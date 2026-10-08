import { RoundMemberType } from "@/app/generated/prisma/enums";
import { getCurrentRound, startRound } from "@/services/round.service";
import { RoundMemberInput } from "@/types";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomCode: string }>;
}

const POST = async (request: NextRequest, { params }: IProps) => {
  try {
    const roomCode = (await params).roomCode.toUpperCase();
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      roundDuration: number;
      player1: number;
      player2: number;
      viewers: number[];
      player1Word: string;
      player2Word: string;
    };

    const {
      roundDuration,
      player1,
      player2,
      viewers,
      player1Word,
      player2Word,
    } = body;

    let errorMessage = "";

    if (!Number.isInteger(roundDuration) || roundDuration <= 0) {
      errorMessage = "مدة الجولة غير صالحة أو لم تحددها";
    } else if (!player1) {
      errorMessage = "يرجى اختيار اللاعب الأول";
    } else if (!player2) {
      errorMessage = "يرجى اختيار اللاعب الثاني";
    } else if ([player1, player2].includes(user.id)) {
      errorMessage = "لا يمكنك إختيار نفسك كلاعب";
    } else if (player1 === player2) {
      errorMessage = "يرجى اختيار لاعبين مختلفين";
    } else if (viewers.includes(player1) || viewers.includes(player2)) {
      errorMessage = "لا يمكنك اختيار اللاعبين كمشاهدين";
    } else if (!player1Word) {
      errorMessage = "يرجى تحديد كلمة اللاعب الأول";
    } else if (!player2Word) {
      errorMessage = "يرجى تحديد كلمة اللاعب الثاني";
    }

    if (errorMessage) {
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: 422 },
      );
    }

    const roundPlayersViewers: RoundMemberInput[] = [
      {
        userId: player1,
        type: RoundMemberType.PLAYER,
        word: player1Word,
      },
      {
        userId: player2,
        type: RoundMemberType.PLAYER,
        word: player2Word,
      },
      ...(viewers ?? []).map((userId) => ({
        userId,
        type: RoundMemberType.VIEWER,
      })),
    ];

    const currentRound = await getCurrentRound(roomCode, user.id);
    if (!currentRound) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكن البدء بجولة غير موجودة",
        },
        { status: 404 },
      );
    }

    const round = await startRound(
      user.id,
      currentRound.roomId,
      currentRound.id,
      roundDuration,
      roundPlayersViewers,
    );

    if (!round) {
      return NextResponse.json(
        {
          success: false,
          message: "حدث خطأ أثناء بدء الجولة",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "تم بدء الجولة بنجاح" },
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
