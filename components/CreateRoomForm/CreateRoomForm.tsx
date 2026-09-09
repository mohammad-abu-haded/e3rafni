"use client";
import PublicIcon from "@/public/world.svg";
import PrivateIcon from "@/public/lock.svg";
import SettingIcon from "@/public/settings.svg";
import ColorIcon from "@/public/color.svg";
import PlusIcon from "@/public/plus.svg";
import EditIcon from "@/public/edit.svg";
import DeleteIcon from "@/public/delete.svg";
import GameIcon from "@/public/game.svg";
import LiveIcon from "@/public/live.svg";
import PersonAddIcon from "@/public/person-add.svg";
import ColorPickerC from "../ColorPicker/ColorPicker";
import styles from "./CreateRoomForm.module.css";
import { useEffect, useState } from "react";
import { ApiResponse, Card, CreateRoomBody } from "@/types";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { PostData } from "@/services/api.service";

const getTextColor = (backgroundColor: string) => {
  if (typeof document === "undefined") {
    return "#f7f5ff";
  }
  const secondaryColor = "#f7f5ff";

  const hexToRgb = (hex: string) => {
    const value = hex.replace("#", "");

    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  };

  const bg = hexToRgb(backgroundColor);
  const secondary = hexToRgb(secondaryColor);

  const distance = Math.sqrt(
    Math.pow(bg.r - secondary.r, 2) +
      Math.pow(bg.g - secondary.g, 2) +
      Math.pow(bg.b - secondary.b, 2),
  );

  return distance < 100 ? "#000000" : "#f7f5ff";
};

const validateCard = (
  title: string,
  color: string,
  description: string,
  maxPerPlayer: number,
) => {
  if (maxPerPlayer < 1) {
    toast.error("يجب أن يكون عدد الكروت للاعب أكبر من صفر");
    return false;
  }

  if (description.length > 300) {
    toast.error("وصف الكرت يجب ألا يتجاوز 300 حرف");
    return false;
  }

  if (title.length > 50) {
    toast.error("عنوان الكرت يجب ألا يتجاوز 50 حرف");
    return false;
  }

  if (!/^#(?:[0-9A-Fa-f]{3}){1,2}$/.test(color)) {
    toast.error("لون الكرت غير صالح");
    return false;
  }

  return true;
};

const CreateRoomForm = () => {
  const [name, setName] = useState<string>("");
  const [totalRounds, setTotalRounds] = useState<number | "">("");
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [capacity, setCapacity] = useState<number | "">("");
  const [cardTitle, setCardTitle] = useState<string>("");
  const [cardColor, setCardColor] = useState("#7c3aed");
  const [cardDescription, setCardDescription] = useState<string>("");
  const [cardMaxPerPlayer, setCardMaxPerPlayer] = useState<number | "">("");
  const [cards, setCards] = useState<Card[]>([]);
  const [isUpdateCard, setIsUpdateCard] = useState(false);
  const [cardIndex, setCardIndex] = useState(-1);
  const [lastRoomSettings, setLastRoomSettings] = useState<CreateRoomBody>();
  const addCard = () => {
    if (
      !cardTitle ||
      !cardColor ||
      !cardDescription ||
      typeof cardMaxPerPlayer !== "number"
    ) {
      toast.error("أكمل بيانات البطاقة الحالية لإضافة بطاقة جديدة");
      return;
    }

    if (
      !validateCard(
        cardTitle,
        cardColor,
        cardDescription,
        Number(cardMaxPerPlayer),
      )
    ) {
      return;
    }

    const newCards: Card[] = [
      ...cards,
      {
        title: cardTitle,
        color: cardColor,
        description: cardDescription,
        maxPerPlayer: cardMaxPerPlayer,
      },
    ];
    setCards(newCards);

    localStorage.setItem("cards", JSON.stringify(newCards));
    setCardTitle("");
    setCardColor("#7c3aed");
    setCardDescription("");
    setCardMaxPerPlayer("");
  };

  const updateCard = () => {
    if (cardIndex < 0) {
      return;
    }

    if (
      !cardTitle ||
      !cardColor ||
      !cardDescription ||
      typeof cardMaxPerPlayer !== "number"
    ) {
      toast.error("أكمل بيانات البطاقة الحالية لإضافة بطاقة جديدة");
      return;
    }

    if (
      !validateCard(
        cardTitle,
        cardColor,
        cardDescription,
        Number(cardMaxPerPlayer),
      )
    ) {
      return;
    }

    const newCards: Card[] = cards.map((card, index) =>
      index === cardIndex
        ? {
            ...card,
            title: cardTitle,
            color: cardColor,
            description: cardDescription,
            maxPerPlayer: Number(cardMaxPerPlayer) || 0,
          }
        : card,
    );
    setCards(newCards);
    localStorage.setItem("cards", JSON.stringify(newCards));
    setCardIndex(-1);
    setIsUpdateCard(false);
    setCardTitle("");
    setCardColor("#7c3aed");
    setCardDescription("");
    setCardMaxPerPlayer("");
  };

  const deleteCard = () => {
    const newCards: Card[] = cards.filter((_, index) => index !== cardIndex);
    setCards(newCards);
    localStorage.setItem("cards", JSON.stringify(newCards));
    setCardIndex(-1);
    setIsUpdateCard(false);
    setCardTitle("");
    setCardColor("#7c3aed");
    setCardDescription("");
    setCardMaxPerPlayer("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !name ||
      typeof totalRounds !== "number" ||
      typeof isPrivate !== "boolean" ||
      typeof capacity !== "number"
    ) {
      toast.error("هناك حقول مطلوبة لم تملأها");
      return;
    }

    if (totalRounds < 1) {
      toast.error("يجب أن يكون هناك جولة واحدة على الأقل");
      return;
    }

    if (capacity < 1) {
      toast.error("يجب أن تكون سعة الغرفة أكبر من صفر");
      return;
    }

    if (cards.length > 0) {
      for (const card of cards) {
        if (card.maxPerPlayer < 1) {
          toast.error("يجب أن يكون عدد الكروت للاعب أكبر من صفر");
          return;
        }

        if (card.description.length > 300) {
          toast.error("وصف الكرت يجب ألا يتجاوز 300 حرف");
          return;
        }

        if (card.title.length > 50) {
          toast.error("عنوان الكرت يجب ألا يتجاوز 50 حرف");
          return;
        }

        if (!/^#(?:[0-9A-Fa-f]{3}){1,2}$/.test(card.color)) {
          toast.error("لون الكرت غير صالح");
          return;
        }
      }
    }

    const createRoomBody: CreateRoomBody = {
      name,
      isPrivate,
      totalRounds,
      capacity,
      cards,
    };

    const result: ApiResponse = await PostData<CreateRoomBody>(
      "/api/rooms",
      createRoomBody,
    );
    if (!result || !result.success) {
      toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
      return;
    }

    toast.success(result.message);
    localStorage.setItem("lastRoomSettings", JSON.stringify(createRoomBody));
    localStorage.removeItem("cards");
    setName("");
    setIsPrivate(true);
    setTotalRounds("");
    setCapacity("");
    setCardTitle("");
    setCardColor("#7c3aed");
    setCardDescription("");
    setCardMaxPerPlayer("");
    setCards([]);
    setCardIndex(-1);
    setIsUpdateCard(false);
    setLastRoomSettings(createRoomBody);
  };

  const cancelSubmit = () => {
    localStorage.removeItem("cards");
    setCardTitle("");
    setCardColor("#7c3aed");
    setCardDescription("");
    setCardMaxPerPlayer("");
    setCards([]);
  };

  useEffect(() => {
    if (cardIndex === -1) {
      return;
    }
    setIsUpdateCard(true);
    setCardTitle(cards[cardIndex].title);
    setCardColor(cards[cardIndex].color);
    setCardDescription(cards[cardIndex].description);
    setCardMaxPerPlayer(cards[cardIndex].maxPerPlayer);
  }, [cardIndex]);

  useEffect(() => {
    const storedCards = localStorage.getItem("cards");
    if (storedCards) {
      setCards(JSON.parse(storedCards));
    }

    const storedLastRoomSettings = localStorage.getItem("lastRoomSettings");
    if (storedLastRoomSettings) {
      const parsedLastRoomSettings: CreateRoomBody = JSON.parse(
        storedLastRoomSettings,
      );
      setLastRoomSettings(parsedLastRoomSettings);
    }
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyR") {
        event.preventDefault();
        console.log(lastRoomSettings);

        if (lastRoomSettings) {
          setName(lastRoomSettings.name);
          setIsPrivate(lastRoomSettings.isPrivate);
          setTotalRounds(lastRoomSettings.totalRounds);
          setCapacity(lastRoomSettings.capacity);
          setCards(lastRoomSettings.cards);
        }
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, [lastRoomSettings]);

  return (
    <div className={styles["room-container"]}>
      <form className={styles["room-form-container"]} onSubmit={handleSubmit}>
        <div className={styles["room-sections-container"]}>
          {lastRoomSettings && (
            <div className={styles["keyboard-shortcut-hint"]}>
              <p>
                تلميح سريع: اضغط على <b>Alt + R</b> لإعادة تطبيق آخر إعدادات
                استخدمتها لهذه الغرفة فوراً دون الحاجة لضبطها من جديد.
              </p>
            </div>
          )}
          <div className={styles["room-section-container"]}>
            <div className={styles["room-section"]}>
              <div className={styles["room-section-label"]}>
                <div className={styles["room-section-icon-container"]}>
                  <SettingIcon className={styles["room-section-icon"]} />
                </div>
                <div>
                  <h2>معلومات الغرفة</h2>
                  <p>
                    ابدأ بتحديد التفاصيل الأساسية للغرفة وطريقة دخول اللاعبين.
                  </p>
                </div>
              </div>

              <div className={styles["room-field"]}>
                <div className={styles["room-field-item"]}>
                  <label htmlFor="room-name">اسم الغرفة</label>
                  <input
                    type="text"
                    id="room-name"
                    value={name}
                    placeholder="مثال: تحدي الويكند"
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                  />
                </div>
                <div className={styles["room-field-item"]}>
                  <label>نوع الغرفة</label>
                  <div className={styles["room-visibility"]}>
                    <button
                      type="button"
                      className={`btn ${isPrivate ? "btn-primary" : "btn-unselected"}`}
                      onClick={() => !isPrivate && setIsPrivate((old) => !old)}
                    >
                      <PrivateIcon className="icon" />
                      خاصة
                    </button>
                    <button
                      type="button"
                      className={`btn ${!isPrivate ? "btn-primary" : "btn-unselected"}`}
                      onClick={() => isPrivate && setIsPrivate((old) => !old)}
                    >
                      <PublicIcon className="icon" />
                      عامة
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles["room-field"]}>
                <div className={styles["room-field-item"]}>
                  <label htmlFor="total-rounds">عدد الجولات</label>
                  <input
                    type="number"
                    id="total-rounds"
                    value={totalRounds}
                    min={1}
                    placeholder="كم جولة بدك؟"
                    onChange={(e) =>
                      e.currentTarget.value === ""
                        ? ""
                        : setTotalRounds(Number(e.currentTarget.value))
                    }
                    required
                  />
                </div>
                <div className={styles["room-field-item"]}>
                  <label htmlFor="capacity">سعة الغرفة</label>
                  <input
                    type="number"
                    id="capacity"
                    value={capacity}
                    min={1}
                    placeholder="كم لاعب راح يشارك؟"
                    onChange={(e) =>
                      e.currentTarget.value === ""
                        ? ""
                        : setCapacity(Number(e.currentTarget.value))
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <div className={styles["share-section"]}>
              <div className={styles["share-info"]}>
                <div className={styles["share-title"]}>
                  <PersonAddIcon className={styles["share-title-icon"]} />
                  <h3>مشاركة سريعة</h3>
                </div>

                <p className={styles["share-description"]}>
                  بمجرد إنشاء الغرفة، سيظهر لك كود خاص لمشاركته مع أصدقائك.
                </p>
              </div>

              <div className={styles["room-code"]}>XXXXXX</div>
            </div>
          </div>
          <div className={styles["room-section-container"]}>
            <div className={styles["room-section"]}>
              <div className={styles["room-section-header"]}>
                <div className={styles["room-section-label"]}>
                  <div className={styles["room-section-icon-container"]}>
                    <ColorIcon className={styles["room-section-icon"]} />
                  </div>
                  <div>
                    <h2>إعدادات البطاقة</h2>
                    <p>خصص المظهر البصري لبطاقات الأسئلة داخل غرفتك.</p>
                  </div>
                </div>

                <div className={styles["room-card-update-actions"]}>
                  {isUpdateCard && (
                    <button
                      type="button"
                      className={`btn ${styles["room-card-delete"]}`}
                      onClick={() => deleteCard()}
                    >
                      <DeleteIcon className="icon" />
                      حذف
                    </button>
                  )}
                  <button
                    type="button"
                    className={`btn btn-primary ${isUpdateCard && styles["room-card-update-btn"]}`}
                    onClick={() => (isUpdateCard ? updateCard() : addCard())}
                  >
                    {!isUpdateCard ? (
                      <>
                        <PlusIcon className="icon" />
                        حفظ البطاقة
                      </>
                    ) : (
                      <>
                        <EditIcon className="icon" />
                        حفظ التعديل
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className={styles["room-field"]}>
                <div className={styles["room-cards"]}>
                  {cards.length > 0 ? (
                    cards.map((item, index) => (
                      <button
                        type="button"
                        key={nanoid()}
                        className={`btn ${index === cardIndex && styles["room-card-selected"]}`}
                        style={{
                          backgroundColor: item.color,
                          color: getTextColor(item.color),
                        }}
                        onClick={() => setCardIndex(index)}
                      >
                        بطاقة {index + 1}
                      </button>
                    ))
                  ) : (
                    <p>لم يتم إضافة بطاقات</p>
                  )}
                </div>
              </div>
              <div className={styles["room-field"]}>
                <div className={styles["room-field-item"]}>
                  <label htmlFor="card-title">عنوان البطاقة</label>
                  <input
                    type="text"
                    id="card-title"
                    value={cardTitle}
                    placeholder="خلّي للبطاقة اسم ما ينسى!"
                    onChange={(e) => setCardTitle(e.currentTarget.value)}
                  />
                </div>
                <div className={styles["room-field-item"]}>
                  <label htmlFor="card-color">لون البطاقة</label>
                  <ColorPickerC color={cardColor} setColor={setCardColor} />
                </div>
              </div>
              <div className={styles["room-field"]}>
                <div className={styles["room-field-item"]}>
                  <label htmlFor="card-desc">عنوان البطاقة</label>
                  <textarea
                    id="card-desc"
                    placeholder="احكيلنا عن البطاقة بطريقة مميزة!"
                    value={cardDescription}
                    onChange={(e) => setCardDescription(e.currentTarget.value)}
                  ></textarea>
                </div>
              </div>
              <div className={styles["room-field"]}>
                <div className={styles["room-field-item"]}>
                  <label htmlFor="card-count">عدد مرات الاستخدام للاعب</label>
                  <input
                    type="number"
                    id="card-count"
                    value={cardMaxPerPlayer}
                    placeholder="كم مرة يمكن لكل لاعب استخدام هذه البطاقة في الغرفة"
                    min={1}
                    onChange={(e) =>
                      setCardMaxPerPlayer(Number(e.currentTarget.value))
                    }
                  />
                </div>
              </div>
            </div>
            <div className={styles["card-live-container"]}>
              <div className={styles["card-live-label"]}>
                <LiveIcon className={styles["card-live-label-icon"]} />
                <p>معاينة حية للبطاقة</p>
              </div>
              <div
                className={styles["card-live"]}
                style={{
                  backgroundColor: cardColor,
                  color: getTextColor(cardColor),
                }}
              >
                <div className={styles["card-info-container"]}>
                  <div
                    className={styles["card-icon-container"]}
                    style={{
                      backgroundColor: `${getTextColor(cardColor)}33`,
                    }}
                  >
                    <GameIcon
                      className={styles["card-icon"]}
                      style={{
                        color: `${getTextColor(cardColor)}`,
                      }}
                    />
                  </div>
                  <div className={styles["card-title-desc"]}>
                    <h3>
                      {cardTitle.length > 0 ? cardTitle : "عنوان البطاقة"}
                    </h3>

                    <p
                      style={{
                        color: `${getTextColor(cardColor)}CC`,
                      }}
                    >
                      {cardDescription.length > 0
                        ? cardDescription
                        : `
                وصف البطاقة سيظهر هنا بمجرد كتابته في الحقل المخصص. حاول أن تجعل الوصف مشوقاً للاعبين!
                `}
                    </p>
                  </div>
                </div>
                <div className={styles["card-footer"]}>
                  <div
                    className={styles["card-divider"]}
                    style={{
                      backgroundColor: `${getTextColor(cardColor)}33`,
                    }}
                  />
                  <div className={styles["card-cardMaxPerPlayer"]}>
                    <h4
                      style={{
                        color: `${getTextColor(cardColor)}87`,
                      }}
                    >
                      سعة الاستخدام
                    </h4>
                    <p
                      style={{
                        color: getTextColor(cardColor),
                      }}
                    >
                      {typeof cardMaxPerPlayer === "number"
                        ? cardMaxPerPlayer
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles["room-actions"]}>
          <button type="submit" className="btn btn-primary">
            إنشاء الغرفة الآن
          </button>
          <button
            type="button"
            className="btn btn-unselected"
            onClick={() => cancelSubmit()}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoomForm;
