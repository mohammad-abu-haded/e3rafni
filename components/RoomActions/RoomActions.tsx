import styles from "./RoomActions.module.css";
import SelectIcon from "@/public/select.svg";
import EditIcon from "@/public/edit.svg";
import ShareIcon from "@/public/share.svg";
import JoinIcon from "@/public/join.svg";
import LeaveIcon from "@/public/logout.svg";
import DeleteIcon from "@/public/delete.svg";
import SettingsIcon from "@/public/settings.svg";
import { useState } from "react";
import { ApiResponse, RoomMember, Round, RoundMember } from "@/types";
import RulerSelector from "../RulerSelector/RulerSelector";
import ActionButton from "../ActionButton/ActionButton";
import { PostData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { toast } from "react-toastify";
import { redirect, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import RoundSetup from "../RoundSettingsModal/RoundSettingsModal";
import { RoundStatus } from "@/app/generated/prisma/enums";
import EndRoundDialog from "../EndRoundDialog/EndRoundDialog";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  withCredentials: true,
});

interface IProps {
  currentRound: Round | undefined;
  roomName: string;
  roomCode: string;
  roomMembers: RoomMember[];
  roundMembers: RoundMember[];
  isRoomOwner: boolean;
  hasRuler: boolean;
  isRuler: boolean;
  userId: number;
  playedRoundsCount: number;
}

const RoomActions = (props: IProps) => {
  const router = useRouter();
  const roomUrl = `${window.location.origin}/rooms/${props.roomCode.toLocaleLowerCase()}`;
  const [showRoundRulerSelector, setShowRoundRulerSelector] = useState(false);
  const [showRoundSetup, setShowRoundSetup] = useState(false);
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

  const joinRound = () => {
    router.push(`/rooms/${props.roomCode}/round`);
  };
  return (
    <div className={styles["room-actions-container"]}>
      <h3>إجراءات الغرفة</h3>
      <div className={styles["room-actions"]}>
        {props.isRoomOwner &&
          (props.currentRound === undefined ||
            props.currentRound?.status !== RoundStatus.PLAYING) && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowRoundRulerSelector(true)}
            >
              {props.hasRuler &&
              props.currentRound?.status === RoundStatus.WAITING ? (
                <>
                  <EditIcon className="icon" /> تعديل حكم الجولة التالية
                </>
              ) : (
                <>
                  <SelectIcon className="icon" />
                  إختيار حكم الجولة التالية
                </>
              )}
            </button>
          )}
        {props.isRuler &&
          props.currentRound?.status === RoundStatus.WAITING && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowRoundSetup(true)}
            >
              <SettingsIcon className="icon" /> إعداد الجولة التالية
            </button>
          )}
        <button type="button" className="btn btn-secondary" onClick={shareRoom}>
          <ShareIcon className="icon" />
          مشاركة رابط الغرفة
        </button>
        {props.currentRound?.status === RoundStatus.PLAYING && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={joinRound}
          >
            <JoinIcon className="icon" />
            الدخول إلى الجولة
          </button>
        )}
        {(props.isRoomOwner || props.isRuler) &&
          props.currentRound?.status === RoundStatus.PLAYING && (
            <EndRoundDialog
              userId={props.userId}
              roundMembers={props.roundMembers}
              roomMembers={props.roomMembers}
              roomCode={props.roomCode}
            />
          )}
      </div>
      <form action={handleExitRoom}>
        <ActionButton
          title={props.isRoomOwner ? "إنهاء الغرفة" : "الخروج من الغرفة"}
          Icon={props.isRoomOwner ? DeleteIcon : LeaveIcon}
          className="btn btn-leave"
        />
      </form>

      {showRoundRulerSelector && props.isRoomOwner && (
        <RulerSelector
          roomCode={props.roomCode}
          roomMembers={props.roomMembers}
          playedRoundsCount={props.playedRoundsCount}
          onClose={() => setShowRoundRulerSelector(false)}
        />
      )}
      {showRoundSetup && props.isRuler && (
        <RoundSetup
          userId={props.userId}
          roomCode={props.roomCode}
          playedRoundsCount={props.playedRoundsCount}
          roomMembers={props.roomMembers}
          onClose={() => setShowRoundSetup(false)}
        />
      )}
    </div>
  );
};

export default RoomActions;
