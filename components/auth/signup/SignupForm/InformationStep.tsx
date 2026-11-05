import EyeClosedIcon from "@/public/eye-closed.svg";
import EyeIcon from "@/public/eye.svg";
import EmailIcon from "@/public/email.svg";
import LockIcon from "@/public/lock.svg";
import styles from "../signup.module.css";
import { Dispatch, SetStateAction, useState } from "react";
import ActionButton from "@/components/ActionButton/ActionButton";
import { toast } from "react-toastify";
import { ApiResponse } from "@/types";
import { PostData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";

interface IProps {
  onNext: () => void;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
}

const InformationStep = ({ onNext, email, setEmail }: IProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const nameInput = formData.get("name") as string;
    const emailInput = formData.get("email") as string;
    const passwordInput = formData.get("password") as string;

    if (!nameInput) {
      toast.error("الاسم مطلوب");
      return;
    }

    if (!emailInput) {
      toast.error("البريد الإلكتروني مطلوب");
      return;
    }

    if (!passwordInput) {
      toast.error("كلمة المرور مطلوبة");
      return;
    }

    const result: ApiResponse =
      (await PostData("api/auth/signup", {
        name: nameInput,
        email: emailInput,
        password: passwordInput,
      })) || API_ERROR_RESPONSE;

    if (result.success) {
      toast.success(result.message);
      onNext();
    } else {
      toast.error(result.message);
    }
  };

  const getTextDirection = () => {
    const firstChar = name.trim().charAt(0);

    if (/[\u0600-\u06FF]/.test(firstChar)) {
      return "rtl";
    } else if (/[A-Za-z]/.test(firstChar)) {
      return "ltr";
    }
    return "rtl";
  };

  return (
    <div className={styles["step-panel"]}>
      <div>
        <h2 className={styles["step-title"]}>أنشئ حسابك الجديد</h2>
        <p className={styles["step-description"]}>
          أدخل بياناتك الأساسية للبدء في مغامرة التخمين
        </p>

        <form className={styles["form"]} action={handleSubmit}>
          <div>
            <div className={styles["field"]}>
              <label htmlFor="name">الاسم الكامل</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="محمد أحمد"
                autoComplete="name"
                dir={getTextDirection()}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles["field"]}>
              <label htmlFor="email">البريد الإلكتروني</label>
              <div className={styles["input-wrap"]}>
                <EmailIcon className={styles["email-icon"]} />
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles["field"]}>
              <label htmlFor="password">كلمة المرور</label>
              <div className={styles["input-wrap"]}>
                <LockIcon className={styles["lock-icon"]} />

                {showPassword ? (
                  <button
                    type="button"
                    className={styles["visibility-toggle"]}
                    aria-label="إخفاء كلمة المرور"
                    onClick={() => setShowPassword(false)}
                  >
                    <EyeClosedIcon className={styles["eye-closed-icon"]} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles["visibility-toggle"]}
                    aria-label="إظهار كلمة المرور"
                    onClick={() => setShowPassword(true)}
                  >
                    <EyeIcon className={styles["eye-icon"]} />
                  </button>
                )}

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <ActionButton
            title="التالي"
            className={`btn btn-primary ${styles["submit-button"]}`}
          />
        </form>
      </div>
    </div>
  );
};

export default InformationStep;
