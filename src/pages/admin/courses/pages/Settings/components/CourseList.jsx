import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, Book, Video, Users, X, Edit2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Store
import {
  updateExistingCourse,
  deleteExistingCourse,
  reorderCourses,
  selectAllCourses,
} from "@/store/reducer/courseSlice";

// Components
import CreateCourseModal from "./CreateCourseModal";
import DraggableCourseCard from "./DraggableCourseCard";

const CourseList = ({ onCourseSelect }) => {
  const dispatch = useDispatch();
  const courses = useSelector(selectAllCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
console.log(courses, "courses1");

  const handleUpdateCourse = async (courseData) => {
    if (!selectedCourse) return;
    try {
      await dispatch(
        updateExistingCourse({
          id: selectedCourse._id,
          courseData,
          token: localStorage.getItem("token"),
        })
      ).unwrap();
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
        await dispatch(
          deleteExistingCourse({
            id: course._id,
            token: localStorage.getItem("token"),
          })
        ).unwrap();
        toast.success("Course deleted successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to delete course");
      }
    }
  };

  const handleMoveCourse = async (dragIndex, hoverIndex) => {
    try {
      // Create a new array with the reordered courses
      const newCourses = [...courses];
      const draggedCourse = newCourses[dragIndex];
      newCourses.splice(dragIndex, 1);
      newCourses.splice(hoverIndex, 0, draggedCourse);

      // Prepare the order data for the API
      const courseOrders = newCourses.map((course, index) => ({
        id: course._id,
        order: index,
      }));

      // Dispatch the reorder action
      const result = await dispatch(
        reorderCourses({
          courses: courseOrders,
          token: localStorage.getItem("token"),
        })
      ).unwrap();

      // Force a re-render by updating the courses array
      dispatch({
        type: "courses/updateLocalOrder",
        payload: result,
      });

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
            <div key={course._id} className="relative group">
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
              <p className="text-gray-500">No IQ Vault found</p>
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
          className="rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors duration-200"
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
        />
      </div>
    </DndProvider>
  );
};

export default CourseList;
