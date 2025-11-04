import React, { forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { useDeleteAdminMutation } from "../../../store/api/admin/superAdminApiSlice";

const DeleteAdmin = forwardRef(
  ({ isDeleteOpen, handleDeleteClose, selectedRow, refetch }, ref) => {
    const [deleteAdmin, { isLoading }] = useDeleteAdminMutation();

    const handleDelete = async () => {
      try {
        await deleteAdmin(selectedRow?._id).unwrap();
        toast.success("Admin deleted successfully!");
        refetch?.();
        handleDeleteClose();
      } catch (err) {
        const message =
          err?.data?.message || "Failed to delete admin. Please try again.";
        toast.error(message);
        console.error("Delete admin error:", err);
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
            <DialogTitle>Delete Admin</DialogTitle>
          </VisuallyHidden>

          <div className="text-center">
            <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          </div>

          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to delete{" "}
            <strong>{selectedRow?.name || "this admin"}</strong>?
          </p>

          <div className="flex justify-center items-center space-x-4">
            <button
              className="btn btn-light"
              onClick={() => {
                handleDeleteClose();
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

DeleteAdmin.displayName = "DeleteAdmin";
export default DeleteAdmin;
