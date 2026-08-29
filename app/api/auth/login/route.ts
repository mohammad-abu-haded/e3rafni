import { getUserByEmail, login } from "@/services/auth.service";
import { User } from "@/types";
import { generateJWT } from "@/utils/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const POST = async (request: NextRequest) => {
  const { email, password } = (await request.json()) as {
    email: string;
    password: string;
  };
  
  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "البريد الإلكتروني وكلمة المرور مطلوبان" },
      { status: 400 },
    );
  }
  let user: User | null = await getUserByEmail(email);
  if (user && !user.password && user.googleId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر تسجيل الدخول باستخدام كلمة المرور، يرجى استخدام تسجيل الدخول عبر Google",
      },
      { status: 400 },
    );
  }

  user = await login(email, password);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "خطأ في البريد الإلكتروني أو كلمة المرور" },
      { status: 401 },
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
    { success: true, message: "تم تسجيل الدخول بنجاح" },
    { status: 200 },
  );
};

export { POST };
