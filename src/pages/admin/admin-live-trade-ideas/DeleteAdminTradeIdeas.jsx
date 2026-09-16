import React, { forwardRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDeleteAdminLiveTradeIdeaMutation } from '../../../store/api/admin/adminLiveTradeIdeasApiSlice';
import { toast } from 'sonner';
import { FollowUpDeleteWarning } from '@/utils/ideaThread';


const DeleteAdminTradeIdeas = forwardRef(({ isDeleteOpen, handleDeleteClose, selectedRow, refetch }, ref) => {
    const [deleteTradeIdea, { isLoading }] = useDeleteAdminLiveTradeIdeaMutation();

    const handleDelete = async () => {
        try {
            await deleteTradeIdea(selectedRow?._id).unwrap();
            refetch();
            toast.success("Trade idea deleted successfully!");
            handleDeleteClose();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete trade idea.");
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
                <div className='flex justify-center mb-3.5'>
                    <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700"></i>
                </div>
                {/* Modal Text */}
                <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
                    Are you sure you want to delete this item?
                </p>
                <FollowUpDeleteWarning />
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

export default DeleteAdminTradeIdeas;
