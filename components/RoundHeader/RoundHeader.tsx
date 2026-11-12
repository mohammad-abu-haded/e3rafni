"use client";

import Link from "next/link";
import styles from "./RoundHeader.module.css";

import { RoundMemberType } from "@/app/generated/prisma/enums";
import { RoomMember, RoundMember } from "@/types";

import BackIcon from "@/public/back.svg";
import EndRoundDialog from "../EndRoundDialog/EndRoundDialog";

interface IProps {
  roomCode: string;
  roundNumber: number;
  userId: number;
  roundRule?: RoundMemberType;
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
}

const roleLabels: Record<RoundMemberType, string> = {
  PLAYER: "أنت لاعب",
  RULER: "أنت الحكم",
  VIEWER: "أنت مشاهد",
};

const RoundHeader = ({
  roomCode,
  roundNumber,
  userId,
  roundRule,
  roundMembers,
  roomMembers,
}: IProps) => {
  return (
    <header className={styles["round-header"]}>
      <div className={styles["header-main"]}>
        <div className={styles["round-title"]}>
          <span className={styles["round-live"]}>اللعبة جارية</span>
          <h1>الجولة {roundNumber}</h1>
        </div>

        <div className={styles["header-actions"]}>
          <span className={styles["round-status"]}>
            {roundRule ? roleLabels[roundRule] : "غير مصنف"}
          </span>

          <Link href={`/rooms/${roomCode}`} className={styles["back-button"]}>
            <BackIcon />
            <span>الرجوع إلى الغرفة</span>
          </Link>

          <EndRoundDialog
            userId={userId}
            roundMembers={roundMembers}
            roomMembers={roomMembers}
            roomCode={roomCode}
          />
        </div>
      </div>
    </header>
  );
};

export default RoundHeader;
