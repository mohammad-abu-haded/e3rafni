
"use client";

import { CardWithUsage } from "@/types";
import styles from "./ConfirmCardDialog.module.css";

interface IProps {
  card: CardWithUsage;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmCardDialog = ({ card, onConfirm, onClose }: IProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className={styles["dialog-overlay"]}
      onClick={onClose}
    >
      <div
        className={styles["confirm-dialog"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-card-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles["dialog-icon"]}>!</div>

        <h3 id="confirm-card-title">تأكيد استخدام الكرت</h3>

        <p className={styles["dialog-message"]}>
          هل أنت متأكد أنك تريد استخدام هذا الكرت؟
        </p>

        <div className={styles["dialog-card-info"]}>
          <h4>{card.title}</h4>
          <p>{card.description}</p>
        </div>

        <div className={styles["dialog-actions"]}>
          <button
            type="button"
            className={styles["confirm-button"]}
            onClick={handleConfirm}
          >
            تأكيد الاستخدام
          </button>

          <button
            type="button"
            className={styles["cancel-button"]}
            onClick={onClose}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCardDialog;
