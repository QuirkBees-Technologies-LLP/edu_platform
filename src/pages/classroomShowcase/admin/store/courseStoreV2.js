import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_FEATURED_COURSES = 5;

const useCourseStore = create(
  persist(
    (set, get) => ({
      // State
      courses: [],
      selectedCourse: null,
      isLoading: false,
      error: null,

      // Actions
      setCourses: (courses) => set({ courses }),

      addCourse: (course) =>
        set((state) => {
          // If the course is featured, check if we've reached the limit
          if (course.isFeatured) {
            const featuredCount = state.courses.filter(
              (c) => c.isFeatured
            ).length;
            if (featuredCount >= MAX_FEATURED_COURSES) {
              return {
                error: `You can only have ${MAX_FEATURED_COURSES} featured courses`,
                courses: state.courses,
              };
            }
          }
          return {
            courses: [...state.courses, course],
            error: null,
          };
        }),

      updateCourse: (updatedCourse) =>
        set((state) => {
          // If the course is being featured, check if we've reached the limit
          if (updatedCourse.isFeatured) {
            const featuredCount = state.courses.filter(
              (c) => c.isFeatured && c.id !== updatedCourse.id
            ).length;
            if (featuredCount >= MAX_FEATURED_COURSES) {
              return {
                error: `You can only have ${MAX_FEATURED_COURSES} featured courses`,
                courses: state.courses,
              };
            }
          }
          return {
            courses: state.courses.map((course) =>
              course.id === updatedCourse.id ? updatedCourse : course
            ),
            error: null,
          };
        }),

      deleteCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== courseId),
        })),

      setSelectedCourse: (course) => set({ selectedCourse: course }),

      // Course Reordering
      reorderCourses: (dragIndex, hoverIndex) =>
        set((state) => {
          const newCourses = [...state.courses];
          const draggedCourse = newCourses[dragIndex];
          newCourses.splice(dragIndex, 1);
          newCourses.splice(hoverIndex, 0, draggedCourse);
          return { courses: newCourses };
        }),

      // Section Management
      addSection: (courseId, section) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? { ...course, sections: [...course.sections, section] }
              : course
          ),
        })),

      updateSection: (courseId, sectionId, updates) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  sections: course.sections.map((section) =>
                    section.id === sectionId
                      ? { ...section, ...updates }
                      : section
                  ),
                }
              : course
          ),
        })),

      deleteSection: (courseId, sectionId) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  sections: course.sections.filter(
                    (section) => section.id !== sectionId
                  ),
                }
              : course
          ),
        })),

      // Lecture Management
      addLecture: (courseId, sectionId, lecture) =>
        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id === courseId) {
              return {
                ...course,
                sections: course.sections.map((section) => {
                  if (section.id === sectionId) {
                    return {
                      ...section,
                      lectures: [
                        ...(section.lectures || []).filter(Boolean),
                        lecture,
                      ],
                    };
                  }
                  return section;
                }),
              };
            }
            return course;
          }),
        })),

      updateLecture: (courseId, sectionId, lectureId, updates) =>
        set((state) => {
          // Create updated courses array
          const updatedCourses = state.courses.map((course) => {
            if (course.id === courseId) {
              return {
                ...course,
                sections: course.sections.map((section) => {
                  if (section.id === sectionId) {
                    return {
                      ...section,
                      lectures: section.lectures
                        .filter(Boolean)
                        .map((lecture) =>
                          lecture.id === lectureId
                            ? {
                                ...lecture,
                                ...updates,
                                updatedAt: new Date().toISOString(),
                                // Ensure thumbnail and video are properly updated
                                thumbnail:
                                  updates.thumbnail || lecture.thumbnail,
                                video: updates.video || lecture.video,
                              }
                            : lecture
                        ),
                    };
                  }
                  return section;
                }),
              };
            }
            return course;
          });

          // Update localStorage
          try {
            const storageKey = "course-storage-v2";
            const currentStorage = localStorage.getItem(storageKey);
            if (currentStorage) {
              const parsedStorage = JSON.parse(currentStorage);
              parsedStorage.state.courses = updatedCourses;
              localStorage.setItem(storageKey, JSON.stringify(parsedStorage));
            }
          } catch (error) {
            console.error("Error updating localStorage:", error);
            throw error;
          }

          // Return updated state
          return { courses: updatedCourses };
        }),

      deleteLecture: (courseId, sectionId, lectureId) =>
        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id === courseId) {
              return {
                ...course,
                sections: course.sections.map((section) => {
                  if (section.id === sectionId) {
                    return {
                      ...section,
                      lectures: section.lectures
                        .filter(Boolean)
                        .filter((lecture) => lecture.id !== lectureId),
                    };
                  }
                  return section;
                }),
              };
            }
            return course;
          }),
        })),

      // Utility Actions
      clearError: () => set({ error: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "course-storage-v2",
      partialize: (state) => ({ courses: state.courses }),
    }
  )
);

export default useCourseStore;
