import { PlayerResult, Role, RoundMemberType, RoundMode } from "@/app/generated/prisma/enums";

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
  word?: string;
};

export type CreateRoomBody = {
  name: string;
  totalRounds: number;
  isPrivate: boolean;
  capacity: number;
  cards: Card[];
};

export type Card = {
  title: string;
  color: string;
  description: string;
  maxPerPlayer: number;
};

export type RoomMember = {
  roomId: number;
  userId: number;
  wins: number;
  roundsPlayed: number;
  roundsRuled: number;
  user: {
    name: string;
    picture: string | null;
  };
};

export interface RoundMember {
  userId: number;
  roomId: number;
  type: RoundMemberType;
  roundId: number;
}

export type CardUsed = {
  id: number;
  roomId: number;
  userId: number;
  roundId: number;
  cardId: string;
  usedAt: Date;
};

export type CardWithUsage = {
  cardId: string;
  title: string;
  description: string;
  color: string;
  maxPerPlayer: number;
  players: {
    userId: number;
    usedCount: number;
  }[];
};

export type VisiblePlayerWord = {
  playerId: number;
  word: string;
};

export type PlayerRoundResultInput = {
  playerId: number,
  result: PlayerResult
};
