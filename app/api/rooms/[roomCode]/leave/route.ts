import { deleteRoom, getRoomByCode, leaveRoom } from "@/services/room.service";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomCode: string }>;
}
const POST = async (request: NextRequest, { params }: IProps) => {
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
        { success: false, message: "لم يتم العثور على الغرفة" },
        { status: 400 },
      );
    }
    const isRoomOwner = room.ownerId === user.id;

    if (isRoomOwner) {
      const roomDeleted = await deleteRoom(room.id, user.id);

      if (roomDeleted) {
        return NextResponse.json(
          { success: true, message: "تم إنهاء الغرفة بنجاح" },
          { status: 200 },
        );
      }

      return NextResponse.json(
        { success: false, message: "فشل إنهاء الغرفة" },
        { status: 400 },
      );
    }

    const leftRoom = await leaveRoom(room.id, user.id);
    if (leftRoom) {
      return NextResponse.json(
        { success: true, message: "تم الخروج من الغرفة بنجاح" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: false, message: "فشل الخروج من الغرفة" },
      { status: 400 },
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
