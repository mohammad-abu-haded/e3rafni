import {
  RoomMember,
  Round,
  RoundMember,
  User,
  VisiblePlayerWord,
} from "@/types";
import { RoundMemberType } from "@/app/generated/prisma/enums";

import RoundTimer from "../RoundTimer/RoundTimer";
import PlayerCards from "../PlayerCards/PlayerCards";

import styles from "./RoundProgress.module.css";

interface IProps {
  round: Round;
  roundMembers: RoundMember[];
  roomMembers: RoomMember[];
  playerWords: VisiblePlayerWord[];
  roundRule?: RoundMemberType;
  currentTurnPlayer: Pick<User, "id" | "name"> | null;
  onEditPlayerWord: (playerId: number, word: string) => void;
}

const RoundProgress = ({
  round,
  roundMembers,
  roomMembers,
  playerWords,
  roundRule,
  currentTurnPlayer,
  onEditPlayerWord,
}: IProps) => {
  return (
    <section className={styles["round-progress"]}>
      <div className={styles["round-timer"]}>
        <RoundTimer
          startedAt={round.startedAt}
          duration={round.roundDuration}
        />
      </div>

      <PlayerCards
        round={round}
        roundMembers={roundMembers}
        roomMembers={roomMembers}
        playerWords={playerWords}
        roundRule={roundRule}
        currentTurnPlayer={currentTurnPlayer}
        onEditPlayerWord={onEditPlayerWord}
      />
    </section>
  );
};

export default RoundProgress;
