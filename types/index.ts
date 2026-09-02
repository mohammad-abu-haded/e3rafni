import { Role, RoundMemberType, RoomStatus, RoundMode } from "@/app/generated/prisma/enums";

export type User = {
  id: number;
  role: Role;
  name: string;
  email: string;
  password: string | null;
  googleId: string | null;
  createdAt: Date;
};

export type ApiResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

export type Room = {
  id: number;
  name: string;
  totalRounds: number;
  currentRound: number;
  createdAt: Date;
  ownerId: number;
  code: string;
  isPrivate: boolean;
  capacity: number;
  isActive: boolean;
  status: RoomStatus;
};

export type Round = {
  id: number;
  roomId: number;
  roundNumber: number;
  roundDuration: number;
  startedAt: Date;
  mode: RoundMode;
};

export type RoundMemberInput = {
  userId: number;
  type: RoundMemberType;
};