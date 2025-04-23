import React, { useState, useEffect, useMemo } from "react";
import { Container } from "@/components";

import { useAuthContext } from "../../../../auth/useAuthContext";
import { useCourseStore } from "../../../../store/courseStore";
// components
import CourseCard from "../../components/courseCard";
import FeaturedSection from "../../../admin/courses/components/FeaturedSection";

const ClassroomSection = () => {
  const [visibleCourses, setVisibleCourses] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  // hooks contexts
  const { auth } = useAuthContext();
  const { courses, isLoading, error, fetchCourses } = useCourseStore();

  // Filter courses based on selected category and professor
  const filteredCourses = useMemo(() => {
    let filtered = courses;

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
  }, [courses, selectedCategory, selectedProfessor]);

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

  useEffect(() => {
    fetchCourses(auth.token);
  }, [courses.length, fetchCourses]);

  return (
    <Container>
      {/* <FeaturedSection courses={courses} /> */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Popular Courses</h2>
        <p className="text-gray-600 mt-2">
          Explore our most popular learning resources
        </p>
      </div>
      {isLoading && <div>Loading...</div>}
      {courses.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {courses.map((course) => (
            <div key={course.id}>
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      )}
      {courses.length === 0 && <div>No courses found</div>}
    </Container>
  );
};

export default ClassroomSection;
