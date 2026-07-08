import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { format } from "date-fns";

import { Link } from "react-router-dom";
import EducatorImage from "../client-trade-ideas/EducatorImage";
import ClientTradeSlider from "./ClientTradeSlider";


const ViewClientTradeIdeas = forwardRef(
  ({ isViewOpen, handleCloseView, selectedIdea, setIsLightBoxOpen }, ref) => {

    return (
      <Dialog
        asChild
        open={isViewOpen}
        onOpenChange={() => {
          handleCloseView();
        }}
      >
        <DialogContent forceMount className="max-w-[600px]" ref={ref}>
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
                  <ClientTradeSlider
                    sliderImages={selectedIdea?.image}
                    setIsLightBoxOpen={setIsLightBoxOpen}
                    selectedIdea={selectedIdea}
                  />
                </div>


                <div className="flex items-center justify-between py-2">
                  {/* Left side: Image + Name */}
                  <Link to={`/iq-educators/${selectedIdea?.educatorDetails?._id}`} className="flex items-center">
                    <img
                      src={selectedIdea?.educatorDetails?.image}
                      className="rounded-full size-7 me-2"
                      alt=""
                    />
                    <div className="text-2sm text-gray-800 hover:text-primary mb-px">
                      {selectedIdea?.educatorDetails?.first_name}{" "}
                      {selectedIdea?.educatorDetails?.last_name}
                    </div>
                  </Link>

                  {/* Right side: Category Name */}
                  <div className="text-2sm text-gray-800">
                    {selectedIdea?.category?.name}
                  </div>
                </div>
                {selectedIdea?.createdAt && <div>
                  <div className="text-2sm text-gray-700 mb-px">
                    {format(selectedIdea?.createdAt, "MMM dd, yyyy, hh:mm a")}
                  </div>
                </div>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default ViewClientTradeIdeas;
