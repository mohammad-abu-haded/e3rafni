import { ApiResponse, RoomMember, RoundMember } from "@/types";
import { GetData } from "./api.service";

export const fetchRoomMembers  = async (
  roomCode: string,
): Promise<{ roomMembers?: RoomMember[]; hasError: boolean }> => {
  const result: ApiResponse = await GetData(`/api/rooms/${roomCode}/members`);

  if (!result || !result.success || !result.data) {
    return { hasError: true };
  }

  return { roomMembers: result.data as RoomMember[], hasError: false };
};

export const fetchRoundMembers = async (
  roomCode: string,
): Promise<{ roundMembers?: RoundMember[]; hasError: boolean }> => {
  const result: ApiResponse = await GetData(
    `/api/rooms/${roomCode}/rounds/members`,
  );

  if (!result || !result.success || !result.data) {
    return { hasError: true };
  }

  return { roundMembers: result.data as RoundMember[], hasError: false };
};