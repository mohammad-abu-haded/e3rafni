import Signup from "@/components/auth/signup/Signup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد",
  description: "صفحة إنشاء حساب جديد في اعرفني. أدخل بياناتك للانضمام إلى مجتمعنا واستمتع بتجربة اللعبة الاجتماعية الممتعة.",
}

const SignupPage = () => {
  return (
    <div>
        <Signup />
    </div>
  );
};

export default SignupPage;
