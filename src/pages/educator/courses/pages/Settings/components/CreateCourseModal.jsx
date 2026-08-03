import { forwardRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Store
import {
  useCreateEducatorMasterClassMutation,
  useUpdateEducatorMasterClassMutation,
} from "@/store/api/educator/educatorMasterClassApiSlice";

// Components
import StrategyForm from "./forms/StrategyForm";
import { useAuthContext } from "../../../../../../auth/useAuthContext";

const CreateCourseModal = forwardRef(
  ({ isOpen, onClose, onSubmit, initialData }, ref) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { auth } = useAuthContext();
    const isAdmin =
      auth?.user?.role === "admin" || auth?.user?.role === "super_admin";

    const [createMasterClass] = useCreateEducatorMasterClassMutation();
    const [updateMasterClass] = useUpdateEducatorMasterClassMutation();

    if (!isOpen) return null;

    const dialogTitle = initialData ? "Edit Masterclass" : "Create New Masterclass";

    const handleSubmit = async (formData) => {
      setIsSubmitting(true);
      try {
        if (initialData) {
          await updateMasterClass({ id: initialData._id, formData }).unwrap();
        } else {
          await createMasterClass(formData).unwrap();
        }

        toast.success(
          initialData
            ? "Masterclass updated successfully!"
            : "Masterclass created successfully!"
        );
        onClose();
        // Automatic refetching via RTK Query tag invalidation handles list updates
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(
          error?.data?.message ||
            (typeof error === "string" ? error : error?.message) ||
            "Operation failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          onClose();
        }}
      >
        <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <StrategyForm
            key={initialData ? `edit-${initialData._id}` : "create"}
            onSubmit={handleSubmit}
            initialData={initialData}
            isSubmitting={isSubmitting}
            isAdmin={isAdmin}
          />
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreateCourseModal;
