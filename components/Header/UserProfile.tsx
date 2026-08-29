"use client";

import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { ApiResponse } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./UserProfile.module.css";

const profilePlaceholderBase64 =
  "data:image/webp;base64,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";

const UserProfile = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    getProfileImage();
  }, []);

  return (
    <div className={styles.container}>
      {loading ? (
        <Image
          className={styles.image}
          src={profilePlaceholderBase64}
          alt="loading"
          width={420}
          height={420}
        />
      ) : imageUrl ? (
        <Image
          className={styles.image}
          src={imageUrl}
          alt="profile-image"
          width={420}
          height={420}
          placeholder="blur"
          blurDataURL={profilePlaceholderBase64}
        />
      ) : (
        <div className={styles.fallback}>?</div>
      )}
    </div>
  );
};

export default UserProfile;