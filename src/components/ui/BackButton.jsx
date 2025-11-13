import clsx from "clsx";
import { KeenIcon } from "@/components";
import { useNavigate, useNavigationType } from "react-router-dom";

const BackButton = ({ fallback = "/", className = "" }) => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const handleBack = () => {
    const hasHistory = window.history.length > 2 || navigationType === "PUSH";
    if (hasHistory) navigate(-1);
    else navigate(fallback, { replace: true });
  };

  // Common base styles identical to SidebarToggle
  const buttonBaseClass = clsx(
    "btn btn-icon btn-icon-md size-[30px] rounded-lg border bg-light text-gray-500 hover:text-gray-700 absolute start-full top-[calc(50%+40px)] rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4 transition-all duration-300 group",
    className
  );

  // Icon styling — smooth motion when hovering
  const iconClass = clsx(
    "transition-transform duration-300 group-hover:-translate-x-1"
  );

  // 🌞 Light Mode Button
  const lightButton = () => (
    <button
      onClick={handleBack}
      className={clsx(buttonBaseClass, "border-gray-200 dark:border-gray-300")}
      aria-label="Go back"
    >
      <KeenIcon icon="black-left-line" className={iconClass} />
    </button>
  );

  // 🌚 Dark Mode Button
  const darkButton = () => (
    <div>
      <div className="hidden [html.dark_&]:block">
        <button
          onClick={handleBack}
          className={clsx(buttonBaseClass, "border-gray-300")}
          aria-label="Go back"
        >
          <KeenIcon icon="black-left-line" className={iconClass} />
        </button>
      </div>
      <div className="[html.dark_&]:hidden light">{lightButton()}</div>
    </div>
  );

  return darkButton();
};

export default BackButton;
