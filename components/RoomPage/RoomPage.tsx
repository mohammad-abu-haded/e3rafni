"use client";
import { ApiResponse, Room, RoomMember } from "@/types";
import RoomInfoCard from "../RoomInfoCard/RoomInfoCard";
import RoomParticipants from "../RoomParticipants/RoomParticipants";
import styles from "./RoomPage.module.css";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import { notFound } from "next/navigation";
import { io } from "socket.io-client";
import RoomActions from "../RoomActions/RoomActions";

interface IProps {
  roomCode: string;
  userId: number;
}

const RoomPage = ({ roomCode, userId }: IProps) => {
  const [room, setRoom] = useState<Room>();
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  useEffect(() => {
    const getRoom = async () => {
      const result: ApiResponse = await GetData(`/api/rooms/${roomCode}`);
      if (!result || !result.data) {
        notFound();
      }

      const fetchedRoom: Room = result.data;
      setRoom(fetchedRoom);
    }

    getRoom();
  }, [roomCode]);

  useEffect(() => {
    const socket = io("http://localhost:3001");

    const getRoomMembers = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/members`,
      );
      if (!result || !result.data) {
        console.log("d");

        notFound();
      }

      const fetchedRoomMembers: RoomMember[] = result.data;
      setRoomMembers(fetchedRoomMembers);
    };

    getRoomMembers();

    socket.on("connect", () => { socket.emit("join-room", roomCode); });
    socket.on("room:members-updated", () => { getRoomMembers(); });
    return () => { socket.disconnect(); };

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
        <RoomActions currentRound={room.currentRound} roomCode={roomCode} roomName={room.name} roomMembers={roomMembers}/>
      </div>
    </div>
  );
};

export default RoomPage;
