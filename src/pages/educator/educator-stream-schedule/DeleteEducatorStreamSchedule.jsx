import React, { forwardRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from 'sonner';
import { useDeleteEducatorMutation } from '../../../store/api/admin/adminEducatorsApiSlice';
import { useDeleteEducatorStreamScheduleMutation } from '../../../store/api/educator/EducatorStreamScheduleApiSlice';


const DeleteEducatorStreamSchedule = forwardRef(({ isDeleteOpen, handleDeleteClose, selectedRow, refetch }, ref) => {
    const [deleteEducatorStreamSchedule, { isLoading, isSuccess, isError, error }] = useDeleteEducatorStreamScheduleMutation();

    const handleDelete = async () => {
        try {
            await deleteEducatorStreamSchedule(selectedRow?._id).unwrap();
            refetch();
            toast.success("Stream schedule deleted successfully!");
            handleDeleteClose();
        } catch (error) {
            toast.error(err.data.message);
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
                    Are you sure you want to delete this item?
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

export default DeleteEducatorStreamSchedule;