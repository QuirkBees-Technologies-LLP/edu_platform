import React, { forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { useDeleteTaskMutation } from "../../../store/api/admin/adminTaskManagementApiSlice";

const DeleteTask = forwardRef(
  ({ isDeleteOpen, handleDeleteClose, selectedTask, refetch }, ref) => {
    const [deleteTask, { isLoading }] = useDeleteTaskMutation();

    const handleDelete = async () => {
      try {
        await deleteTask(selectedTask?._id || selectedTask?.id).unwrap();
        toast.success("Task deleted successfully!");
        refetch?.();
        handleDeleteClose();
      } catch (err) {
        console.error("Delete error:", err);
        toast.error(err?.data?.message || "Failed to delete task");
      }
    };

    return (
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open) handleDeleteClose();
        }}
      >
        <DialogContent className="p-5 max-w-[500px]" ref={ref}>
          <VisuallyHidden>
            <DialogTitle>Delete Task</DialogTitle>
          </VisuallyHidden>

          <div className="text-center">
            <i className="ki-filled text-3xl ki-trash text-gray-500 mb-3.5 mx-auto"></i>
          </div>

          <p className="mb-4 text-gray-700 text-center">
            Are you sure you want to delete{" "}
            {/* <span className="font-semibold text-gray-800">
              {selectedTask?.title || "this task"}
            </span> */}
            ?
          </p>

          <div className="flex justify-center items-center space-x-4">
            <button
              className="btn btn-light"
              onClick={handleDeleteClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger disabled:opacity-60"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Yes, I'm sure"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default DeleteTask;
