"use client";

import { useEffect, useState } from "react";
import styles from "./RoomsList.module.css";
import { ApiResponse, PaginatedRoomsResponse, Room } from "@/types";
import { GetData, PostData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { useRouter } from "next/navigation";
import CustomPagination from "../CustomPagination/CustomPagination";
import Link from "next/link";
import { toast } from "react-toastify";

interface IProps {
  type: "my" | "public";
}

const RoomsList = ({ type }: IProps) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [joiningRoomCode, setJoiningRoomCode] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const fetchRooms = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result: ApiResponse<PaginatedRoomsResponse> =
          (await GetData(`/api/rooms/${type}?page=${page}`)) ??
          API_ERROR_RESPONSE;

        if (!isCurrent) return;

        if (
          !result.success ||
          !result.data ||
          !Array.isArray(result.data.rooms) ||
          typeof result.data.totalPages !== "number"
        ) {
          setErrorMessage(result.message || "تعذر تحميل الغرف. حاول مجدداً.");
          setRooms([]);
          setTotalPages(1);
        } else {
          setRooms(result.data.rooms);
          setTotalPages(Math.max(result.data.totalPages, 1));
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        if (isCurrent) {
          setErrorMessage("تعذر تحميل الغرف. حاول مجدداً.");
          setRooms([]);
          setTotalPages(1);
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    fetchRooms();

    return () => {
      isCurrent = false;
    };
  }, [page, retryCount, type]);

  const handleJoinRoom = async (roomCode: string) => {
    setJoiningRoomCode(roomCode);
    try {
      const result: ApiResponse<{ roomCode: string }> =
        (await PostData(`/api/rooms/${roomCode}/join`)) ?? API_ERROR_RESPONSE;

      if (!result.success || !result.data?.roomCode) {
        toast.error(result.message || "تعذر الانضمام إلى الغرفة.");
        return;
      }

      toast.success(result.message);
      router.push(`/rooms/${result.data.roomCode.toLowerCase()}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("تعذر الانضمام إلى الغرفة. حاول مجدداً.");
    } finally {
      setJoiningRoomCode("");
    }
  };

  const title = type === "my" ? "غرفي" : "غرف عامة";
  const description =
    type === "my"
      ? "تابع اللعب في الغرف التي انضممت إليها."
      : "اكتشف غرفاً جديدة وانضم إلى لاعبين آخرين.";

  return (
    <section
      className={styles["rooms-section"]}
      aria-labelledby={`${type}-rooms-title`}
    >
      <header className={styles["section-header"]}>
        <div>
          <h2 id={`${type}-rooms-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        {!isLoading && !errorMessage && (
          <span className={styles["room-count"]}>{rooms.length}</span>
        )}
      </header>

      {isLoading ? (
        <div className={styles["status-message"]} role="status">
          <span className={styles["spinner"]} aria-hidden="true" />
          جارٍ تحميل الغرف...
        </div>
      ) : errorMessage ? (
        <div className={styles["status-message"]} role="alert">
          <p>{errorMessage}</p>
          <button
            className={styles["retry-button"]}
            onClick={() => setRetryCount((count) => count + 1)}
            type="button"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className={styles["status-message"]}>
          {type === "my"
            ? "لم تنضم إلى أي غرفة بعد. أدخل رمز غرفة للبدء."
            : "لا توجد غرف عامة متاحة حالياً."}
        </div>
      ) : (
        <div className={styles["rooms-grid"]}>
          {rooms.map((room) => (
            <article className={styles["room-item"]} key={room.id}>
              <div className={styles["room-item-header"]}>
                <h3>{room.name}</h3>
                <span
                  className={`${styles["visibility-badge"]} ${
                    room.isPrivate ? styles["private-badge"] : ""
                  }`}
                >
                  {room.isPrivate ? "خاصة" : "عامة"}
                </span>
              </div>

              <p className={styles["room-code"]} dir="ltr">
                {room.code}
              </p>

              <div className={styles["room-meta"]}>
                <span>
                  {room.currentRound > 0
                    ? `الجولة ${room.currentRound}`
                    : "لم تبدأ بعد"}
                </span>
                <span>السعة: {room.capacity} لاعبين</span>
              </div>

              <div className={styles["room-item-footer"]}>
                <time dateTime={new Date(room.createdAt).toISOString()}>
                  {new Date(room.createdAt).toLocaleDateString("ar", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                {type === "my" ? (
                  <Link
                    className={styles["room-action"]}
                    href={`/rooms/${room.code.toLowerCase()}`}
                  >
                    دخول الغرفة
                    <span aria-hidden="true">←</span>
                  </Link>
                ) : (
                  <button
                    className={styles["room-action"]}
                    disabled={Boolean(joiningRoomCode)}
                    onClick={() => handleJoinRoom(room.code)}
                    type="button"
                  >
                    {joiningRoomCode === room.code
                      ? "جارٍ الانضمام..."
                      : "انضم للغرفة"}
                    <span aria-hidden="true">←</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !errorMessage && totalPages > 1 && (
        <div className={styles["pagination"]}>
          <CustomPagination
            currentPage={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </section>
  );
};

export default RoomsList;
