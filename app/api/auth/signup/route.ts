import { getUserByEmail } from "@/services/auth.service";
import crypto from "crypto";
import {
  deleteRedisValue,
  setRedisValue,
} from "@/services/redis.service";
import { SIGNUP_OTP_KEY } from "@/utils/redis-keys";
import { sendOtpEmail } from "@/services/email.service";
import { NextRequest, NextResponse } from "next/server";
import { hashValue } from "@/utils/auth";

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

  try {
    const otp = crypto.randomInt(100000, 1000000).toString();
    await setRedisValue(SIGNUP_OTP_KEY(email), { passwordHash: hashValue(password), name, otpHash: hashValue(otp) }, 60 * 5);
    await sendOtpEmail(email, otp);
    return NextResponse.json(
      { success: true, message: "تم إرسال رمز التحقق بنجاح" },
      { status: 200 },
    );
  } catch (error) {
    await deleteRedisValue(SIGNUP_OTP_KEY(email));
    return NextResponse.json(
      { success: false, message: "فشل إرسال رمز التحقق" },
      { status: 500 },
    );
  }
};

export { POST };
