import { create } from "zustand";

export const useCourseStore = create((set) => ({
  courses: [],
  selectedCourse: null,

  addCourse: (title) =>
    set((state) => {
      const newCourse = {
        id: Date.now().toString(),
        title,
        sections: [],
      };
      const newCourses = [...state.courses, newCourse];
      return {
        courses: newCourses,
        selectedCourse: newCourse, // Auto-select new course
      };
    }),

  selectCourse: (courseId) =>
    set((state) => ({
      selectedCourse:
        state.courses.find((course) => course.id === courseId) || null,
    })),

  addSection: (courseId, title) =>
    set((state) => {
      const newCourses = state.courses.map((course) => {
        if (course.id === courseId) {
          const updatedCourse = {
            ...course,
            sections: [
              ...course.sections,
              {
                id: Date.now().toString(),
                title,
                lectures: [],
                order: course.sections.length,
              },
            ],
          };
          return updatedCourse;
        }
        return course;
      });

      const updatedSelectedCourse =
        newCourses.find((course) => course.id === courseId) || null;

      return {
        courses: newCourses,
        selectedCourse: updatedSelectedCourse,
      };
    }),

  addLecture: (courseId, sectionId, title) =>
    set((state) => {
      const newCourses = state.courses.map((course) => {
        if (course.id === courseId) {
          const updatedCourse = {
            ...course,
            sections: course.sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  lectures: [
                    ...section.lectures,
                    {
                      id: Date.now().toString(),
                      title,
                      content: "",
                      order: section.lectures.length,
                    },
                  ],
                };
              }
              return section;
            }),
          };
          return updatedCourse;
        }
        return course;
      });

      const updatedSelectedCourse =
        newCourses.find((course) => course.id === courseId) || null;

      return {
        courses: newCourses,
        selectedCourse: updatedSelectedCourse,
      };
    }),

  reorderSection: (courseId, sectionId, newOrder) =>
    set((state) => {
      const newCourses = state.courses.map((course) => {
        if (course.id === courseId) {
          const sections = [...course.sections];
          const sectionIndex = sections.findIndex((s) => s.id === sectionId);
          const section = sections[sectionIndex];
          sections.splice(sectionIndex, 1);
          sections.splice(newOrder, 0, section);
          sections.forEach((s, index) => (s.order = index));
          const updatedCourse = { ...course, sections };
          return updatedCourse;
        }
        return course;
      });

      const updatedSelectedCourse =
        newCourses.find((course) => course.id === courseId) || null;

      return {
        courses: newCourses,
        selectedCourse: updatedSelectedCourse,
      };
    }),

  reorderLecture: (courseId, sectionId, lectureId, newOrder) =>
    set((state) => {
      const newCourses = state.courses.map((course) => {
        if (course.id === courseId) {
          const updatedCourse = {
            ...course,
            sections: course.sections.map((section) => {
              if (section.id === sectionId) {
                const lectures = [...section.lectures];
                const lectureIndex = lectures.findIndex(
                  (l) => l.id === lectureId
                );
                const lecture = lectures[lectureIndex];
                lectures.splice(lectureIndex, 1);
                lectures.splice(newOrder, 0, lecture);
                lectures.forEach((l, index) => (l.order = index));
                return { ...section, lectures };
              }
              return section;
            }),
          };
          return updatedCourse;
        }
        return course;
      });

      const updatedSelectedCourse =
        newCourses.find((course) => course.id === courseId) || null;

      return {
        courses: newCourses,
        selectedCourse: updatedSelectedCourse,
      };
    }),

  moveLectureToSection: (courseId, fromSectionId, toSectionId, lectureId) =>
    set((state) => {
      const newCourses = state.courses.map((course) => {
        if (course.id === courseId) {
          let movedLecture = null;
          const updatedCourse = {
            ...course,
            sections: course.sections.map((section) => {
              if (section.id === fromSectionId) {
                const lectures = section.lectures.filter((l) => {
                  if (l.id === lectureId) {
                    movedLecture = l;
                    return false;
                  }
                  return true;
                });
                lectures.forEach((l, index) => (l.order = index));
                return { ...section, lectures };
              }
              if (section.id === toSectionId && movedLecture) {
                const lectures = [
                  ...section.lectures,
                  { ...movedLecture, order: section.lectures.length },
                ];
                lectures.forEach((l, index) => (l.order = index));
                return { ...section, lectures };
              }
              return section;
            }),
          };
          return updatedCourse;
        }
        return course;
      });

      const updatedSelectedCourse =
        newCourses.find((course) => course.id === courseId) || null;

      return {
        courses: newCourses,
        selectedCourse: updatedSelectedCourse,
      };
    }),

  deleteCourse: (courseId) =>
    set((state) => {
      const newCourses = state.courses.filter((course) => course.id !== courseId);
      return {
        courses: newCourses,
        selectedCourse: state.selectedCourse?.id === courseId ? null : state.selectedCourse,
      };
    }),

  deleteSection: (courseId, sectionId) =>
    set((state) => {
      const newCourses = state.courses.map((course) => {
        if (course.id === courseId) {
          return {
            ...course,
            sections: course.sections.filter((section) => section.id !== sectionId),
          };
        }
        return course;
      });

      const updatedSelectedCourse =
        newCourses.find((course) => course.id === courseId) || null;

      return {
        courses: newCourses,
        selectedCourse: updatedSelectedCourse,
      };
    }),

  deleteLecture: (courseId, sectionId, lectureId) =>
    set((state) => {
      const newCourses = state.courses.map((course) => {
        if (course.id === courseId) {
          return {
            ...course,
            sections: course.sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  lectures: section.lectures.filter((lecture) => lecture.id !== lectureId),
                };
              }
              return section;
            }),
          };
        }
        return course;
      });

      const updatedSelectedCourse =
        newCourses.find((course) => course.id === courseId) || null;

      return {
        courses: newCourses,
        selectedCourse: updatedSelectedCourse,
      };
    }),
}));
