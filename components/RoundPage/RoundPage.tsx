"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import styles from "./RoundPage.module.css";
import {
  ApiResponse,
  CardWithUsage,
  RoomMember,
  Round,
  RoundMember,
  VisiblePlayerWord,
} from "@/types";
import { GetData, PatchData, PostData } from "@/services/api.service";
import NotFound from "@/app/not-found";
import { RoundMemberType } from "@/app/generated/prisma/enums";
import {
  fetchRoomMembers,
  fetchRoundMembers,
  fetchVisiblePlayerWords,
} from "@/services/room-api.service";
import Image from "next/image";
import ConfirmCardDialog from "../ConfirmCardDialog/ConfirmCardDialog";
import RoundTimer from "../RoundTimer/RoundTimer";
import SearchIcon from "@/public/search.svg";
import GoogleAIIcon from "@/public/GoogleAIIcon.svg";
import EditIcon from "@/public/edit.svg";
import ActionButton from "../ActionButton/ActionButton";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

interface IProps {
  roomCode: string;
  userId: number;
}

const RoundPage = ({ roomCode, userId }: IProps) => {
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const roomMembersRef = useRef<RoomMember[]>([]);
  const [roundMembers, setRoundMembers] = useState<RoundMember[]>([]);
  const [round, setRound] = useState<Round>();
  const [roomCards, setRoomCards] = useState<CardWithUsage[]>([]);
  const [roundRule, setRoundRule] = useState<RoundMemberType>();
  const [playerWords, setPlayerWords] = useState<VisiblePlayerWord[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardWithUsage>();
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState("");
  const [isUpdatingWord, setIsUpdatingWord] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getRoomMembers = async () => {
    const result = await fetchRoomMembers(roomCode);

    if (result.hasError) {
      setHasError(true);
      return;
    }

    const members = result.roomMembers ?? [];

    roomMembersRef.current = members;
    setRoomMembers(members);
  };

  const getRoundMembers = async () => {
    const result = await fetchRoundMembers(roomCode);

    if (result.hasError) {
      setHasError(true);
      return;
    }

    const fetchedRoundMembers = result.roundMembers ?? [];

    setRoundMembers(fetchedRoundMembers);
    setRoundRule(
      fetchedRoundMembers.find((member) => member.userId === userId)?.type,
    );
  };

  const getPlayerWords = async (playerEditedId?: number) => {
    const result = await fetchVisiblePlayerWords(roomCode);

    if (result.hasError) {
      setHasError(true);
      return;
    }

    setPlayerWords(result.visiblePlayerWords ?? []);

    if (playerEditedId !== undefined) {
      const playerName = roomMembersRef.current.find(
        (item) => item.userId === playerEditedId,
      )?.user.name;
      if (playerName) {
        toast.success(`تم تعديل كلمة اللاعب ${playerName}`);
      }
    }
  };

  const getRoomCards = async () => {
    const result: ApiResponse<CardWithUsage[]> = await GetData(
      `/api/rooms/${roomCode}/cards/usage`,
    );

    if (!result?.success || !result.data) {
      setHasError(true);
      return;
    }

    setRoomCards(result.data);
  };

  const getRound = async () => {
    const result: ApiResponse<Round> = await GetData(
      `/api/rooms/${roomCode}/rounds`,
    );

    if (!result?.success || !result.data) {
      setHasError(true);
      return;
    }

    setRound(result.data);
  };

  const getRoundData = async () => {
    await getRoomMembers();
    await getRoundMembers();
    await getPlayerWords();
    await getRoomCards();
    await getRound();
  };

  const handleUseCard = async (card: CardWithUsage) => {
    try {
    
    const result: ApiResponse = await PostData(`/api/rooms/${roomCode}/rounds/players/cards/${card.cardId}/use`) || API_ERROR_RESPONSE;

    if(result.success) {
      toast.success(result.message);
    }
    else {
      toast.error(result.message);
    }
  } catch {
    toast.error("حدث خطأ أثناء استخدام الكرت");
    }
  };

  const handleUpdatePlayerWord = async () => {
    if (editingPlayerId === null || !editedWord) {
      toast.error("يرجى إدخال كلمة صحيحة");
      return;
    }

    if (editedWord.length > 100) {
      toast.error("كلمة اللاعب يجب ألا تتجاوز 100 حرف");
      return;
    }

    setIsUpdatingWord(true);
    try {
      const result: ApiResponse =
        (await PatchData(
          `/api/rooms/${roomCode}/rounds/players/${editingPlayerId}/word`,
          { word: editedWord },
        )) || API_ERROR_RESPONSE;

      if (!result || !result.success) {
        toast.error(result.message ?? "فشل تعديل الكلمة");
        return;
      }
      socket.emit("round:player-word-updated", roomCode, editingPlayerId);
      getPlayerWords();
      setEditingPlayerId(null);
      setEditedWord("");
    } catch {      
      toast.error("حدث خطأ أثناء تعديل الكلمة");
    } finally {
      setIsUpdatingWord(false);
    }
  };

  const getPlayerCardUsage = (card: CardWithUsage, playerId: number) => {
    return (
      card.players.find((player) => player.userId === playerId)?.usedCount ?? 0
    );
  };

  useEffect(() => {
    const handleConnect = () => {
      socket.emit("join-room", roomCode);
    };

    const handleRoomMembersUpdated = () => {
      getRoomMembers();
    };

    const handleRoomMemberLeft = () => {
      getRoomMembers();
      getRoundMembers();
      getPlayerWords();
    };

    const handleRoundMembersUpdated = () => {
      getRoundMembers();
      getPlayerWords();
    };

    const handleRoundStarted = () => {
      getRoundData();
    };

    const handlePlayerWordUpdated = (playerEditedId: number) => {
      getPlayerWords(playerEditedId);
    };

    const handleRoomEnded = () => {
      toast.info("تم إنهاء الغرفة من قبل صاحبها");
      window.location.href = "/";
    };

    socket.on("connect", handleConnect);
    socket.on("room:members-updated", handleRoomMembersUpdated);
    socket.on("room:member-left", handleRoomMemberLeft);
    socket.on("round:members-updated", handleRoundMembersUpdated);
    socket.on("round:started", handleRoundStarted);
    socket.on("player:word-updated", handlePlayerWordUpdated);
    socket.on("room:ended", handleRoomEnded);

    if (socket.connected) {
      handleConnect();
    }

    getRoundData();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("room:members-updated", handleRoomMembersUpdated);
      socket.off("room:member-left", handleRoomMemberLeft);
      socket.off("round:members-updated", handleRoundMembersUpdated);
      socket.off("round:started", handleRoundStarted);
      socket.off("player:word-updated", handlePlayerWordUpdated);
      socket.off("room:ended", handleRoomEnded);
    };
  }, [roomCode]);

  if (hasError) {
    return <NotFound />;
  }

  if (!round) {
    return <div className={styles["round-loading"]}>جاري تحميل الجولة...</div>;
  }

  return (
    <div className={styles["round-page"]}>
      <section className={styles["round-header"]}>
        <div>
          <h2>الجولة {round.roundNumber}</h2>
          <RoundTimer
            startedAt={round.startedAt}
            duration={round.roundDuration}
          />
        </div>

        <div className={styles["round-status"]}>
          {roundRule === "PLAYER"
            ? "أنت لاعب"
            : roundRule === "RULER"
              ? "أنت الحكم"
              : roundRule === "VIEWER"
                ? "أنت مشاهد"
                : "غير مصنف"}
        </div>
      </section>

      <section className={styles["round-words-section"]}>
        <div className={styles["section-header"]}>
          <h3>كلمات اللاعبين</h3>
        </div>

        <div className={styles["round-words"]}>
          {roundMembers
            .filter((member) => member.type === RoundMemberType.PLAYER)
            .map((member) => {
              const player = roomMembers.find(
                (roomMember) => roomMember.userId === member.userId,
              );

              const playerWord = playerWords.find(
                (item) => item.playerId === member.userId,
              )?.word;

              return (
                <div key={member.userId} className={styles["player-word-card"]}>
                  <div className={styles["player-word-header"]}>
                    <div className={styles["player-avatar"]}>
                        <Image
                          className={styles["user-image"]}
                          src={player?.user.picture || profilePlaceholderBase64}
                          alt="profile-image"
                          width={48}
                          height={48}
                        />
                    </div>

                    <h4>{player?.user.name ?? `اللاعب ${member.userId}`}</h4>
                  </div>

                  <div className={styles["player-word-container"]}>
                    {playerWord ? (
                      <>
                        <span className={styles["player-word-text"]}>
                          {playerWord}
                        </span>

                        <div className={styles["word-search-actions"]}>
                          <button
                            type="button"
                            className={`${styles["word-search-button"]} ${styles["word-search-images"]}`}
                            onClick={() => {
                              const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                                playerWord,
                              )}`;

                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                            aria-label={`البحث عن ${playerWord} في صور Google`}
                            title="البحث عن الصور"
                          >
                            <SearchIcon className={styles["search-icon"]} />
                            <span>صور Google</span>
                          </button>

                          <button
                            type="button"
                            className={`${styles["word-search-button"]} ${styles["word-search-ai"]}`}
                            onClick={() => {
                              const url = `https://www.google.com/search?udm=50&q=${encodeURIComponent(
                                playerWord,
                              )}`;

                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                            aria-label={`استكشاف ${playerWord} باستخدام Google AI Mode`}
                            title="البحث باستخدام الذكاء الاصطناعي"
                          >
                            <GoogleAIIcon className={styles["search-icon"]} />
                            <span>AI Mode</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className={styles["player-word-hidden"]}>
                        الكلمة مخفية
                      </span>
                    )}
                  </div>
                  {roundRule === RoundMemberType.RULER && (
                    <button
                      type="button"
                      className={styles["edit-player-word-button"]}
                      onClick={() => {
                        setEditingPlayerId(member.userId);
                        setEditedWord(playerWord ?? "");
                      }}
                      disabled={!playerWord}
                    >
                      <EditIcon />
                      <span>تعديل الكلمة</span>
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      <section className={styles["round-cards-section"]}>
        <div className={styles["section-header"]}>
          <h3>كروت اللعبة</h3>
          <span>{roomCards.length} كرت</span>
        </div>

        {roomCards.length === 0 ? (
          <p className={styles["empty-message"]}>لا توجد كروت متاحة.</p>
        ) : (
          <div className={styles["round-cards"]}>
            {roomCards.map((card) => {
              const usedCount = getPlayerCardUsage(card, userId);
              const isLimitReached = usedCount >= card.maxPerPlayer;
              const canUseCard = roundRule === "PLAYER" && !isLimitReached;

              return (
                <div
                  key={card.cardId}
                  className={`${styles["round-card"]} ${
                    canUseCard ? styles["round-card-clickable"] : ""
                  } ${
                    roundRule === "PLAYER" && isLimitReached
                      ? styles["round-card-disabled"]
                      : ""
                  }`}
                  style={{ borderTopColor: card.color }}
                  onClick={() => {
                    if (canUseCard) {
                      setSelectedCard(card);
                    }
                  }}
                  role={canUseCard ? "button" : undefined}
                  tabIndex={canUseCard ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (
                      canUseCard &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      setSelectedCard(card);
                    }
                  }}
                >
                  <div className={styles["round-card-header"]}>
                    <h4>{card.title}</h4>
                    {roundRule === "PLAYER" && (
                      <span
                        className={`${styles["card-usage-badge"]} ${
                          isLimitReached ? styles["card-usage-limit"] : ""
                        }`}
                      >
                        {usedCount} / {card.maxPerPlayer}
                      </span>
                    )}
                  </div>

                  <p className={styles["round-card-description"]}>
                    {card.description}
                  </p>

                  <div className={styles["card-players-usage"]}>
                    <h5>استخدام اللاعبين</h5>

                    {card.players.length === 0 ? (
                      <span className={styles["no-card-usage"]}>
                        لم يستخدمه أحد بعد
                      </span>
                    ) : (
                      card.players.map((usage) => {
                        const player = roomMembers.find(
                          (member) => member.userId === usage.userId,
                        );

                        return (
                          <div
                            key={usage.userId}
                            className={styles["card-player-usage"]}
                          >
                            <span>
                              {player?.user.name ?? `اللاعب ${usage.userId}`}
                            </span>
                            <span>{usage.usedCount} مرة</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {roundRule === "PLAYER" && (
                    <div className={styles["round-card-footer"]}>
                      {isLimitReached
                        ? "وصلت للحد الأقصى"
                        : "اضغط لاستخدام الكرت"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editingPlayerId !== null && (
        <form
          className={styles["edit-word-overlay"]}
          action={handleUpdatePlayerWord}
        >
          <div className={styles["edit-word-dialog"]}>
            <h3>تعديل كلمة اللاعب</h3>

            <p>
              اللاعب:{" "}
              {roomMembers.find((member) => member.userId === editingPlayerId)
                ?.user.name ?? `اللاعب ${editingPlayerId}`}
            </p>

            <input
              type="text"
              value={editedWord}
              onChange={(event) => setEditedWord(event.target.value)}
              placeholder="أدخل الكلمة الجديدة"
              autoFocus
              disabled={isUpdatingWord}
            />

            <div className={styles["edit-word-actions"]}>
              <ActionButton title="حفظ التعديل" />
              <button
                type="button"
                onClick={() => {
                  setEditingPlayerId(null);
                  setEditedWord("");
                }}
                disabled={isUpdatingWord}
              >
                إلغاء
              </button>
            </div>
          </div>
        </form>
      )}
      {selectedCard && (
        <ConfirmCardDialog
          card={selectedCard}
          onConfirm={() => handleUseCard(selectedCard)}
          onClose={() => setSelectedCard(undefined)}
        />
      )}
    </div>
  );
};

export default RoundPage;
