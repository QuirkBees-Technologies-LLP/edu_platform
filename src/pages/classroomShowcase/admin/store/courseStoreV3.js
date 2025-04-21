import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useCourseStore = create(
  persist(
    (set, get) => ({
      courses: [],
      selectedCourse: null,
      error: null,
      loading: false,

      // Course Management
      fetchCourses: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get("/api/courses");
          set({ courses: response.data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      createCourse: async (courseData) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/courses", courseData);
          set((state) => ({
            courses: [...state.courses, response.data],
            loading: false,
          }));
          return response.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateCourse: async (courseId, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put(`/api/courses/${courseId}`, updates);
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId ? response.data : course
            ),
            selectedCourse:
              state.selectedCourse?.id === courseId
                ? response.data
                : state.selectedCourse,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteCourse: async (courseId) => {
        set({ loading: true, error: null });
        try {
          await axios.delete(`/api/courses/${courseId}`);
          set((state) => ({
            courses: state.courses.filter((course) => course.id !== courseId),
            selectedCourse:
              state.selectedCourse?.id === courseId
                ? null
                : state.selectedCourse,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Course Reordering
      reorderCourses: async (dragIndex, hoverIndex) => {
        set({ loading: true, error: null });
        try {
          const newCourses = [...get().courses];
          const draggedCourse = newCourses[dragIndex];
          newCourses.splice(dragIndex, 1);
          newCourses.splice(hoverIndex, 0, draggedCourse);

          // Update order in backend
          await axios.put("/api/courses/reorder", {
            courseId: draggedCourse.id,
            newOrder: hoverIndex,
          });

          set({ courses: newCourses, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Section Management
      addSection: async (courseId, section) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(
            `/api/courses/${courseId}/sections`,
            section
          );
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? { ...course, sections: [...course.sections, response.data] }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateSection: async (courseId, sectionId, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put(
            `/api/courses/${courseId}/sections/${sectionId}`,
            updates
          );
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? {
                    ...course,
                    sections: course.sections.map((section) =>
                      section.id === sectionId ? response.data : section
                    ),
                  }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteSection: async (courseId, sectionId) => {
        set({ loading: true, error: null });
        try {
          await axios.delete(`/api/courses/${courseId}/sections/${sectionId}`);
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
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Section Reordering
      reorderSections: async (courseId, dragIndex, hoverIndex) => {
        set({ loading: true, error: null });
        try {
          const course = get().courses.find((c) => c.id === courseId);
          if (!course) return;

          const newSections = [...course.sections];
          const draggedSection = newSections[dragIndex];
          newSections.splice(dragIndex, 1);
          newSections.splice(hoverIndex, 0, draggedSection);

          // Update order in backend
          await axios.put(`/api/courses/${courseId}/sections/reorder`, {
            sectionId: draggedSection.id,
            newOrder: hoverIndex,
          });

          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? { ...course, sections: newSections }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Lecture Management
      addLecture: async (courseId, sectionId, lecture) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(
            `/api/courses/${courseId}/sections/${sectionId}/lectures`,
            lecture
          );
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? {
                    ...course,
                    sections: course.sections.map((section) =>
                      section.id === sectionId
                        ? {
                            ...section,
                            lectures: [...section.lectures, response.data],
                          }
                        : section
                    ),
                  }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateLecture: async (courseId, sectionId, lectureId, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put(
            `/api/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
            updates
          );
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? {
                    ...course,
                    sections: course.sections.map((section) =>
                      section.id === sectionId
                        ? {
                            ...section,
                            lectures: section.lectures.map((lecture) =>
                              lecture.id === lectureId ? response.data : lecture
                            ),
                          }
                        : section
                    ),
                  }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteLecture: async (courseId, sectionId, lectureId) => {
        set({ loading: true, error: null });
        try {
          await axios.delete(
            `/api/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`
          );
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? {
                    ...course,
                    sections: course.sections.map((section) =>
                      section.id === sectionId
                        ? {
                            ...section,
                            lectures: section.lectures.filter(
                              (lecture) => lecture.id !== lectureId
                            ),
                          }
                        : section
                    ),
                  }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Lecture Reordering
      reorderLecture: async (courseId, sectionId, lectureId, newOrder) => {
        set({ loading: true, error: null });
        try {
          const course = get().courses.find((c) => c.id === courseId);
          if (!course) return;

          const section = course.sections.find((s) => s.id === sectionId);
          if (!section) return;

          const newLectures = [...section.lectures];
          const lectureIndex = newLectures.findIndex((l) => l.id === lectureId);
          const lecture = newLectures[lectureIndex];

          newLectures.splice(lectureIndex, 1);
          newLectures.splice(newOrder, 0, lecture);

          // Update order in backend
          await axios.put(
            `/api/courses/${courseId}/sections/${sectionId}/lectures/reorder`,
            {
              lectureId,
              newOrder,
            }
          );

          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? {
                    ...course,
                    sections: course.sections.map((section) =>
                      section.id === sectionId
                        ? { ...section, lectures: newLectures }
                        : section
                    ),
                  }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Move lecture between sections
      moveLectureToSection: async (
        courseId,
        fromSectionId,
        toSectionId,
        lectureId
      ) => {
        set({ loading: true, error: null });
        try {
          await axios.put(
            `/api/courses/${courseId}/sections/${fromSectionId}/lectures/${lectureId}/move`,
            { toSectionId }
          );

          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId
                ? {
                    ...course,
                    sections: course.sections.map((section) => {
                      if (section.id === fromSectionId) {
                        return {
                          ...section,
                          lectures: section.lectures.filter(
                            (lecture) => lecture.id !== lectureId
                          ),
                        };
                      }
                      if (section.id === toSectionId) {
                        return {
                          ...section,
                          lectures: [...section.lectures, { id: lectureId }],
                        };
                      }
                      return section;
                    }),
                  }
                : course
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Selection Management
      setSelectedCourse: (course) => set({ selectedCourse: course }),
      clearSelectedCourse: () => set({ selectedCourse: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "course-storage",
      partialize: (state) => ({
        courses: state.courses,
        selectedCourse: state.selectedCourse,
      }),
    }
  )
);

export default useCourseStore;
