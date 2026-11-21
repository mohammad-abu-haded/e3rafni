import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";

import { getUserByEmail } from "@/services/auth.service";
import { setRedisValue, deleteRedisValue } from "@/services/redis.service";
import { sendOtpEmail } from "@/services/email.service";

import { FORGOT_PASSWORD_OTP_KEY } from "@/utils/redis-keys";
import { hashValue } from "@/utils/auth";

import {
  consumeRateLimit,
  IdentifierType,
  RateLimitAction,
} from "@/utils/rate-limit";

const POST = async (request: NextRequest) => {
  try {
    const { email } = (await request.json()) as {
      email: string;
    };

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني مطلوب" },
        { status: 400 },
      );
    }

    const emailKey = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey)) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني غير صالح" },
        { status: 400 },
      );
    }

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
        action: RateLimitAction.FORGOT_PASSWORD_OTP_SEND,
        identifier: ip,
        identifierType: IdentifierType.IP,
      }),
      consumeRateLimit({
        action: RateLimitAction.FORGOT_PASSWORD_OTP_SEND,
        identifier: emailKey,
        identifierType: IdentifierType.EMAIL,
      }),
    ]);

    if (!(rateLimitByIP.success && rateLimitByEmail.success)) {
      return NextResponse.json(
        {
          success: false,
          message: "تجاوزت الحد المسموح من المحاولات. يرجى المحاولة لاحقاً",
        },
        { status: 429 },
      );
    }

    const user = await getUserByEmail(emailKey);

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "إذا كان البريد مرتبطاً بحساب، فستصلك رسالة تحتوي على رمز التحقق",
        },
        { status: 200 },
      );
    }

    const otp = randomInt(100000, 1000000).toString();

    await setRedisValue(
      FORGOT_PASSWORD_OTP_KEY(emailKey),
      {
        userId: user.id,
        otpHash: hashValue(otp),
      },
      60 * 5,
    );

    try {
      await sendOtpEmail(emailKey, otp, "لإعادة تعيين كلمة المرور");
    } catch (error) {
      await deleteRedisValue(FORGOT_PASSWORD_OTP_KEY(emailKey));
      return NextResponse.json(
        { success: false, message: "تعذر إرسال رمز التحقق" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
