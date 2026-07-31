import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Store
import {
  updateExistingCourse,
  deleteExistingCourse,
  reorderCourses,
  selectAllCourses,
} from "@/store/reducer/courseSlice";
import {
  useDeleteEducatorMasterClassMutation,
  useReorderEducatorMasterClassMutation,
  useDeleteEducatorAcademyMutation,
  useReorderEducatorAcademiesMutation,
  useUpdateEducatorAcademyMutation,
} from "@/store/api/educator/educatorMasterClassApiSlice";

// Components
import CreateCourseModal from "./CreateCourseModal";
import CreateAcademyModal from "./CreateAcademyModal";
import DraggableCourseCard from "./DraggableCourseCard";

const CourseList = ({ onCourseSelect, activeTab, courses: propCourses, onSwitchToMasterclass }) => {
  const dispatch = useDispatch();
  const reduxCourses = useSelector(selectAllCourses);
  const courses = propCourses ?? reduxCourses;

  // ─── Masterclass mutations ────────────────────────────────────────────────
  const [deleteMasterClass] = useDeleteEducatorMasterClassMutation();
  const [reorderMasterClasses] = useReorderEducatorMasterClassMutation();

  // ─── Academy mutations ────────────────────────────────────────────────────
  const [deleteAcademy] = useDeleteEducatorAcademyMutation();
  const [reorderAcademies] = useReorderEducatorAcademiesMutation();
  const [updateAcademy, { isLoading: isUpdatingAcademy }] = useUpdateEducatorAcademyMutation();

  // ─── Modal state ──────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const isAcademyTab = activeTab === "academy";
  const itemLabel = isAcademyTab ? "Academy" : "Masterclass";

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleUpdateCourse = async (courseData) => {
    if (!selectedCourse) return;
    try {
      if (isAcademyTab) {
        await updateAcademy({ id: selectedCourse._id, formData: courseData }).unwrap();
        toast.success("Academy updated successfully!");
      } else {
        await dispatch(
          updateExistingCourse({
            id: selectedCourse._id,
            courseData,
            token: localStorage.getItem("token"),
          })
        ).unwrap();
        toast.success("Masterclass updated successfully!");
      }
      setIsModalOpen(false);
      setSelectedCourse(null);
      setIsEditMode(false);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || `Failed to update ${itemLabel.toLowerCase()}`);
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (course) => {
    setDeleteConfirm(course);
  };

  const confirmDelete = async () => {
    const course = deleteConfirm;
    setDeleteConfirm(null);
    try {
      if (isAcademyTab) {
        await deleteAcademy(course._id).unwrap();
      } else {
        await deleteMasterClass(course._id).unwrap();
      }
      toast.success(`${itemLabel} deleted successfully!`);
    } catch (error) {
      toast.error(
        error?.data?.message || error?.message || `Failed to delete ${itemLabel.toLowerCase()}`
      );
    }
  };

  const handleMoveCourse = async (dragIndex, hoverIndex) => {
    try {
      const newCourses = [...courses];
      const dragged = newCourses[dragIndex];
      newCourses.splice(dragIndex, 1);
      newCourses.splice(hoverIndex, 0, dragged);

      const orderedList = newCourses.map((item, idx) => ({ id: item._id, order: idx }));

      if (isAcademyTab) {
        await reorderAcademies({ strategies: orderedList }).unwrap();
      } else {
        await reorderMasterClasses({ strategies: orderedList }).unwrap();
      }

      toast.success(`${itemLabel} order updated successfully!`);
    } catch (error) {
      toast.error(error?.message || `Failed to update ${itemLabel.toLowerCase()} order`);
    }
  };

  const handleSelectCourse = (course) => {
    onCourseSelect?.(course);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card — always first */}
        <div
          onClick={openCreateModal}
          className="rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors duration-200"
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[180px]">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              Create New {itemLabel}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Start building your {itemLabel.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Existing Cards */}
        {courses?.map((course, index) => (
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
        ))}

        {/* ─── Masterclass Modal ──────────────────────────────────────────── */}
        {!isAcademyTab && (
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
        )}

        {/* ─── Academy Modal ──────────────────────────────────────────────── */}
        {isAcademyTab && (
          <CreateAcademyModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCourse(null);
              setIsEditMode(false);
            }}
            onSubmit={isEditMode ? handleUpdateCourse : undefined}
            initialData={isEditMode ? selectedCourse : undefined}
            onSwitchToMasterclass={() => {
              setIsModalOpen(false);
              onSwitchToMasterclass?.();
            }}
          />
        )}

        {/* ─── Delete Confirmation Dialog ─────────────────────────────────── */}
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
