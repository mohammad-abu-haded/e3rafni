"use client";
import HomeIcon from "@/public/home.svg";
import BackIcon from "@/public/right-arrow.svg";
import styles from "@/styles/status.module.css";
import { useRouter } from "next/navigation";
const NotFound = () => {
  const router = useRouter();
  return (
    <div className={styles["status-main"]}>
      <div className={styles["status-container"]}>
        <div className={styles["status-content"]}>
          <h2>عذراً، الصفحة غير موجودة</h2>
          <p>
            يبدو أنك ضللت الطريق في أروقة اللعبة. الصفحة التي تبحث عنها قد تم
            نقلها أو أنها لم تكن موجودة من الأساس.
          </p>
        </div>

        <div className={styles["status-actions"]}>
          <button
            className="btn btn-primary"
            onClick={() => router.replace("/")}
          >
            <HomeIcon className="icon" />
            للصفحة الرئيسية
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => router.back()}
          >
            <BackIcon className="icon" />
            العودة للخلف
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
