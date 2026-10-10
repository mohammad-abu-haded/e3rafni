"use client";
import { useEffect, useState } from "react";
import styles from "./RoundPage.module.css";
import {
  ApiResponse,
  CardWithUsage,
  RoomMember,
  Round,
  RoundMember,
} from "@/types";
import { GetData } from "@/services/api.service";
import NotFound from "@/app/not-found";
import { RoundMemberType } from "@/app/generated/prisma/enums";
import {
  fetchRoomMembers,
  fetchRoundMembers,
} from "@/services/room-api.service";
interface IProps {
  roomCode: string;
  userId: number;
}
const RoundPage = ({ roomCode, userId }: IProps) => {
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roundMembers, setRoundMembers] = useState<RoundMember[]>([]);
  const [round, setRound] = useState<Round>();
  const [roomCards, setRoomCards] = useState<CardWithUsage[]>([]);
  const [roundRule, setRoundRule] = useState<RoundMemberType>();
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const getRoomMembers = async () => {
      const result = await fetchRoomMembers(roomCode);

      if (result.hasError) {
        setHasError(true);
        return;
      }

      setRoomMembers(result.roomMembers ?? []);
    };

    const getRoundMembers = async () => {
      const result = await fetchRoundMembers(roomCode);

      if (result.hasError) {
        setHasError(true);
        return;
      }

      setRoundMembers(result.roundMembers ?? []);
      const rule = result.roundMembers?.find(
        (member) => member.userId === userId,
      )?.type;
      setRoundRule(rule);
    };

    const getMembers = async () => {
      await Promise.all([getRoomMembers(), getRoundMembers()]);
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

    const getRound = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/rounds`,
      );

      if (!result || !result.success || !result.data) {
        setHasError(true);
        return;
      }

      const fetchedRound: Round = result.data;
      setRound(fetchedRound);
    };

    getMembers();
    getRoomCards();
    getRound();
  }, [roomCode]);

  if (hasError) {
    return <NotFound />;
  }

  return <div></div>;
};

export default RoundPage;
