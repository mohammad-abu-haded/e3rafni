"use client";

import { ApiResponse, ProfileUser } from "@/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ChevronIcon from "@/public/chevron.svg";
import styles from "./Header.module.css";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";
import { GetData } from "@/services/api.service";
import { PROFILE_UPDATED_EVENT } from "@/utils/profile-events";

const UserProfile = () => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>(profilePlaceholderBase64);
  const [iconClassName, setIconClassName] = useState<
    "bottom-arrow" | "up-arrow"
  >("bottom-arrow");
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result: ApiResponse = await GetData("/api/user/profile");

        if (!result?.success || !result.data) {
          return;
        }

        setUser(result.data);
        const userData: ProfileUser = result.data;

        if (userData.profileImage) {
          setImageUrl(userData.profileImage);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchProfile();

    window.addEventListener(PROFILE_UPDATED_EVENT, fetchProfile);

    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, fetchProfile);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIconClassName("bottom-arrow");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={profileRef} className={styles["user-profile-main"]}>
      <div
        className={styles["user-profile-container"]}
        onClick={() =>
          iconClassName === "bottom-arrow"
            ? setIconClassName("up-arrow")
            : setIconClassName("bottom-arrow")
        }
      >
        <div className={styles["user-profile"]}>
          <Image
            className={styles["user-image"]}
            src={imageUrl}
            alt="profile-image"
            width={32}
            height={32}
          />
          <p>{user?.name}</p>
        </div>
        <ChevronIcon
          className={`${styles["arrow-icon"]} ${styles[iconClassName] || ""}`}
        />
      </div>

      {iconClassName === "up-arrow" && (
        <ProfileDropdown setIconClassName={setIconClassName} />
      )}
    </div>
  );
};

export default UserProfile;
function setName(name: string) {
  throw new Error("Function not implemented.");
}
