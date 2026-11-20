import Spinner from "../Spinner/Spinner";
import styles from "./LoadingSpinner.module.css";

interface IProps {
  title: string;
  className?: string;
}

const LoadingSpinner = ({ title, className }: IProps) => (
  <div
    className={[styles["loading-spinner"], className].filter(Boolean).join(" ")}
    role="status"
  >
    <Spinner />
    <span>{title}</span>
  </div>
);

export default LoadingSpinner;
