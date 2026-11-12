"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./TurnTimer.module.css";

import { Round, RoundMember, RoomMember, User } from "@/types";
import { RoundMemberType, RoundStatus } from "@/app/generated/prisma/enums";

type Player = Pick<User, "id" | "name"> & {
  picture: string | null;
};

interface IProps {
  round: Round | undefined;
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  currentTurnPlayer: Pick<User, "id" | "name"> | null;
}

const formatTime = (value: number) => String(value).padStart(2, "0");

const TurnPlayers = ({
  round,
  roundMembers,
  roomMembers,
  currentTurnPlayer,
}: IProps) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const players: Player[] = roundMembers
    .filter((member) => member.type === RoundMemberType.PLAYER)
    .slice(0, 2)
    .map((member) => {
      const roomMember = roomMembers.find(
        (item) => item.userId === member.userId,
      );

      return {
        id: member.userId,
        name: roomMember?.user.name || `Player ${member.userId}`,
        picture: roomMember?.user.picture || null,
      };
    });

  const turnDuration = round?.turnDuration ?? 0;
  const roundDuration = round?.roundDuration ?? 0;
  const turnMs = turnDuration * 1000;

  const startTime = round ? new Date(round.startedAt).getTime() : 0;

  const elapsedRoundTime = Math.min(
    roundDuration * 1000,
    Math.max(0, currentTime - startTime),
  );

  const elapsedTurnTime = turnMs > 0 ? elapsedRoundTime % turnMs : 0;

  const remainingTime =
    turnMs > 0
      ? Math.max(
          0,
          Math.ceil(
            Math.min(
              turnMs - elapsedTurnTime,
              roundDuration * 1000 - elapsedRoundTime,
            ) / 1000,
          ),
        )
      : 0;

  const progress = turnMs > 0 ? Math.min(100, (elapsedTurnTime / turnMs) * 100) : 0;

  const turnIndex = turnMs > 0 ? Math.floor(elapsedRoundTime / turnMs) : 0;

  const turnOffsetRef = useRef(0);

  useEffect(() => {
    if (!currentTurnPlayer || turnMs <= 0) return;

    const msIntoTurn = elapsedRoundTime % turnMs;
    if (msIntoTurn < 600 || turnMs - msIntoTurn < 600) return;

    const propIndex = players.findIndex((p) => p.id === currentTurnPlayer.id);
    if (propIndex < 0) return;

    turnOffsetRef.current = (((propIndex - turnIndex) % 2) + 2) % 2;
  });

  const isRoundOver =
    roundDuration > 0 && elapsedRoundTime >= roundDuration * 1000;

  const activePlayerId = isRoundOver
    ? undefined
    : turnMs > 0
      ? players[(turnIndex + turnOffsetRef.current) % 2]?.id
      : currentTurnPlayer?.id;

  const isPlaying = round?.status === RoundStatus.PLAYING;
  const isCritical = remainingTime > 0 && remainingTime <= 5;
  const isFinished = remainingTime === 0;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  if (players.length !== 2) return null;

  return (
    <div className={styles["turn-players"]}>
      <div className={styles["players-container"]}>
        {players.map((player, index) => {
          const isActive = isPlaying && activePlayerId === player.id;
          const isWaiting = isPlaying && !isRoundOver && !isActive;

          return (
            <Fragment key={player.id}>
              {index === 1 && (
                <span className={styles["versus"]} aria-hidden="true">
                  VS
                </span>
              )}

              <article
                className={`${styles["player-card"]} ${
                  isActive ? styles["player-active"] : ""
                }`}
              >
                <div className={styles["player-card-header"]}>
                  <div className={styles["player-avatar"]}>
                    {player.picture ? (
                      <Image
                        src={player.picture}
                        alt={player.name}
                        width={56}
                        height={56}
                        quality={90}
                      />
                    ) : (
                      <span>{player.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className={styles["player-info"]}>
                    <span className={styles["player-role"]}>
                      {isActive
                        ? "صاحب الدور"
                        : isWaiting
                          ? "ينتظر دوره"
                          : isRoundOver
                            ? "انتهت الجولة"
                            : "لا يوجد دور حالي"}
                    </span>

                    <strong title={player.name}>{player.name}</strong>
                  </div>

                  <div
                    className={`${styles["player-status"]} ${
                      isActive ? styles["status-active"] : ""
                    }`}
                    aria-label={isActive ? "الدور الحالي" : "بانتظار الدور"}
                  />
                </div>

                <div className={styles["player-timer"]}>
                  {isActive && turnDuration > 0 ? (
                    <>
                      <div className={styles["timer-value"]} dir="ltr">
                        <span>{formatTime(minutes)}</span>
                        <span>:</span>
                        <span>{formatTime(seconds)}</span>
                      </div>

                      <span
                        className={`${styles["timer-message"]} ${
                          isCritical ? styles["timer-message-critical"] : ""
                        } ${
                          isFinished ? styles["timer-message-finished"] : ""
                        }`}
                      >
                        {isFinished
                          ? "انتهى وقت الدور"
                          : isCritical
                            ? "اقترب انتهاء الوقت"
                            : "الوقت المتبقي"}
                      </span>
                    </>
                  ) : (
                    <div className={styles["waiting-message"]}>
                      {isRoundOver
                        ? "انتهى وقت الجولة"
                        : isWaiting
                          ? "بانتظار انتهاء دور اللاعب الآخر"
                          : isPlaying
                            ? "بانتظار تحديد الدور"
                            : "لم تبدأ الجولة بعد"}
                    </div>
                  )}
                </div>

                <div className={styles["progress-track"]}>
                  <div
                    className={`${styles["progress-bar"]} ${
                      isActive && isCritical ? styles["progress-critical"] : ""
                    }`}
                    style={{
                      width: `${isActive ? progress : 0}%`,
                      transition: isActive ? "width 0.25s linear" : "none",
                    }}
                  />
                </div>
              </article>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default TurnPlayers;