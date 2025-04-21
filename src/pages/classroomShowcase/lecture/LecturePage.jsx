import {
  Clock,
  Users,
  BookOpen,
  ChevronLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";

import featuredCourses from "../mocks/featuredCourses";
import courseSections from "../mocks/sectionCourse";
import { useEffect, useState } from "react";
import CourseProgressBar from "../courses/components/CourseProgressBar";
// import LectureSideBar from "./components/LectureSidebar";

const LecturePage = () => {
  const mockCourse = featuredCourses[0];
  let { lectureId, courseId } = useParams();
  const navigate = useNavigate();
  const [currentLecture, setCurrentLecture] = useState(null);
  const [completedLectures, setCompletedLectures] = useState(() => {
    const saved = localStorage.getItem(`course-${courseId}-progress`);
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate progress
  const calculateProgress = () => {
    const totalLectures = courseSections.reduce(
      (total, section) => total + section.lectures.length,
      0
    );
    return Math.round((completedLectures.length / totalLectures) * 100);
  };

  useEffect(() => {
    // find lecture
    const findLectureById = (lectureId) => {
      for (const section of courseSections) {
        const lecture = section.lectures.find((lecture) => {
          return lecture.id === +lectureId;
        });
        if (lecture) {
          return lecture;
        }
      }
      return null;
    };

    if (lectureId) {
      const selectedLecture = findLectureById(lectureId);
      setCurrentLecture(selectedLecture);
    }
  }, [lectureId]);

  // Save completed lectures to localStorage
  useEffect(() => {
    localStorage.setItem(
      `course-${courseId}-progress`,
      JSON.stringify(completedLectures)
    );
  }, [completedLectures, courseId]);

  const handleToggleComplete = () => {
    const lectureIdNum = +lectureId;
    if (completedLectures.includes(lectureIdNum)) {
      setCompletedLectures(
        completedLectures.filter((id) => id !== lectureIdNum)
      );
    } else {
      setCompletedLectures([...completedLectures, lectureIdNum]);
    }
  };

  const isLectureCompleted = (lectureId) => {
    return completedLectures.includes(+lectureId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md overflow-y-auto">
        <div className="p-4">
          <button
            onClick={() => navigate(`/classroom/course/${courseId}`)}
            className="flex items-center gap-2 text-black/80 hover:text-black mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Course</span>
          </button>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {mockCourse.title}
          </h2>
          <div className="my-4">
            <CourseProgressBar progress={calculateProgress()} />
          </div>
          {courseSections.map((section, sectionIndex) => (
            <div key={`${section.title}-${sectionIndex}`} className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.lectures.map((lecture, lectureIndex) => {
                  const isCompleted = isLectureCompleted(lecture.id);
                  return (
                    <li key={`${lecture.id}-${lectureIndex}`}>
                      <Link
                        to={`/classroom/course/${courseId}/lecture/${lecture.id}`}
                        className={`block px-2 py-1 text-sm rounded flex items-center justify-between ${
                          lecture.id === +lectureId
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {lecture.type === "video" ? "📹 " : "📝 "}
                          <span className={isCompleted ? "line-through" : ""}>
                            {lecture.title}
                          </span>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentLecture && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentLecture.title}
              </h1>
              <button
                onClick={handleToggleComplete}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLectureCompleted(currentLecture.id)
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isLectureCompleted(currentLecture.id) ? (
                  <>
                    <XCircle className="w-5 h-5" />
                    Mark as Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Mark as Complete
                  </>
                )}
              </button>
            </div>
            {currentLecture.type === "video" ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black mb-6">
                <ReactPlayer
                  url={currentLecture.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                />
              </div>
            ) : (
              <div className="prose max-w-none">
                <p>{currentLecture.content}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturePage;
