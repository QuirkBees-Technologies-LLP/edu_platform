import React, { forwardRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from 'sonner';
import { useDeleteEducatorMutation } from '../../../store/api/admin/adminEducatorsApiSlice';
import { useDeleteEducatorRecordingMutation } from '../../../store/api/educator/educatorRecordingApiSlice';


const DeleteEducatorRecording = forwardRef(({ isDeleteOpen, handleDeleteClose, selectedRow, refetch}, ref) => {
    const [deleteEducatorRecording, { isLoading, isSuccess, isError, error }] = useDeleteEducatorRecordingMutation();

  

    const handleDelete = async () => {
        try {
            await deleteEducatorRecording(selectedRow?._id).unwrap();
            toast.success("Recording deleted successfully!");
            handleDeleteClose();
            refetch();
        } catch (error) {
              toast.error(err?.data?.message || "Failed to delete recording!");
        }
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={() => {
            handleDeleteClose();
        }}>
            <DialogContent className="p-5 max-w-[500px]" ref={ref}>
                <VisuallyHidden>
                    <DialogTitle>Hidden Title</DialogTitle>
                </VisuallyHidden>
                <div className="text-center">
                <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>

                </div>
                {/* Modal Text */}
                <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
                    Are you sure you want to delete this recording?
                </p>
                {/* Action Buttons */}
                <div className="flex justify-center items-center space-x-4">
                    <button className='btn btn-light' onClick={() => {
                        handleDeleteClose();
                    }}>Cancel</button>
                    <button
                        type="submit"
                        className="btn btn-danger"
                        onClick={() => {
                            handleDelete();
                        }}
                        disabled={isLoading}
                    >
                        Yes, I'm sure
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
})

export default DeleteEducatorRecording;