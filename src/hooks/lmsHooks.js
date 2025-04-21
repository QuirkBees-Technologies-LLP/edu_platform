import { useState, useCallback } from "react";
import { getAllCourses } from "../services/lms.api";

export const useLMS = () => {
  // States for different data types
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllCourses();
      const data = response.data;
      setCourses(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch courses");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear current states
  const clearCurrentStates = useCallback(() => {
    setCurrentCourse(null);
    setError(null);
  }, []);

  return {
    // Data states
    courses,
    currentCourse,

    // Loading and error states
    isLoading,
    error,

    // Fetch functions
    fetchCourses,

    // Utility functions
    clearCurrentStates,
  };
};
