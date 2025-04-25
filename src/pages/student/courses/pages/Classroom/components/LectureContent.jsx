import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  FileText,
  Video,
  BookOpen,
  Clock,
} from "lucide-react";
import ReactPlayer from "react-player";
import { lmsLectures } from "../../../../../../services";
import { useAuthContext } from "../../../../../../auth/useAuthContext";
import { useEffect, useState, useCallback, useMemo } from "react";

import CourseContentSideBar from "./CourseContentSideBar";
import LectureMainContent from "./LectureMainContent";

const LectureContent = ({ handleBack, selectedCourse, selectedLecture }) => {
  const [currentLecture, setCurrentLecture] = useState(selectedLecture);
  const [completedLectures, setCompletedLectures] = useState(() => {
    try {
      const saved = localStorage.getItem(
        `course-${selectedCourse?._id}-progress`
      );
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading progress from localStorage:", error);
      return [];
    }
  });

  // Calculate progress
  const calculateProgress = useCallback(() => {
    if (!selectedCourse?.sections) return 0;

    const totalLectures = selectedCourse.sections.reduce(
      (total, section) => total + section.lectures.length,
      0
    );
    return totalLectures
      ? Math.round((completedLectures.length / totalLectures) * 100)
      : 0;
  }, [completedLectures.length, selectedCourse?.sections]);

  useEffect(() => {
    if (selectedLecture) {
      setCurrentLecture(selectedLecture);
    }
  }, [selectedLecture]);

  // Save completed lectures to localStorage
  useEffect(() => {
    if (selectedCourse?._id) {
      try {
        localStorage.setItem(
          `course-${selectedCourse._id}-progress`,
          JSON.stringify(completedLectures)
        );
      } catch (error) {
        console.error("Error saving progress to localStorage:", error);
      }
    }
  }, [completedLectures, selectedCourse?._id]);

  const handleToggleComplete = useCallback(() => {
    if (!selectedLecture) return;

    const lectureIdNum = +selectedLecture._id;
    setCompletedLectures((prevCompleted) => {
      if (prevCompleted.includes(lectureIdNum)) {
        return prevCompleted.filter((id) => id !== lectureIdNum);
      } else {
        return [...prevCompleted, lectureIdNum];
      }
    });
  }, [selectedLecture]);

  const isLectureCompleted = useCallback(
    (lectureId) => {
      return completedLectures.includes(+lectureId);
    },
    [completedLectures]
  );

  const progress = useMemo(() => calculateProgress(), [calculateProgress]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CourseContentSideBar
        course={selectedCourse}
        handleBack={handleBack}
        onSelectLecture={setCurrentLecture}
      />
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentLecture ? (
          <LectureMainContent currentLecture={currentLecture} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
              <div className="bg-indigo-50 rounded-full p-6 mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                <FileText className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">
                Select a lecture to start learning
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Choose a lecture from the sidebar to begin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureContent;
