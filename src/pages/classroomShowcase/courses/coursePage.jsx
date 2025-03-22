import { useParams } from "react-router-dom";
import featuredCourses from "../mocks/featuredCourses";
import { Container } from "@/components";

// components
import HeroSectionCourse from "./components/HeroSectionCourse";

// mock data
import courseSections from "../mocks/sectionCourse";
import LectureCard from "./components/LectureCard";

const CoursePage = () => {
  let { courseId } = useParams();

  const mockCourse = featuredCourses[0];

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
        <div className="space-y-8">
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
      </Container>
    </div>
  );
};

export default CoursePage;
