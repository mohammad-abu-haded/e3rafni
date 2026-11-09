"use client";
import { ApiResponse, Room, RoomMember, Round, RoundMember } from "@/types";
import RoomInfoCard from "../RoomInfoCard/RoomInfoCard";
import RoomParticipants from "../RoomParticipants/RoomParticipants";
import styles from "./RoomPage.module.css";
import { useEffect, useRef, useState } from "react";
import { GetData } from "@/services/api.service";
import { redirect, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [room, setRoom] = useState<Room>();
  const [currentRound, setCurrentRound] = useState<Round>();
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [roundMembers, setRoundMembers] = useState<RoundMember[]>([]);
  const [hasError, setHasError] = useState(false);

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
      setRoundMembers([]);
      return;
    }

    setRoundMembers(result.roundMembers ?? []);    
  };

  const getMembers = async () => {
    await Promise.all([getRoomMembers(), getRoundMembers()]);
  };

  const getRound = async () => {
    const result: ApiResponse<Round> = await GetData(
      `/api/rooms/${roomCode}/rounds`,
    );

    if (result?.success && result.data) {
      setCurrentRound(result.data);
    } else {
      setCurrentRound(undefined);
    }
  };

  const getRoom = async () => {
    const result: ApiResponse = await GetData(`/api/rooms/${roomCode}`);
    if (!result || !result.data) {
      setHasError(true);
      return;
    }

    const fetchedRoom: Room = result.data;
    setRoom(fetchedRoom);
  };

  const getRoomData = async () => {
    await getMembers();
    await getRound();
  };

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      withCredentials: true,
    });

    const handleConnect = () => {
      socket.emit("join-room", roomCode);
    };

    const handleRoomMembersUpdated = () => {
      getRoomMembers();
    };

    const handleRoomMemberLeft = () => {
      getMembers();
    };

    const handleRulerUpdated = () => {
      getMembers();
      getRound();
      getRoom();
    };

    const handleRoomEnded = () => {
      toast.info("تم إنهاء الغرفة من قبل صاحبها");
      redirect("/");
    };

    const handleRoundStarted = () => {
      router.push(`/rooms/${roomCode.toLocaleLowerCase()}/round`);
    };

    const handleRoundEnded = () => {
      toast.info("تم إنهاء الجولة");
      getMembers();
      getRound();
      getRoom();
    };

    socket.on("connect", handleConnect);
    socket.on("room:members-updated", handleRoomMembersUpdated);
    socket.on("room:member-left", handleRoomMemberLeft);
    socket.on("round:ruler-updated", handleRulerUpdated);
    socket.on("room:ended", handleRoomEnded);
    socket.on("round:started", handleRoundStarted);
    socket.on("round:ended", handleRoundEnded);
    if (socket.connected) {
      handleConnect();
    }

    getRoomData();
    getRoom();
    return () => {
      socket.off("connect", handleConnect);
      socket.off("room:members-updated", handleRoomMembersUpdated);
      socket.off("room:member-left", handleRoomMemberLeft);
      socket.off("round:ruler-updated", handleRulerUpdated);
      socket.off("room:ended", handleRoomEnded);
      socket.off("round:started", handleRoundStarted);
      socket.off("round:ended", handleRoundEnded);
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
          currentRoundNumber={room.currentRound}
          currentRoundStatus={currentRound?.status || "FINISHED" }
          playerCount={roomMembers.length}
          roomCode={roomCode}
        />

        <RoomParticipants
          roomMembers={roomMembers}
          userId={userId}
          ownerId={room.ownerId}
        />
      </div>

      <div className={styles["room-cards"]}>
        <div className={styles["room-card"]}>
          <RoomActions
            userId={userId}
            currentRound={currentRound}
            roomCode={roomCode}
            roomName={room.name}
            roomMembers={roomMembers}
            roundMembers={roundMembers}
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
            currentRound={currentRound}
            userId={userId}
            roomMembers={roomMembers}
            roundMembers={roundMembers}
            roundNumber={room.currentRound}
            ownerId={room.ownerId}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
