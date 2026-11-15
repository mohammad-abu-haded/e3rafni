import styles from "./RoomsDashboard.module.css";
import JoinRoom from "../JoinRoom/JoinRoom";
import RoomsList from "../RoomsList/RoomsList";

const RoomsDashboard = () => {
  return (
    <div className={styles["rooms-dashboard"]}>
      <header className={styles["dashboard-header"]}>
        <h1>الغرف</h1>
        <p className={styles["dashboard-description"]}>
          انضم إلى أصدقائك أو اكتشف غرفة جديدة وابدأ اللعب.
        </p>
      </header>

      <JoinRoom />

      <div className={styles["room-sections"]}>
        <RoomsList type="my" />
        <RoomsList type="public" />
      </div>
    </div>
  );
};

export default RoomsDashboard;
