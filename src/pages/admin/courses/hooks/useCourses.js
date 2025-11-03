import { useSelector, useDispatch } from "react-redux";
import { useMemo, useCallback } from "react";
import {
  setSelectedCategory,
  setSelectedProfessor,
  incrementVisibleCourses,
  setCourses,
  setFeaturedCourses,
  setLoading,
  setError,
} from "@/store/reducer/coursesSlice";
import { mockCourses, mockFeaturedCourses } from "../mocks/coursesData";

// Usar import.meta.env en lugar de process.env
const API_URL = import.meta.env.VITE_API_URL || "";

export const useCourses = () => {
  const dispatch = useDispatch();
  const {
    courses,
    featuredCourses,
    selectedCategory,
    selectedProfessor,
    visibleCourses,
    loading,
    error,
  } = useSelector((state) => state.courses);

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    if (selectedCategory) {
      filtered = filtered.filter(
        (course) => course.category.id === selectedCategory
      );
    }

    if (selectedProfessor) {
      filtered = filtered.filter(
        (course) => course.instructor.id === selectedProfessor
      );
    }

    return filtered;
  }, [courses, selectedCategory, selectedProfessor]);

  const hasMoreCourses = visibleCourses < filteredCourses.length;

  const handleShowMore = () => {
    dispatch(incrementVisibleCourses());
  };

  const handleCategoryChange = (categoryId) => {
    dispatch(setSelectedCategory(categoryId));
  };

  const handleProfessorChange = (professorId) => {
    dispatch(setSelectedProfessor(professorId));
  };

  const fetchCourses = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      if (API_URL) {
        // Intenta hacer el fetch solo si hay una URL de API configurada
        const [coursesResponse, featuredResponse] = await Promise.all([
          fetch(`${API_URL}/courses`),
          fetch(`${API_URL}/courses/featured`),
        ]);

        if (!coursesResponse.ok || !featuredResponse.ok) {
          throw new Error("Failed to fetch courses");
        }

        const [coursesData, featuredData] = await Promise.all([
          coursesResponse.json(),
          featuredResponse.json(),
        ]);

        dispatch(setCourses(coursesData));
        dispatch(setFeaturedCourses(featuredData));
      } else {
        dispatch(setCourses(mockCourses));
        dispatch(setFeaturedCourses(mockFeaturedCourses));
      }
    } catch (err) {
      console.warn("Error fetching courses, falling back to mock data:", err);
      // En caso de error, usa los datos mock
      dispatch(setCourses(mockCourses));
      dispatch(setFeaturedCourses(mockFeaturedCourses));
      dispatch(setError("Using mock data - API unavailable"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    courses: filteredCourses.slice(0, visibleCourses),
    featuredCourses,
    hasMoreCourses,
    loading,
    error,
    handleShowMore,
    handleCategoryChange,
    handleProfessorChange,
    fetchCourses,
    selectedCategory,
    selectedProfessor,
  };
};
