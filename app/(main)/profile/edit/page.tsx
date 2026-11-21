import type { Metadata } from "next";
import Profile from "./Profile";

export const metadata: Metadata = {
  title: "الملف الشخصي",
  description: "إدارة حسابك الشخصي وتحديث معلوماتك وصورتك الشخصية في اعرفني.",
  robots: {
    index: false,
    follow: false,
  },
};

const ProfilePage = () => {
  return <Profile />;
};

export default ProfilePage;
