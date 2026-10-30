import { ApiResponse, RoomMember, Round, RoundMember } from "@/types";
import styles from "./CurrentRoundCard.module.css";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import ClockIcon from "@/public/clock.svg";
import OwnerIcon from "@/public/owner.svg";
import ShieldIcon from "@/public/shield.svg";
import OneIcon from "@/public/one.svg";
import TwoIcon from "@/public/two.svg";
import { formatDuration } from "@/utils/formatDuration";
interface IProps {
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  roomCode: string;
  userId: number;
  ownerId: number;
}

const CurrentRoundCard = ({
  roundMembers,
  roomMembers,
  roomCode,
  userId,
  ownerId,
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

    setRuler(
      rulerMember
        ? { name: rulerMember.user.name, id: rulerMember.userId }
        : null,
    );
    setPlayer1(
      player1 ? { name: player1.user.name, id: player1.userId } : null,
    );
    setPlayer2(
      player2 ? { name: player2.user.name, id: player2.userId } : null,
    );
  }, [roomMembers, roundMembers]);

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

  const ownerName = roomMembers.find((item) => item.userId === ownerId)?.user.name;
  const ROUND_PARTICIPANTS_CONFIG  = [
    {
      title: "مالك الغرفة",
      isCurrentUser: ownerId === userId,
      Icon: OwnerIcon,
      name: ownerName,
      fallback: "لم يتم العثور على مالك الغرفة"
    },
    {
      title: "حكم الجولة",
      isCurrentUser: ruler?.id === userId,
      Icon: ShieldIcon,
      name: ruler && ruler.name,
      fallback: "لم يتم العثور على حكم الجولة"
    },
    {
      title: "اللاعب الأول",
      isCurrentUser: player1?.id === userId,
      Icon: OneIcon,
      name: player1 && player1.name,
      fallback: "لم يتم تحديد اللاعب الأول"
    },
    {
      title: "اللاعب الثاني",
      isCurrentUser: player2?.id === userId,
      Icon: TwoIcon,
      name: player2 && player2.name,
      fallback: "لم يتم تحديد اللاعب الثاني"
    },
  ];
  return (
    <div className={styles["current-round-card"]}>
      <h3>الجولة الحالية</h3>
      <div className={styles["current-round-settings"]}>
        <div className={styles["current-round-settings-field"]}>
          <div className={styles["current-round-setting"]}>
            <p>رقم الجولة</p>
            <b>{currentRound?.roundNumber || 0}</b>
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
        {ROUND_PARTICIPANTS_CONFIG .map((item, index) => (
          <div
          key={index}
            className={`${styles["current-round-setting"]} ${item.isCurrentUser && styles["is-me"]}`}
          >
            <div>
              <item.Icon className={styles["member-icon"]} />
              <p>{item.title}</p>
            </div>
            {item.name ? (
              <b>{item.name}</b>
            ) : (
              <p>{item.fallback}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentRoundCard;
