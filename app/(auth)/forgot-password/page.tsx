import ForgotPassword from "@/components/ForgotPassword/ForgotPassword";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
  description: "استعد الوصول إلى حسابك في اعرفني من خلال خطوات بسيطة وآمنة.",
  robots: {
    index: false,
    follow: false,
  },
};

const Page = () => {
  return <ForgotPassword />;
};

export default Page;
