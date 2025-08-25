import React, { forwardRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { deleteEducatorPost } from '@/store/reducer/postSlice';

const DeletePostDialog = forwardRef(({ isDeleteOpen, handleDeleteClose, selectedPost, refetch }, ref) => {
    const dispatch = useDispatch();

    const handleDelete = async () => {
        try {
            await dispatch(deleteEducatorPost(selectedPost?.id)).unwrap();
            if (refetch) refetch();
            toast.success("Post deleted successfully!");
            handleDeleteClose();
        } catch (error) {
            console.error('Failed to delete post:', error);
            toast.error(error?.message || "Failed to delete post");
        }
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={() => {
            handleDeleteClose();
        }}>
            <DialogContent className="p-4 max-w-md w-full mx-4 my-8" ref={ref}>
                <VisuallyHidden>
                    <DialogTitle>Hidden Title</DialogTitle>
                </VisuallyHidden>
                <div className="text-center">
                    <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
                </div>
                {/* Modal Text */}
                <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
                    Are you sure you want to delete this post?
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
                    >
                        Yes, I'm sure
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
});

export default DeletePostDialog;
