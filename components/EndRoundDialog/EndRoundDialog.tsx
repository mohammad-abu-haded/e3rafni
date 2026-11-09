"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./EndRoundDialog.module.css";
import { RoundMemberType } from "@/app/generated/prisma/enums";
import {
  ApiResponse,
  PlayerRoundResultInput,
  Room,
  RoomMember,
  RoundMember,
} from "@/types";
import ActionButton from "@/components/ActionButton/ActionButton";
import FinishIcon from "@/public/finish.svg";
import { GetData, PostData } from "@/services/api.service";
import { toast } from "react-toastify";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import NotFound from "@/app/not-found";
import { io } from "socket.io-client";
import Image from "next/image";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  withCredentials: true,
});

interface IProps {
  userId: number;
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  roomCode: string;
}

const EndRoundDialog = ({
  userId,
  roundMembers,
  roomMembers,
  roomCode,
}: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isRoomOwner = useRef<boolean | null>(null);
  const isRuler = roundMembers.some(
    (member) =>
      member.userId === userId && member.type === RoundMemberType.RULER,
  );

  const players = roundMembers
    .filter((member) => member.type === RoundMemberType.PLAYER)
    .map((member) => {
      const roomMember = roomMembers.find(
        (item) => item.userId === member.userId,
      );

      return {
        userId: member.userId,
        name: roomMember?.user.name ?? `اللاعب ${member.userId}`,
        picture: roomMember?.user.picture ?? profilePlaceholderBase64,
      };
    });

  const handleSubmit = async (formData: FormData) => {
    try {
      const winner = formData.get("winner");

      if (winner === null) {
        return;
      }

      const winnerId = winner === "draw" ? null : Number(winner);
      const firstPlayerId: number = roundMembers.find(
        (item) => item.type === "PLAYER",
      )?.userId!;
      const secondPlayerId: number = roundMembers.find(
        (item) => item.type === "PLAYER" && item.userId !== firstPlayerId,
      )?.userId!;
      const endRoundRequest: PlayerRoundResultInput[] =
        winnerId === null
          ? [
              { result: "DRAW", playerId: firstPlayerId },
              { result: "DRAW", playerId: secondPlayerId },
            ]
          : [
              { result: "WIN", playerId: winnerId },
              {
                result: "LOSS",
                playerId:
                  winnerId === firstPlayerId ? secondPlayerId : firstPlayerId,
              },
            ];

      const result: ApiResponse =
        (await PostData(
          `/api/rooms/${roomCode}/rounds/end`,
          endRoundRequest,
        )) || API_ERROR_RESPONSE;

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setIsOpen(false);
      socket.emit("server:round-ended", roomCode);
    } catch (error) {
      toast.error("حدث خطأ أثناء إنهاء الجولة");
    }
  };

  useEffect(() => {
    const getRoom = async () => {
      const result: ApiResponse = await GetData(`/api/rooms/${roomCode}`);
      if (!result || !result.data) {
        return <NotFound />;
      }

      const fetchedRoom: Room = result.data;
      isRoomOwner.current = fetchedRoom.ownerId === userId;
    };

    getRoom();
  }, [roomCode]);

  if (!isRuler && isRoomOwner.current === false) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-leave"
        onClick={() => setIsOpen(true)}
      >
        <FinishIcon className="icon" />
        إنهاء الجولة
      </button>

      {isOpen && (
        <div
          className={styles["dialog-overlay"]}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`${styles["dialog"]} ${styles["winner-dialog"]}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-round-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`${styles["dialog-header"]} ${styles["winner-header"]}`}
            >
              <h2 id="end-round-title">إنهاء الجولة</h2>

              <p>اختر الفائز أو سجّل تعادلًا لإنهاء الجولة.</p>
            </div>

            <form action={handleSubmit}>
              <fieldset
                className={`${styles["winner-options"]} ${styles["winner-grid"]}`}
              >
                <legend>من الفائز؟</legend>

                {players.map((player) => (
                  <label
                    key={player.userId}
                    className={`${styles["winner-option"]} ${styles["winner-choice"]}`}
                  >
                    <input
                      type="radio"
                      name="winner"
                      value={player.userId}
                      required
                    />

                    <span className={styles["winner-avatar"]}>
                      <Image
                        className={styles["winner-avatar-image"]}
                        src={player.picture}
                        alt=""
                        width={68}
                        height={68}
                      />
                    </span>
                    <span>{player.name}</span>
                  </label>
                ))}

                <label
                  className={`${styles["winner-option"]} ${styles["winner-choice"]} ${styles["draw-option"]}`}
                >
                  <input type="radio" name="winner" value="draw" required />

                  <span>تعادل</span>
                </label>
              </fieldset>

              <div
                className={`${styles["dialog-actions"]} ${styles["winner-actions"]}`}
              >
                <ActionButton
                  title="تأكيد النتيجة"
                  className={`btn btn-primary ${styles["winner-confirm"]}`}
                  disabled={players.length !== 2}
                />

                <button
                  type="button"
                  className={`btn btn-secondary ${styles["winner-cancel"]}`}
                  onClick={() => setIsOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EndRoundDialog;
