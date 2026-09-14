"use client";
import { ApiResponse, RoomMember } from "@/types";
import styles from "./RoomParticipants.module.css";
import TrophyIcon from "@/public/trophy.svg";
import Medal1Icon from "@/public/medal-1.svg";
import Medal2Icon from "@/public/medal-2.svg";
import Medal3Icon from "@/public/medal-3.svg";
import Image from "next/image";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";
import { useEffect, useState } from "react";
import { GetData } from "@/services/api.service";
import { notFound } from "next/navigation";
interface IProps {
  roomCode: string;
  userId: number;
}

export const getRoundLabel = (count: number) => {
  if (count === 1) return "جولة";
  if (count >= 2 && count <= 10) return "جولات";

  return "جولة";
};

export const getWinLabel = (count: number) => {
  if (count === 1) return "انتصار";
  if (count >= 2 && count <= 10) return "انتصارات";

  return "انتصار";
};

const MedalIcon = [
  {
    icon: <Medal1Icon className={styles["medal-icon"]} />,
  },
  {
    icon: <Medal2Icon className={styles["medal-icon"]} />,
  },
  {
    icon: <Medal3Icon className={styles["medal-icon"]} />,
  },
];

const RoomParticipants = ({ roomCode, userId }: IProps) => {
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>();

  useEffect(() => {
    const getRoomMembers = async () => {
      const result: ApiResponse = await GetData(
        `/api/rooms/${roomCode}/members`,
      );
      if (!result || !result.data) {
        notFound();
      }

      const fetchedRoomMembers: RoomMember[] = result.data;
      setRoomMembers(fetchedRoomMembers);
    };

    getRoomMembers();
  }, [roomCode]);

  if(!roomMembers || roomMembers.length === 0) {
    return <div>جاري تحميل الأعضاء...</div>;
  }
  return (
    <div className={styles["room-participants-container"]}>
      <div className={styles["room-participants-label"]}>
        <h3>ترتيب المشاركين</h3>
        <TrophyIcon className={styles["trophy-icon"]} />
      </div>
      <div className={styles["room-participants"]}>
        {roomMembers.map((item, index) => (
          <div
            key={index}
            className={`${styles["room-participant"]} ${item.userId === userId && styles["current-participant"]}`}
          >
            <div className={styles["participant-info"]}>
              <div className={styles["rank-badge"]}>
                {index < 3 ? MedalIcon[index].icon : <p>{index + 1}</p>}
              </div>
              <div className={styles["participant-profile"]}>
                <Image
                  className={styles["user-profile"]}
                  src={item.user.picture || profilePlaceholderBase64}
                  alt={`participant ${index + 1} image`}
                  width={48}
                  height={48}
                />
                <h3>{item.user.name}</h3>
              </div>
            </div>
            <div className={styles["participant-wins"]}>
              {item.wins}
              &nbsp;
              {getWinLabel(item.wins)}
              &nbsp; من &nbsp;
              {item.roundsPlayed}
              &nbsp;
              {getRoundLabel(item.roundsPlayed)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomParticipants;

// const shareRoom = async () => {
//   const shareData = {
//     title: "انضم إلى لعبة اعرفني",
//     text: "انضم إلينا في لعبة اعرفني 🎮",
//     url: "http://localhost:3000/rooms/3WZ43L",
//   };

//   if (navigator.share) {
//     await navigator.share(shareData);
//   } else {
//     // fallback للـ desktop
//     await navigator.clipboard.writeText("http://localhost:3000/rooms/3WZ43L");
//   }
// };
// <button onClick={shareRoom}>مشاركة</button>
