import { joinRoom } from "@/services/room.service";
import { getUserEmail } from "@/services/user.service";
import { getAuthUser } from "@/utils/auth";
import {
  checkRateLimit,
  consumeRateLimit,
  IdentifierType,
  RateLimitAction,
} from "@/utils/rate-limit";
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

    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip = forwardedFor?.split(",")[0]?.trim();
    if (!ip) {
      return NextResponse.json(
        { success: false, message: "تعذر معالجة الطلب" },
        { status: 400 },
      );
    }
    const email = await getUserEmail(user.id);
    if (!email) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }
    const emailKey = email.trim().toLowerCase();

    const rateLimitByIP = await checkRateLimit({
      action: RateLimitAction.ROOM_JOIN,
      identifier: ip,
      identifierType: IdentifierType.IP,
    });
    const rateLimitByEmail = await checkRateLimit({
      action: RateLimitAction.ROOM_JOIN,
      identifier: emailKey,
      identifierType: IdentifierType.EMAIL,
    });

    if (!(rateLimitByIP.success && rateLimitByEmail.success)) {
      return NextResponse.json(
        {
          success: false,
          message: "تجاوزت عدد محاولات الانضمام، حاول لاحقاً",
        },
        { status: 429 },
      );
    }

    await consumeRateLimit({
      action: RateLimitAction.ROOM_JOIN,
      identifier: ip,
      identifierType: IdentifierType.IP,
    });

    const roomCode = (await params).roomCode.toUpperCase();
    const roomJoined = await joinRoom(user.id, roomCode);

    if (!roomJoined) {
      await consumeRateLimit({
        action: RateLimitAction.ROOM_JOIN,
        identifier: emailKey,
        identifierType: IdentifierType.EMAIL,
      });
      return NextResponse.json(
        { success: false, message: "فشل الانضمام إلى الغرفة" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم الانضمام إلى الغرفة بنجاح",
        data: { roomCode },
      },
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
