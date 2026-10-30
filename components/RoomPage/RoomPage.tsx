"use client";
import { ApiResponse, Room, RoomMember, RoundMember } from "@/types";
import RoomInfoCard from "../RoomInfoCard/RoomInfoCard";
import RoomParticipants from "../RoomParticipants/RoomParticipants";
import styles from "./RoomPage.module.css";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import { redirect } from "next/navigation";
import RoomActions from "../RoomActions/RoomActions";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import CurrentRoundCard from "../CurrentRoundCard/CurrentRoundCard";
import NotFound from "@/app/not-found";
import {
  fetchRoomMembers,
  fetchRoundMembers,
} from "@/services/room-api.service";

interface IProps {
  roomCode: string;
  userId: number;
}

const RoomPage = ({ roomCode, userId }: IProps) => {
  const [room, setRoom] = useState<Room>();
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roundMembers, setRoundMembers] = useState<RoundMember[]>([]);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const getRoom = async () => {
      const result: ApiResponse = await GetData(`/api/rooms/${roomCode}`);
      if (!result || !result.data) {
        setHasError(true);
        return;
      }

      const fetchedRoom: Room = result.data;
      setRoom(fetchedRoom);
    };

    getRoom();
  }, [roomCode]);

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
        return;
      }

      setRoundMembers(result.roundMembers ?? []);
    };

    const getMembers = async () => {
      await Promise.all([getRoomMembers(), getRoundMembers()]);
    };

    getMembers();

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.on("connect", () => {
      socket.emit("join-room", roomCode);
    });
    socket.on("room:members-updated", () => {
      getRoomMembers();
    });

    socket.on("room:member-left", () => {
      getMembers();
    });
    socket.on("round:members-updated", () => {
      getRoundMembers();
    });
    socket.on("room:ended", () => {
      toast.info("تم إنهاء الغرفة من قبل صاحبها");
      redirect("/");
    });
    socket.on("round:started", () => {
      redirect(`/rooms/${roomCode.toLocaleLowerCase()}/round`);
    });
    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  if (hasError) {
    return <NotFound />;
  }

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

        <RoomParticipants roomMembers={roomMembers} userId={userId} ownerId={room.ownerId}/>
      </div>

      <div className={styles["room-cards"]}>
        <div className={styles["room-card"]}>
          <RoomActions
            userId={userId}
            currentRound={room.currentRound}
            roomCode={roomCode}
            roomName={room.name}
            roomMembers={roomMembers}
            isRoomOwner={room.ownerId === userId}
            isRuler={roundMembers.some(
              (item) => item.type === "RULER" && item.userId === userId,
            )}
            hasRuler={
              roundMembers && roundMembers.some((item) => item.type === "RULER")
            }
          />
        </div>
        <div className={styles["room-card"]}>
          <CurrentRoundCard
            userId={userId}
            roomMembers={roomMembers}
            roundMembers={roundMembers}
            roomCode={roomCode}
            ownerId={room.ownerId}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
