import React, { createContext, useState, useContext } from "react";

// Define types as prop types for prop validation
const PropTypes = {
  course: {
    id: String,
    title: String,
    sections: Array,
  },
  section: {
    id: String,
    title: String,
    lectures: Array,
    order: Number,
  },
  lecture: {
    id: String,
    title: String,
    content: String,
    order: Number,
  },
};

// Create the context
const CourseContext = createContext();

// Context Provider Component
export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Add a new course
  const addCourse = (title) => {
    const newCourse = {
      id: Date.now().toString(),
      title,
      sections: [],
    };

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    setSelectedCourse(newCourse);
  };

  // Select a course by ID
  const selectCourse = (courseId) => {
    const course = courses.find((course) => course.id === courseId) || null;
    setSelectedCourse(course);
  };

  // Add a new section to a course
  const addSection = (courseId, title) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const newSection = {
          id: Date.now().toString(),
          title,
          lectures: [],
          order: course.sections.length,
        };

        return {
          ...course,
          sections: [...course.sections, newSection],
        };
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(
      updatedCourses.find((course) => course.id === courseId) || null
    );
  };

  // Add a new lecture to a section
  const addLecture = (courseId, sectionId, title) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          sections: course.sections.map((section) => {
            if (section.id === sectionId) {
              const newLecture = {
                id: Date.now().toString(),
                title,
                content: "",
                order: section.lectures.length,
              };

              return {
                ...section,
                lectures: [...section.lectures, newLecture],
              };
            }
            return section;
          }),
        };
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(
      updatedCourses.find((course) => course.id === courseId) || null
    );
  };

  // Reorder sections within a course
  const reorderSection = (courseId, sectionId, newOrder) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const sections = [...course.sections];
        const sectionIndex = sections.findIndex((s) => s.id === sectionId);
        const section = sections[sectionIndex];

        sections.splice(sectionIndex, 1);
        sections.splice(newOrder, 0, section);

        sections.forEach((s, index) => (s.order = index));

        return { ...course, sections };
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(
      updatedCourses.find((course) => course.id === courseId) || null
    );
  };

  // Reorder lectures within a section
  const reorderLecture = (courseId, sectionId, lectureId, newOrder) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        return {
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
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(
      updatedCourses.find((course) => course.id === courseId) || null
    );
  };

  // Move a lecture from one section to another
  const moveLectureToSection = (
    courseId,
    fromSectionId,
    toSectionId,
    lectureId
  ) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        let movedLecture = null;

        return {
          ...course,
          sections: course.sections.map((section) => {
            // Remove lecture from original section
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

            // Add lecture to new section
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
      }
      return course;
    });

    setCourses(updatedCourses);
    setSelectedCourse(
      updatedCourses.find((course) => course.id === courseId) || null
    );
  };

  // Context value with state and methods
  const contextValue = {
    courses,
    selectedCourse,
    addCourse,
    selectCourse,
    addSection,
    addLecture,
    reorderSection,
    reorderLecture,
    moveLectureToSection,
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom hook to use the CourseContext
export const useCourseContext = () => {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }

  return context;
};
