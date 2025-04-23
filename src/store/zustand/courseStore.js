import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  reorderCourses as reorderCoursesApi,
} from "@/services/lms.api";

export const useCourseStore = create(
  persist(
    (set, get) => ({
      courses: [],
      selectedCourse: null,
      isLoading: false,
      error: null,

      // Actions
      setCourses: (courses) => set({ courses }),
      setSelectedCourse: (course) => set({ selectedCourse: course }),
      clearSelectedCourse: () => set({ selectedCourse: null }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Async Actions
      fetchCourses: async (token) => {
        try {
          set({ isLoading: true, error: null });
          const courses = await getAllCourses(token);
          // sort courses by order
          const sortedCourses = courses.sort((a, b) => a.order - b.order);
          set({ courses: sortedCourses, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      createNewCourse: async (courseData, token) => {
        try {
          set({ isLoading: true, error: null });
          const newCourse = await createCourse(courseData, token);
          set((state) => ({
            courses: [...state.courses, newCourse],
            isLoading: false,
          }));
          return newCourse;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateExistingCourse: async (courseId, courseData, token) => {
        try {
          set({ isLoading: true, error: null });
          const updatedCourse = await updateCourse(courseId, courseData, token);
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId ? updatedCourse : course
            ),
            selectedCourse:
              state.selectedCourse?.id === courseId
                ? updatedCourse
                : state.selectedCourse,
            isLoading: false,
          }));
          return updatedCourse;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteCourse: async (courseId, token) => {
        try {
          set({ isLoading: true, error: null });
          await deleteCourse(courseId, token);
          set((state) => ({
            courses: state.courses.filter((course) => course.id !== courseId),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      reorderCourses: async (dragIndex, hoverIndex, token) => {
        try {
          set({ isLoading: true, error: null });
          const newCourses = [...get().courses];
          const draggedCourse = newCourses[dragIndex];
          newCourses.splice(dragIndex, 1);
          newCourses.splice(hoverIndex, 0, draggedCourse);

          // Update backend
          const courseOrders = newCourses.map((course, index) => ({
            id: course.id,
            order: index,
          }));
          await reorderCoursesApi(courseOrders, token);

          // Update local state
          set({ courses: newCourses, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "course-storage",
      partialize: (state) => ({ courses: state.courses }),
    }
  )
);
