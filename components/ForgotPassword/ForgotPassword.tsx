"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StepProgress from "@/components/StepProgress/StepProgress";
import styles from "./ForgotPassword.module.css";
import OtpInput from "../OtpInput/OtpInput";
import EyeClosedIcon from "@/public/eye-closed.svg";
import EyeIcon from "@/public/eye.svg";
import { validatePassword } from "@/utils/password";
import { toast } from "react-toastify";
import { ApiResponse } from "@/types";
import { PostData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import ActionButton from "../ActionButton/ActionButton";

const contents = [
  "إدخال البريد الإلكتروني",
  "تأكيد البريد الإلكتروني",
  "تغيير كلمة المرور",
];

const ForgotPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const stepParam = Number(searchParams.get("step"));
  const step = stepParam === 2 || stepParam === 3 ? stepParam : 1;
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEmail(searchParams.get("email") || "");
  }, [searchParams]);

  const submitButtonText = {
    1: "إرسال رمز التحقق",
    2: "تأكيد الرمز",
    3: "تغيير كلمة المرور",
  }[step];

  const isSubmitDisabled =
    isLoading ||
    (step === 2 && otp.length !== 6) ||
    (step === 3 && password !== confirmPassword);

  const handleEmailSubmit = async () => {
    const result: ApiResponse =
      (await PostData("/api/auth/forgot-password/send-otp", { email })) ||
      API_ERROR_RESPONSE;

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push(`/forgot-password?step=2&email=${encodeURIComponent(email)}`);
  };

  const handleOtpSubmit = async () => {
    const result: ApiResponse =
      (await PostData("/api/auth/forgot-password/verify-otp", {
        email,
        otp,
      })) || API_ERROR_RESPONSE;

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push(`/forgot-password?step=3&email=${encodeURIComponent(email)}`);
  };

  const handlePasswordSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    const isPasswordValid = validatePassword(password);

    if (!isPasswordValid) {
      toast.error(
        "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير وحرف صغير ورقم ورمز خاص",
      );
      return;
    }

    const result: ApiResponse =
      (await PostData("/api/auth/reset-password", {
        password,
        confirmPassword,
      })) || API_ERROR_RESPONSE;

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.replace("/login");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (step === 1) {
        await handleEmailSubmit();
      } else if (step === 2) {
        await handleOtpSubmit();
      } else if (step === 3) {
        await handlePasswordSubmit();
      }
    } catch {
      toast.error("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles["auth-page"]}>
      <div className={styles["ambient"]} aria-hidden="true" />

      <section className={styles["auth-card"]}>
        <div className={styles["brand-mark"]} aria-hidden="true">
          اعرفني
        </div>

        <header className={styles["heading"]}>
          <span className={styles["eyebrow"]}>استعادة الحساب</span>

          <h1>
            {step === 1 && "نسيت كلمة المرور؟"}
            {step === 2 && "تأكيد بريدك الإلكتروني"}
            {step === 3 && "أنشئ كلمة مرور جديدة"}
          </h1>

          <p>
            {step === 1 && "أدخل بريدك الإلكتروني لنرسل لك رمز التحقق"}

            {step === 2 && (
              <>
                أدخل رمز التحقق الذي أرسلناه إلى
                <span className={styles["email-highlight"]} dir="ltr">
                  {email}
                </span>
              </>
            )}

            {step === 3 && "اختر كلمة مرور قوية لحماية حسابك"}
          </p>
        </header>

        <div className={styles["progress"]}>
          <StepProgress contents={contents} current={step - 1} />
        </div>

        <form className={styles["step-content"]} onSubmit={handleSubmit}>
          {step === 1 && (
            <div className={styles["form"]}>
              <div className={styles["field"]}>
                <label htmlFor="email">البريد الإلكتروني</label>

                <div className={styles["input-wrap"]}>
                  <input
                    className={styles["ltr-input"]}
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles["form"]}>
              <div className={styles["field"]}>
                <label>رمز التحقق</label>
                <OtpInput setOtp={setOtp} />
              </div>

              <button
                className={styles["back-button"]}
                type="button"
                onClick={() => router.push("/forgot-password")}
              >
                تغيير البريد الإلكتروني
              </button>
            </div>
          )}

          {step === 3 && (
            <div className={styles["form"]}>
              <div className={styles["input-wrap"]}>
                <button
                  type="button"
                  className={styles["visibility-toggle"]}
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {password &&
                    (showPassword ? (
                      <EyeClosedIcon className={styles["eye-closed-icon"]} />
                    ) : (
                      <EyeIcon className={styles["eye-icon"]} />
                    ))}
                </button>

                <input
                  className={styles["rtl-placeholder"]}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور الجديدة"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles["input-wrap"]}>
                <button
                  type="button"
                  className={styles["visibility-toggle"]}
                  aria-label={
                    showConfirmPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {confirmPassword &&
                    (showConfirmPassword ? (
                      <EyeClosedIcon className={styles["eye-closed-icon"]} />
                    ) : (
                      <EyeIcon className={styles["eye-icon"]} />
                    ))}
                </button>

                <input
                  className={styles["rtl-placeholder"]}
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles["field"]}>
                <ul className={styles["password-requirements"]}>
                  <li>8 أحرف على الأقل</li>
                  <li>حرف إنجليزي كبير (A-Z)</li>
                  <li>حرف إنجليزي صغير (a-z)</li>
                  <li>رقم واحد على الأقل (0-9)</li>
                  <li>رمز خاص واحد على الأقل (!@#$...)</li>
                </ul>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className={styles["error-message"]}>
                  كلمتا المرور غير متطابقتين
                </p>
              )}
            </div>
          )}

          <ActionButton
            className={styles["submit-button"]}
            disabled={isSubmitDisabled}
            title={submitButtonText}
          />
        </form>

        <p className={styles["login-prompt"]}>
          تذكرت كلمة المرور؟ <Link href="/login">سجّل الدخول</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;
