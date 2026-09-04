import { ApiResponse } from "@/types";
import styles from "./ProfileDropdown.module.css";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import EditIcon from "@/public/edit.svg";
import LogoutIcon from "@/public/logout.svg";
const ProfileDropdown = () => {
  const editProfile = () => {
    console.log("Edit Profile");
  };

  const logout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response) {
      toast.error("فشل تسجيل الخروج");
      return;
    }

    const result: ApiResponse = await response.json();
    if (result.success) {
      toast.success(result.message);
      redirect("/login");
    } else {
      toast.error("فشل تسجيل الخروج");
    }
  };
  const dropdown = [
    {
      title: "تعديل الملف الشخصي",
      func: editProfile,
      Icon: <EditIcon className={styles["icon"]} />,
    },

    {
      title: "تسجيل الخروج",
      func: logout,
      Icon: <LogoutIcon className={styles["icon"]} />,
    },
  ];
  return (
    <div className={styles["profile-dropdown-list"]}>
      {dropdown.map((item, index) => (
        <div
          key={index}
          className={styles["profile-dropdown-item"]}
          onClick={item.func}
        >
          {item.Icon}
          <p>{item.title}</p>
        </div>
      ))}
    </div>
  );
};

export default ProfileDropdown;
