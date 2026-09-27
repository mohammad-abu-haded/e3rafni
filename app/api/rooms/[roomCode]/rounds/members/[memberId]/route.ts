import { getCurrentRound, getRoundMember } from "@/services/round.service";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomCode: string; memberId: string }>;
}
const GET = async (request: NextRequest, { params }: IProps) => {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "غير مصرح" },
      { status: 401 },
    );
  }
  const { roomCode, memberId } = await params;
  const currentRound = await getCurrentRound(roomCode, user.id);
  if (!currentRound) {
    return NextResponse.json(
      { success: false, message: "لا يوجد جولة حالية لهذه الغرفة" },
      { status: 400 },
    );
  }

  const roundMember = await getRoundMember(currentRound.roomId, currentRound.id, Number(memberId), user.id);

  if (!roundMember) {
    return NextResponse.json(
      { success: false, message: "المستخدم غير موجود في الجولة الحالية" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: roundMember,
  });
};

export { GET };
