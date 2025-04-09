import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, Book, Video, Users, X, Edit2 } from "lucide-react";
import CreateCourseModal from "./CreateCourseModal";
import DraggableCourseCard from "./DraggableCourseCard";
import { toast } from "react-hot-toast";

import { useAuthContext } from "../../../../../auth/useAuthContext";
import { useCourseStore } from "../../../../../store/courseStore";

const CourseList = (props) => {
  const { onCourseSelect } = props;

  // states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // hooks
  const { auth } = useAuthContext();
  const {
    courses,
    isLoading,
    error,
    fetchCourses,
    updateExistingCourse,
    deleteCourse,
    reorderCourses,
  } = useCourseStore();

  useEffect(() => {
    fetchCourses(auth.token);
  }, [courses.length, fetchCourses]);

  const handleUpdateCourse = async (courseData) => {
    if (!selectedCourse) return;
    try {
      await updateExistingCourse(selectedCourse.id, courseData, auth.token);
      toast.success("Course updated successfully!");
      setIsModalOpen(false);
      setSelectedCourse(null);
      setIsEditMode(false);
    } catch (error) {
      toast.error(error.message || "Failed to update course");
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (course) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${course.title}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteCourse(course.id, auth.token);
        toast.success("Course deleted successfully!");
        fetchCourses(auth.token);
      } catch (error) {
        toast.error(error.message || "Failed to delete course");
      }
    }
  };

  const handleMoveCourse = async (dragIndex, hoverIndex) => {
    try {
      await reorderCourses(dragIndex, hoverIndex, auth.token);
      toast.success("Course order updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update course order");
    }
  };

  const handleSelectCourse = (course) => {
    onCourseSelect(course);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/** Course Cards */}
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <div key={course.id} className="relative group">
              <DraggableCourseCard
                course={course}
                index={index}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onMove={handleMoveCourse}
                onSelect={handleSelectCourse}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No courses found</p>
            </div>
          </div>
        )}

        {/** Create New Course Card */}
        <div
          onClick={() => {
            setIsEditMode(false);
            setSelectedCourse(null);
            setIsModalOpen(true);
          }}
          className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors duration-200"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              Create New Course
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Start building your course
            </p>
          </div>
        </div>

        {/** Modal for Course Creation/Editing */}
        <CreateCourseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
            setIsEditMode(false);
          }}
          onSubmit={isEditMode ? handleUpdateCourse : undefined}
          initialData={isEditMode ? selectedCourse : undefined}
          isLoading={isLoading}
        />
      </div>
    </DndProvider>
  );
};

export default CourseList;
