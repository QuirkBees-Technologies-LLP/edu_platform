import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../../../../../auth/useAuthContext";

// Store
import {
  fetchCourses,
  selectAllCourses,
  selectCoursesStatus,
  selectCoursesError,
  clearError,
} from "@/store/reducer/courseSlice";
import { clearSections } from "@/store/reducer/sectionSlice";

// Components
import CourseList from "./components/CourseList";
import CourseContent from "./components/CourseContent";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessages from "@/components/common/ErrorsMessage"

const SettingsSection = () => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
 const [content, setContent] = useState(() => localStorage.getItem("courseView") || "list");
const [selectedCourseId, setSelectedCourseId] = useState(() => localStorage.getItem("selectedCourseId"));

  // Selectors
  const courses = useSelector(selectAllCourses);
  const status = useSelector(selectCoursesStatus);
  const error = useSelector(selectCoursesError);

  // Fetch courses on mount and when token changes
  useEffect(() => {
    if (auth?.token) {
      console.log("Fetching courses with token:", auth.token);
      dispatch(
        fetchCourses({
          params: {
            isDeleted: false,
          },
          token: auth.token,
        })
      )
        .unwrap()
        .then((response) => {
          console.log("Courses fetched successfully:", response);
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
        });
    } else {
      console.log("No auth token available");
    }
  }, [dispatch, auth?.token]);

  // Handle course select
  const handleCourseSelect = (course) => {
  setSelectedCourseId(course._id);
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
    if (status === "loading") {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <ErrorMessages
         heading={"No Courses Yet"}
          message={"You haven’t created any courses yet. Let’s get your first one set up and ready to go."}
          onRetry={() =>
            dispatch(
              fetchCourses({
                params: { isDeleted: false },
                token: auth.token,
              })
            )
          }
          onDismiss={handleErrorClear}
        />
      );
    }

    if (content === "list") {
      return (
        <CourseList courses={courses} onCourseSelect={handleCourseSelect} />
      );
    }

    if (content === "content" && selectedCourseId) {
      return <CourseContent courseId={selectedCourseId} />;
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
            <div className="flex items-center">
              {selectedCourseId && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back to Courses 
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {selectedCourseId
                  ? courses.find((c) => c._id === selectedCourseId)?.title
                  : "All Courses"}
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
