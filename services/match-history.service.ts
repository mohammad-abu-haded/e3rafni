import prisma from "@/lib/prisma";
import { UserMatchHistory } from "@/types";

export const getUserMatchHistory = async (
  userId: number,
): Promise<UserMatchHistory[]> => {
  const userMatchHistory = await prisma.roundPlayerResults.findMany({
    where: {
      userId,
    },
    select: {
      result: true,
      createdAt: true,
      roundMember: {
        select: {
          round: {
            select: {
              roundNumber: true,
              room: {
                select: {
                  name: true,
                },
              },
              roundMembers: {
                where: {
                  userId: {
                    not: userId,
                  },
                  type: "PLAYER",
                },
                select: {
                  roomMember: {
                    select: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return userMatchHistory.map((match) => ({
    result: match.result,
    createdAt: match.createdAt,
    roundMember: {
      round: {
        roundNumber: match.roundMember.round.roundNumber,
        room: {
          name: match.roundMember.round.room.name,
        },
      },
      roomMember: {
        user: {
          id:
            match.roundMember.round.roundMembers[0]?.roomMember.user.id ?? null,
          name:
            match.roundMember.round.roundMembers[0]?.roomMember.user.name ??
            "غير معروف",
        },
      },
    },
  }));
};
