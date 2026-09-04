import { NextRequest, NextResponse } from "next/server";

const POST = async () => {
  const response = NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  });

  response.cookies.delete("token");

  return response;
};

export { POST };
