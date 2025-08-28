import React, { useEffect, useState } from "react";
import { ChevronLeft, BookOpen } from "lucide-react";

// components
import Main from "./components/Main";
import CourseContent from "./components/courseContent";
import LectureContent from "./components/LectureContent";
const ClassroomContent = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("activeTab") || "main");
const [currentCourse, setCurrentCourse] = useState(() => {
  const savedCourse = localStorage.getItem("currentCourse");
  return savedCourse ? JSON.parse(savedCourse) : null;
});
const [currentLecture, setCurrentLecture] = useState(() => {
  const savedLecture = localStorage.getItem("currentLecture");
  return savedLecture ? JSON.parse(savedLecture) : null;
});

useEffect(() => {
  localStorage.setItem("activeTab", activeTab);
}, [activeTab]);

useEffect(() => {
  if (currentCourse) {
    localStorage.setItem("currentCourse", JSON.stringify(currentCourse));
  }
}, [currentCourse]);

useEffect(() => {
  if (currentLecture) {
    localStorage.setItem("currentLecture", JSON.stringify(currentLecture));
  }
}, [currentLecture]);
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
  localStorage.removeItem("currentCourse");
  localStorage.removeItem("currentLecture");
  localStorage.setItem("activeTab", "main");
  };

  const handleBackToCourse = () => {
     setActiveTab("course");
  setCurrentLecture(null);
  localStorage.removeItem("currentLecture");
  localStorage.setItem("activeTab", "course");
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
      <div className="">
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
