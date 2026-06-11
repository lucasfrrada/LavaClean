import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";

type BackButtonProps = {
  label?: string;
  fallbackPath?: string;
  className?: string;
};

export default function BackButton({
  label = "Volver",
  fallbackPath = "/",
  className = "",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`flex items-center gap-2 text-sm font-medium transition ${className}`}
    >
      <ArrowLeft size={17} />
      {label}
    </button>
  );
}
