import React, { useState } from "react";
import {
  Plus as AddIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
} from "lucide-react";

const ClassroomAdminPage = () => {
  const [courses, setCourses] = useState([
    {
      id: "course-1",
      title: "Introduction to React",
      sections: [
        {
          id: "section-1",
          title: "React Basics",
          lectures: [
            { id: "lecture-1", title: "What is React?" },
            { id: "lecture-2", title: "Setting up Development Environment" },
          ],
        },
        {
          id: "section-2",
          title: "Advanced Concepts",
          lectures: [
            { id: "lecture-3", title: "State Management" },
            { id: "lecture-4", title: "Hooks" },
          ],
        },
      ],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);

  const [modalState, setModalState] = useState({
    type: null,
    mode: "create",
    isOpen: false,
    editItem: null,
    parentId: null,
  });

  const [formData, setFormData] = useState({
    title: "",
    parentId: null,
  });

  // Modal Handlers
  const openModal = (type, mode = "create", item = null, parentId = null) => {
    setModalState({
      type,
      mode,
      isOpen: true,
      editItem: item,
      parentId: parentId || null,
    });

    // Pre-fill form data if editing
    setFormData({
      title: item ? item.title : "",
      parentId: parentId || null,
    });
  };

  const closeModal = () => {
    setModalState({
      type: null,
      mode: "create",
      isOpen: false,
      editItem: null,
      parentId: null,
    });
    setFormData({ title: "", parentId: null });
  };

  // CRUD Handlers
  const handleSubmit = () => {
    const updatedCourses = courses.map((course) => {
      if (course.id !== selectedCourse.id) return course;

      switch (modalState.type) {
        case "course":
          if (modalState.mode === "edit") {
            return {
              ...course,
              title: formData.title,
            };
          }
          return course;

        case "section":
          return {
            ...course,
            sections: course.sections.map((section) => {
              if (
                modalState.mode === "edit" &&
                section.id === modalState.editItem.id
              ) {
                return {
                  ...section,
                  title: formData.title,
                };
              }
              if (modalState.mode === "create") {
                return section;
              }
              return section;
            }),
          };

        case "lecture":
          return {
            ...course,
            sections: course.sections.map((section) => {
              if (section.id !== modalState.parentId) return section;

              return {
                ...section,
                lectures: section.lectures.map((lecture) => {
                  if (
                    modalState.mode === "edit" &&
                    lecture.id === modalState.editItem.id
                  ) {
                    return {
                      ...lecture,
                      title: formData.title,
                    };
                  }
                  if (modalState.mode === "create") {
                    return lecture;
                  }
                  return lecture;
                }),
              };
            }),
          };

        default:
          return course;
      }
    });

    // Special handling for creating new items
    if (modalState.mode === "create") {
      switch (modalState.type) {
        case "course":
          updatedCourses.push({
            id: `course-${Date.now()}`,
            title: formData.title,
            sections: [],
          });
          break;

        case "section":
          const courseToUpdate = updatedCourses.find(
            (c) => c.id === selectedCourse.id
          );
          courseToUpdate.sections.push({
            id: `section-${Date.now()}`,
            title: formData.title,
            lectures: [],
          });
          break;

        case "lecture":
          const courseIndex = updatedCourses.findIndex(
            (c) => c.id === selectedCourse.id
          );
          const sectionIndex = updatedCourses[courseIndex].sections.findIndex(
            (s) => s.id === modalState.parentId
          );
          updatedCourses[courseIndex].sections[sectionIndex].lectures.push({
            id: `lecture-${Date.now()}`,
            title: formData.title,
          });
          break;
      }
    }

    // Update courses and selected course
    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find((c) => c.id === selectedCourse.id));
    closeModal();
  };

  const handleDelete = (type, itemId, parentId = null) => {
    const updatedCourses = courses.map((course) => {
      if (course.id !== selectedCourse.id) return course;

      switch (type) {
        case "course":
          return course; // For now, we'll disable course deletion

        case "section":
          return {
            ...course,
            sections: course.sections.filter(
              (section) => section.id !== itemId
            ),
          };

        case "lecture":
          return {
            ...course,
            sections: course.sections.map((section) =>
              section.id === parentId
                ? {
                    ...section,
                    lectures: section.lectures.filter(
                      (lecture) => lecture.id !== itemId
                    ),
                  }
                : section
            ),
          };

        default:
          return course;
      }
    });

    // Update courses and selected course
    setCourses(updatedCourses);
    setSelectedCourse(updatedCourses.find((c) => c.id === selectedCourse.id));
  };

  // Render Modal
  const renderModal = () => {
    if (!modalState.isOpen) return null;

    const titleMap = {
      course: modalState.mode === "create" ? "Create Course" : "Edit Course",
      section: modalState.mode === "create" ? "Create Section" : "Edit Section",
      lecture: modalState.mode === "create" ? "Create Lecture" : "Edit Lecture",
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h2 className="text-xl font-semibold mb-4">
            {titleMap[modalState.type]}
          </h2>
          <input
            type="text"
            placeholder={`${modalState.type} Title`}
            className="w-full px-3 py-2 border rounded mb-4"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
          />
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleSubmit}
            >
              {modalState.mode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Courses</h2>
        <button
          className="w-full bg-blue-500 text-white p-2 rounded mb-4 flex items-center justify-center"
          onClick={() => openModal("course")}
        >
          <AddIcon className="mr-2" /> Create Course
        </button>
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between mb-2 p-2 hover:bg-gray-200 rounded"
          >
            <span
              onClick={() => setSelectedCourse(course)}
              className="cursor-pointer flex-grow"
            >
              {course.title}
            </span>
            <div>
              <button
                className="p-1 hover:bg-gray-300 rounded mr-1"
                onClick={() => openModal("course", "edit", course)}
              >
                <EditIcon size={16} />
              </button>
              <button
                className="p-1 hover:bg-red-100 rounded text-red-600"
                onClick={() => handleDelete("course", course.id)}
              >
                <DeleteIcon size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedCourse ? (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h1 className="text-3xl font-bold">{selectedCourse.title}</h1>
              <button
                className="bg-green-500 text-white p-2 rounded flex items-center"
                onClick={() => openModal("section", "create")}
              >
                <AddIcon className="mr-2" /> Add Section
              </button>
            </div>

            {selectedCourse.sections.map((section) => (
              <div
                key={section.id}
                className="mb-4 bg-white shadow-md rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <div className="flex items-center">
                    <button
                      className="bg-blue-500 text-white p-1 rounded flex items-center mr-2"
                      onClick={() =>
                        openModal("lecture", "create", null, section.id)
                      }
                    >
                      <AddIcon className="mr-1" size={16} /> Lecture
                    </button>
                    <button
                      className="p-1 hover:bg-gray-300 rounded mr-2"
                      onClick={() => openModal("section", "edit", section)}
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className="text-red-500 p-1 hover:bg-red-100 rounded"
                      onClick={() => handleDelete("section", section.id)}
                    >
                      <DeleteIcon size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {section.lectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="p-2 bg-gray-100 rounded flex justify-between items-center"
                    >
                      <span>{lecture.title}</span>
                      <div>
                        <button
                          className="p-1 hover:bg-gray-300 rounded mr-1"
                          onClick={() =>
                            openModal("lecture", "edit", lecture, section.id)
                          }
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          className="text-red-500 p-1 hover:bg-red-100 rounded"
                          onClick={() =>
                            handleDelete("lecture", lecture.id, section.id)
                          }
                        >
                          <DeleteIcon size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Select a course or create a new one
          </div>
        )}
      </div>

      {/* Render Modal */}
      {renderModal()}
    </div>
  );
};

export default ClassroomAdminPage;
