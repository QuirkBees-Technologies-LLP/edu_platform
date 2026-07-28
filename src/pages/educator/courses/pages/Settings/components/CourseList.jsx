import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  reorderStrategies,
  selectAllCourses,
} from "@/store/reducer/courseSlice";
import {
  useDeleteEducatorMasterClassMutation,
  useReorderEducatorMasterClassMutation
} from "@/store/api/educator/educatorMasterClassApiSlice";
// Components
import CreateCourseModal from "./CreateCourseModal";
import DraggableCourseCard from "./DraggableCourseCard";

const CourseList = ({ onCourseSelect, activeTab, courses: propCourses }) => {
  const dispatch = useDispatch();
  const reduxCourses = useSelector(selectAllCourses);
  const courses = propCourses || reduxCourses;

  const [deleteMasterClass] = useDeleteEducatorMasterClassMutation();
  const [reorderMasterClasses] = useReorderEducatorMasterClassMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds course to delete

  const handleUpdateCourse = async (courseData) => {
    if (!selectedCourse) return;
    try {
      await dispatch(
        updateExistingCourse({
          id: selectedCourse?._id,
          courseData,
          token: localStorage.getItem("token"),
        })
      ).unwrap();
      toast.success("Course updated successfully!");
      setIsModalOpen(false);
      setSelectedCourse(null);
      setIsEditMode(false);
    } catch (error) {
      toast.error(error?.message || "Failed to update course");
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (course) => {
    setDeleteConfirm(course); // show modal instead of window.confirm
  };

  const confirmDelete = async () => {
    const course = deleteConfirm;
    const itemType = activeTab === "master-class" ? "Master Class" : "Course";
    setDeleteConfirm(null);
    try {
      if (activeTab === "master-class") {
        await deleteMasterClass(course?._id).unwrap();
      } else {
        await dispatch(
          deleteExistingCourse({
            id: course?._id,
            token: localStorage.getItem("token"),
          })
        ).unwrap();
      }
      toast.success(`${itemType} deleted successfully!`);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || `Failed to delete ${itemType.toLowerCase()}`);
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
      const courseOrders = newCourses?.map((course, index) => ({
        id: course?._id,
        order: index,
      }));

      // Dispatch the reorder action
      if (activeTab === "master-class") {
        await reorderMasterClasses({ strategies: courseOrders }).unwrap();
        // No need to dispatch updateLocalOrder as RTK Query should invalidate tags and refetch or we can optimistic update (but here relying on invalidation for now)
      } else {
        const strategyAction = reorderCourses;
        const payloadKey = "courses";

        const result = await dispatch(
          strategyAction({
            [payloadKey]: courseOrders,
            token: localStorage.getItem("token"),
          })
        ).unwrap();

        // Force a re-render by updating the courses array
        dispatch({
          type: "courses/updateLocalOrder",
          payload: result,
        });
      }

      toast.success("Course order updated successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to update course order");
    }
  };

  const handleSelectCourse = (course) => {
    onCourseSelect?.(course);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/** Course Cards */}
        {courses?.length > 0 ? (
          courses.map((course, index) => (
            <div key={course?._id} className="relative group">
              <DraggableCourseCard
                course={course}
                index={index}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onMove={handleMoveCourse}
                onSelect={handleSelectCourse}
                activeTab={activeTab}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No courses found yet</p>
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
              Create New Masterclass
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Start building your masterclass
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
        {/** Delete Confirmation Modal — uses project-standard Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="p-5 max-w-[500px]">
            <VisuallyHidden>
              <DialogTitle>Delete Confirmation</DialogTitle>
            </VisuallyHidden>
            <i className="ki-filled text-3xl ki-trash dark:text-white text-gray-500 mb-3.5 mx-auto block text-center" />
            <p className="mb-4 text-gray-700 dark:text-white text-base text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{deleteConfirm?.title}"</span>?{" "}
              This action cannot be undone.
            </p>
            <div className="flex justify-center items-center space-x-4">
              <button className="btn btn-light" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Yes, I'm sure
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DndProvider>
  );
};

export default CourseList;
