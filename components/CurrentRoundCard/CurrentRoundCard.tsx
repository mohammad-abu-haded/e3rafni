import { ApiResponse, RoomMember, Round, RoundMember } from "@/types";
import styles from "./CurrentRoundCard.module.css";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import ClockIcon from "@/public/clock.svg";
import ShieldIcon from "@/public/shield.svg";
import OneIcon from "@/public/one.svg";
import TwoIcon from "@/public/two.svg";
interface IProps {
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  roomCode: string;
}

const CurrentRoundCard = ({ roundMembers, roomMembers, roomCode }: IProps) => {
  const [currentRound, setCurrentRound] = useState<Round>();
  const [rulerName, setRulerName] = useState<string>();
  const [player1Name, setPlayer1Name] = useState<string>();
  const [player2Name, setPlayer2Name] = useState<string>();

  useEffect(() => {
    const ruler = roundMembers.find((member) => member.type === "RULER");
    const rulerName = roomMembers.find(
      (member) => member.userId === ruler?.userId,
    )?.user.name;
    const players = roundMembers.filter((member) => member.type === "PLAYER");
    const player1Name = roomMembers.find(
      (member) => member.userId === players[0]?.userId,
    )?.user.name;
    const player2Name = roomMembers.find(
      (member) => member.userId === players[1]?.userId,
    )?.user.name;

    setRulerName(rulerName);
    setPlayer1Name(player1Name);
    setPlayer2Name(player2Name);
  }, [roundMembers]);

  useEffect(() => {
    const getCurrentRound = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/rounds`,
      );

      if (result && result.data) {
        const currentRoundFetched: Round = result.data;
        setCurrentRound(currentRoundFetched);
      }
    };
    getCurrentRound();
  }, [roomCode]);
  return (
    <div className={styles["current-round-card"]}>
      <h3>الجولة الحالية</h3>
      <div className={styles["current-round-settings"]}>
        <div className={styles["current-round-settings-field"]}>
          <div className={styles["current-round-setting"]}>
            <p>رقم الجولة</p>
            <b>{currentRound?.roundNumber}</b>
          </div>
          <div className={styles["current-round-setting"]}>
            <p>المدة</p>
            <div>
              <ClockIcon className={styles["clock-icon"]} />
              {currentRound?.roundDuration ? (
                <b>{currentRound?.roundDuration}</b>
              ) : (
                <p>لم تحدد بعد</p>
              )}
            </div>
          </div>
        </div>
        <div className={styles["current-round-setting"]}>
          <div>
            <ShieldIcon className={styles["rule-icon"]} />
            <p>الحكم</p>
          </div>
          {rulerName ? <b>{rulerName}</b> : <p>لم يتم تحديد الحكم</p>}
        </div>
        <div className={styles["current-round-setting"]}>
          <div>
            <OneIcon className={styles["rule-icon"]} />
            <p>اللاعب الأول</p>
          </div>
          {player1Name ? (
            <b>{player1Name}</b>
          ) : (
            <p>لم يتم تحديد اللاعب الأول</p>
          )}
        </div>
        <div className={styles["current-round-setting"]}>
          <div>
            <TwoIcon className={styles["rule-icon"]} />
            <p>اللاعب الثاني</p>
          </div>
          {player2Name ? (
            <b>{player2Name}</b>
          ) : (
            <p>لم يتم تحديد اللاعب الثاني</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentRoundCard;
