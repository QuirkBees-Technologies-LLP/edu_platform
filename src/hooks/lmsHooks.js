import { useState, useCallback } from "react";
import { getAllCourses } from "../services/lms.api";

export const useLMS = () => {
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const clearCurrentStates = useCallback(() => {
    setCurrentCourse(null);
    setError(null);
  }, []);

  return {
    courses,
    currentCourse,

    isLoading,
    error,

    fetchCourses,

    clearCurrentStates,
  };
};
