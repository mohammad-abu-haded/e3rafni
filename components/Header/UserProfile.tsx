"use client";

import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { ApiResponse } from "@/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ChevronIcon from "@/public/chevron.svg";
import styles from "./Header.module.css";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";

const UserProfile = ({ name }: { name: string }) => {
  const profileRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>(profilePlaceholderBase64);
  const [iconClassName, setIconClassName] = useState<
    "bottom-arrow" | "up-arrow"
  >("bottom-arrow");
  useEffect(() => {
    const getProfileImage = async () => {
      try {
        const response = await fetch("/api/user/profile-image");

        const result: ApiResponse<string> =
          (await response.json()) || API_ERROR_RESPONSE;

        if (result.success && result.data) {
          setImageUrl(result.data);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      } finally {
      }
    };

    getProfileImage();
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
          <p>{name}</p>
        </div>
        <ChevronIcon
          className={`${styles["arrow-icon"]} ${styles[iconClassName] || ""}`}
        />
      </div>

      {iconClassName === "up-arrow" && <ProfileDropdown />}
    </div>
  );
};

export default UserProfile;
