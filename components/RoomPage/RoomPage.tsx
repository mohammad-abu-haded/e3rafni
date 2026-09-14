"use client";
import { ApiResponse, Room } from "@/types";
import RoomInfoCard from "../RoomInfoCard/RoomInfoCard";
import RoomParticipants from "../RoomParticipants/RoomParticipants";
import styles from "./RoomPage.module.css";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import { notFound } from "next/navigation";
interface IProps {
  roomCode: string;
  userId: number;
}

const RoomPage = ({ roomCode, userId }: IProps) => {
  const [room, setRoom] = useState<Room>();
  useEffect(() => {
    const getRoom = async () => {
      const result: ApiResponse = await GetData(`/api/rooms/${roomCode}`);
      if(!result || !result.data) {
        notFound();
      }

      const fetchedRoom: Room = result.data;
      setRoom(fetchedRoom);
    }
    
    getRoom();
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
          playerCount={0}
          roomCode={roomCode}
        />

        <RoomParticipants roomCode={roomCode} userId={userId} />
      </div>
    </div>
  );
};

export default RoomPage;
