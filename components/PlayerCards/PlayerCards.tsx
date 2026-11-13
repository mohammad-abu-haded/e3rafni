"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./PlayerCards.module.css";

import {
  RoomMember,
  Round,
  RoundMember,
  User,
  VisiblePlayerWord,
} from "@/types";
import { RoundMemberType, RoundStatus } from "@/app/generated/prisma/enums";
import SearchIcon from "@/public/search.svg";
import GoogleAIIcon from "@/public/GoogleAIIcon.svg";
import EditIcon from "@/public/edit.svg";

type Player = Pick<User, "id" | "name"> & {
  picture: string | null;
};

interface IProps {
  round: Round;
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  playerWords: VisiblePlayerWord[];
  roundRule?: RoundMemberType;
  currentTurnPlayer: Pick<User, "id" | "name"> | null;
  onEditPlayerWord: (playerId: number, word: string) => void;
}

const formatTime = (value: number) => String(value).padStart(2, "0");

const PlayerCards = ({
  round,
  roundMembers,
  roomMembers,
  playerWords,
  roundRule,
  currentTurnPlayer,
  onEditPlayerWord,
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

  const turnDuration = round.turnDuration ?? 0;
  const roundDuration = round.roundDuration;
  const turnMs = turnDuration * 1000;
  const startTime = new Date(round.startedAt).getTime();

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
  const progress =
    turnMs > 0 ? Math.min(100, (elapsedTurnTime / turnMs) * 100) : 0;
  const turnIndex = turnMs > 0 ? Math.floor(elapsedRoundTime / turnMs) : 0;

  const isRoundOver =
    roundDuration > 0 && elapsedRoundTime >= roundDuration * 1000;
  const activePlayerId = isRoundOver
    ? undefined
    : (currentTurnPlayer?.id ??
      (turnMs > 0 ? players[turnIndex % 2]?.id : undefined));
  const isPlaying = round.status === RoundStatus.PLAYING;
  const isCritical = remainingTime > 0 && remainingTime <= 5;
  const isFinished = remainingTime === 0;
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  if (players.length !== 2) return null;

  return (
    <div className={styles["players-container"]}>
      {players.map((player, index) => {
        const isActive = isPlaying && activePlayerId === player.id;
        const isWaiting = isPlaying && !isRoundOver && !isActive;
        const playerWord = playerWords.find(
          (item) => item.playerId === player.id,
        )?.word;

        return (
          <Fragment key={player.id}>
            {index === 1 && (
              <span className={styles["versus"]} aria-hidden="true">
                ضد
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
                      width={48}
                      height={48}
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
                      } ${isFinished ? styles["timer-message-finished"] : ""}`}
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

              <div className={styles["player-word"]}>
                <span className={styles["word-label"]}>كلمة اللاعب</span>
                {playerWord ? (
                  <div className={styles["player-word-content"]}>
                    <strong className={styles["player-word-text"]}>
                      {playerWord}
                    </strong>
                    <div className={styles["word-actions"]}>
                      <button
                        type="button"
                        className={`${styles["word-action"]} ${styles["word-search-images"]}`}
                        onClick={() => {
                          const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(playerWord)}`;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        aria-label={`البحث عن ${playerWord} في صور Google`}
                        title="البحث عن الصور"
                      >
                        <SearchIcon aria-hidden="true" />
                        <span>البحث عن صور</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles["word-action"]} ${styles["word-search-ai"]}`}
                        onClick={() => {
                          const prompt = `اشرح لي ما هي "${playerWord}"، وما أهم خصائصها واستخداماتها، بطريقة مبسطة وواضحة، مع إعطاء أمثلة تساعدني على التعرف عليها.`;

                          const url = `https://www.google.com/search?udm=50&q=${encodeURIComponent(prompt)}`;

                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        aria-label={`استكشاف ${playerWord} باستخدام Google AI Mode`}
                        title="البحث باستخدام الذكاء الاصطناعي"
                      >
                        <GoogleAIIcon aria-hidden="true" />
                        <span>اسأل الذكاء الاصطناعي</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className={styles["player-word-hidden"]}>
                    الكلمة مخفية
                  </span>
                )}
                {roundRule === RoundMemberType.RULER && (
                  <button
                    type="button"
                    className={styles["edit-player-word-button"]}
                    onClick={() =>
                      onEditPlayerWord(player.id, playerWord ?? "")
                    }
                    disabled={!playerWord}
                  >
                    <EditIcon aria-hidden="true" />
                    <span>تعديل الكلمة</span>
                  </button>
                )}
              </div>
            </article>
          </Fragment>
        );
      })}
    </div>
  );
};

export default PlayerCards;
