import { ApiResponse, RoomMember, Round, RoundMember } from "@/types";
import styles from "./CurrentRoundCard.module.css";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import ClockIcon from "@/public/clock.svg";
import ShieldIcon from "@/public/shield.svg";
import OneIcon from "@/public/one.svg";
import TwoIcon from "@/public/two.svg";
import { formatDuration } from "@/utils/formatDuration";
interface IProps {
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  roomCode: string;
  userId: number;
}

const CurrentRoundCard = ({
  roundMembers,
  roomMembers,
  roomCode,
  userId,
}: IProps) => {
  const [currentRound, setCurrentRound] = useState<Round>();
  const [ruler, setRuler] = useState<{ name: string; id: number } | null>();
  const [player1, setPlayer1] = useState<{ name: string; id: number } | null>();
  const [player2, setPlayer2] = useState<{ name: string; id: number } | null>();

  useEffect(() => {
    const ruler = roundMembers.find((member) => member.type === "RULER");
    const rulerMember = roomMembers.find(
      (member) => member.userId === ruler?.userId,
    );
    const players = roundMembers.filter((member) => member.type === "PLAYER");
    const player1 = roomMembers.find(
      (member) => member.userId === players[0]?.userId,
    );
    const player2 = roomMembers.find(
      (member) => member.userId === players[1]?.userId,
    );

    setRuler(rulerMember ? {name: rulerMember.user.name, id: rulerMember.userId}: null);
    setPlayer1(player1 ? {name: player1.user.name, id: player1.userId}: null);
    setPlayer2(player2 ? {name: player2.user.name, id: player2.userId}: null);
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
                <b>{formatDuration(currentRound?.roundDuration)}</b>
              ) : (
                <p>لم تحدد بعد</p>
              )}
            </div>
          </div>
        </div>
        <div className={`${styles["current-round-setting"]} ${ruler?.id === userId && styles["is-me"]}`}>
          <div>
            <ShieldIcon className={styles["rule-icon"]} />
            <p>الحكم</p>
          </div>
          {ruler ? <b>{ruler.name}</b> : <p>لم يتم تحديد الحكم</p>}
        </div>
        <div className={`${styles["current-round-setting"]} ${player1?.id === userId && styles["is-me"]}`}>
          <div>
            <OneIcon className={styles["rule-icon"]} />
            <p>اللاعب الأول</p>
          </div>
          {player1 ? <b>{player1.name}</b> : <p>لم يتم تحديد اللاعب الأول</p>}
        </div>
        <div className={`${styles["current-round-setting"]} ${player2?.id === userId && styles["is-me"]}`}>
          <div>
            <TwoIcon className={styles["rule-icon"]} />
            <p>اللاعب الثاني</p>
          </div>
          {player2 ? <b>{player2.name}</b> : <p>لم يتم تحديد اللاعب الثاني</p>}
        </div>
      </div>
    </div>
  );
};

export default CurrentRoundCard;
