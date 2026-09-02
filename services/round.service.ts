import prisma from "@/lib/prisma";
import { getRoomById, isRoomMember, isRoomOwner } from "./room.service";
import {
  RoundMemberType,
  RoundMode,
  RoundStatus,
} from "@/app/generated/prisma/enums";
import { RoundMemberInput } from "@/types";

const numberOfPlayersAllowed = 2;

export const createRound = async (
  roomId: number,
  roundDuration: number,
  mode: RoundMode,
  userId: number,
) => {
  try {
    if (!(await isRoomOwner(roomId, userId))) {
      return null;
    }
    const room = await getRoomById(roomId);
    if (!room) {
      return null;
    }

    const roundNumber = room.currentRound + 1;
    const createdRound = await prisma.$transaction(async (tx) => {
      const round = await tx.rounds.create({
        data: {
          roomId,
          roundNumber,
          roundDuration,
          mode,
        },
      });

      await tx.rooms.update({
        where: {
          id: roomId,
        },
        data: {
          currentRound: roundNumber,
        },
      });

      return round;
    });

    return createdRound;
  } catch (error) {
    return null;
  }
};

export const getRound = async (roundId: number, userId: number) => {
  try {
    const round = await prisma.rounds.findUnique({
      where: {
        id: roundId,
      },
    });

    if (!round || !(await isRoomMember(round.roomId, userId))) {
      return null;
    }

    return round;
  } catch (error) {
    return null;
  }
};

export const getCurrentRound = async (roomId: number, userId: number) => {
  try {
    const room = await getRoomById(roomId);
    if (!room || !(await isRoomMember(roomId, userId))) {
      return null;
    }

    const currentRound = room.currentRound;
    const round = await prisma.rounds.findUnique({
      where: {
        roomId_roundNumber: {
          roomId,
          roundNumber: currentRound,
        },
      },
    });

    return round;
  } catch (error) {
    return null;
  }
};

export const addMemberToRound = async (
  roundId: number,
  roomId: number,
  userId: number,
  type: RoundMemberType,
) => {
  try {
    const roomMember = await isRoomMember(roomId, userId);
    if (!roomMember) {
      return null;
    }

    const roundMemberAdded = await prisma.roundMembers.create({
      data: {
        roundId,
        roomId,
        userId,
        type,
      },
    });

    return roundMemberAdded;
  } catch (error) {
    return null;
  }
};

export const removeMemberFromRound = async (
  roundId: number,
  userId: number,
) => {
  try {
    return await prisma.roundMembers.delete({
      where: {
        roundId_userId: {
          roundId,
          userId,
        },
      },
    });
  } catch (error) {
    return null;
  }
};

export const startRound = async (
  userId: number,
  roomId: number,
  roundId: number,
  roundMembers: RoundMemberInput[],
) => {
  try {
    let playerCount = 0;
    if (!(await isRoomOwner(roomId, userId))) {
      return null;
    }

    const round = await prisma.rounds.findUnique({
      where: {
        id: roundId,
        roomId,
      },
    });

    if (!round) {
      return null;
    }

    if (round.status !== RoundStatus.WAITING) {
      return null;
    }

    for (const item of roundMembers) {
      if (!(await isRoomMember(roomId, item.userId))) {
        return null;
      }
      if (item.type === RoundMemberType.PLAYER) {
        playerCount++;
      }
    }

    if (playerCount != numberOfPlayersAllowed) {
      return null;
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of roundMembers) {
        await tx.roundMembers.create({
          data: {
            roundId,
            roomId,
            userId: item.userId,
            type: item.type,
          },
        });
      }

      const updatedRound = await tx.rounds.update({
        where: {
          id: roundId,
        },
        data: {
          status: RoundStatus.PLAYING,
        },
      });

      return updatedRound;
    });

    return result;
  } catch (error) {
    return null;
  }
};

export const endRound = async (
  userId: number,
  roomId: number,
  roundId: number,
) => {
  try {
    if (!(await isRoomOwner(roomId, userId))) {
      return null;
    }

    const round = await prisma.rounds.findUnique({
      where: {
        id: roundId,
        roomId,
      },
    });

    if (!round) {
      return null;
    }

    if (round.status === RoundStatus.FINISHED) {
      return null;
    }

    const updatedRound = await setRoundStatus(
      roomId,
      roundId,
      userId,
      RoundStatus.FINISHED,
    );

    return updatedRound;
  } catch (error) {
    return null;
  }
};

export const getRoundMembers = async (
  roomId: number,
  roundId: number,
  userId: number,
) => {
  try {
    if (!(await isRoomMember(roomId, userId))) {
      return null;
    }

    const roundMembers = await prisma.roundMembers.findMany({
      where: {
        roundId,
        roomId,
      },
    });

    return roundMembers;
  } catch (error) {
    return null;
  }
};

export const addRoundWord = async (
  rulerId: number,
  roomId: number,
  roundId: number,
  playerId: number,
  word: string,
  { isUpdate = false }: { isUpdate?: boolean },
) => {
  try {
    const roundMembers = await getRoundMembers(roomId, roundId, rulerId);
    if (!roundMembers) {
      return null;
    }

    const roundPlayerAndRuler = roundMembers.filter((item) =>
      [rulerId, playerId].includes(item.userId),
    );

    if (roundPlayerAndRuler.length !== 2) {
      return null;
    }

    const ruler = roundPlayerAndRuler.find(
      (item) => item.userId === rulerId && item.type === RoundMemberType.RULER,
    );
    if (!ruler) {
      return null;
    }

    const player = roundPlayerAndRuler.find(
      (item) =>
        item.userId === playerId && item.type === RoundMemberType.PLAYER,
    );
    if (!player) {
      return null;
    }

    if (isUpdate) {
      const updatedRoundWord = await prisma.roundWords.update({
        where: {
          roundId_playerId: {
            roundId,
            playerId: player.userId,
          },
        },
        data: {
          word,
        },
      });

      return updatedRoundWord;
    }
    const createdRoundWord = await prisma.roundWords.create({
      data: {
        roundId,
        playerId: player.userId,
        word,
      },
    });

    return createdRoundWord;
  } catch (error) {
    return null;
  }
};

export const getRoundWords = async (
  userId: number,
  roomId: number,
  roundId: number,
) => {
  try {
    if (!(await isRoomMember(roomId, userId))) {
      return null;
    }

    const roundMembers = await getRoundMembers(roomId, roundId, userId);

    if (!roundMembers) {
      return null;
    }

    let roundWords = await prisma.roundWords.findMany({
      where: {
        roundId,
        playerId: {
          not: userId,
        },
      },
    });

    return roundWords;
  } catch (error) {
    return null;
  }
};

export const getRoundOpponentWord = async (
  userId: number,
  roomId: number,
  roundId: number,
) => {
  try {
    if (!(await isRoomMember(roomId, userId))) {
      return null;
    }

    const roundMembers = await getRoundMembers(roomId, roundId, userId);

    if (!roundMembers) {
      return null;
    }

    const opponent = roundMembers.find(
      (item) => item.type === RoundMemberType.PLAYER && item.userId !== userId,
    );

    if (!opponent) {
      return null;
    }

    const roundWords = await prisma.roundWords.findUnique({
      where: {
        roundId_playerId: {
          roundId,
          playerId: opponent.userId,
        },
      },
    });

    return roundWords;
  } catch (error) {
    return null;
  }
};

export const getRoundMyWord = async (
  userId: number,
  roomId: number,
  roundId: number,
) => {
  try {
    if (!(await isRoomMember(roomId, userId))) {
      return null;
    }

    const roundMembers = await getRoundMembers(roomId, roundId, userId);

    if (!roundMembers) {
      return null;
    }

    const me = roundMembers.find(
      (item) => item.type === RoundMemberType.PLAYER && item.userId === userId,
    );

    if (!me) {
      return null;
    }

    const roundStatus = await getRoundStatus(roomId, roundId, userId);
    if (!roundStatus) {
      return null;
    }

    if (roundStatus !== RoundStatus.FINISHED) {
      return null;
    }
    const roundWords = await prisma.roundWords.findUnique({
      where: {
        roundId_playerId: {
          roundId,
          playerId: me.userId,
        },
      },
    });

    return roundWords;
  } catch (error) {
    return null;
  }
};

export const setRoundStatus = async (
  roomId: number,
  roundId: number,
  userId: number,
  status: RoundStatus,
) => {
  try {
    if (!(await isRoomOwner(roomId, userId))) {
      return null;
    }

    const roundUpdated = await prisma.rounds.update({
      where: {
        id: roundId,
        roomId,
      },
      data: {
        status,
      },
    });

    return roundUpdated;
  } catch (error) {
    return null;
  }
};

export const getRoundStatus = async (
  roomId: number,
  roundId: number,
  userId: number,
) => {
  try {
    if (!(await isRoomMember(roomId, userId))) {
      return null;
    }

    const status = (
      await prisma.rounds.findUnique({
        where: {
          id: roundId,
          roomId,
        },
        select: {
          status: true,
        },
      })
    )?.status;

    if (!status) {
      return null;
    }

    return status;
  } catch (error) {
    return null;
  }
};
