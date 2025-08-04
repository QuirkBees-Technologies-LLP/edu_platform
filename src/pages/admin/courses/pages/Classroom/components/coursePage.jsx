import { Clock, Users, BookOpen, ChevronLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import featuredCourses from "../../../../../classroomShowcase/mocks/featuredCourses";
import { Container } from "@/components";

// components
import HeroSectionCourse from "./HeroSectionCourse";
import CourseProgressBar from "./CourseProgressBar";

// mock data
import courseSections from "../../../../../classroomShowcase/mocks/sectionCourse";
import LectureCard from "./LectureCard";

const CoursePage = () => {
  let { courseId } = useParams();

  const mockCourse = featuredCourses[0];
  const navigate = useNavigate();

  if (!mockCourse) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <HeroSectionCourse course={mockCourse} />

      {/* Main Content */}
      <Container>
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-md overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => navigate(`/classroom`)}
                className="flex items-center gap-2 text-black/80 hover:text-black mb-6 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to IQ Vault</span>
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {mockCourse.title}
              </h2>
              <div className="my-4">
                <CourseProgressBar progress={100} />
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
                            className={`block px-2 py-1 text-sm rounded text-gray-600 hover:bg-gray-100`}
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
          <div className=" flex-1 space-y-8 px-4">
            {courseSections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.lectures.map((lecture) => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      courseId={courseId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CoursePage;
