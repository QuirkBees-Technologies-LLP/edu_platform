import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// Store
import {
  updateExistingCourse,
  deleteExistingCourse,
  reorderCourses,
  reorderStrategies,
  selectAllCourses,
  fetchStrategies,
  fetchMasterClasses,
} from "@/store/reducer/courseSlice";
import { selectSelectedLanguagesAdmin } from "@/store/reducer/studentLanagugeSlice";
import { useDeleteAdminStrategyMutation } from "@/store/api/admin/adminStrategyApiSlice";
import {
  useCreateAdminMasterClassMutation,
  useUpdateAdminMasterClassMutation,
  useDeleteAdminMasterClassMutation,
} from "@/store/api/admin/adminMasterClassApiSlice";

// Components
import CreateCourseModal from "./CreateCourseModal";
import DraggableCourseCard from "./DraggableCourseCard";
import MasterClassForm from "./forms/MasterClassForm";

const CourseList = ({ onCourseSelect, activeTab }) => {
  const dispatch = useDispatch();
  const courses = useSelector(selectAllCourses);
  const selectedLanguage = useSelector(selectSelectedLanguagesAdmin);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMCModalOpen, setIsMCModalOpen] = useState(false);
  const [selectedMC, setSelectedMC] = useState(null);
  const [isMCEditMode, setIsMCEditMode] = useState(false);

  // RTK Query mutations for strategies
  const [deleteStrategy] = useDeleteAdminStrategyMutation();

  // RTK Query mutations for master classes
  const [createMasterClass, { isLoading: isCreatingMC }] = useCreateAdminMasterClassMutation();
  const [updateMasterClass, { isLoading: isUpdatingMC }] = useUpdateAdminMasterClassMutation();
  const [deleteMasterClass] = useDeleteAdminMasterClassMutation();

  // ─── Course Handlers ─────────────────────────────────────────────────────
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

  const handleDeleteCourse = async (course) => {
    const itemType = activeTab === "strategies" ? "Strategy" : "Course";
    if (window.confirm(`Are you sure you want to delete "${course?.title}"? This action cannot be undone.`)) {
      try {
        if (activeTab === "strategies") {
          await deleteStrategy(course?._id).unwrap();
          dispatch(fetchStrategies({ params: { isDeleted: false, ...(selectedLanguage?.length > 0 ? { language: selectedLanguage.join(',') } : {}) }, token: localStorage.getItem("token") }));
        } else {
          await dispatch(
            deleteExistingCourse({ id: course?._id, token: localStorage.getItem("token") })
          ).unwrap();
        }
        toast.success(`${itemType} deleted successfully!`);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || `Failed to delete ${itemType.toLowerCase()}`);
      }
    }
  };

  const handleMoveCourse = async (dragIndex, hoverIndex) => {
    try {
      const newCourses = [...courses];
      const draggedCourse = newCourses[dragIndex];
      newCourses.splice(dragIndex, 1);
      newCourses.splice(hoverIndex, 0, draggedCourse);

      const courseOrders = newCourses?.map((course, index) => ({
        id: course?._id,
        order: index,
      }));

      const strategyAction = activeTab === "courses" ? reorderCourses : reorderStrategies;
      const payloadKey = activeTab === "courses" ? "courses" : "strategies";

      const result = await dispatch(
        strategyAction({ [payloadKey]: courseOrders, token: localStorage.getItem("token") })
      ).unwrap();

      dispatch({ type: "courses/updateLocalOrder", payload: result });
      toast.success("Order updated successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to update order");
    }
  };

  const handleSelectCourse = (course) => {
    onCourseSelect(course);
  };

  // ─── Master Class Handlers ────────────────────────────────────────────────
  const handleCreateMC = async (formData) => {
    try {
      await createMasterClass(formData).unwrap();
      toast.success("Master Class created successfully!");
      setIsMCModalOpen(false);
      dispatch(fetchMasterClasses({ params: {}, token: localStorage.getItem("token") }));
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to create Master Class");
    }
  };

  const handleUpdateMC = async (formData) => {
    if (!selectedMC) return;
    try {
      await updateMasterClass({ id: selectedMC?._id, formData }).unwrap();
      toast.success("Master Class updated successfully!");
      setIsMCModalOpen(false);
      setSelectedMC(null);
      setIsMCEditMode(false);
      dispatch(fetchMasterClasses({ params: {}, token: localStorage.getItem("token") }));
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to update Master Class");
    }
  };

  const handleEditMC = (course) => {
    setSelectedMC(course);
    setIsMCEditMode(true);
    setIsMCModalOpen(true);
  };

  const handleDeleteMC = async (course) => {
    if (window.confirm(`Are you sure you want to delete "${course?.title}"? This action cannot be undone.`)) {
      try {
        await deleteMasterClass(course?._id).unwrap();
        toast.success("Master Class deleted successfully!");
        dispatch(fetchMasterClasses({ params: {}, token: localStorage.getItem("token") }));
      } catch (error) {
        toast.error(error?.data?.message || error?.message || "Failed to delete Master Class");
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/** Create New Card — always first */}
        <div
          onClick={() => {
            if (activeTab === "master-class") {
              setIsMCEditMode(false);
              setSelectedMC(null);
              setIsMCModalOpen(true);
            } else {
              setIsEditMode(false);
              setSelectedCourse(null);
              setIsModalOpen(true);
            }
          }}
          className="rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors duration-200"
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[180px]">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              Create New {activeTab === "courses" ? "Academy" : activeTab === "strategies" ? "Strategy" : "Master Class"}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Start building your {activeTab === "courses" ? "Academy" : activeTab === "strategies" ? "Strategy" : "Master Class"}
            </p>
          </div>
        </div>

        {/** Course / Strategy / Master Class Cards */}
        {courses?.map((course, index) => (
          <div key={course?._id} className="relative group">
            <DraggableCourseCard
              course={course}
              index={index}
              onEdit={activeTab === "master-class" ? handleEditMC : handleEditCourse}
              onDelete={activeTab === "master-class" ? handleDeleteMC : handleDeleteCourse}
              onMove={activeTab === "master-class" ? undefined : handleMoveCourse}
              onSelect={handleSelectCourse}
              activeTab={activeTab}
            />
          </div>
        ))}

        {/** Modal for Course/Strategy */}
        {activeTab !== "master-class" && (
          <CreateCourseModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCourse(null);
              setIsEditMode(false);
            }}
            onSubmit={isEditMode ? handleUpdateCourse : undefined}
            initialData={isEditMode ? selectedCourse : undefined}
            activeTab={activeTab}
          />
        )}

        {/** Modal for Master Class */}
        {activeTab === "master-class" && isMCModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsMCModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-[#1a1c23] rounded-2xl shadow-2xl w-full max-w-6xl min-h-[90vh] max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {isMCEditMode ? "Edit Master Class" : "Create Master Class"}
                </h2>
                <button
                  onClick={() => {
                    setIsMCModalOpen(false);
                    setSelectedMC(null);
                    setIsMCEditMode(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {/* Form */}
              <div className="px-6">
                <MasterClassForm
                  onSubmit={isMCEditMode ? handleUpdateMC : handleCreateMC}
                  initialData={isMCEditMode ? selectedMC : undefined}
                  isLoading={isCreatingMC || isUpdatingMC}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default CourseList;
