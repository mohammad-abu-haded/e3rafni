import { verifyToken } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

const flashMessageResponse = (request: NextRequest, message: string) => {
  const response = NextResponse.redirect(new URL("/login", request.url));
  return response;
};

const authMiddleware = async (request: NextRequest, role: string[]) => {
  const token = request.cookies.get("token")?.value;
  const response = NextResponse.redirect(new URL("/login", request.url));
  if (!token) {
    return flashMessageResponse(
      request,
      "يرجى تسجيل الدخول للوصول إلى هذه الصفحة",
    );
  }

  const user = await verifyToken(token);
  if (!user) {
    response.cookies.delete("token");
    return flashMessageResponse(
      request,
      "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى",
    );
  }

  if (!role.includes(user.role)) {
    response.cookies.delete("token");
    return flashMessageResponse(
      request,
      "ليس لديك الصلاحيات اللازمة لزيارة هذه الصفحة",
    );
  }
};

export { authMiddleware };
