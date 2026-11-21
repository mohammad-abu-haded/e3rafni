import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { updatePassword } from "@/services/auth.service";

import {
  getRedisValue,
  getAndDeleteRedisValue,
} from "@/services/redis.service";

import { PASSWORD_RESET_TOKEN_KEY } from "@/utils/redis-keys";
import { validatePassword } from "@/utils/password";

import {
  consumeRateLimit,
  IdentifierType,
  RateLimitAction,
} from "@/utils/rate-limit";

const POST = async (request: NextRequest) => {
  try {
    const { password, confirmPassword } = (await request.json()) as {
      password: string;
      confirmPassword: string;
    };

    if (
      typeof password !== "string" ||
      typeof confirmPassword !== "string" ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { success: false, message: "يرجى إدخال كلمة المرور وتأكيدها" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "كلمتا المرور غير متطابقتين" },
        { status: 400 },
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير وحرف صغير ورقم ورمز خاص",
        },
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

    const rateLimitByIP = await consumeRateLimit({
      action: RateLimitAction.PASSWORD_RESET,
      identifier: ip,
      identifierType: IdentifierType.IP,
    });

    if (!rateLimitByIP.success) {
      return NextResponse.json(
        {
          success: false,
          message: "تجاوزت الحد المسموح من المحاولات. يرجى المحاولة لاحقاً",
        },
        { status: 429 },
      );
    }

    const resetToken = request.cookies.get("password-reset-token")?.value;

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: "انتهت صلاحية طلب إعادة تعيين كلمة المرور",
        },
        { status: 401 },
      );
    }

    const tokenHash = createHash("sha256").update(resetToken).digest("hex");

    const tokenKey = PASSWORD_RESET_TOKEN_KEY(tokenHash);

    const tokenData = await getRedisValue<{
      userId: number;
      email: string;
    }>(tokenKey);

    if (!tokenData) {
      const response = NextResponse.json(
        {
          success: false,
          message: "انتهت صلاحية طلب إعادة تعيين كلمة المرور",
        },
        { status: 401 },
      );

      response.cookies.delete("password-reset-token");

      return response;
    }

    const rateLimitByEmail = await consumeRateLimit({
      action: RateLimitAction.PASSWORD_RESET,
      identifier: tokenData.email,
      identifierType: IdentifierType.EMAIL,
    });

    if (!rateLimitByEmail.success) {
      return NextResponse.json(
        {
          success: false,
          message: "تجاوزت الحد المسموح من المحاولات. يرجى المحاولة لاحقاً",
        },
        { status: 429 },
      );
    }

    const consumedToken = await getAndDeleteRedisValue<{
      userId: number;
      email: string;
    }>(tokenKey);

    if (
      !consumedToken ||
      consumedToken.userId !== tokenData.userId ||
      consumedToken.email !== tokenData.email
    ) {
      const response = NextResponse.json(
        {
          success: false,
          message: "التوكين غير صالح أو تم استخدامه مسبقاً",
        },
        { status: 401 },
      );

      response.cookies.delete("password-reset-token");

      return response;
    }

    const user = await updatePassword(consumedToken.userId, password);

    if (!user) {
      const response = NextResponse.json(
        { success: false, message: "فشل تغيير كلمة المرور" },
        { status: 500 },
      );

      response.cookies.delete("password-reset-token");

      return response;
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "تم تغيير كلمة المرور بنجاح",
      },
      { status: 200 },
    );

    response.cookies.delete("password-reset-token");
    response.cookies.delete("token");

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
