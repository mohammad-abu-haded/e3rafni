
"use client";

import { useEffect, useState } from "react";
import styles from "./RoundTimer.module.css";

interface IProps {
  startedAt: Date | string;
  duration: number;
}

const RoundTimer = ({ startedAt, duration }: IProps) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const startTime = new Date(startedAt).getTime();
  const durationInMs = duration * 1000;
  const endTime = startTime + durationInMs;

  useEffect(() => {
    const updateTimer = () => {
      setCurrentTime(Date.now());
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationInMs]);

  const remainingTime = Math.max(0, Math.ceil((endTime - currentTime) / 1000));

  const elapsedTime = Math.min(
    durationInMs,
    Math.max(0, currentTime - startTime),
  );

  const progress =
    durationInMs > 0
      ? Math.min(100, Math.max(0, (elapsedTime / durationInMs) * 100))
      : 100;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const formatTime = (value: number) => String(value).padStart(2, "0");

  const isFinished = remainingTime === 0;
  const isCritical = remainingTime > 0 && remainingTime <= 30;

  return (
    <div
      className={`${styles["round-timer"]} ${
        isFinished
          ? styles["timer-finished"]
          : isCritical
            ? styles["timer-critical"]
            : ""
      }`}
      role="timer"
      aria-label={
        isFinished
          ? "انتهى وقت الجولة"
          : `الوقت المتبقي ${minutes} دقيقة و${seconds} ثانية`
      }
    >
      <div className={styles["timer-header"]}>
        <div className={styles["timer-title"]}>
          <div className={styles["timer-icon"]}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="13" r="8.5" />
              <path d="M12 8v5l3 2" />
              <path d="M9 2h6M12 2v2.5" />
            </svg>
          </div>

          <div className={styles["timer-labels"]}>
            <h3>وقت الجولة</h3>
            <p>
              {isFinished
                ? "انتهى الوقت"
                : isCritical
                  ? "اقترب الوقت من الانتهاء"
                  : "الوقت المتبقي"}
            </p>
          </div>
        </div>

        <div className={styles["timer-value"]} dir="ltr">
          <span>{formatTime(minutes)}</span>
          <span className={styles["timer-colon"]}>:</span>
          <span>{formatTime(seconds)}</span>
        </div>
      </div>

      <div
        className={styles["timer-track"]}
        role="progressbar"
        aria-label="الوقت المنقضي من الجولة"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={styles["timer-progress"]}
          style={{ width: `${progress}%` }}
        >
          {!isFinished && (
            <span className={styles["timer-progress-glow"]} />
          )}
        </div>
      </div>

      <div className={styles["timer-footer"]}>
        <span>
          {isFinished ? "الجولة انتهت" : "الوقت المنقضي"}
        </span>

        <span dir="ltr">
          {Math.floor(elapsedTime / 60000)}:
          {formatTime(Math.floor((elapsedTime % 60000) / 1000))}
          {" / "}
          {Math.floor(duration / 60)}:
          {formatTime(duration % 60)}
        </span>
      </div>
    </div>
  );
};

export default RoundTimer;
