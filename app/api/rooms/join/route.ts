import { joinRoom } from "@/services/room.service";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

const POST = async (request: NextRequest) => {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { roomCode: string };
    const { roomCode } = body;
    const roomJoined = await joinRoom(user.id, roomCode);

    if (!roomJoined) {
      return NextResponse.json(
        { success: false, message: "فشل الانضمام إلى الغرفة" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, message: "تم الانضمام إلى الغرفة بنجاح", data: {roomCode} },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
