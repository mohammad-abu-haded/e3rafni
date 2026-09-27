import styles from "./RoomActions.module.css";
import SelectIcon from "@/public/select.svg";
import ShareIcon from "@/public/share.svg";
import LeaveIcon from "@/public/logout.svg";
import DeleteIcon from "@/public/delete.svg";
import { useState } from "react";
import { ApiResponse, RoomMember } from "@/types";
import RulerSelector from "../RulerSelector/RulerSelector";
import ActionButton from "../ActionButton/ActionButton";
import { PostData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

interface IProps {
  currentRound: number;
  roomName: string;
  roomCode: string;
  roomMembers: RoomMember[];
  isRoomOwner: boolean;
}

const RoomActions = (props: IProps) => {
  const roomUrl = `${window.location.origin}/rooms/${props.roomCode.toLocaleLowerCase()}`;
  const [showRoundRulerSelector, setShowRoundRulerSelector] = useState(false);
  const shareRoom = async () => {
    const shareData = {
      title: `🎮 اعرفني | ${props.roomName}`,
      text: `🎮 اعرفني

أنت مدعو للانضمام إلى غرفة "${props.roomName}" على منصة اعرفني!

🔥 ادخل الآن وابدأ اللعب`,
      url: roomUrl,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(roomUrl);
    }
  };
  const handleExitRoom = async () => {
    const confirmed = window.confirm(
      props.isRoomOwner
        ? "هل أنت متأكد أنك تريد إنهاء الغرفة؟ لا يمكن التراجع عن هذا الإجراء."
        : "هل أنت متأكد أنك تريد الخروج من الغرفة؟",
    );

    if (!confirmed) {
      return;
    }
    const result: ApiResponse =
      (await PostData(`/api/rooms/${props.roomCode}/leave`)) ||
      API_ERROR_RESPONSE;

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    if (props.isRoomOwner) {
      socket.emit("server:room-ended", props.roomCode);
    } else {
      socket.emit("server:room-member-left", props.roomCode);
    }
    toast.success(result.message);
    redirect("/");
  };
  return (
    <div className={styles["room-actions-container"]}>
      <h3>إجراءات الغرفة</h3>
      <form action={handleExitRoom}>
        <div className={styles["room-actions"]}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowRoundRulerSelector(true)}
          >
            <SelectIcon className="icon" />
            إختيار حكم الجولة التالية
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={shareRoom}
          >
            <ShareIcon className="icon" />
            مشاركة رابط الغرفة
          </button>
          <ActionButton
            title={props.isRoomOwner ? "إنهاء الغرفة" : "الخروج من الغرفة"}
            Icon={props.isRoomOwner ? DeleteIcon : LeaveIcon}
            className="btn btn-leave"
          />
        </div>
      </form>

      {showRoundRulerSelector && props.isRoomOwner && (
        <RulerSelector
          roomCode={props.roomCode}
          roomMembers={props.roomMembers}
          onClose={() => setShowRoundRulerSelector(false)}
        />
      )}
    </div>
  );
};

export default RoomActions;
