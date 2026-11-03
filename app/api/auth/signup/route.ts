import { getUserByEmail } from "@/services/auth.service";
import crypto from "crypto";
import {
  deleteRedisValue,
  getRedisTTL,
  setRedisValue,
} from "@/services/redis.service";
import { SIGNUP_OTP_KEY } from "@/utils/redis-keys";
import { sendOtpEmail } from "@/services/email.service";
import { NextRequest, NextResponse } from "next/server";
import { hashValue } from "@/utils/auth";
import {
  checkRateLimit,
  IdentifierType,
  consumeRateLimit,
  RateLimitAction,
} from "@/utils/rate-limit";
import {
  SIGNUP_OTP_COOLDOWN_SECONDS,
  SIGNUP_OTP_TTL_SECONDS,
} from "@/constant/redis.constants";

const POST = async (request: NextRequest) => {
  const { email, password, name } = (await request.json()) as {
    email: string;
    password: string;
    name: string;
  };

  if (!email) {
    return NextResponse.json(
      { success: false, message: "البريد الإلكتروني مطلوب" },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { success: false, message: "كلمة المرور مطلوبة" },
      { status: 400 },
    );
  }

  if (!name) {
    return NextResponse.json(
      { success: false, message: "الاسم مطلوب" },
      { status: 400 },
    );
  }

  const user = await getUserByEmail(email);
  if (user) {
    return NextResponse.json(
      {
        success: false,
        message: "تعذر معالجة طلب إنشاء الحساب",
      },
      { status: 400 },
    );
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  const ip = forwardedFor?.split(",")[0]?.trim();
  if (!ip) {
    return NextResponse.json(
      { success: false, message: "تعذر معالجة الطلب" },
      { status: 400 },
    );
  }

  const emailKey = email.trim().toLowerCase();
  try {
    const rateLimitByIP = await checkRateLimit({
      action: RateLimitAction.OTP_SEND,
      identifier: ip,
      identifierType: IdentifierType.IP,
    });

    if (!rateLimitByIP.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "تم إيقاف محاولات إرسال رمز التحقق مؤقتاً بسبب تجاوز الحد المسموح من المحاولات. يرجى المحاولة لاحقاً",
        },
        { status: 429 },
      );
    }

    const redisTTL = await getRedisTTL(SIGNUP_OTP_KEY(emailKey));

    if (
      redisTTL !== null &&
      SIGNUP_OTP_TTL_SECONDS - redisTTL < SIGNUP_OTP_COOLDOWN_SECONDS
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكنك إعادة إرسال رمز التحقق إلا بعد مرور دقيقة ونصف",
        },
        { status: 429 },
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    await setRedisValue(
      SIGNUP_OTP_KEY(emailKey),
      { passwordHash: hashValue(password), name, otpHash: hashValue(otp) },
      SIGNUP_OTP_TTL_SECONDS,
    );
    await sendOtpEmail(emailKey, otp);
    await consumeRateLimit({
      action: RateLimitAction.OTP_SEND,
      identifier: ip,
      identifierType: IdentifierType.IP,
    });
    return NextResponse.json(
      { success: true, message: "تم إرسال رمز التحقق بنجاح" },
      { status: 200 },
    );
  } catch (error) {
    await deleteRedisValue(SIGNUP_OTP_KEY(emailKey));
    return NextResponse.json(
      { success: false, message: "فشل إرسال رمز التحقق" },
      { status: 500 },
    );
  }
};

export { POST };
