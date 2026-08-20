import React from "react";
import { Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Post-submit prompt asking whether to share the update as a social post.
const SocialPostPrompt = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-6 max-w-[400px] text-center">
        <VisuallyHidden>
          <DialogTitle>Share to Social</DialogTitle>
        </VisuallyHidden>

        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Share2 className="size-6 text-primary" />
        </div>

        <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-gray-50">
          Share this update?
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Do you want to send a social post about it?
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="btn btn-light min-w-[100px]"
            onClick={onClose}
          >
            No
          </button>
          <button
            type="button"
            className="btn btn-primary min-w-[100px]"
            onClick={onConfirm}
          >
            Yes, post it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialPostPrompt;
