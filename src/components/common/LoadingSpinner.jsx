import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 24, className = "" }) => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <Loader2
        className={`animate-spin text-primary ${className}`}
        size={size}
      />
    </div>
  );
};

export default LoadingSpinner;
