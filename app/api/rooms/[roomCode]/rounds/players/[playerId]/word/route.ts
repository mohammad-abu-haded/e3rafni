import { addRoundWord, getCurrentRound } from "@/services/round.service";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

interface IProps {
  params: Promise<{ roomCode: string; playerId: string }>;
}

const PATCH = async (request: NextRequest, { params }: IProps) => {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const roomCode = (await params).roomCode.toLocaleUpperCase();
    const playerId = Number((await params).playerId);
    const body = (await request.json()) as { word: string };
    const { word } = body;
    if (!(roomCode && Number.isInteger(playerId))) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الطلب غير صحيحة أو هناك حقول مطلوبة مفقودة",
        },
        { status: 422 },
      );
    }

    if (!word) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى تحديد كلمة اللاعب",
        },
        { status: 422 },
      );
    }

    if (word.trim().length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمة اللاعب يجب ألا تتجاوز 100 حرف",
        },
        { status: 422 },
      );
    }

    const currentRound = await getCurrentRound(roomCode, user.id);
    if (!currentRound) {
      if (!currentRound) {
        return NextResponse.json(
          {
            success: false,
            message: "الجولة غير موجودة",
          },
          { status: 404 },
        );
      }
    }

    const updatedWord = await addRoundWord(
      user.id,
      currentRound.roomId,
      currentRound.id,
      playerId,
      word,
      { isUpdate: true },
    );
    if (!updatedWord) {
      return NextResponse.json(
        { success: false, message: "حدث خطأ ما" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "تم تعديل الكلمة بناجح" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { PATCH };
