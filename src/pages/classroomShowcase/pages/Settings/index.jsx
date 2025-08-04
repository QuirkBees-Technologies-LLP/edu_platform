import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

import { useCourseStore } from "../../../../store/courseStore";

// components
import CourseList from "../../../admin/courses/pages/Settings/components/CourseList";
import CourseContent from "../../../admin/courses/pages/Settings/components/CourseContent";

const SettingsSection = () => {
  const { selectedCourse, clearSelectedCourse, setSelectedCourse } =
    useCourseStore();
  const [content, setContent] = useState("list");

  // handle course select
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setContent("content");
  };

  // handle on Back
  const handleBack = () => {
    clearSelectedCourse();
    setContent("list");
  };

  // render content
  const renderContent = () => {
    if (content === "list") {
      return <CourseList onCourseSelect={handleCourseSelect} />;
    }
    if (content === "content") {
      return <CourseContent courseId={selectedCourse.id} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ml-0`}>
        {/* Top Navigation */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {selectedCourse && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back to IQ Vault
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {selectedCourse ? selectedCourse.title : "All IQ Vault"}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SettingsSection;
