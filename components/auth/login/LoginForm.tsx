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
    
    if (!emailInput) {
      toast.error("البريد الإلكتروني مطلوب");
      return;
    }

    if (!passwordInput) {
      toast.error("كلمة المرور مطلوبة");
      return;
    }

    const result: ApiResponse = await PostData('api/auth/login', {email: emailInput, password: passwordInput}) || API_ERROR_RESPONSE;
    if (result.success) {
      toast.success(result.message);
      setEmail("");
      setPassword("");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div>
      <div>
        <GoogleButton />
      </div>
      <div>
        <p>أو عن طريق البريد الإلكتروني</p>
      </div>

      <form action={handleSubmit}>
        <div>
          <label htmlFor="email">البريد الإلكتروني</label>
          <div>
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

        <div>
          <label htmlFor="password">كلمة المرور</label>
          <div>
            <LockIcon className={styles["lock-icon"]} />
            {showPassword ? (
              <div onClick={() => setShowPassword(false)}>
                <EyeClosedIcon className={styles["eye-closed-icon"]} />
              </div>
            ) : (
              <div onClick={() => setShowPassword(true)}>
                <EyeIcon className={styles["eye-icon"]} />
              </div>
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

        <ActionButton title="تسجيل الدخول"/>
      </form>
    </div>
  );
};

export default LoginForm;
