import { NextRequest, NextResponse } from "next/server";
import { deleteRedisValue, getRedisValue } from "@/services/redis.service";
import { SIGNUP_OTP_KEY } from "@/utils/redis-keys";
import { signup } from "@/services/auth.service";
import { User } from "@/types";
import { compareHash, generateJWT } from "@/utils/auth";
import { cookies } from "next/headers";

const POST = async (request: NextRequest) => {
  const { email, otp } = (await request.json()) as {
    email: string;
    otp: string;
  };

  const data = await getRedisValue<{
    passwordHash: string;
    name: string;
    otpHash: string;
  }>(SIGNUP_OTP_KEY(email));

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
    return NextResponse.json(
      { success: false, message: "رمز التحقق غير صحيح" },
      { status: 400 },
    );
  }

  await deleteRedisValue(SIGNUP_OTP_KEY(email));
  const user: User | null = await signup(email, passwordHash, name, {
    passwordIsHashed: true,
  });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "فشل إنشاء الحساب" },
      { status: 400 },
    );
  }

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
