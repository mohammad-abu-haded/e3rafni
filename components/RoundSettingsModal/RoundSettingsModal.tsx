import { useEffect, useState } from "react";
import styles from "./RoundSettingsModal.module.css";
import { ApiResponse, RoomMember } from "@/types";
import { toast } from "react-toastify";
import ActionButton from "../ActionButton/ActionButton";
import SelectIcon from "@/public/select.svg";
import SearchIcon from "@/public/search.svg";
import UsersIcon from "@/public/users.svg";
import ClockIcon from "@/public/clock.svg";
import Image from "next/image";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";
import { PostData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { io } from "socket.io-client";
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

interface IProps {
  userId: number;
  roomCode: string;
  roomMembers: RoomMember[];
  onClose: () => void;
}

const RoundSetup = ({ userId, roomCode, roomMembers, onClose }: IProps) => {
  const [roundDuration, setRoundDuration] = useState<number | string>("");
  const [player1, setPlayer1] = useState<number>();
  const [player2, setPlayer2] = useState<number>();
  const [viewers, setViewers] = useState<number[]>([]);
  const [player1Word, setPlayer1Word] = useState("");
  const [player2Word, setPlayer2Word] = useState("");

  const [nameSearched, setNameSearched] = useState("");
  const [roomMemberFiltered, setRoomMemberFiltered] =
    useState<RoomMember[]>(roomMembers);

  const [durationUnit, setDurationUnit] = useState<
    "seconds" | "minutes" | "hours"
  >("minutes");

  const [memberFilter, setMemberFilter] = useState<
    "all" | "players" | "viewers"
  >("all");

  const handleSubmit = async () => {
    const duration = Number(roundDuration);
    let roundDurationInSeconds = duration;
    if (durationUnit === "minutes") {
      roundDurationInSeconds = duration * 60;
    } else if (durationUnit === "hours") {
      roundDurationInSeconds = duration * 60 * 60;
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      toast.error("مدة الجولة غير صالحة أو لم تحددها");
      return;
    }
    if (!player1) {
      toast.error("يرجى اختيار اللاعب الأول");
      return;
    }
    if (!player2) {
      toast.error("يرجى اختيار اللاعب الثاني");
      return;
    }
    if (player1 === player2) {
      toast.error("يرجى اختيار لاعبين مختلفين");
      return;
    }
    if ([player1, player2].includes(userId)) {
      toast.error("لا يمكنك إختيار نفسك كلاعب");
      return;
    }
    if (viewers.includes(player1) || viewers.includes(player2)) {
      toast.error("لا يمكنك اختيار اللاعبين كمشاهدين");
      return;
    }
    if (!player1Word.trim()) {
      toast.error("يرجى تحديد كلمة اللاعب الأول");
      return;
    }
    if (!player2Word.trim()) {
      toast.error("يرجى تحديد كلمة اللاعب الثاني");
      return;
    }
    const result: ApiResponse =
      (await PostData(`/api/rooms/${roomCode}/rounds/start`, {
        roundDuration: roundDurationInSeconds,
        player1,
        player2,
        viewers,
        player1Word: player1Word.trim(),
        player2Word: player2Word.trim(),
      })) || API_ERROR_RESPONSE;
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    socket.emit("server:round-started", roomCode);
    onClose();
  };

  const handlePlayerSelect = (memberId: number, player: 1 | 2) => {
    if (player === 1) {
      if (player1 === memberId) {
        setPlayer1(undefined);
        return;
      }
      setPlayer1(memberId);

      setPlayer2((current) => (current === memberId ? undefined : current));

      setViewers((current) => current.filter((id) => id !== memberId));

      return;
    }

    if (player2 === memberId) {
      setPlayer2(undefined);
      return;
    }
    setPlayer2(memberId);

    setPlayer1((current) => (current === memberId ? undefined : current));

    setViewers((current) => current.filter((id) => id !== memberId));
  };

  const handleViewerSelect = (memberId: number) => {
    setViewers((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );

    setPlayer1((current) => (current === memberId ? undefined : current));

    setPlayer2((current) => (current === memberId ? undefined : current));
  };

  const handleSelectAllViewers = () => {
    setViewers(
      roomMemberFiltered
        .filter(
          (item) =>
            item.userId !== player1 &&
            item.userId !== player2 &&
            item.userId !== userId,
        )
        .map((item) => item.userId),
    );
  };

  useEffect(() => {
    const filtered = roomMembers.filter((item) =>
      item.user.name.toLowerCase().includes(nameSearched.toLowerCase()),
    );

    setRoomMemberFiltered(filtered);
  }, [nameSearched, roomMembers]);

  const displayedMembers = roomMemberFiltered.filter((item) => {
    if (memberFilter === "players") {
      return item.userId === player1 || item.userId === player2;
    }

    if (memberFilter === "viewers") {
      return viewers.includes(item.userId);
    }

    return true;
  });

  return (
    <div className={styles["round-setup-container"]} onClick={() => onClose()}>
      <form
        action={handleSubmit}
        className={styles["round-setup-main"]}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["round-setup-header"]}>
          <div className={styles["round-setup-label"]}>
            <div className={styles["round-setup-title"]}>
              <ClockIcon className={styles["clock-icon"]} />
              إدارة الجولة القادمة
            </div>

            <h2>إعداد الجولة</h2>

            <p>
              حدد مدة الجولة، اللاعبين، الكلمات السرية والمشاهدين قبل بدء
              الجولة.
            </p>
          </div>

          <div className={styles["round-settings"]}>
            <div className={styles["duration-container"]}>
              <label htmlFor="round-duration">مدة الجولة</label>

              <div className={styles["duration-input-container"]}>
                <input
                  id="round-duration"
                  type="number"
                  min="1"
                  value={roundDuration}
                  placeholder="مثال: 20"
                  onChange={(e) => setRoundDuration(e.target.value)}
                />

                <select
                  form=""
                  value={durationUnit}
                  onChange={(e) =>
                    setDurationUnit(
                      e.target.value as "seconds" | "minutes" | "hours",
                    )
                  }
                >
                  <option value="seconds">ثواني</option>
                  <option value="minutes">دقائق</option>
                  <option value="hours">ساعات</option>
                </select>
              </div>
            </div>

            <div className={styles["player-settings"]}>
              <div className={styles["player-setting"]}>
                <label>كلمة اللاعب الأول</label>

                <input
                  type="text"
                  placeholder="الكلمة السرية للاعب الأول"
                  value={player1Word}
                  onChange={(e) => setPlayer1Word(e.target.value)}
                />
              </div>

              <div className={styles["player-setting"]}>
                <label>كلمة اللاعب الثاني</label>

                <input
                  type="text"
                  placeholder="الكلمة السرية للاعب الثاني"
                  value={player2Word}
                  onChange={(e) => setPlayer2Word(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles["search-container"]}>
            <SearchIcon className={styles["search-icon"]} />

            <input
              type="text"
              placeholder="ابحث عن لاعب باسمه"
              value={nameSearched}
              onChange={(e) => setNameSearched(e.currentTarget.value)}
            />
          </div>
        </div>

        <div className={styles["room-members-container"]}>
          <div className={styles["room-members-header"]}>
            <div className={styles["room-members-label"]}>
              <UsersIcon className={styles["room-members-icon"]} />
              أعضاء الجولة
            </div>

            <div className={styles["member-filters"]}>
              <button
                type="button"
                className={`${styles["member-filter"]} ${
                  memberFilter === "all" ? styles["member-filter-selected"] : ""
                }`}
                onClick={() => setMemberFilter("all")}
              >
                الكل {roomMembers.length - 1}
              </button>

              <button
                type="button"
                className={`${styles["member-filter"]} ${
                  memberFilter === "players"
                    ? styles["member-filter-selected"]
                    : ""
                }`}
                onClick={() => setMemberFilter("players")}
              >
                اللاعبين {[player1, player2].filter(Boolean).length}
              </button>

              <button
                type="button"
                className={`${styles["member-filter"]} ${
                  memberFilter === "viewers"
                    ? styles["member-filter-selected"]
                    : ""
                }`}
                onClick={() => setMemberFilter("viewers")}
              >
                المشاهدين {viewers.length}
              </button>
            </div>

            <div className={styles["viewer-actions"]}>
              <button
                type="button"
                className={styles["viewer-action"]}
                onClick={handleSelectAllViewers}
              >
                اختيار الكل كمشاهدين
              </button>

              <button
                type="button"
                className={styles["viewer-action"]}
                onClick={() => setViewers([])}
              >
                إلغاء الكل
              </button>
            </div>
          </div>

          <div className={styles["room-members"]}>
            {displayedMembers.map((item) => {
              if (item.userId === userId) {
                return null;
              }
              const isPlayer1 = item.userId === player1;
              const isPlayer2 = item.userId === player2;
              const isViewer = viewers.includes(item.userId);

              return (
                <div
                  key={item.userId}
                  className={`${styles["room-member-card"]} ${
                    isPlayer1 || isPlayer2 || isViewer
                      ? styles["room-member-card-selected"]
                      : ""
                  }`}
                >
                  <Image
                    className={styles["member-picture"]}
                    src={item.user.picture || profilePlaceholderBase64}
                    alt="member profile picture"
                    width={80}
                    height={80}
                  />

                  <div className={styles["member-info"]}>
                    <h4>{item.user.name}</h4>

                    <p>لعب 10 جولات من 12 جولة</p>
                    <p>فاز 8 من 10</p>
                  </div>

                  <div className={styles["member-actions"]}>
                    <button
                      type="button"
                      className={`${styles["member-action"]} ${
                        isPlayer1 ? styles["member-action-selected"] : ""
                      }`}
                      onClick={() => handlePlayerSelect(item.userId, 1)}
                    >
                      لاعب أول
                    </button>

                    <button
                      type="button"
                      className={`${styles["member-action"]} ${
                        isPlayer2 ? styles["member-action-selected"] : ""
                      }`}
                      onClick={() => handlePlayerSelect(item.userId, 2)}
                    >
                      لاعب ثاني
                    </button>

                    <button
                      type="button"
                      className={`${styles["member-action"]} ${
                        isViewer ? styles["member-action-selected"] : ""
                      }`}
                      onClick={() => handleViewerSelect(item.userId)}
                    >
                      مشاهد
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles["actions"]}>
          <div className={styles["round-selector"]}>
            <ActionButton
              title="بدء الجولة"
              className="btn btn-primary"
              Icon={SelectIcon}
              disabled={
                !roundDuration ||
                !player1 ||
                !player2 ||
                !player1Word.trim() ||
                !player2Word.trim()
              }
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onClose()}
          >
            إغلاق
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoundSetup;
