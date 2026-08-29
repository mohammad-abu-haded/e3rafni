"use client";

import { useEffect, useState } from "react";
import InformationStep from "./SignupForm/InformationStep";
import OtpStep from "./SignupForm/OtpStep";
import PhotoStep from "./SignupForm/PhotoStep";
import GoogleButton from "../GoogleButton";
import StepProgress from "@/components/StepProgress/StepProgress";
import { useRouter, useSearchParams } from "next/navigation";

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
  const handleComplete = () => {};
  return (
    <div>
      <div>
        <StepProgress contents={contents} current={step - 1} />
        <div>
          {step == 1 && (
            <InformationStep
              onNext={() => router.push(`/signup?email=${email}`)}
              email={email}
              setEmail={setEmail}
            />
          )}
          {step == 2 && (
            <OtpStep
              onNext={() => router.push("/signup?complete=true")}
              email={email}
            />
          )}
          {step == 3 && <PhotoStep onComplete={() => handleComplete()} />}
        </div>
      </div>

      {step == 1 && (
        <div>
          <div>
            <p>أو</p>
          </div>

          <div>
            <GoogleButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
