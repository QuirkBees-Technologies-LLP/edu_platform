import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Info } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../../../../../auth/useAuthContext";

// Store
import { clearSections } from "@/store/reducer/sectionSlice";
import { clearError } from "@/store/reducer/courseSlice";
import {
  useGetEducatorMasterClassesQuery,
  useGetEducatorAcademiesQuery,
} from "@/store/api/educator/educatorMasterClassApiSlice";

// Components — single CourseList handles both tabs (same as admin pattern)
import CourseList from "./components/CourseList";
import CourseContent from "./components/CourseContent";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessages from "@/components/common/ErrorsMessage";
import { selectSelectedLanguage } from "@/store/reducer/studentLanagugeSlice";

const SettingsSection = () => {
  // ── Info tooltip state ──────────────────────────────────────────────────
  const [showAcademyInfo, setShowAcademyInfo] = useState(false);
  const infoTimeoutRef = useRef(null);

  const handleInfoMouseEnter = () => {
    if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
    setShowAcademyInfo(true);
  };
  const handleInfoMouseLeave = () => {
    infoTimeoutRef.current = setTimeout(() => setShowAcademyInfo(false), 200);
  };
  const handleInfoClick = () => {
    setShowAcademyInfo((prev) => !prev);
  };
  const dispatch = useDispatch();
  const { auth } = useAuthContext();

  // ── Tab state: "master-class" | "academy" ───────────────────────────────
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("educatorSettingsTab") || "master-class";
  });

  // ── Content navigation ──────────────────────────────────────────────────
  const [content, setContent] = useState(
    () => localStorage.getItem("courseView") || "list"
  );
  const [selectedCourseId, setSelectedCourseId] = useState(() =>
    localStorage.getItem("selectedCourseId")
  );

  // ── Language filter from header dropdown ─────────────────────────────
  const selectedLanguage = useSelector(selectSelectedLanguage);

  // ── RTK Query — Masterclasses ───────────────────────────────────────────
  const {
    data: masterClassesData,
    isLoading: isMasterClassesLoading,
    error: masterClassesError,
    refetch: refetchMasterClasses,
  } = useGetEducatorMasterClassesQuery(
    { isDeleted: false, ...(selectedLanguage ? { language: selectedLanguage } : {}) },
    { skip: activeTab !== "master-class" }
  );

  // ── RTK Query — Academies ───────────────────────────────────────────────
  const {
    data: academiesData,
    isLoading: isAcademiesLoading,
    error: academiesError,
    refetch: refetchAcademies,
  } = useGetEducatorAcademiesQuery(
    { isDeleted: false, ...(selectedLanguage ? { language: selectedLanguage } : {}) },
    { skip: activeTab !== "academy" }
  );

  // ── Resolve current tab's data ──────────────────────────────────────────
  const currentRawData =
    activeTab === "master-class"
      ? masterClassesData?.data
      : academiesData?.data;

  const currentLoading =
    activeTab === "master-class" ? isMasterClassesLoading : isAcademiesLoading;

  const currentError =
    activeTab === "master-class" ? masterClassesError : academiesError;

  // Persist active tab
  useEffect(() => {
    localStorage.setItem("educatorSettingsTab", activeTab);
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedCourseId");
      localStorage.removeItem("courseView");
    };
  }, []);

  // ── Navigation handlers ─────────────────────────────────────────────────
  const handleCourseSelect = (course) => {
    setSelectedCourseId(course?._id);
    setContent("content");
    localStorage.setItem("selectedCourseId", course._id);
    localStorage.setItem("courseView", "content");
  };

  const handleBack = () => {
    setSelectedCourseId(null);
    setContent("list");
    localStorage.removeItem("selectedCourseId");
    localStorage.setItem("courseView", "list");
    dispatch(clearSections());
  };

  const handleSwitchToMasterclass = () => {
    setActiveTab("master-class");
    setContent("list");
    setSelectedCourseId(null);
  };

  const handleRefetch = () => {
    if (activeTab === "master-class") refetchMasterClasses();
    else refetchAcademies();
  };

  // ── Render content ──────────────────────────────────────────────────────
  const renderContent = () => {
    if (currentLoading) return <LoadingSpinner />;

    if (currentError) {
      return (
        <ErrorMessages
          heading={
            activeTab === "academy"
              ? "No Academies Yet"
              : "No Masterclasses Yet"
          }
          message={
            activeTab === "academy"
              ? "You haven't created any academies yet. Let's get your first one set up."
              : "You haven't created any masterclasses yet. Let's get your first one set up."
          }
          onRetry={handleRefetch}
          onDismiss={() => dispatch(clearError())}
        />
      );
    }

    if (content === "content" && selectedCourseId) {
      return <CourseContent courseId={selectedCourseId} activeTab={activeTab} />;
    }

    // ── Single CourseList for both tabs (admin pattern) ─────────────────
    return (
      <CourseList
        courses={currentRawData ?? []}
        onCourseSelect={handleCourseSelect}
        activeTab={activeTab}
        onSwitchToMasterclass={handleSwitchToMasterclass}
      />
    );
  };

  // ── UI labels ───────────────────────────────────────────────────────────
  const tabLabel = activeTab === "academy" ? "Academies" : "All Masterclasses";

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 transition-all duration-200 ml-0">
        {/* ── Top Navigation (same structure as admin) ─────────────────── */}
        <div className="shadow-sm">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            {/* Left — back button OR tab switcher */}
            <div className="flex items-center gap-4">
              {selectedCourseId ? (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back to {activeTab === "academy" ? "Academies" : "Masterclasses"}
                </button>
              ) : (
                /* ── Tab pills — same style as admin ───────────────────── */
                <>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => {
                        setActiveTab("master-class");
                        setContent("list");
                        setSelectedCourseId(null);
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "master-class"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      All Masterclasses
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("academy");
                        setContent("list");
                        setSelectedCourseId(null);
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "academy"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Academies
                    </button>
                  </div>

                  {/* ── Academy Info Tooltip ───────────────────────────── */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleInfoClick}
                      onMouseEnter={handleInfoMouseEnter}
                      onMouseLeave={handleInfoMouseLeave}
                      className="p-1 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                      aria-label="Academy Guidelines"
                    >
                      <Info className="w-4.5 h-4.5" />
                    </button>

                    {showAcademyInfo && (
                      <div
                        onMouseEnter={handleInfoMouseEnter}
                        onMouseLeave={handleInfoMouseLeave}
                        className="absolute left-0 top-full mt-2 z-50 w-80 p-4 bg-white dark:bg-[#1a1c23] rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-top-1 duration-200"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-primary flex-shrink-0" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Academy Guidelines
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="dark:text-white">
                              Only <strong className="text-gray-800 dark:text-white">one Academy</strong> is allowed per language.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            <span className="dark:text-white" >
                              If an Academy already exists for a language, any new Academy for that language must be approved by the{" "}
                              <strong className="text-gray-800 dark:text-white">IQonic Corporate Team</strong>{" "}
                              before it can be published and made live.
                            </span>
                          </li>
                        </ul>
                        {/* Tooltip arrow */}
                        <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white dark:bg-[#1a1c23] border-l border-t border-gray-200 dark:border-gray-600 rotate-45" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right — title */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {selectedCourseId
                  ? currentRawData?.find((c) => c?._id === selectedCourseId)?.title
                  : `All ${activeTab === "academy" ? "Academies" : "Masterclasses"}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Page Content ─────────────────────────────────────────────── */}
        <div className="">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SettingsSection;
