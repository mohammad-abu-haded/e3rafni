import { RoomMember, Round, RoundMember, User } from "@/types";

import RoundTimer from "../RoundTimer/RoundTimer";
import TurnPlayers from "../TurnPlayers/TurnTimer";

import styles from "./RoundProgress.module.css";

interface IProps {
  round: Round;
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  currentTurnPlayer: Pick<User, "id" | "name"> | null;
}

const RoundProgress = ({
  round,
  roundMembers,
  roomMembers,
  currentTurnPlayer,
}: IProps) => {
  return (
    <section className={styles["round-progress"]}>
      <div className={styles["round-timer"]}>
        <RoundTimer
          startedAt={round.startedAt}
          duration={round.roundDuration}
        />
      </div>

      <div className={styles["turn-players"]}>
        <TurnPlayers
          round={round}
          roundMembers={roundMembers}
          roomMembers={roomMembers}
          currentTurnPlayer={currentTurnPlayer}
        />
      </div>
    </section>
  );
};

export default RoundProgress;
