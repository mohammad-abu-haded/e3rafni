import { getRoomByCode } from "@/services/room.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./room.module.css";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import RoomPage from "@/components/RoomPage/RoomPage";

interface IProps {
  params: Promise<{ roomCode: string }>;
}

export const generateMetadata = async ({
  params,
}: IProps): Promise<Metadata> => {
  const roomCode = (await params).roomCode.toLocaleUpperCase();
  const token = (await cookies()).get("token")!.value;
  const userId = (await verifyToken(token))!.id;
  const room = await getRoomByCode(roomCode, userId);
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
  const token = (await cookies()).get("token")!.value;
  const userId = (await verifyToken(token))!.id;
  return <RoomPage roomCode={roomCode} userId={userId} />;
};

export default page;
