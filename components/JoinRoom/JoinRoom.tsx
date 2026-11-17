"use client";

import ActionButton from "@/components/ActionButton/ActionButton";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { PostData } from "@/services/api.service";
import { ApiResponse } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import RoomKeyIcon from "@/public/room-join.svg";
import styles from "./JoinRoom.module.css";

const JoinRoom = () => {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const code = String(formData.get("code") ?? "")
      .trim()
      .toUpperCase();

    const result: ApiResponse<{ roomCode: string }> =
      (await PostData(`/api/rooms/${code}/join`)) ?? API_ERROR_RESPONSE;

    if (!result.success || !result.data?.roomCode) {
      toast.error(result.message || "تعذر الانضمام إلى الغرفة.");
      return;
    }

    toast.success(result.message);
    router.push(`/rooms/${result.data.roomCode.toLowerCase()}`);
  };

  return (
    <section className={styles["join-room"]} aria-labelledby="join-room-title">
      <div className={styles["join-room-copy"]}>
        <span className={styles["join-room-icon-container"]} aria-hidden="true">
          <RoomKeyIcon
            className={styles["join-room-icon"]}
            aria-hidden="true"
          />
        </span>

        <div>
          <h2 id="join-room-title">انضم إلى غرفة</h2>
          <p>أدخل رمز الغرفة الذي شاركه معك أصدقاؤك.</p>
        </div>
      </div>

      <form className={styles["join-room-form"]} action={handleSubmit}>
        <div className={styles["code-field"]}>
          <div className={styles["code-field-heading"]}>
            <label htmlFor="room-code">رمز الغرفة</label>
            <span>8 أحرف أو أرقام</span>
          </div>

          <input
            id="room-code"
            name="code"
            type="text"
            placeholder="ABC12345"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            dir="ltr"
            aria-describedby="room-code-hint"
            required
          />
          <span id="room-code-hint" className={styles["visually-hidden"]}>
            اكتب رمز الغرفة باللغة الإنجليزية، ويتكوّن من 8 أحرف أو أرقام.
          </span>
        </div>

        <div className={styles["join-room-button"]}>
          <ActionButton title="انضمام" className="btn btn-primary" />
        </div>
      </form>
    </section>
  );
};

export default JoinRoom;
