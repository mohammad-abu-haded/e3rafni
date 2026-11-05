"use client";
import GoogleButton from "../GoogleButton";
import EyeClosedIcon from "@/public/eye-closed.svg";
import EyeIcon from "@/public/eye.svg";
import EmailIcon from "@/public/email.svg";
import LockIcon from "@/public/lock.svg";
import styles from "./login.module.css";
import { useState } from "react";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";
import { ApiResponse } from "@/types";
import { PostData } from "@/services/api.service";
import ActionButton from "../../ActionButton/ActionButton";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const emailInput = formData.get("email") as string;
    const passwordInput = formData.get("password") as string;
    if (!emailInput) return void toast.error("البريد الإلكتروني مطلوب");
    if (!passwordInput) return void toast.error("كلمة المرور مطلوبة");
    const result: ApiResponse =
      (await PostData("api/auth/login", {
        email: emailInput,
        password: passwordInput,
      })) || API_ERROR_RESPONSE;
    if (result.success) {
      toast.success(result.message);
      setEmail("");
      setPassword("");
      redirect("/");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className={styles["form-area"]}>
      <div className={styles["google-button"]}>
        <GoogleButton />
      </div>

      <div className={styles["divider"]}>
        <span>أو عن طريق البريد الإلكتروني</span>
      </div>

      <form className={styles["form"]} action={handleSubmit}>
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
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <ActionButton
          title="تسجيل الدخول"
          className={`btn btn-primary ${styles["submit-button"]}`}
        />
      </form>
    </div>
  );
};
export default LoginForm;
