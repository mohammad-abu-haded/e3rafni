import {
  getPlayerCardUsages,
  getRoomByCode,
  getRoomCards,
} from "@/services/room.service";
import { getCurrentRound } from "@/services/round.service";
import { CardWithUsage } from "@/types";
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
    const room = await getRoomByCode(roomCode, user.id);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 },
      );
    }

    const cards = await getRoomCards(user.id, room.id);

    const currentRound = await getCurrentRound(roomCode, user.id);
    if (!currentRound) {
      return NextResponse.json(
        { success: false, message: "لا يوجد جولة حالية لهذه الغرفة" },
        { status: 400 },
      );
    }
    const playersCardUsage = await getPlayerCardUsages(
      user.id,
      room.id,
      currentRound.id,
    );

    if (!cards || cards.length < 1) {
      return NextResponse.json({ success: false, data: [] }, { status: 200 });
    }

    if (!playersCardUsage || playersCardUsage.length < 1) {
      const cardsWithUsage: CardWithUsage[] = cards.map((card) => ({
        cardId: card.id,
        title: card.title,
        description: card.description,
        color: card.color,
        maxPerPlayer: card.maxPerPlayer,
        players: [],
      }));

      return NextResponse.json(
        { success: true, data: cardsWithUsage },
        { status: 200 },
      );
    }
    const cardsWithUsage: CardWithUsage[] = cards.map((card) => {
      const cardUsages = playersCardUsage.filter(
        (usage) => usage.cardId === card.id,
      );

      const players = Object.values(
        cardUsages.reduce<
          Record<number, { userId: number; usedCount: number }>
        >((acc, usage) => {
          if (!acc[usage.userId]) {
            acc[usage.userId] = {
              userId: usage.userId,
              usedCount: 0,
            };
          }

          acc[usage.userId].usedCount++;

          return acc;
        }, {}),
      );

      return {
        cardId: card.id,
        title: card.title,
        description: card.description,
        color: card.color,
        maxPerPlayer: card.maxPerPlayer,
        players,
      };
    });

    return NextResponse.json({
      success: true,
      data: cardsWithUsage,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ ما" },
      { status: 500 },
    );
  }
};

export { GET };
