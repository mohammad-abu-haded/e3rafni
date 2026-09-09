"use client";
import RefreshIcon from "@/public/refresh.svg";
import HomeIcon from "@/public/home.svg";
import AlertIcon from "@/public/alert.svg";
import HelpIcon from "@/public/help.svg";
import { useRouter } from "next/navigation";
import styles from "@/styles/status.module.css";
interface IProps {
  reset: () => void;
}
const Error = ({ reset }: IProps) => {
  const router = useRouter();
  return (
    <div className={styles["status-main"]}>
      <div className={styles["status-container"]}>
        <div className={styles["status-content"]}>
          <div className={styles["alert"]}>
            <AlertIcon className={styles["alert-icon"]} />
            <p>خطأ في النظام</p>
          </div>
          <h2>
            عذراً، <span>حدث خطأ</span> غير متوقع!
          </h2>
          <p>
            لا تقلق، فريقنا التقني يعمل الآن على حل المشكلة. يبدو أن بعض الأكواد
            قررت أخذ استراحة قصيرة.
          </p>
          <b>
            يمكنك محاولة تحديث الصفحة أو العودة إلى لوحة التحكم الخاصة بك
            للمتابعة.
          </b>
        </div>

        <div className={styles["status-actions"]}>
          <button className="btn btn-primary" onClick={() => reset()}>
            <RefreshIcon className="icon" />
            إعادة المحاولة
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => router.replace("/")}
          >
            <HomeIcon className="icon" />
            للصفحة الرئيسية
          </button>
        </div>

        <div className={styles["help-main"]}>
          <div className={styles["help-container"]}>
            <div className={styles["help-icon-container"]}>
              <HelpIcon className={styles["help-icon"]} />
            </div>
            <div className={styles["help-content"]}>
              <h3>هل تحتاج إلى مساعدة إضافية؟</h3>
              <p>
                إذا استمر هذا الخطأ في الظهور، يرجى التواصل مع فريق الدعم الفني
                عبر البريد الإلكتروني:{" "}
                <a
                  href="mailto:mo.abu.haded@gmail.com"
                  aria-label="إرسال بريد إلكتروني إلى فريق الدعم"
                >
                  mo.abu.haded@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
