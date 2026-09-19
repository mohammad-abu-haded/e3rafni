import {
  createRound,
  getCurrentRound,
  getRoundRuler,
  updateRoundRuler,
} from "@/services/round.service";
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
      rulerId: number;
    };
    const { rulerId } = body;
    let isUpdated = false;
    let successMessage = "تم تحديد الحكم بنجاح";

    if (!(roomCode && typeof rulerId === "number")) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الطلب غير صحيحة أو هناك حقول مطلوبة مفقودة",
        },
        { status: 422 },
      );
    }

    const currentRound = await getCurrentRound(roomCode, user.id);
    
    if (currentRound) {
      if (currentRound.status === "PLAYING") {
        return NextResponse.json(
          { success: false, message: "لا يمكن تعديل الحكم أثناء الجولة" },
          { status: 409 },
        );
      }

      if (currentRound.status === "FINISHED") {
        return NextResponse.json(
          { success: false, message: "لا يمكن تعديل الحكم لجولة سابقة" },
          { status: 409 },
        );
      }

      const currentRoundRuler = await getRoundRuler(roomCode, currentRound.id, user.id);
      const updatedRoundRuler = await updateRoundRuler(
        roomCode,
        user.id,
        rulerId,
        currentRoundRuler!.userId,
      );

      if (!updatedRoundRuler) {
        return NextResponse.json(
          { success: false, message: "حدث خطأ اثناء تعديل الحكم" },
          { status: 500 },
        );
      }

      isUpdated = true;
      successMessage = "تم تعديل الحكم بنجاح";
    } else {
      const round = await createRound(roomCode, user.id, rulerId);
      if (!round) {
        return NextResponse.json(
          { success: false, message: "حدث خطأ اثناء تحديد الحكم" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { success: true, message: successMessage },
      { status: isUpdated ? 200 : 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
