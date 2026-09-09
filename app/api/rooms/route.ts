import { createRoom } from "@/services/room.service";
import { CreateRoomBody } from "@/types";
import { getAuthUser } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

const POST = async (request: NextRequest) => {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CreateRoomBody;
    let { name, totalRounds, isPrivate, capacity, cards } = body;
    const ownerId = user.id;

    if (
      !name ||
      typeof totalRounds !== "number" ||
      typeof isPrivate !== "boolean" ||
      typeof capacity !== "number" ||
      !ownerId
    ) {
      return NextResponse.json(
        { success: false, message: "هناك حقول مطلوبة لم تملأها" },
        { status: 422 },
      );
    }

    if (totalRounds < 1) {
      return NextResponse.json(
        { success: false, message: "يجب أن يكون هناك جولة واحدة على الأقل" },
        { status: 400 },
      );
    }

    if (capacity < 1) {
      return NextResponse.json(
        { success: false, message: "يجب أن تكون سعة الغرفة أكبر من صفر" },
        { status: 400 },
      );
    }

    if (cards.length > 0) {
      for (const card of cards) {
        if (card.maxPerPlayer < 1) {
          return NextResponse.json(
            {
              success: false,
              message: "يجب أن يكون عدد الكروت للاعب أكبر من صفر",
            },
            { status: 400 },
          );
        }

        if (card.description.length > 300) {
          return NextResponse.json(
            {
              success: false,
              message: "وصف الكرت يجب ألا يتجاوز 300 حرف",
            },
            { status: 400 },
          );
        }

        if (card.title.length > 50) {
          return NextResponse.json(
            {
              success: false,
              message: "عنوان الكرت يجب ألا يتجاوز 50 حرف",
            },
            { status: 400 },
          );
        }

        if (!/^#(?:[0-9A-Fa-f]{3}){1,2}$/.test(card.color)) {
          return NextResponse.json(
            {
              success: false,
              message: "لون الكرت غير صالح",
            },
            { status: 400 },
          );
        }
      }
    } else {
      cards = [];
    }

    const roomCreated = await createRoom(
      ownerId,
      name,
      totalRounds,
      isPrivate,
      capacity,
      cards,
    );

    if (!roomCreated) {
      return NextResponse.json(
        { success: false, message: "حدث خطأ اثناء إنشاء الغرفة" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "تم إنشاء الغرفة بنجاح" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { POST };
