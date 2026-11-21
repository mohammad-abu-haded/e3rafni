import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";

import {
  getRedisValue,
  setRedisValue,
  getAndDeleteRedisValue,
} from "@/services/redis.service";

import { compareHash } from "@/utils/auth";

import {
  FORGOT_PASSWORD_OTP_KEY,
  PASSWORD_RESET_TOKEN_KEY,
} from "@/utils/redis-keys";

import {
  consumeRateLimit,
  IdentifierType,
  RateLimitAction,
} from "@/utils/rate-limit";

const POST = async (request: NextRequest) => {
  try {
    const { email, otp } = (await request.json()) as {
      email: string;
      otp: string;
    };

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        { success: false, message: "بيانات التحقق غير صالحة" },
        { status: 400 },
      );
    }

    const emailKey = email.trim().toLowerCase();

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip");

    if (!ip) {
      return NextResponse.json(
        { success: false, message: "تعذر معالجة الطلب" },
        { status: 400 },
      );
    }

    const [rateLimitByIP, rateLimitByEmail] = await Promise.all([
      consumeRateLimit({
        action: RateLimitAction.FORGOT_PASSWORD_OTP_VERIFY,
        identifier: ip,
        identifierType: IdentifierType.IP,
      }),
      consumeRateLimit({
        action: RateLimitAction.FORGOT_PASSWORD_OTP_VERIFY,
        identifier: emailKey,
        identifierType: IdentifierType.EMAIL,
      }),
    ]);

    if (!(rateLimitByIP.success && rateLimitByEmail.success)) {
      return NextResponse.json(
        {
          success: false,
          message: "تم إيقاف محاولات التحقق مؤقتاً بسبب تجاوز الحد المسموح",
        },
        { status: 429 },
      );
    }

    const otpKey = FORGOT_PASSWORD_OTP_KEY(emailKey);

    const data = await getRedisValue<{
      userId: number;
      otpHash: string;
    }>(otpKey);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز التحقق غير صحيح أو انتهت صلاحيته",
        },
        { status: 400 },
      );
    }

    const isValid = compareHash(otp, data.otpHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "رمز التحقق غير صحيح" },
        { status: 400 },
      );
    }

    const consumedData = await getAndDeleteRedisValue<{
      userId: number;
      otpHash: string;
    }>(otpKey);

    if (
      !consumedData ||
      consumedData.userId !== data.userId ||
      !compareHash(otp, consumedData.otpHash)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز التحقق غير صحيح أو تم استخدامه مسبقاً",
        },
        { status: 400 },
      );
    }

    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(resetToken).digest("hex");

    await setRedisValue(
      PASSWORD_RESET_TOKEN_KEY(tokenHash),
      {
        userId: consumedData.userId,
        email: emailKey,
      },
      60 * 5,
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "تم التحقق من البريد الإلكتروني بنجاح",
      },
      { status: 200 },
    );

    response.cookies.set("password-reset-token", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 5,
      path: "/api/auth/reset-password",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
