import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../../../../../auth/useAuthContext";

// Store
import {
  fetchCourses,
  fetchCoursesByEducatorId,
  selectAllCourses,
  selectCoursesStatus,
  selectCoursesError,
  clearError,
} from "@/store/reducer/courseSlice";
import { clearSections } from "@/store/reducer/sectionSlice";
import { useGetEducatorMasterClassesQuery } from "@/store/api/educator/educatorMasterClassApiSlice";

// Components
import CourseList from "./components/CourseList";
import CourseContent from "./components/CourseContent";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessages from "@/components/common/ErrorsMessage";

const SettingsSection = ({ defaultActiveTab }) => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const [content, setContent] = useState(
    () => localStorage.getItem("courseView") || "list"
  );
  const [selectedCourseId, setSelectedCourseId] = useState(() =>
    localStorage.getItem("selectedCourseId")
  );
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "super_admin";
  const isEducator = auth?.user?.role === "educator";

  const [activeTab, setActiveTab] = useState(() => {
    if (defaultActiveTab) return defaultActiveTab;
    const savedTab = localStorage.getItem("settingsTab");
    // Removed isAdmin restriction for strategies since educators need Master Class
    return savedTab || "courses";
  });

  // Selectors
  const courses = useSelector(selectAllCourses);
  const status = useSelector(selectCoursesStatus);
  const error = useSelector(selectCoursesError);

  // Master Class Query
  const {
    data: masterClassesData,
    isLoading: isMasterClassesLoading,
    error: masterClassesError,
    refetch: refetchMasterClasses
  } = useGetEducatorMasterClassesQuery(
    { isDeleted: false },
    { skip: activeTab !== "master-class" }
  );

  const currentData = activeTab === "master-class" ? masterClassesData?.data : courses;
  const currentStatus = activeTab === "master-class"
    ? (isMasterClassesLoading ? "loading" : (masterClassesError ? "failed" : "succeeded"))
    : status;
  const currentError = activeTab === "master-class" ? masterClassesError : error;

  // Fetch courses/strategies on mount and when token or activeTab changes
  useEffect(() => {
    let action;
    let payload = { params: { isDeleted: false }, token: auth?.token };

    if (auth?.token) {
      // Master Class is handled by RTK Query now
      if (activeTab === "courses") {
        if (auth?.user?.role === "educator") {
          action = fetchCoursesByEducatorId;
          payload = { id: auth.user._id, token: auth.token };
        } else {
          action = fetchCourses;
        }
      }
    } else {
      // For courses tab
      if (auth?.user?.role === "educator") {
        action = fetchCoursesByEducatorId;
        payload = { id: auth?.user?._id, token: auth?.token };
      } else {
        action = fetchCourses;
      }
    }

    if (action) {
      dispatch(action(payload))
        .unwrap()
        .then((response) => {
          console.log(`${activeTab === "courses" ? "Courses" : "Master Class"} fetched successfully:`, response);
        })
        .catch((error) => {
          console.error(`Error fetching ${activeTab}:`, error);
        });
    } else if (activeTab === "master-class") {
      // No action needed for master-class here as it's handled by RTK Query
      console.log("Master Class data handled by RTK Query.");
    } else {
      console.log("No auth token available or no action defined for current tab.");
    }
  }, [dispatch, auth?.token, auth?.user?._id, auth?.user?.role, activeTab]);

  useEffect(() => {
    localStorage.setItem("settingsTab", activeTab);
  }, [activeTab]);

  // Handle course select
  const handleCourseSelect = (course) => {
    setSelectedCourseId(course?._id);
    setContent("content");
    localStorage.setItem("selectedCourseId", course._id);
    localStorage.setItem("courseView", "content");
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedCourseId(null);
    setContent("list");
    localStorage.removeItem("selectedCourseId");
    localStorage.setItem("courseView", "list");
    dispatch(clearSections());
  };

  // Handle error clear
  const handleErrorClear = () => {
    dispatch(clearError());
  };

  // Render content based on status and content type

  useEffect(() => {
    return () => {
      localStorage.removeItem("selectedCourseId");
      localStorage.removeItem("courseView");
    };
  }, []);
  const renderContent = () => {
    if (currentStatus === "loading") {
      return <LoadingSpinner />;
    }

    if (currentError) {
      return (
        <ErrorMessages
          heading={
            activeTab === "courses" ? "No IQ Vault Yet" : "No Master Class Yet"
          }
          message={
            activeTab === "courses"
              ? "You haven’t created any IQ Vault yet. Let’s get your first one set up and ready to go."
              : "You haven’t created any master class yet. Let’s get your first one set up and ready to go."
          }
          onRetry={() => {
            let action;
            let payload = { params: { isDeleted: false }, token: auth?.token };

            if (activeTab === "master-class") {
              refetchMasterClasses();
            } else {
              if (auth?.user?.role === "educator") {
                action = fetchCoursesByEducatorId;
                payload = { id: auth?.user?._id, token: auth?.token };
              } else {
                action = fetchCourses;
              }
            }
            if (action) dispatch(action(payload));
          }}
          onDismiss={handleErrorClear}
        />
      );
    }

    if (content === "list") {
      return (
        <CourseList
          courses={currentData}
          onCourseSelect={handleCourseSelect}
          activeTab={activeTab}
        />
      );
    }

    if (content === "content" && selectedCourseId) {
      return <CourseContent courseId={selectedCourseId} activeTab={activeTab} />;
    }

    return null;
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ml-0`}>
        {/* Top Navigation */}
        <div className="shadow-sm">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {selectedCourseId && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back to {activeTab === "courses" ? "IQ Vault" : "Master Class"}
                </button>
              )}
              {!selectedCourseId && (
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {(!defaultActiveTab || defaultActiveTab !== "master-class") && (
                    <button
                      onClick={() => setActiveTab("courses")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "courses"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Courses
                    </button>
                  )}
                  {(isAdmin || isEducator) && (
                    <button
                      onClick={() => setActiveTab("master-class")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "master-class"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Master Class
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {selectedCourseId
                  ? currentData?.find((c) => c?._id === selectedCourseId)?.title
                  : `All ${activeTab === "courses" ? "IQ Vault" : "Master Class"}`}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SettingsSection;
