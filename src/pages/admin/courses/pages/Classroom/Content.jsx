import React, { useState } from "react";
import { ChevronLeft, BookOpen } from "lucide-react";

// components
import Main from "./components/Main";
import CourseContent from "./components/courseContent";
import LectureContent from "./components/LectureContent";
const ClassroomContent = () => {
  const [activeTab, setActiveTab] = useState("main");
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const handleViewCourse = (course) => {
    setCurrentCourse(course);
    setActiveTab("course");
  };

  const handleViewLecture = (lecture) => {
    setCurrentLecture(lecture);
    setActiveTab("lecture");
  };

  const handleBackToMain = () => {
    setActiveTab("main");
    setCurrentCourse(null);
  };

  const handleBackToCourse = () => {
    setActiveTab("course");
    setCurrentLecture(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "main":
        return <Main onSelectCourse={handleViewCourse} />;
      case "course":
        return (
          <CourseContent
            course={currentCourse}
            handleBack={handleBackToMain}
            handleViewLecture={handleViewLecture}
          />
        );
      case "lecture":
        return (
          <LectureContent
            selectedCourse={currentCourse}
            selectedLecture={currentLecture}
            handleBack={handleBackToCourse}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        {activeTab === "course" ||
        (activeTab === "lecture" && currentCourse) ? (
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <button
                onClick={handleBackToMain}
                className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Volver atrás"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  {currentCourse?.title || "Curso seleccionado"}
                </h1>
                {currentCourse?.category && (
                  <span className="text-sm text-gray-500">
                    {currentCourse.category?.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Classroom</h1>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default ClassroomContent;
