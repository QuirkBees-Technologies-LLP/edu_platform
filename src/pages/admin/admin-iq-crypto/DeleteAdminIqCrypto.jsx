import React, { forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { useDeleteAdminCryptoAnalysisMutation } from "../../../store/api/admin/adminCryptoAnalysisApiSlice";
import { set } from "date-fns";

// Delete eductor trade idea

const DeleteAdminIqCrypto = forwardRef(
  (
    { isDeleteOpen, handleDeleteClose, setSelectedRow, selectedRow, refetch },
    ref
  ) => {
    const [DeleteCryptoAnalysis, { isLoading, isSuccess, isError, error }] =
      useDeleteAdminCryptoAnalysisMutation();

    const handleDelete = async () => {
      try {
        await DeleteCryptoAnalysis(selectedRow?._id).unwrap();
        refetch();
        toast.success("IQ Crypto deleted successfully!");

        setSelectedRow({});
        handleDeleteClose();
      } catch (err) {
        toast.error(err?.data?.message || "Delete failed");
      }
    };

    return (
      <Dialog
        open={isDeleteOpen}
        onOpenChange={() => {
          setSelectedRow({});
          handleDeleteClose();
        }}
      >
        <DialogContent className="p-5 max-w-[500px]" ref={ref}>
          <VisuallyHidden>
            <DialogTitle>Hidden Title</DialogTitle>
          </VisuallyHidden>
          <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          {/* Modal Text */}
          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to delete this item?
          </p>
          {/* Action Buttons */}
          <div className="flex justify-center items-center space-x-4">
            <button
              className="btn btn-light"
              onClick={() => {
                setSelectedRow({});
                handleDeleteClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              onClick={() => {
                setSelectedRow({});
                handleDelete();
              }}
              disabled={isLoading}
            >
              Yes, I'm sure
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default DeleteAdminIqCrypto;
