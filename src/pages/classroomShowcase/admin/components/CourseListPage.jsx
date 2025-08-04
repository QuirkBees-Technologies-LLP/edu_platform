import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Plus,
  Book,
  Video,
  Users,
  Star,
  Lock,
  Globe,
  Edit2,
  GripVertical,
} from "lucide-react";
import useCourseStore from "../store/courseStoreV2";

// Draggable Course Card Component
const DraggableCourseCard = ({
  course,
  index,
  moveCourse,
  onSelect,
  onEdit,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "COURSE",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "COURSE",
    hover: (draggedItem) => {
      if (draggedItem.index === index) {
        return;
      }
      moveCourse(draggedItem.index, index);
      draggedItem.index = index;
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative group ${
        isDragging ? "opacity-50 scale-105 shadow-xl" : ""
      }`}
    >
      <div onClick={() => onSelect(course)} className="cursor-pointer">
        {/* Thumbnail Section */}
        <div className="relative aspect-video rounded-t-lg overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Book className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Overlay with drag handle and badges */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200">
            <div className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200">
              <GripVertical className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {course.isFeatured && (
              <div className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3" />
                Featured
              </div>
            )}
            {course.isPro && (
              <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                <Lock className="w-3 h-3" />
                Pro
              </div>
            )}
            {course.isPublic ? (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                <Globe className="w-3 h-3" />
                Public
              </div>
            ) : (
              <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                <Lock className="w-3 h-3" />
                Private
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Video className="w-4 h-4 mr-1" />
            <span>{course.sections.length} sections</span>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(course);
        }}
        className="absolute top-2 left-2 p-2.5 bg-blue-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-600 hover:shadow-xl hover:scale-110 hover:rotate-12"
        title="Edit IQ Vault"
      >
        <Edit2 className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

const CourseListPage = ({ onCreateCourse, onCourseSelect, onUpdateCourse }) => {
  const { courses, error, reorderCourses } = useCourseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    isFeatured: false,
    isPublic: false,
    isPro: false,
  });

  const moveCourse = (dragIndex, hoverIndex) => {
    reorderCourses(dragIndex, hoverIndex);
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseData({
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        isFeatured: course.isFeatured,
        isPublic: course.isPublic,
        isPro: course.isPro,
      });
    } else {
      setEditingCourse(null);
      setCourseData({
        title: "",
        description: "",
        thumbnail: "",
        isFeatured: false,
        isPublic: false,
        isPro: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setCourseData({
      title: "",
      description: "",
      thumbnail: "",
      isFeatured: false,
      isPublic: false,
      isPro: false,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      onUpdateCourse({ ...editingCourse, ...courseData });
    } else {
      onCreateCourse(courseData);
    }
    if (!error) {
      handleCloseModal();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course Cards */}
          {courses.map((course, index) => (
            <DraggableCourseCard
              key={course.id}
              course={course}
              index={index}
              moveCourse={moveCourse}
              onSelect={onCourseSelect}
              onEdit={handleOpenModal}
            />
          ))}

          {/* Create New Course Card */}
          <div
            onClick={() => handleOpenModal()}
            className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors duration-200"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <Plus className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                Create New IQ Vault
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Start building your IQ Vault
              </p>
            </div>
          </div>
        </div>

        {/* Course Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingCourse ? "Edit IQ Vault" : "Create New IQ Vault"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={courseData.thumbnail}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        thumbnail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={courseData.isFeatured}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isFeatured"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Featured Course
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={courseData.isPublic}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          isPublic: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isPublic"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Public Course
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPro"
                      checked={courseData.isPro}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          isPro: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isPro"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Pro Course
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingCourse ? "Save Changes" : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default CourseListPage;
