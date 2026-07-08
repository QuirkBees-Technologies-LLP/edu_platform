import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientTradeSlider from "./ClientTradeSlider";
import { format } from "date-fns";
import EducatorImage from "./EducatorImage";
import { Link } from "react-router-dom";

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

                <div className="flex items-center mt-5">
                  <Link to={`/iq-educators/${selectedIdea?.educatorDetails?._id}`}>
                    <EducatorImage
                      educator={selectedIdea?.educatorDetails}
                    // defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)}
                    />
                  </Link>
                  <div className="">
                    <Link
                      to={`/iq-educators/${selectedIdea?.educatorDetails?._id}`}
                      className="text-2sm text-gray-800 hover:text-primary mb-px"
                    >
                      {selectedIdea?.educatorDetails?.first_name}{" "}
                      {selectedIdea?.educatorDetails?.last_name}
                    </Link>
                  </div>
                </div>
                <div className="flex mt-2">
                  <div className="text-2sm text-gray-700 mb-px">
                    {/* {selectedIdea?.educatorDetails?.categories
                          ? selectedIdea?.categories?.name
                          : "Category not assigned"} */}
                    {Array.isArray(selectedIdea?.educatorDetails?.categories) &&
                      selectedIdea?.educatorDetails?.categories?.length > 0
                      ? selectedIdea?.educatorDetails?.categories
                        .map((cat) => cat)
                        .join(", ")
                      : "Category not assigned"}
                  </div>
                </div>
                {/* <div className="border-1 border-solid border-current bg-gray-100 px-5 py-3 mt-5">
                   
                  </div> */}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default ViewClientTradeIdeas;
