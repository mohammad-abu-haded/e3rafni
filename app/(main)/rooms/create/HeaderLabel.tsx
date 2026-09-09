'use client';
import styles from "./create-room.module.css";
import GameIcon from "@/public/game.svg";

const HeaderLabel = () => {
  return (
    <div className={styles["header-label"]}>
      <GameIcon className={styles["header-icon"]} />
      <p>تجهيز غرفة اللعب</p>
    </div>
  );
};

export default HeaderLabel;
