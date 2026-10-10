import { getRoomByCode } from "@/services/room.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import RoundPage from "@/components/RoundPage/RoundPage";

interface IProps {
  params: Promise<{ roomCode: string }>;
}

export const generateMetadata = async ({
  params,
}: IProps): Promise<Metadata> => {
  const roomCode = (await params).roomCode.toUpperCase();
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
  const roomCode = (await params).roomCode.toUpperCase();
  const token = (await cookies()).get("token")!.value;
  const userId = (await verifyToken(token))!.id;
  return <RoundPage roomCode={roomCode} userId={userId} />;
};

export default page;