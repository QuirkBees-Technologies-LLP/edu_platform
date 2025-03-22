import { Clock, Users, BookOpen, ChevronLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";

import featuredCourses from "../mocks/featuredCourses";
import courseSections from "../mocks/sectionCourse";
import { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";
// import LectureSideBar from "./components/LectureSidebar";

const LecturePage = () => {
  const mockCourse = featuredCourses[0];
  let { lectureId, courseId } = useParams();
  const navigate = useNavigate();
  const [currentLecture, setCurrentLecture] = useState(null);

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
            <span>Back to Courses</span>
          </button>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {mockCourse.title}
          </h2>
          <div className="my-4">
            <LinearProgress variant="determinate" value={0} />
          </div>
          {courseSections.map((section, sectionIndex) => (
            <div key={`${section.title}-${sectionIndex}`} className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.lectures.map((lecture, lectureIndex) => {
                  return (
                    <li key={`${lecture.id}-${lectureIndex}`}>
                      <Link
                        to={`/classroom/course/${courseId}/lecture/${lecture.id}`}
                        className={`block px-2 py-1 text-sm rounded ${
                          lecture.id === +lectureId
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {lecture.tag}
                        {lecture.type === "video" ? "📹 " : "📝 "}
                        {lecture.title}
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
          <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentLecture.title}
            </h1>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {currentLecture.type === "video" ? (
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <div className="relative w-full aspect-w-16 aspect-h-9 mb-4">
                    <ReactPlayer
                      url={currentLecture.content}
                      controls
                      playing={false}
                      width="100%"
                      height={500}
                      className="rounded-lg overflow-hidden shadow-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {currentLecture.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturePage;
