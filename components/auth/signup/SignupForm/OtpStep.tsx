import ActionButton from "@/components/ActionButton/ActionButton";
import OtpInput from "@/components/OtpInput/OtpInput";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { PostData } from "@/services/api.service";
import { ApiResponse } from "@/types";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "../signup.module.css";

interface IProps {
  onNext: () => void;
  email: string;
}

const OtpStep = ({ onNext, email }: IProps) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("الرجاء إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    const result: ApiResponse =
      (await PostData("api/auth/verify-email", { otp, email })) ||
      API_ERROR_RESPONSE;

    if (result.success) {
      toast.success(result.message);
      onNext();
    } else {
      toast.error(result.message);
    }
  };

  const handleReSendOtp = async () => {
    const result: ApiResponse =
      (await PostData("api/auth/signup/resend-otp", { email })) ||
      API_ERROR_RESPONSE;

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className={styles["step-panel"]}>
      <div>
        <h2 className={styles["step-title"]}>تحقق من بريدك الإلكتروني</h2>
        <p className={styles["step-description"]}>
          لقد أرسلنا رمز التحقق المكون من 6 أرقام إلى:
        </p>
        <span className={styles["email-badge"]} dir="ltr">
          <b>{email}</b>
        </span>
      </div>

      <form className={styles["form"]} action={handleSubmit}>
        <div className={styles["otp-wrap"]}>
          <OtpInput setOtp={setOtp} />
        </div>

        <div>
          <ActionButton
            title="تأكيد الرمز"
            className={`btn btn-primary ${styles["submit-button"]}`}
          />
        </div>
      </form>

      <form className={styles["resend-form"]} action={handleReSendOtp}>
        <p className={styles["resend-prompt"]}>لم يصلك الرمز؟</p>
        <ActionButton
          title="إعادة إرسال رمز التحقق"
          className={`btn btn-muted ${styles["resend-button"]}`}
        />
      </form>
    </div>
  );
};

export default OtpStep;
