import { Fragment, useState, useMemo } from "react";
import { Container } from "@/components";
import { toAbsoluteUrl } from "@/utils";

import { UserProfileHero } from "@/partials/heros";
import CourseCard from "./components/courseCard";
import CategoryFilter from "./components/CategoryFilter";
import ProfessorFilter from "./components/ProfessorFilter";
import FeaturedSection from "./components/featuredSection/FeaturedSection";

// testing
// import featuredCourses from "./mocks/featuredCourses";
// import popularCourses from "./mocks/popularCourses";
import {
  featuredCourses,
  popularCourses,
  generateUnifiedCourses,
} from "./mocks/unifiedCourses";

const ClassRoomShowcasePage = () => {
  const [visibleCourses, setVisibleCourses] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  // Filter courses based on selected category and professor
  const filteredCourses = useMemo(() => {
    let filtered = popularCourses;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (course) => course.category.id === selectedCategory
      );
    }

    // Apply professor filter
    if (selectedProfessor) {
      filtered = filtered.filter(
        (course) => course.instructor.id === selectedProfessor
      );
    }

    return filtered;
  }, [popularCourses, selectedCategory, selectedProfessor]);

  const hasMoreCourses = visibleCourses < filteredCourses.length;

  const handleShowMore = () => {
    setVisibleCourses((prev) => Math.min(prev + 9, filteredCourses.length));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setVisibleCourses(9); // Reset visible courses when changing category
  };

  const handleProfessorChange = (professorId) => {
    setSelectedProfessor(professorId);
    setVisibleCourses(9); // Reset visible courses when changing professor
  };

  const image = (
    <img
      src={toAbsoluteUrl("/media/avatars/300-1.png")}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
    />
  );

  return (
    <Fragment>
      <UserProfileHero
        name="Jenny Klabber"
        image={image}
        info={[
          { label: "KeenThemes", icon: "abstract-41" },
          { label: "SF, Bay Area", icon: "geolocation" },
          { email: "jenny@kteam.com", icon: "sms" },
        ]}
      />
      <Container>
        <FeaturedSection featuredCourses={featuredCourses} />
      </Container>

      <Container>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Popular Courses</h2>
          <p className="text-gray-600 mt-2">
            Explore our most popular learning resources
          </p>
        </div>

        <div className="space-y-6">
          <ProfessorFilter
            selectedProfessor={selectedProfessor}
            onProfessorChange={handleProfessorChange}
          />

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          <div className="grid grid-cols-3 gap-2">
            {filteredCourses.slice(0, visibleCourses).map((course, index) => (
              <div key={index} className="aspect-square">
                <CourseCard {...course} />
              </div>
            ))}
          </div>

          {hasMoreCourses && (
            <div className="flex justify-center">
              <button
                onClick={handleShowMore}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Show More Courses
              </button>
            </div>
          )}
        </div>
      </Container>
    </Fragment>
  );
};

export { ClassRoomShowcasePage };
