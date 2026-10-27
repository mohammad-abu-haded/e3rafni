import { RoundMemberType } from "@/app/generated/prisma/enums";
import { incrementPlayerWins, isRoomOwner } from "@/services/room.service";
import {
  endRound,
  getCurrentRound,
  isRoundRuler,
} from "@/services/round.service";
import { EndRoundRequest } from "@/types";
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
    const roomCode = (await params).roomCode;
    const currentRound = await getCurrentRound(roomCode, user.id);
    if (!currentRound) {
      return NextResponse.json(
        { success: false, message: "لا يوجد جولة حالية لهذه الغرفة" },
        { status: 400 },
      );
    }

    if (
      !(await isRoomOwner(currentRound.roomId, user.id)) &&
      !(await isRoundRuler(currentRound.id, user.id))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مسموح لك بإنهاء الجولة",
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as EndRoundRequest;
    if (
      typeof body !== "object" ||
      body === null ||
      !("result" in body) ||
      !("winnerId" in body) ||
      (body.result !== "WIN" && body.result !== "DRAW")
    ) {
      return NextResponse.json(
        { success: false, message: "بيانات الطلب غير صحيحة" },
        { status: 400 },
      );
    }
    const { result, winnerId } = body;
    if (result === "WIN") {
      const incrementedPlayerWins = await incrementPlayerWins(
        user.id,
        winnerId,
        currentRound.roomId,
        currentRound.id,
      );
      if (!incrementedPlayerWins) {
        return NextResponse.json(
          { success: false, message: "حدث خطأ ما أثناء إنهاء الجولة" },
          { status: 500 },
        );
      }
    }

    const endedRound = await endRound(
      user.id,
      currentRound.roomId,
      currentRound.id,
    );

    if (!endedRound) {
      return NextResponse.json(
        { success: false, message: "حدث خطأ ما أثناء إنهاء الجولة" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم إنهاء الجولة بنجاح",
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
