import { useFormStatus } from "react-dom";
import LeftArrowIcon from "@/public/left-arrow.svg";
import Spinner from "@/components/Spinner/Spinner";

const ActionButton = ({
  title,
  className = "",
  showIcon = true,
  Icon,
}: {
  title: string;
  className?: string;
  showIcon?: boolean;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <Spinner />
      ) : (
        <>
          {showIcon && Icon ? <Icon className="icon" /> : <LeftArrowIcon className="icon" />}
          {title}
        </>
      )}
    </button>
  );
};

export default ActionButton;
