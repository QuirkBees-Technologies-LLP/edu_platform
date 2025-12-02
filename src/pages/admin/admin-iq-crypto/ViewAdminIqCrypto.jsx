import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import ShowMoreLess from "../../../components/ui/showmoreless";
import AdminIqCryptoSlider from "./AdminIqCryptoSlider";

const ViewAdminIqCrypto = forwardRef(
  ({ isViewOpen, handleCloseView, selectedIdea, setIsLightBoxOpen }, ref) => {
    return (
      <Dialog
        asChild
        open={isViewOpen}
        onOpenChange={() => {
          handleCloseView();
        }}
      >
        <DialogContent forceMount className="max-w-[800px]" ref={ref}>
          <DialogHeader className="sr-only">
            <DialogTitle className="sr-only">text</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex items-center px-4 pb-3 pt-3">
                  <div className="mr-2 text-lg text-gray-900 font-semibold">
                    {selectedIdea?.name}
                  </div>
                </div>
                <div className="">
                  <AdminIqCryptoSlider
                    sliderImages={selectedIdea?.image}
                    setIsLightBoxOpen={setIsLightBoxOpen}
                    selectedIdea={selectedIdea}
                  />
                </div>
                <div className="grid gap-5 p-5">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12"></div>
                    <div className="col-span-12">
                      <ShowMoreLess
                        className="text-gray-900 text-sm mt-2 leading-relaxed"
                        html={selectedIdea?.description || "No description"}
                        limit={95}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-5">
                  <img
                    src={selectedIdea?.image}
                    className="rounded-full size-7 me-2"
                    alt=""
                  />
                  <div>
                    <a
                      className="text-2sm text-gray-800 hover:text-primary mb-px"
                      href="#"
                    >
                      {selectedIdea?.createdBy?.first_name}{" "}
                      {selectedIdea?.createdBy?.last_name}
                    </a>
                    {selectedIdea?.createdAt && (
                      <div className="text-2sm text-gray-700 mb-px">
                        {format(
                          selectedIdea?.createdAt,
                          "MMM dd, yyyy, hh:mm a"
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
export default ViewAdminIqCrypto;
