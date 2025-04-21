import { mockInstructors } from "../mocks/unifiedCourses";
import {
  GraduationCap,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Users,
} from "lucide-react";
import { useRef } from "react";

const ProfessorFilter = ({ selectedProfessor, onProfessorChange }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -400 : 400;
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Filter by Professor
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent" />

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {/* All Professors Card */}
          <div
            onClick={() => onProfessorChange(null)}
            className={`flex-shrink-0 w-[300px] rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
              !selectedProfessor
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-200"
            }`}
          >
            <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-t-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
                alt="All"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-900">All Professors</h4>
              <p className="text-sm text-gray-600">
                View all available courses
              </p>
            </div>
          </div>

          {/* Professor Cards */}
          {mockInstructors.map((professor) => (
            <div
              key={professor.id}
              onClick={() => onProfessorChange(professor.id)}
              className={`flex-shrink-0 w-[300px] rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedProfessor === professor.id
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-200"
              }`}
            >
              {/* Profile Image */}
              <div className="relative h-48 rounded-t-xl overflow-hidden">
                <img
                  src={professor.image}
                  alt={professor.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="font-semibold text-white text-lg mb-1">
                    {professor.name}
                  </h4>
                  <p className="text-white/90 text-sm">{professor.title}</p>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-4">
                <div className="flex items-center gap-1 text-yellow-500 mb-3">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">4.9</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {professor.bio}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>12 courses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>2.3k students</span>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                  {professor.expertise.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessorFilter;
