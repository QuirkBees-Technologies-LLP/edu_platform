import React, { forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { useDeletePackageMutation } from "../../../store/api/admin/adminPackageApiSlice";

const DeletePackage = forwardRef(
  ({ isDeleteOpen, handleDeleteClose, selectedRow, refetch }, ref) => {
    const [deletePackage, { isLoading: isDeleting }] =
      useDeletePackageMutation();

    const handleDelete = async () => {
      try {
        if (!selectedRow?._id) {
          toast.error("Invalid package ID");
          return;
        }

        const res = await deletePackage(selectedRow._id).unwrap();
        toast.success(res?.message || "Package deleted successfully!");

        refetch?.();
        handleDeleteClose();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error?.data?.message || "Failed to delete package.");
      }
    };

    return (
      <Dialog
        open={isDeleteOpen}
        onOpenChange={() => {
          handleDeleteClose();
        }}
      >
        <DialogContent className="p-5 max-w-[500px]" ref={ref}>
          <VisuallyHidden>
            <DialogTitle>Delete Package</DialogTitle>
          </VisuallyHidden>

          <div className="text-center">
            <i className="ki-filled text-3xl ki-trash text-gray-500 mb-3.5 mx-auto"></i>
          </div>

          <p className="mb-4 text-gray-700 text-center">
            Are you sure you want to delete this package?
          </p>

          <div className="flex justify-center items-center space-x-4">
            <button
              className="btn btn-light"
              onClick={handleDeleteClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, I'm sure"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default DeletePackage;
