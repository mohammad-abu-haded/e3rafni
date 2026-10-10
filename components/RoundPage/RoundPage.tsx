"use client";
import { useEffect, useState } from "react";
import styles from "./RoundPage.module.css";
import { ApiResponse, CardWithUsage, RoomMember } from "@/types";
import { GetData } from "@/services/api.service";
import NotFound from "@/app/not-found";
interface IProps {
  roomCode: string;
  userId: number;
}
const RoundPage = ({ roomCode, userId }: IProps) => {
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roomCards, setRoomCards] = useState<CardWithUsage[]>([]);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const getRoomMembers = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/members`,
      );

      if (!result || !result.data) {
        setHasError(true);
        return;
      }

      const fetchedRoomMembers: RoomMember[] = result.data;
      setRoomMembers(fetchedRoomMembers);
    };

    const getRoomCards = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/cards/usage`,
      );

      if (!result || !result.success || !result.data) {
        setHasError(true);
        return;
      }

      const fetchedRoomCards: CardWithUsage[] = result.data;
      setRoomCards(fetchedRoomCards);
    };

    getRoomMembers();
    getRoomCards();
  }, [roomCode]);

  if (hasError) {
    return <NotFound />;
  }

  return (
    <div>
    </div>
  );
};

export default RoundPage;
