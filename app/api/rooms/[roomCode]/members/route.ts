import {
  getPlayerRoundsPlayed,
  getRoomMembers,
} from "@/services/room.service";
import { getAuthUser } from "@/utils/auth";
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
    const roomCode = (await params).roomCode;
    const roomMembers = await getRoomMembers(user.id, roomCode);
    if (!roomMembers) {
      return NextResponse.json(
        { success: false, message: "الغرفة غير موجودة أو غير مصرح لك" },
        { status: 403 },
      );
    }

    const roomMembersWithRounds = await Promise.all(
      roomMembers.map(async (member) => {
        const roundsPlayed = await getPlayerRoundsPlayed(
          user.id,
          member.userId,
          roomCode,
        );

        return {
          ...member,
          roundsPlayed: roundsPlayed ?? 0,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: roomMembersWithRounds,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { GET };
