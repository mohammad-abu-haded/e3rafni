import styles from "./RoomActions.module.css";
import SelectIcon from "@/public/select.svg";
import ShareIcon from "@/public/share.svg";
import LeaveIcon from "@/public/logout.svg";
import { useState } from "react";
import { RoomMember } from "@/types";
import RulerSelector from "../RulerSelector/RulerSelector";
import ActionButton from "../ActionButton/ActionButton";
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
  const handleLeave = async () => {};
  return (
    <div className={styles["room-actions-container"]}>
      <h3>إجراءات الغرفة</h3>
      <form action={handleLeave}>
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
            title="الخروج من الغرفة"
            Icon={LeaveIcon}
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
