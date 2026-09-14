import { getRoomByCode } from "@/services/room.service";
import { getAuthUser, verifyToken } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomCode: string }>;
}
const GET = async (request: NextRequest, { params }: IProps) => {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const roomCode = (await params).roomCode.toUpperCase();
    const room = await getRoomByCode(roomCode, user.id);
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          message: "الغرفة غير موجودة أو غير مصرح لك",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { GET };
