import Login from "@/components/auth/login/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description:
    "صفحة تسجيل الدخول إلى حسابك في اعرفني. أدخل بياناتك للمتابعة إلى حسابك واستمتع بتجربة اللعبة الاجتماعية الممتعة.",
};

const LoginPage = async () => {
  return (
    <div>
      <Login />
    </div>
  );
};

export default LoginPage;
