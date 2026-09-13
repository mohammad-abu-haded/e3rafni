import RoomInfoCard from "@/components/RoomInfoCard/RoomInfoCard";
import { getRoomByCode } from "@/services/room.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./room.module.css";
interface IProps {
  params: Promise<{ roomCode: string }>;
}

export const generateMetadata = async ({
  params,
}: IProps): Promise<Metadata> => {
  const roomCode = (await params).roomCode.toLocaleUpperCase();
  const room = await getRoomByCode(roomCode);
  if (!room) {
    notFound();
  }
  const roomName = room.name;
  return {
    title: roomName,
    description: `الغرفة ${roomName} في تطبيقنا.`,
  };
};

const page = async ({ params }: IProps) => {
  const roomCode = (await params).roomCode.toLocaleUpperCase();
  const room = await getRoomByCode(roomCode);
  if (!room) {
    notFound();
  }
  return (
    <div className={styles['room-page']}>
      <div className={styles['room-info']}>
        <RoomInfoCard
          roomName={room.name}
          currentRound={room.currentRound}
          playerCount={0}
          roomCode={roomCode}
        />
      </div>
    </div>
  );
};

export default page;
