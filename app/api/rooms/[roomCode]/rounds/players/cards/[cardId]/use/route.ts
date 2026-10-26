import { RoundMemberType } from "@/app/generated/prisma/enums";
import {
  getPlayerCardUsages,
  getRoomCards,
  recordPlayerCardUsage,
} from "@/services/room.service";
import {
  getCurrentRound,
  getUserRoundRule,
} from "@/services/round.service";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomCode: string; cardId: string }>;
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

    const roomCode = (await params).roomCode.toLocaleUpperCase();
    const cardId = (await params).cardId;
    if (!(roomCode && cardId)) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الطلب غير صحيحة أو هناك حقول مطلوبة مفقودة",
        },
        { status: 422 },
      );
    }

    const currentRound = await getCurrentRound(roomCode, user.id);
    if (!currentRound) {
        return NextResponse.json(
          {
            success: false,
            message: "الجولة غير موجودة",
          },
          { status: 404 },
        );
      
    }

    const myRoundRule = await getUserRoundRule(
      user.id,
      currentRound.id,
      currentRound.roomId,
    );

    if (myRoundRule !== RoundMemberType.PLAYER) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكتك استخدام الكرت إلا وأنت لاعب",
        },
        { status: 404 },
      );
    }
    const roomCards = await getRoomCards(user.id, currentRound.roomId);
    const targetCard = roomCards?.find((item) => item.id === cardId);

    if (!targetCard) {
      return NextResponse.json(
        {
          success: false,
          message: "الكرت غير موجود",
        },
        { status: 404 },
      );
    }

    const playerCardUsages = await getPlayerCardUsages(
      user.id,
      currentRound.roomId,
      currentRound.id,
    );

    const targetCardUsage = playerCardUsages?.filter(
      (item) => item.cardId === cardId,
    );

    if (targetCardUsage && targetCardUsage.length >= targetCard?.maxPerPlayer) {
      return NextResponse.json(
        {
          success: false,
          message: "لقد استنفدت الحد الأقصى لاستخدام هذا الكرت لهذه الغرفة",
        },
        { status: 409 },
      );
    }

    if (targetCardUsage?.find((item) => item.roundId === currentRound.id && item.userId === user.id)) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكن استخدام نفس الكرت مرتين في نفس الجولة",
        },
        { status: 409 },
      );
    }

    const newPlayerCardUsage = await recordPlayerCardUsage(
      user.id,
      cardId,
      currentRound.id,
      currentRound.roomId,
    );

    if (!newPlayerCardUsage) {
      return NextResponse.json(
        { success: false, message: "حدث خطأ ما" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: `تم استخدام الكرت ${targetCard.title}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
