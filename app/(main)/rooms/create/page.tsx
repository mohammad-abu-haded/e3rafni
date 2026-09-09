import { Metadata } from "next";
import styles from "./create-room.module.css";
import HeaderLabel from "./HeaderLabel";
import CreateRoomForm from "@/components/CreateRoomForm/CreateRoomForm";

export const metadata: Metadata = {
  title: "إنشاء غرفة جديدة",
  description:
    "قم بتخصيص قواعد اللعب، اسم الغرفة، وتصميم البطاقات لتبدأ تحدياً فريداً مع أصدقائك أو لاعبين جدد.",
}

const page = () => {
  return (
    <div className={styles["create-room-page"]}>
      <header className={styles["header"]}>
        <div className={styles["header-content"]}>
          <HeaderLabel />
          <h2>
            اصنع عالمك الخاص في <span>اعرفني</span>
          </h2>

          <p>
            قم بتخصيص قواعد اللعب، اسم الغرفة، وتصميم البطاقات لتبدأ تحدياً
            فريداً مع أصدقائك أو لاعبين جدد.
          </p>
        </div>
      </header>
      <div className={styles["create-room-from"]}>
        <CreateRoomForm />
      </div>
    </div>
  );
};

export default page;
