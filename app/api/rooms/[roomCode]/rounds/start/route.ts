import { RoundMode } from "@/app/generated/prisma/enums";
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
      roundPlayersViewers: RoundMemberInput[];
      mode: RoundMode;
      roundDuration: number;
    };

    const { roundPlayersViewers, mode, roundDuration } = body;

    if (!roundPlayersViewers || roundPlayersViewers.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب أن تحتوي الجولة على لاعبين اثنين",
        },
        { status: 422 },
      );
    }

    if (!Object.values(RoundMode).includes(mode)) {
      return NextResponse.json(
        {
          success: false,
          message: "نوع الجولة غير صالح",
        },
        { status: 422 },
      );
    }

    if (!Number.isInteger(roundDuration) || roundDuration <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "مدة الجولة غير صالحة",
        },
        { status: 422 },
      );
    }

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
      mode,
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
