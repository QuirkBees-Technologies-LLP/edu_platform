import { forwardRef, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, AlertTriangle, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Store
import {
  useCreateEducatorAcademyMutation,
  useUpdateEducatorAcademyMutation,
  useCreateEducatorMasterClassMutation,
} from "@/store/api/educator/educatorMasterClassApiSlice";

// Components
import AcademyForm from "./forms/AcademyForm";

// ─── Duplicate Confirmation Modal ──────────────────────────────────────────
const DuplicateConfirmModal = ({
  isOpen,
  errorMessage,
  existingTitle,
  onConvertToMasterclass,
  onCancel,
  isConverting,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="p-0 max-w-[460px] overflow-hidden border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Academy Already Exists
            </h3>
          </div>
          <p className="text-sm dark:text-white text-gray-500 dark:text-gray-400 ml-[42px]">
            {errorMessage}
          </p>
        </div>

        {/* Body */}


        {/* Actions */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 flex gap-2.5 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConverting}
            className="px-4 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConvertToMasterclass}
            disabled={isConverting}
            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                Convert to Masterclass
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Modal ────────────────────────────────────────────────────────────
const CreateAcademyModal = forwardRef(
  ({ isOpen, onClose, initialData, onSwitchToMasterclass }, ref) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    // Duplicate state
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateErrorMsg, setDuplicateErrorMsg] = useState("");
    const [duplicateExistingTitle, setDuplicateExistingTitle] = useState("");
    const [pendingFormData, setPendingFormData] = useState(null);

    const [createAcademy] = useCreateEducatorAcademyMutation();
    const [updateAcademy] = useUpdateEducatorAcademyMutation();
    const [createMasterClass] = useCreateEducatorMasterClassMutation();

    if (!isOpen && !showDuplicateModal) return null;

    const dialogTitle = initialData ? "Edit Academy" : "Create New Academy";

    const handleSubmit = async (formData) => {
      setIsSubmitting(true);
      setShowDuplicateModal(false);
      try {
        if (initialData) {
          await updateAcademy({ id: initialData._id, formData }).unwrap();
          toast.success("Academy updated successfully!");
        } else {
          await createAcademy(formData).unwrap();
          toast.success("Academy created successfully!");
        }
        onClose();
      } catch (error) {
        console.error("Academy submission error:", error);

        // Duplicate academy → show confirmation modal with convert option
        if (error?.status === 409 || error?.data?.code === "ACADEMY_DUPLICATE") {
          setPendingFormData(formData);
          setDuplicateErrorMsg(
            error?.data?.message ||
            "An academy already exists for this language and category."
          );
          setDuplicateExistingTitle(error?.data?.existingAcademyTitle || "");
          setShowDuplicateModal(true);
          return;
        }

        toast.error(
          error?.data?.message ||
          (typeof error === "string" ? error : error?.message) ||
          "Operation failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    // Convert the pending form data to a masterclass
    const handleConvertToMasterclass = async () => {
      if (!pendingFormData) return;

      setIsConverting(true);
      try {
        // Clone the FormData and change the academy flags to masterclass flags
        const mcFormData = new FormData();
        for (const [key, value] of pendingFormData.entries()) {
          if (key === "isAcademy") {
            mcFormData.append("isAcademy", "false");
          } else if (key === "isMasterClass") {
            mcFormData.append("isMasterClass", "true");
          } else {
            mcFormData.append(key, value);
          }
        }

        // Ensure flags are set even if not in original form
        if (!mcFormData.has("isAcademy")) mcFormData.append("isAcademy", "false");
        if (!mcFormData.has("isMasterClass")) mcFormData.append("isMasterClass", "true");

        await createMasterClass(mcFormData).unwrap();
        toast.success("Masterclass created successfully!");

        // Cleanup
        setShowDuplicateModal(false);
        setPendingFormData(null);
        setDuplicateErrorMsg("");
        setDuplicateExistingTitle("");
        onClose();

        // Switch to masterclass tab so they can see it
        if (onSwitchToMasterclass) onSwitchToMasterclass();
      } catch (error) {
        console.error("Convert to masterclass error:", error);
        toast.error(
          error?.data?.message ||
          error?.message ||
          "Failed to create masterclass. Please try again."
        );
      } finally {
        setIsConverting(false);
      }
    };

    const handleDuplicateCancel = () => {
      setShowDuplicateModal(false);
      setPendingFormData(null);
      setDuplicateErrorMsg("");
      setDuplicateExistingTitle("");
    };

    return (
      <>
        {/* Main Academy Form Dialog */}
        <Dialog
          open={isOpen && !showDuplicateModal}
          onOpenChange={() => {
            setShowDuplicateModal(false);
            setPendingFormData(null);
            onClose();
          }}
        >
          <DialogContent className="p-5 max-w-[1100px] max-h-[90vh] overflow-y-auto" ref={ref}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <GraduationCap className="w-5 h-5 text-primary" />
                {dialogTitle}
              </DialogTitle>
            </DialogHeader>

            <AcademyForm
              key={initialData ? `edit-academy-${initialData._id}` : "create-academy"}
              onSubmit={handleSubmit}
              initialData={initialData}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Duplicate Confirmation Modal */}
        <DuplicateConfirmModal
          isOpen={showDuplicateModal}
          errorMessage={duplicateErrorMsg}
          existingTitle={duplicateExistingTitle}
          onConvertToMasterclass={handleConvertToMasterclass}
          onCancel={handleDuplicateCancel}
          isConverting={isConverting}
        />
      </>
    );
  }
);

CreateAcademyModal.displayName = "CreateAcademyModal";

export default CreateAcademyModal;
