import { Clock, Users, BookOpen, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSectionCourse = (props) => {
  const { course } = props;
  const navigate = useNavigate();
  return (
    <div className="relative h-[400px]">
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-full object-cover brightness-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="container mx-auto px-8 h-full flex items-end pb-12">
          <div className="max-w-3xl">
            <button
              onClick={() => navigate("/classroom")}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Courses</span>
            </button>
            <h1 className="text-4xl font-bold text-white mb-4">
              {course.title}
            </h1>
            <p className="text-xl text-white/90 mb-6">{course.subtitle}</p>
            {/* <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{course.totalLessons} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{course.enrolled.toLocaleString()} enrolled</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionCourse;
