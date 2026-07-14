import { useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const StudentNavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/dashboard";

  return (
    <div className="flex items-center gap-2 mb-4">
      {!isHome && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>
      )}
      {!isHome && (
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go home"
        >
          <Home size={16} />
          <span className="hidden sm:inline">Home</span>
        </button>
      )}
    </div>
  );
};

export default StudentNavigationBar;
