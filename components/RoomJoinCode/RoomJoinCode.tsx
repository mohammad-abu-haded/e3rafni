import { QRCodeSVG } from "qrcode.react";
import styles from "./RoomJoinCode.module.css";
import { Dispatch, SetStateAction } from "react";

interface IProps {
  code: string;
  roomUrl: string;
  setShowRoomJoinCode: Dispatch<SetStateAction<boolean>>;
}
const RoomJoinCode = ({ code, roomUrl, setShowRoomJoinCode }: IProps) => {
  return (
    <div className={styles["room-join-container"]} onClick={() => setShowRoomJoinCode(false)}>
      <div className={styles["room-join-card"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["room-qr-content"]}>
          <div className={styles["room-qr-container"]}>
            <QRCodeSVG value={roomUrl} size={256} />
          </div>
          <div className={styles["room-qr-info"]}>
            <h3>امسح الرمز للانضمام</h3>
            <p>وجه الكاميرا نحو الرمز ليتم توجيهك مباشرة للغرفة</p>
          </div>
        </div>
        <div className={styles["room-join-footer"]}>
          <div className={styles["room-code-section"]}>
            <p>أو أدخل الرمز يدوياً</p>
            <h3>{code}</h3>
          </div>

          <button className={styles["close-button"]} onClick={() => setShowRoomJoinCode(false)}>إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default RoomJoinCode;
