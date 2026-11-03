import { NextRequest, NextResponse } from "next/server";
import { deleteRedisValue, getRedisValue } from "@/services/redis.service";
import { SIGNUP_OTP_KEY } from "@/utils/redis-keys";
import { signup } from "@/services/auth.service";
import { User } from "@/types";
import { compareHash, generateJWT } from "@/utils/auth";
import { cookies } from "next/headers";
import {
  checkRateLimit,
  IdentifierType,
  consumeRateLimit,
  RateLimitAction,
} from "@/utils/rate-limit";

const POST = async (request: NextRequest) => {
  const { email, otp } = (await request.json()) as {
    email: string;
    otp: string;
  };
  const forwardedFor = request.headers.get("x-forwarded-for");

  const ip = forwardedFor?.split(",")[0]?.trim();

  if (!ip) {
    return NextResponse.json(
      { success: false, message: "تعذر معالجة الطلب" },
      { status: 400 },
    );
  }
  const emailKey = email.trim().toLowerCase();

  const rateLimitByIP = await checkRateLimit({
    action: RateLimitAction.OTP_VERIFY,
    identifier: ip,
    identifierType: IdentifierType.IP,
  });
  const rateLimitByEmail = await checkRateLimit({
    action: RateLimitAction.OTP_VERIFY,
    identifier: emailKey,
    identifierType: IdentifierType.EMAIL,
  });

  if (!(rateLimitByIP.success && rateLimitByEmail.success)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "تم إيقاف محاولات التحقق مؤقتاً بسبب تجاوز الحد المسموح من المحاولات. يرجى المحاولة لاحقاً",
      },
      { status: 429 },
    );
  }

  const data = await getRedisValue<{
    passwordHash: string;
    name: string;
    otpHash: string;
  }>(SIGNUP_OTP_KEY(emailKey));

  await consumeRateLimit({
    action: RateLimitAction.OTP_VERIFY,
    identifier: ip,
    identifierType: IdentifierType.IP,
  });

  if (!data) {
    return NextResponse.json(
      {
        success: false,
        message: "انتهت صلاحية طلب إنشاء الحساب أو لم يتم العثور عليه",
      },
      { status: 400 },
    );
  }

  const { passwordHash, name, otpHash } = data;
  const isValid = compareHash(otp, otpHash);

  if (!isValid) {
    await consumeRateLimit({
      action: RateLimitAction.OTP_VERIFY,
      identifier: emailKey,
      identifierType: IdentifierType.EMAIL,
    });

    return NextResponse.json(
      { success: false, message: "رمز التحقق غير صحيح" },
      { status: 400 },
    );
  }

  const user: User | null = await signup(emailKey, passwordHash, name, {
    passwordIsHashed: true,
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "فشل إنشاء الحساب" },
      { status: 400 },
    );
  }

  await deleteRedisValue(SIGNUP_OTP_KEY(emailKey));
  const token = await generateJWT(user);
  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return NextResponse.json(
    { success: true, message: "تم إنشاء الحساب بنجاح" },
    { status: 201 },
  );
};

export { POST };
