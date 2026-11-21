"use client";
import { ApiResponse, Room, RoomMember, Round, RoundMember } from "@/types";
import RoomInfoCard from "../RoomInfoCard/RoomInfoCard";
import RoomParticipants from "../RoomParticipants/RoomParticipants";
import styles from "./RoomPage.module.css";
import { useEffect, useRef, useState } from "react";
import { GetData, PostData } from "@/services/api.service";
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
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";

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
  const initializationRef = useRef<Promise<boolean> | null>(null);
  const getRoom = async () => {
    const result: ApiResponse = await GetData(`/api/rooms/${roomCode}`);

    if (!result?.success || !result.data) {
      return false;
    }

    setRoom(result.data);
    return true;
  };

  const initializeRoom = async (): Promise<boolean> => {
    let isMember = await getRoom();

    if (!isMember) {
      const result: ApiResponse<{ roomCode: string }> =
        (await PostData(`/api/rooms/${roomCode}/join`)) ?? API_ERROR_RESPONSE;

      if (!result.success) {
        toast.error(result.message || "تعذر الانضمام إلى الغرفة.");
        setHasError(true);
        return false;
      }

      toast.success(result.message);

      router.refresh();

      isMember = await getRoom();

      if (!isMember) {
        setHasError(true);
        return false;
      }
    }

    await getRoomData();
    return true;
  };
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

  const getRoomData = async () => {
    await getMembers();
    await getRound();
  };

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;
    let isCancelled = false;

    const initialize = async () => {
      if (!initializationRef.current) {
        initializationRef.current = initializeRoom();
      }

      const success = await initializationRef.current;

      if (!success || isCancelled) return;

      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        withCredentials: true,
      });

      const handleConnect = () => {
        socket?.emit("join-room", roomCode);
      };

      const handleRulerUpdated = () => {
        getRoom();
        getMembers();
        getRound();
      };

      const handleRoomMembersUpdated = () => {
        getRoomMembers();
      };

      const handleRoomMemberLeft = () => {
        getMembers();
      };

      const handleRoomEnded = () => {
        toast.info("تم إنهاء الغرفة من قبل صاحبها");
        router.push("/");
      };

      const handleRoundStarted = () => {
        router.push(`/rooms/${roomCode.toLowerCase()}/round`);
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
    };

    initialize();

    return () => {
      isCancelled = true;

      socket?.disconnect();
    };
  }, [roomCode]);

  if (hasError) {
    return <NotFound />;
  }

  if (!room) {
    return (
      <LoadingSpinner
        title="جاري تحميل الغرفة..."
        className={styles["room-loading"]}
      />
    );
  }

  return (
    <div className={styles["room-page"]}>
      <div className={styles["room-info"]}>
        <RoomInfoCard
          roomName={room.name}
          currentRoundNumber={room.currentRound}
          currentRoundStatus={currentRound?.status || "FINISHED"}
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
            playedRoundsCount={room.playedRounds || 0}
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
