import { RoomStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { Card, Room } from "@/types";

import { customAlphabet } from "nanoid";

const generateRoomCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const createUniqueRoomCode = async () => {
  while (true) {
    const code = generateRoomCode();

    const existingRoom = await prisma.rooms.findUnique({
      where: { code },
    });

    if (!existingRoom) {
      return code;
    }
  }
};

export const isRoomOwner = async (
  roomId: number,
  userId: number,
): Promise<boolean> => {
  try {
    const room = await getRoomById(roomId);
    if (!room) {
      return false;
    }
    return room.ownerId === userId;
  } catch (error) {
    return false;
  }
};

export const isRoomMember = async (
  roomId: number,
  userId: number,
): Promise<boolean> => {
  try {
    const roomMember = await prisma.roomMembers.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    return roomMember ? true : false;
  } catch (error) {
    return false;
  }
};

export const createRoom = async (
  ownerId: number,
  name: string,
  totalRounds: number,
  isPrivate: boolean,
  capacity: number,
  cards: Card[],
): Promise<Room | null> => {
  try {
    const roomCode = await createUniqueRoomCode();
    const room = await prisma.rooms.create({
      data: {
        name,
        totalRounds,
        ownerId,
        isPrivate,
        capacity,
        code: roomCode,
        currentRound: 0,
        cards,
      },
    });
    await joinRoom(ownerId, roomCode);
    return room;
  } catch (error) {
    return null;
  }
};

export const getRoomById = async (id: number): Promise<Room | null> => {
  try {
    const room = await prisma.rooms.findUnique({
      where: {
        id,
      },
    });

    return room;
  } catch (error) {
    return null;
  }
};

export const getRoomByCode = async (
  code: string,
  userId: number,
): Promise<Room | null> => {
  try {
    code = code.toUpperCase();
    const room = await prisma.rooms.findUnique({
      where: {
        code,
      },
    });

    if (!room || !(await isRoomMember(room.id, userId))) {
      return null;
    }

    return room;
  } catch (error) {
    return null;
  }
};

export const getRoomMembers = async (userId: number, roomCode: string) => {
  try {
    roomCode = roomCode.toUpperCase();
    const room = await getRoomByCode(roomCode, userId);
    if (!room) {
      return null;
    }

    const roomMembers = await prisma.roomMembers.findMany({
      where: {
        roomId: room.id,
      },
      orderBy: {
        wins: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            picture: true,
          },
        },
      },
    });

    return roomMembers;
  } catch (error) {
    return null;
  }
};

export const getRoomMemberCount = async (roomId: number) => {
  return await prisma.roomMembers.count({
    where: {
      roomId,
    },
  });
};

export const joinRoom = async (userId: number, code: string) => {
  try {
    code = code.toUpperCase();
    const room = await prisma.rooms.findUnique({
      where: {
        code,
      },
    });
    if (
      !room ||
      !((await getRoomMemberCount(room.id)) < room.capacity) ||
      !room.isActive
    ) {
      return null;
    }
    const roomMember = await prisma.roomMembers.create({
      data: {
        roomId: room.id,
        userId,
      },
    });

    return roomMember;
  } catch (error) {
    return null;
  }
};

export const leaveRoom = async (roomId: number, userId: number) => {
  try {
    return await prisma.roomMembers.delete({
      where: {
        roomId_userId: { roomId, userId },
      },
    });
  } catch (error) {
    return null;
  }
};

export const deleteRoom = async (roomId: number, userId: number) => {
  try {
    if (!(await isRoomOwner(roomId, userId))) {
      return null;
    }

    return await prisma.rooms.delete({
      where: {
        id: roomId,
      },
    });
  } catch (error) {
    return null;
  }
};

export const updateRoom = async (
  roomId: number,
  name: string,
  totalRounds: number,
  userId: number,
  isPrivate: boolean,
  capacity: number,
) => {
  try {
    if (!(await isRoomOwner(roomId, userId))) {
      return null;
    }

    const roomUpdated = await prisma.rooms.update({
      where: {
        id: roomId,
      },
      data: {
        name,
        totalRounds,
        isPrivate,
        capacity,
      },
    });

    return roomUpdated;
  } catch (error) {
    return null;
  }
};

export const setRoomStatus = async (
  roomId: number,
  userId: number,
  status: RoomStatus,
) => {
  try {
    if (!(await isRoomOwner(roomId, userId))) {
      return null;
    }

    const roomUpdated = await prisma.rooms.update({
      where: {
        id: roomId,
      },
      data: {
        status,
      },
    });

    return roomUpdated;
  } catch (error) {
    return null;
  }
};

export const incrementPlayerWins = async (
  userId: number,
  playerId: number,
  roomId: number,
) => {
  try {
    if (
      !(
        (await isRoomOwner(roomId, userId)) &&
        (await isRoomMember(roomId, playerId))
      )
    ) {
      return null;
    }

    await prisma.roomMembers.update({
      where: {
        roomId_userId: {
          roomId,
          userId: playerId,
        },
      },
      data: {
        wins: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    return null;
  }
};

export const getPlayerWins = async (playerId: number, roomId: number) => {
  try {
    if (!(await isRoomMember(roomId, playerId))) {
      return null;
    }

    const playerWins = (
      await prisma.roomMembers.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId: playerId,
          },
        },
        select: {
          wins: true,
        },
      })
    )?.wins;

    return playerWins;
  } catch (error) {
    return null;
  }
};

export const getPlayerRoundsPlayed = async (
  userId: number,
  playerId: number,
  roomCode: string,
) => {
  try {
    const room = await getRoomByCode(roomCode, userId);
    if (!room) {
      return null;
    }
    const playerRoundsPlayed = await prisma.roundMembers.count({
      where: {
        userId: playerId,
        roomId: room.id,
        type: "PLAYER",
      },
    });

    return playerRoundsPlayed;
  } catch (error) {
    return null;
  }
};

export const getPlayerRoundsRuled = async (
  userId: number,
  playerId: number,
  roomCode: string,
) => {
  try {
    const room = await getRoomByCode(roomCode, userId);
    if (!room) {
      return null;
    }
    const playerRoundsPlayed = await prisma.roundMembers.count({
      where: {
        userId: playerId,
        roomId: room.id,
        type: "RULER",
      },
    });

    return playerRoundsPlayed;
  } catch (error) {
    return null;
  }
};
