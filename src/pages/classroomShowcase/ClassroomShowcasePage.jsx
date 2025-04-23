import { Fragment, useState, useMemo } from "react";
import { Container } from "@/components";
import { toAbsoluteUrl } from "@/utils";

import { useAuthContext } from "../../auth/useAuthContext";

import { UserProfileHero } from "@/partials/heros";
import CourseCard from "./components/courseCard";
import CategoryFilter from "./components/CategoryFilter";
import ProfessorFilter from "./components/ProfessorFilter";
import FeaturedSection from "../admin/courses/components/FeaturedSection";

import {
  featuredCourses,
  popularCourses,
  generateUnifiedCourses,
} from "./mocks/unifiedCourses";
import { ClassroomShowcaseContent } from "./ClassroomShowcaseContent";

const ClassRoomShowcasePage = () => {
  const [visibleCourses, setVisibleCourses] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  const { auth } = useAuthContext();

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
        name={auth?.user?.name}
        image={image}
        info={[
          { label: `${auth?.user?.tier}`, icon: "abstract-41" },
          { label: `${auth?.user?.role}`, icon: "geolocation" },
          { email: `${auth?.user?.email}`, icon: "sms" },
        ]}
      />
      <ClassroomShowcaseContent />
    </Fragment>
  );
};

export { ClassRoomShowcasePage };
