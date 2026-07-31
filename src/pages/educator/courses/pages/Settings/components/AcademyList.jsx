import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

// Store
import {
  useDeleteEducatorAcademyMutation,
  useReorderEducatorAcademiesMutation,
} from "@/store/api/educator/educatorMasterClassApiSlice";

// Components
import DraggableCourseCard from "./DraggableCourseCard";
import CreateAcademyModal from "./CreateAcademyModal";

// ─── AcademyList ──────────────────────────────────────────────────────────
const AcademyList = ({ academies, onAcademySelect, onSwitchToMasterclass }) => {
  const [deleteAcademy] = useDeleteEducatorAcademyMutation();
  const [reorderAcademies] = useReorderEducatorAcademiesMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Edit ──────────────────────────────────────────────────────────────
  const handleEditAcademy = (academy) => {
    setSelectedAcademy(academy);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDeleteAcademy = (academy) => {
    setDeleteConfirm(academy);
  };

  const confirmDelete = async () => {
    const academy = deleteConfirm;
    setDeleteConfirm(null);
    try {
      await deleteAcademy(academy?._id).unwrap();
      toast.success("Academy deleted successfully!");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to delete academy"
      );
    }
  };

  // ── Drag-and-drop reorder (1.6) ───────────────────────────────────────
  const handleMoveAcademy = async (dragIndex, hoverIndex) => {
    try {
      const newAcademies = [...(academies || [])];
      const dragged = newAcademies[dragIndex];
      newAcademies.splice(dragIndex, 1);
      newAcademies.splice(hoverIndex, 0, dragged);

      const academyOrders = newAcademies.map((a, index) => ({
        id: a?._id,
        order: index,
      }));

      await reorderAcademies({ strategies: academyOrders }).unwrap();
      toast.success("Academy order updated!");
    } catch (error) {
      toast.error(error?.message || "Failed to update academy order");
    }
  };

  const handleSelectAcademy = (academy) => {
    onAcademySelect?.(academy);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedAcademy(null);
    setIsModalOpen(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Academy Cards */}
        {academies?.length > 0 ? (
          academies.map((academy, index) => (
            <div key={academy?._id} className="relative group">
              <DraggableCourseCard
                course={academy}
                index={index}
                onEdit={handleEditAcademy}
                onDelete={handleDeleteAcademy}
                onMove={handleMoveAcademy}
                onSelect={handleSelectAcademy}
                activeTab="academy"
              />
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <p className="text-gray-500 text-sm">No academies yet. Create your first one!</p>
            </div>
          </div>
        )}

        {/* Create New Academy Card */}
        <div
          onClick={openCreateModal}
          className="rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors duration-200"
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[180px]">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Create New Academy</h3>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Start building your academy
            </p>
          </div>
        </div>

        {/* Create/Edit Academy Modal */}
        <CreateAcademyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAcademy(null);
            setIsEditMode(false);
          }}
          initialData={isEditMode ? selectedAcademy : undefined}
          onSwitchToMasterclass={() => {
            // Notify parent to switch to masterclass tab and open create modal
            onSwitchToMasterclass?.();
          }}
        />

        {/* Delete Confirmation Modal */}
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
              <button
                className="btn btn-light"
                onClick={() => setDeleteConfirm(null)}
              >
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

export default AcademyList;
