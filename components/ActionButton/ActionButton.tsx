import { useFormStatus } from "react-dom";
import styles from "./ActionButton.module.css";
import LeftArrowIcon from "@/public/left-arrow.svg";
import Spinner from "@/components/Spinner/Spinner";

const ActionButton = ({title}: {title: string}) => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <Spinner />
      ) : (
        <>
          <p>{title}</p>
          <LeftArrowIcon className={styles["left-arrow-icon"]} />
        </>
      )}
    </button>
  );
};

export default ActionButton;
