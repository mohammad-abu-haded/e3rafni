"use client";
import { ApiResponse, Room, RoomMember, RoundMember } from "@/types";
import RoomInfoCard from "../RoomInfoCard/RoomInfoCard";
import RoomParticipants from "../RoomParticipants/RoomParticipants";
import styles from "./RoomPage.module.css";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import { notFound } from "next/navigation";
import RoomActions from "../RoomActions/RoomActions";
import { io } from "socket.io-client";

interface IProps {
  roomCode: string;
  userId: number;
}

const RoomPage = ({ roomCode, userId }: IProps) => {
  const [room, setRoom] = useState<Room>();
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roundMembers, setRoundMembers] = useState<RoundMember[]>([]);
  useEffect(() => {
    const getRoom = async () => {
      const result: ApiResponse = await GetData(`/api/rooms/${roomCode}`);
      if (!result || !result.data) {
        notFound();
      }

      const fetchedRoom: Room = result.data;
      setRoom(fetchedRoom);
    };

    getRoom();
  }, [roomCode]);

  useEffect(() => {
    const getRoomMembers = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/members`,
      );
      if (!result || !result.data) {
        notFound();
      }

      const fetchedRoomMembers: RoomMember[] = result.data;
      setRoomMembers(fetchedRoomMembers);
    };

    const getRoundMembers = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/rounds/members`,
      );
      if (!result || !result.data) {
        notFound();
      }

      const fetchedRoundMembers: RoundMember[] = result.data;
      setRoundMembers(fetchedRoundMembers);
    };

    getRoomMembers();
    getRoundMembers();

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.on("connect", () => {
      socket.emit("join-room", roomCode);
    });
    socket.on("room:members-updated", () => {
      getRoomMembers();
    });
    socket.on("round:ruler-selected", () => {
      getRoundMembers();
    });
    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  if (!room) {
    return <div>جاري تحميل الغرفة...</div>;
  }

  return (
    <div className={styles["room-page"]}>
      <div className={styles["room-info"]}>
        <RoomInfoCard
          roomName={room.name}
          currentRound={room.currentRound}
          playerCount={roomMembers.length}
          roomCode={roomCode}
        />

        <RoomParticipants roomMembers={roomMembers} userId={userId} />
      </div>

      <div className={styles["room-actions"]}>
        <RoomActions
          currentRound={room.currentRound}
          roomCode={roomCode}
          roomName={room.name}
          roomMembers={roomMembers}
          isRoomOwner={room.ownerId === userId}
        />
      </div>
    </div>
  );
};

export default RoomPage;
