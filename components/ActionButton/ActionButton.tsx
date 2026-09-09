import { useFormStatus } from "react-dom";
import LeftArrowIcon from "@/public/left-arrow.svg";
import Spinner from "@/components/Spinner/Spinner";

const ActionButton = ({
  title,
  className = "",
  showIcon = true,
}: {
  title: string;
  className?: string;
  showIcon?: boolean;
}) => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <Spinner />
      ) : (
        <>
          {title}
          {showIcon && <LeftArrowIcon className="icon" />}
        </>
      )}
    </button>
  );
};

export default ActionButton;
