import { login } from "@/services/auth.service";
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
      { success: false, message: "Email and password are required" },
      { status: 400 },
    );
  }

  const user: User | null = await login(email, password);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
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

  return NextResponse.json({ success: true, message: "Login successful" }, { status: 200 });
};

export { POST };
