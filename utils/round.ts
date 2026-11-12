import { Round, User } from "@/types";
import { RoundStatus } from "@/app/generated/prisma/enums";

const hashString = (value: string): number => {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const getCurrentTurnPlayer = (
  round: Round,
  players: [Pick<User, "id" | "name">, Pick<User, "id" | "name">],
  currentTime: number = Date.now(),
): Pick<User, "id" | "name"> | null => {
  if (round.status !== RoundStatus.PLAYING) return null;

  const sortedPlayers = [...players].sort((a, b) => a.id - b.id);

  const seed = hashString(
    `${round.id}:${sortedPlayers[0].id}:${sortedPlayers[1].id}`,
  );

  const startingPlayerIndex = seed % 2;

  const startedAt = new Date(round.startedAt).getTime();

  const elapsedTime = Math.max(
    0,
    (currentTime - startedAt) / 1000,
  );

  if (elapsedTime >= round.roundDuration) return null;

  if (round.turnDuration === undefined) {
    return sortedPlayers[startingPlayerIndex];
  }

  const turnNumber = Math.floor(elapsedTime / round.turnDuration);
  const currentPlayerIndex = (startingPlayerIndex + turnNumber) % 2;

  return sortedPlayers[currentPlayerIndex];
};