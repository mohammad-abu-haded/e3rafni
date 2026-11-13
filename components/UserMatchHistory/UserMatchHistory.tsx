"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./UserMatchHistory.module.css";
import { ApiResponse, UserMatchHistory } from "@/types";
import { GetData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import DrawIcon from "@/public/handshake.svg";
import WinIcon from "@/public/win.svg";
import LossIcon from "@/public/circleX.svg";
import SearchIcon from "@/public/search.svg";

type ResultFilter = "ALL" | "WIN" | "LOSS" | "DRAW";

const MatchHistory = () => {
  const [userMatchHistory, setUserMatchHistory] = useState<UserMatchHistory[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState("ALL");
  const [opponentSearch, setOpponentSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("ALL");
  const [selectedResult, setSelectedResult] = useState<ResultFilter>("ALL");

  useEffect(() => {
    const getUserMatchHistory = async () => {
      try {
        const result: ApiResponse<UserMatchHistory[]> =
          (await GetData("/api/user/match-history")) || API_ERROR_RESPONSE;
        if (!result || !result.success || !Array.isArray(result.data)) {
          setHasError(true);
          return;
        }
        setUserMatchHistory(result.data);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    getUserMatchHistory();
  }, []);

  const opponents = useMemo(
    () => [
      ...new Set(
        userMatchHistory.map((match) => match.roundMember.roomMember.user.name),
      ),
    ],
    [userMatchHistory],
  );
  const rooms = useMemo(
    () => [
      ...new Set(
        userMatchHistory.map((match) => match.roundMember.round.room.name),
      ),
    ],
    [userMatchHistory],
  );
  const filteredMatches = useMemo(
    () =>
      userMatchHistory.filter((match) => {
        const opponent = match.roundMember.roomMember.user.name;
        const room = match.roundMember.round.room.name;
        const matchesOpponent =
          selectedOpponent === "ALL" || opponent === selectedOpponent;
        const matchesRoom = selectedRoom === "ALL" || room === selectedRoom;
        const matchesResult =
          selectedResult === "ALL" || String(match.result) === selectedResult;
        const matchesSearch = opponent
          .toLocaleLowerCase("ar")
          .includes(opponentSearch.trim().toLocaleLowerCase("ar"));
        return matchesOpponent && matchesRoom && matchesResult && matchesSearch;
      }),
    [
      userMatchHistory,
      selectedOpponent,
      selectedRoom,
      selectedResult,
      opponentSearch,
    ],
  );

  const resetFilters = () => {
    setSelectedOpponent("ALL");
    setSelectedRoom("ALL");
    setSelectedResult("ALL");
    setOpponentSearch("");
  };
  const getResultInfo = (result: UserMatchHistory["result"]) => {
    switch (String(result)) {
      case "WIN":
        return { label: "فوز", className: "win", Icon: WinIcon };
      case "LOSS":
        return { label: "خسارة", className: "loss", Icon: LossIcon };
      case "DRAW":
        return { label: "تعادل", className: "draw", Icon: DrawIcon };
      default:
        return { label: "غير معروف", className: "unknown", Icon: DrawIcon };
    }
  };
  const formatDate = (date: Date) =>
    new Date(date).toLocaleString("ar-PS", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const hasActiveFilters =
    selectedOpponent !== "ALL" ||
    selectedRoom !== "ALL" ||
    selectedResult !== "ALL" ||
    opponentSearch.trim() !== "";
  const wins = userMatchHistory.filter(
    (match) => String(match.result) === "WIN",
  ).length;
  const losses = userMatchHistory.filter(
    (match) => String(match.result) === "LOSS",
  ).length;
  const draws = userMatchHistory.filter(
    (match) => String(match.result) === "DRAW",
  ).length;

  return (
    <section className={styles["match-history"]}>
      <header className={styles.hero}>
        <div className={styles["hero-copy"]}>
          <span className={styles["hero-kicker"]}>ملفك التنافسي</span>
          <h2 className={styles["section-title"]}>كل مباراة تحكي قصة</h2>
          <p className={styles["section-description"]}>
            راجع مواجهاتك، تابع تقدمك، واكتشف سجلّك مع الأصدقاء
          </p>
        </div>
        {!isLoading && !hasError && (
          <div className={styles["hero-total"]}>
            <strong>{userMatchHistory.length}</strong>
            <span>إجمالي المواجهات</span>
          </div>
        )}
      </header>
      {!isLoading && !hasError && userMatchHistory.length > 0 && (
        <div className={styles["stat-grid"]}>
          <div className={`${styles["stat-card"]} ${styles["stat-win"]}`}>
            <span className={styles["stat-label"]}>انتصارات</span>
            <strong>{wins}</strong>
            <span className={styles["stat-note"]}>مباريات فزت بها</span>
          </div>
          <div className={`${styles["stat-card"]} ${styles["stat-draw"]}`}>
            <span className={styles["stat-label"]}>تعادلات</span>
            <strong>{draws}</strong>
            <span className={styles["stat-note"]}>مواجهات متكافئة</span>
          </div>
          <div className={`${styles["stat-card"]} ${styles["stat-loss"]}`}>
            <span className={styles["stat-label"]}>خسائر</span>
            <strong>{losses}</strong>
            <span className={styles["stat-note"]}>فرص لمواجهة جديدة</span>
          </div>
        </div>
      )}
      {!isLoading && !hasError && userMatchHistory.length > 0 && (
        <>
          <div className={styles["list-heading"]}>
            <div>
              <h3>المواجهات الأخيرة</h3>
              <span>{filteredMatches.length} مباراة معروضة</span>
            </div>
            <span className={styles["list-heading-mark"]}>سجلّك</span>
          </div>
          <div className={styles.filters}>
            <div className={styles["search-filter"]}>
              <label htmlFor="opponent-search">بحث باسم الخصم</label>
              <div className={styles["search-control"]}>
                <SearchIcon
                  className={styles["search-icon"]}
                  aria-hidden="true"
                />
                <input
                  id="opponent-search"
                  type="search"
                  value={opponentSearch}
                  onChange={(e) => setOpponentSearch(e.target.value)}
                  placeholder="اكتب اسم الخصم..."
                  autoComplete="off"
                />
              </div>
            </div>
            <div className={styles["filter-group"]}>
              <label htmlFor="opponent-filter">الخصم</label>
              <select
                id="opponent-filter"
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
              >
                <option value="ALL">جميع الأشخاص</option>
                {opponents.map((opponent) => (
                  <option key={opponent} value={opponent}>
                    {opponent}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles["filter-group"]}>
              <label htmlFor="room-filter">الغرفة</label>
              <select
                id="room-filter"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="ALL">جميع الغرف</option>
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles["filter-group"]}>
              <label htmlFor="result-filter">النتيجة</label>
              <select
                id="result-filter"
                value={selectedResult}
                onChange={(e) =>
                  setSelectedResult(e.target.value as ResultFilter)
                }
              >
                <option value="ALL">جميع النتائج</option>
                <option value="WIN">فوز</option>
                <option value="LOSS">خسارة</option>
                <option value="DRAW">تعادل</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles["reset-filters"]}
                onClick={resetFilters}
              >
                إعادة ضبط التصفية
              </button>
            )}
          </div>
        </>
      )}

      {isLoading ? (
        <div className={styles.message}>جاري تحميل سجل المباريات...</div>
      ) : hasError ? (
        <div className={styles.message} role="alert">
          حدث خطأ أثناء تحميل سجل المباريات.
        </div>
      ) : userMatchHistory.length === 0 ? (
        <div className={styles["empty-state"]}>
          <div className={styles["empty-icon"]} aria-hidden="true">
            —
          </div>
          <h3>لا توجد مباريات حتى الآن</h3>
          <p>عندما تخوض مباريات جديدة ستظهر نتائجها هنا.</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className={styles["empty-state"]}>
          <div className={styles["empty-icon"]} aria-hidden="true">
            ⌕
          </div>
          <h3>لا توجد نتائج مطابقة</h3>
          <p>جرّب تغيير خيارات التصفية.</p>
          <button
            type="button"
            className={styles["reset-filters"]}
            onClick={resetFilters}
          >
            إعادة ضبط التصفية
          </button>
        </div>
      ) : (
        <div className={styles["match-list"]}>
          {filteredMatches.map((match, index) => {
            const resultInfo = getResultInfo(match.result);
            const ResultIcon = resultInfo.Icon;
            return (
              <article
                className={styles["match-card"]}
                key={`${match.createdAt}-${index}`}
              >
                <div className={styles["match-main"]}>
                  <div
                    className={`${styles["match-result-icon"]} ${styles[resultInfo.className]}`}
                    aria-label={resultInfo.label}
                  >
                    <ResultIcon
                      className={styles["result-svg"]}
                      aria-hidden="true"
                    />
                  </div>
                  <div className={styles["match-info"]}>
                    <h3 className={styles["room-name"]}>
                      {match.roundMember.round.room.name}
                    </h3>
                    <p className={styles["opponent-name"]}>
                      ضد{" "}
                      <strong>{match.roundMember.roomMember.user.name}</strong>
                    </p>
                  </div>
                </div>
                <div className={styles["match-details"]}>
                  <span className={styles["round-number"]}>
                    الجولة {match.roundMember.round.roundNumber}
                  </span>
                  <span
                    className={`${styles["result-badge"]} ${styles[resultInfo.className]}`}
                  >
                    {resultInfo.label}
                  </span>
                </div>
                <time
                  className={styles["match-date"]}
                  dateTime={new Date(match.createdAt).toISOString()}
                >
                  {formatDate(match.createdAt)}
                </time>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MatchHistory;
