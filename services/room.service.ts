import { RoomStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { Room } from "@/types";

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

export const createRoom = async (
  name: string,
  totalRounds: number,
  ownerId: number,
  isPrivate: boolean,
  capacity: number,
): Promise<Room | null> => {
  try {
    const room = await prisma.rooms.create({
      data: {
        name,
        totalRounds,
        ownerId,
        isPrivate,
        capacity,
        code: await createUniqueRoomCode(),
        currentRound: 0,
      },
    });

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

export const getRoomByCode = async (code: string): Promise<Room | null> => {
  try {
    const room = await prisma.rooms.findUnique({
      where: {
        code,
      },
    });

    return room;
  } catch (error) {
    return null;
  }
};

export const getRoomMembers = async (roomId: number) => {
  try {
    const roomMembers = await prisma.roomMembers.findMany({
      where: {
        roomId,
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
    const room = await getRoomByCode(code);
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
    const room = await getRoomById(roomId);
    if (!room || room.ownerId !== userId) {
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
    const room = await getRoomById(roomId);
    if (!room || room.ownerId !== userId) {
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
    const room = await getRoomById(roomId);
    if (!room || room.ownerId !== userId) {
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
