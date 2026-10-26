import { RoundMemberType } from "@/app/generated/prisma/enums";
import {
  getCurrentRound,
  getRoundWords,
  getUserRoundRule,
} from "@/services/round.service";
import { VisiblePlayerWord } from "@/types";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomCode: string }>;
}

const GET = async (request: NextRequest, { params }: IProps) => {
  try {
    const roomCode = (await params).roomCode.toUpperCase();
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const currentRound = await getCurrentRound(roomCode, user.id);
    if (!currentRound) {
      return NextResponse.json(
        { success: false, message: "لا يوجد جولة حالية لهذه الغرفة" },
        { status: 400 },
      );
    }
    const roundWords = await getRoundWords(
      user.id,
      currentRound.roomId,
      currentRound.id,
    );

    const myRoundRule = await getUserRoundRule(
      user.id,
      currentRound.id,
      currentRound.roomId,
    );

    const visiblePlayerWords: VisiblePlayerWord[] = [];

    if (myRoundRule && roundWords) {
      if (
        myRoundRule === RoundMemberType.RULER ||
        myRoundRule === RoundMemberType.VIEWER
      ) {
        for (const roundWord of roundWords) {
          visiblePlayerWords.push({
            playerId: roundWord.playerId,
            word: roundWord.word,
          });
        }
      } else if (myRoundRule === RoundMemberType.PLAYER) {
        for (const roundWord of roundWords) {
          roundWord.playerId !== user.id &&
            visiblePlayerWords.push({
              playerId: roundWord.playerId,
              word: roundWord.word,
            });
        }
      }
    }
    return NextResponse.json({
      success: true,
      data: { visiblePlayerWords },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { GET };
