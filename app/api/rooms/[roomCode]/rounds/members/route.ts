import { getCurrentRound, getRoundMembers } from "@/services/round.service";
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
    const { roomCode } = await params;
    const currentRound = await getCurrentRound(roomCode, user.id);
    if (!currentRound) {
      return NextResponse.json(
        { success: false, message: "لا يوجد جولة حالية لهذه الغرفة" },
        { status: 400 },
      );
    }

    const roundMembers = await getRoundMembers(
      currentRound.roomId,
      currentRound.id,
      user.id,
    );

    return NextResponse.json({
      success: true,
      data: roundMembers ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { GET };
