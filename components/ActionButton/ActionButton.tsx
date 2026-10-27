import { useFormStatus } from "react-dom";
import Spinner from "@/components/Spinner/Spinner";

const ActionButton = ({
  title,
  className = "",
  disabled = false,
  Icon,
}: {
  title: string;
  className?: string;
  disabled?: boolean
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
      style={{ width: "100%" }}
    >
      {pending ? (
        <Spinner />
      ) : (
        <>
          {Icon && (<Icon className="icon" />)}
          {title}
        </>
      )}
    </button>
  );
};

export default ActionButton;
