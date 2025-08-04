import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import useCourseStore from "../store/courseStoreV3";
import { toast } from "react-hot-toast";

// Draggable Course Card Component
const DraggableCourseCard = ({
  course,
  index,
  moveCourse,
  onSelect,
  onEdit,
  loading,
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
      } ${loading ? "opacity-50 cursor-wait" : ""}`}
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
          <div className="absolute top-2 right-2 flex gap-2">
            {course.isFeatured && (
              <span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                Featured
              </span>
            )}
            {course.isPro && (
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Pro
              </span>
            )}
            {course.isPublic ? (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Public
              </span>
            ) : (
              <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Private
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>{course.lectureCount || 0} lectures</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{course.studentCount || 0} students</span>
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
    </div>
  );
};

const CourseListPage = () => {
  const {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    reorderCourses,
    setSelectedCourse,
  } = useCourseStore();

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

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const moveCourse = async (dragIndex, hoverIndex) => {
    try {
      await reorderCourses(dragIndex, hoverIndex);
      toast.success("Course order updated successfully");
    } catch (error) {
      toast.error("Failed to update course order");
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
        toast.success("Course updated successfully");
      } else {
        await createCourse(courseData);
        toast.success("Course created successfully");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save course");
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId);
        toast.success("Course deleted successfully");
      } catch (error) {
        toast.error("Failed to delete course");
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 lg:p-6">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course Cards */}
          {courses.map((course, index) => (
            <DraggableCourseCard
              key={course.id}
              course={course}
              index={index}
              moveCourse={moveCourse}
              onSelect={setSelectedCourse}
              onEdit={handleOpenModal}
              loading={loading}
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
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCourse ? "Edit IQ Vault" : "Create New IQ Vault"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={courseData.isFeatured}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={courseData.isPublic}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          isPublic: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={courseData.isPro}
                      onChange={(e) =>
                        setCourseData({
                          ...courseData,
                          isPro: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Pro Course</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  {editingCourse && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingCourse.id)}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete Course
                    </button>
                  )}
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
