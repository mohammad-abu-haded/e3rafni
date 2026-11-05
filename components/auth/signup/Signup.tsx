"use client";

import { useEffect, useState } from "react";
import InformationStep from "./SignupForm/InformationStep";
import OtpStep from "./SignupForm/OtpStep";
import PhotoStep from "./SignupForm/PhotoStep";
import GoogleButton from "../GoogleButton";
import StepProgress from "@/components/StepProgress/StepProgress";
import styles from "./signup.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const contents = ["إنشاء الحساب", "تأكيد البريد الإلكتروني", "إكمال التسجيل"];

const Signup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const completeParam = searchParams.get("complete");
  const [step, setStep] = useState(emailParam ? 2 : completeParam ? 3 : 1);
  const [email, setEmail] = useState(emailParam ? emailParam : "");

  useEffect(() => {
    setStep(() =>
      searchParams.get("email") ? 2 : searchParams.get("complete") ? 3 : 1,
    );
  }, [searchParams]);

  return (
    <main className={styles["auth-page"]}>
      <div className={styles["ambient"]} aria-hidden="true" />

      <section className={styles["auth-card"]}>
        <div className={styles["brand-mark"]} aria-hidden="true">
          اعرفني
        </div>

        <header className={styles["heading"]}>
          <span className={styles["eyebrow"]}>انضم إلى مجتمع اعرفني</span>
          <h1>رحلتك تبدأ من هنا</h1>
          <p>أنشئ حسابك بخطوات بسيطة</p>
        </header>

        <div className={styles["progress"]}>
          <StepProgress contents={contents} current={step - 1} />
        </div>

        <div className={styles["step-content"]}>
          {step === 1 && (
            <InformationStep
              onNext={() => router.push(`/signup?email=${email}`)}
              email={email}
              setEmail={setEmail}
            />
          )}

          {step === 2 && (
            <OtpStep
              onNext={() => router.push("/signup?complete=true")}
              email={email}
            />
          )}

          {step === 3 && <PhotoStep />}
        </div>

        {step === 1 && (
          <div className={styles["social-area"]}>
            <div className={styles["divider"]}>
              <span>أو أنشئ حسابك باستخدام</span>
            </div>

            <div className={styles["google-button"]}>
              <GoogleButton />
            </div>
          </div>
        )}

        <p className={styles["login-prompt"]}>
          لديك حساب بالفعل؟ <Link href="/login">سجّل الدخول</Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;
