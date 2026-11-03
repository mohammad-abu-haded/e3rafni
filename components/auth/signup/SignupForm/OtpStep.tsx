import ActionButton from "@/components/ActionButton/ActionButton";
import OtpInput from "@/components/OtpInput/OtpInput";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { PostData } from "@/services/api.service";
import { ApiResponse } from "@/types";
import { useState } from "react";
import { toast } from "react-toastify";

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
    <div>
      <div>
        <h2>تحقق من بريدك الإلكتروني</h2>
        <p>لقد أرسلنا رمز التحقق المكون من 6 أرقام إلى:</p>
        <span dir="ltr">
          <b>{email}</b>
        </span>
      </div>
      <form action={handleSubmit}>
        <div>
          <OtpInput setOtp={setOtp} />
        </div>
        <div>
          <ActionButton title="تأكيد الرمز" />
        </div>
      </form>
      <form action={handleReSendOtp}>
        <p>لم يصلك الرمز؟</p>
        <ActionButton title="إعادة إرسال رمز التحقق" />
      </form>
    </div>
  );
};

export default OtpStep;
