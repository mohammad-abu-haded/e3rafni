import { useEffect, useState } from "react";
import styles from "./RulerSelector.module.css";
import { ApiResponse, RoomMember } from "@/types";
import { toast } from "react-toastify";
import ActionButton from "../ActionButton/ActionButton";
import SelectIcon from "@/public/select.svg";
import RulerIcon from "@/public/ruler.svg";
import SearchIcon from "@/public/search.svg";
import UsersIcon from "@/public/users.svg";
import CheckedIcon from "@/public/radio-button-checked.svg";
import UnCheckedIcon from "@/public/radio-button-unchecked.svg";
import Image from "next/image";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";
import { PostData } from "@/services/api.service";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";

interface IProps {
  currentRound: number;
  roomCode: string;
  roomMembers: RoomMember[];
  onClose: () => void;
}

const RulerSelector = ({
  currentRound,
  roomCode,
  roomMembers,
  onClose,
}: IProps) => {
  const [rulerId, setRulerId] = useState<number>();
  const [nameSearched, setNameSearched] = useState<string>();

  const handleSubmit = async () => {
    if (!rulerId) {
      toast.error("يرجى إختيار الحكم");
      return;
    }

    const result: ApiResponse = await PostData(`/api/rooms/${roomCode}/rounds`, {rulerId}) || API_ERROR_RESPONSE;
    if(!result.success) {
      toast.error(result.message);
      return;
    }
    
    toast.success(result.message);
    onClose();

  };

  useEffect(() => {}, [nameSearched]);

  return (
    <div className={styles["ruler-selector-container"]} onClick={() => onClose()}>
      <form action={handleSubmit} className={styles["ruler-selector-main"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["ruler-selector-header"]}>
          <div className={styles["ruler-selector-label"]}>
            <div className={styles["ruler-selector-title"]}>
              <RulerIcon className={styles["ruler-icon"]} />
              إدارة الجولة القادمة
            </div>
            <h2>اختر حكم الجولة</h2>
            <p>
              قم بتعيين لاعب ليكون حكماً للجولة القادمة. الحكم هو من يختار
              الكلمات السرية واللاعبين والمشاهدين ويراقب أداء المتسابقين.
            </p>
          </div>

          <div className={styles["search-container"]}>
            <SearchIcon className={styles["search-icon"]} />
            <input
              type="text"
              placeholder="ابحث عن لاعب باسمه"
              onChange={(e) => setNameSearched(e.currentTarget.value)}
            />
          </div>
        </div>

        <div className={styles["room-members-container"]}>
          <div className={styles["room-members-label"]}>
            <UsersIcon className={styles["room-members-icon"]} />
            اللاعبون المتحاون ({roomMembers.length})
          </div>
          <div className={styles["room-members"]}>
            {roomMembers.map((item) => (
              <div
                key={item.userId}
                className={`${styles["room-member-card"]} ${rulerId === item.userId && styles["room-member-card-selected"]}`}
                onClick={() => setRulerId(item.userId)}
              >
                {rulerId === item.userId ? (
                  <CheckedIcon
                    className={`${styles["radio-icon"]} ${styles["radio-checked-icon"]}`}
                  />
                ) : (
                  <UnCheckedIcon
                    className={`${styles["radio-icon"]} ${styles["radio-unchecked-icon"]}`}
                  />
                )}
                <Image
                  className={styles["member-picture"]}
                  src={item.user.picture || profilePlaceholderBase64}
                  alt="member profile picture"
                  width={80}
                  height={80}
                />

                <div className={styles["member-info"]}>
                  <h4>{item.user.name}</h4>
                  <div className={styles["member-history"]}>
                    <p>لعب 3 من 5 جولات</p>
                    <p>حكم 3 من 5 جولات</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles["actions"]}>
          <ActionButton
            title="تأكيد الحكم"
            className="btn btn-primary"
            Icon={SelectIcon}
          />
          <button className="btn btn-unselected" onClick={() => onClose()}>
            اغلاق
          </button>
        </div>
      </form>
    </div>
  );
};

export default RulerSelector;
