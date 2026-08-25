import { NextRequest, NextResponse } from "next/server";
import { deleteRedisValue, getRedisValue } from "@/services/redis.service";
import { SIGNUP_OTP_KEY } from "@/utils/redis-keys";
import { signup } from "@/services/auth.service";
import { User } from "@/types";
import { compareHash } from "@/utils/auth";

const POST = async (request: NextRequest) => {
  const { email, otp } = (await request.json()) as {
    email: string;
    otp: string;
  };

  const data = await getRedisValue<{passwordHash: string; name: string; otpHash: string;}>(SIGNUP_OTP_KEY(email));

  if (!data) {
    return NextResponse.json(
      {
        success: false,
        message: "Signup request expired or not found",
      },
      { status: 400 },
    );
  }

  const { passwordHash, name, otpHash } = data;
  const isValid = compareHash(otp, otpHash);

  if (!isValid) {
    return NextResponse.json(
      { success: false, message: "Invalid OTP" },
      { status: 400 },
    );
  }

  await deleteRedisValue(SIGNUP_OTP_KEY(email));
  const user: User | null = await signup(email, passwordHash, name, {
    passwordIsHashed: true,
  });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { success: true, message: "User created successfully" },
    { status: 201 },
  );
};

export { POST };
