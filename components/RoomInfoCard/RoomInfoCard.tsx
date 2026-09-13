"use client";
import styles from "./RoomInfoCard.module.css";
import QrIcon from "@/public/qr.svg";
import CopyIcon from "@/public/copy.svg";
import UsersIcon from "@/public/users.svg";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RoomJoinCode from "../RoomJoinCode/RoomJoinCode";
interface IProps {
  roomName: string;
  currentRound: number;
  playerCount: number;
  roomCode: string;
}
const RoomInfoCard = (props: IProps) => {
  const [roomUrl, setRoomUrl] = useState("");
  const [showRoomJoinCode, setShowRoomJoinCode] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.roomCode);

      toast.success("تم النسخ إلى الحافظة");
    } catch (error) {
      toast.error("فشل النسخ إلى الحافظة");
    }
  };

  useEffect(() => {
    setRoomUrl(
      `${window.location.origin}/rooms/${props.roomCode.toLocaleLowerCase()}`,
    );
  }, [props.roomCode]);

  return (
    <div className={styles["room-info-card"]}>
      <div className={styles["room-details"]}>
        <h3 className={styles["room-name"]}>{props.roomName}</h3>
        <div className={styles["room-stats"]}>
          <div className={styles["room-current-round"]}>
            الجولة {props.currentRound}
          </div>
          <div className={styles["room-player-count"]}>
            <UsersIcon className={styles["users-icon"]} />
            {props.playerCount} لاعباً
          </div>
        </div>
      </div>
      <div className={styles["room-code-container"]}>
        <p>رمز الغرفة:</p>
        <div className={styles["room-code"]}>
          {props.roomCode}
          <button
            className={styles["room-icon-container"]}
            title="نسخ الكود"
            onClick={() => handleCopy()}
          >
            <CopyIcon className={styles["room-code-icon"]} />
          </button>
          <button
            className={styles["room-icon-container"]}
            title="عرض رمز QR"
            onClick={() => setShowRoomJoinCode(true)}
          >
            <QrIcon
              className={`${styles["room-code-icon"]} ${styles["qr-icon"]}`}
            />
          </button>
        </div>
      </div>

      {showRoomJoinCode && (
        <RoomJoinCode
          code={props.roomCode}
          roomUrl={roomUrl}
          setShowRoomJoinCode={setShowRoomJoinCode}
        />
      )}
    </div>
  );
};

export default RoomInfoCard;
