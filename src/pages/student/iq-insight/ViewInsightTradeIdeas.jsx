import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import StudentIqSlider from "./StudentIqSlider";
import EducatorImage from "../client-trade-ideas/EducatorImage";
import { Link } from "react-router-dom";

const ViewInsightTradeIdeas = forwardRef(
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
                {/* <div className="flex px-4">
                                <div className="mr-2 mb-3 text-md text-gray-900 font-semibold">Buy</div>
                                <div className="mr-2 mb-3 text-md text-gray-900 font-semibold">•</div>
                                <div className="mr-2 mb-3 text-md text-gray-900 font-semibold">5m</div>
                                <div className="mr-2 mb-3 text-md text-gray-900 font-semibold">•</div>
                                <div className="mr-2 mb-3 text-md text-gray-900 font-semibold">Scalp</div>
                            </div> */}
                <div className="">
                  <StudentIqSlider
                    sliderImages={selectedIdea?.image}
                    setIsLightBoxOpen={setIsLightBoxOpen}
                    selectedIdea={selectedIdea}
                  />
                </div>

                <div className="flex items-center">
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
                    {selectedIdea?.category
                      ? selectedIdea?.category?.name
                      : "-"}
                  </div>
                </div>
                {/* TradingView Links */}
                {selectedIdea?.tradingViewLinks?.length > 0 && selectedIdea.tradingViewLinks.some(l => l && l.trim()) && (
                  <div className="px-4 mt-3">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1.5">TradingView Charts</div>
                    <div className="flex flex-col gap-1">
                      {selectedIdea.tradingViewLinks.filter(l => l && l.trim()).map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          📈 {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {/* <div className="grid gap-5 p-5">
                  <div className="grid grid-cols-12 gap-4">
                    {(selectedIdea?.description || selectedIdea?.message) && (
                      <div className="col-span-12">
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: selectedIdea?.description || selectedIdea?.message || "" }}
                        />
                      </div>
                    )}
                  </div>
                </div> */}
                {/* <div className="flex items-center p-5">
                                <img src="/media/avatars/300-6.png" className="rounded-full size-7 me-2" alt="" />
                                <div>
                                    <a className="text-2sm text-gray-800 hover:text-primary mb-px" href="/public-profile/profiles/nft">{selectedIdea?.educatorDetails?.name}</a>
                                    {selectedIdea?.createAt && <div className="text-2sm text-gray-700 mb-px">{format(selectedIdea?.createAt, "MMM dd, yyyy, hh:mm a")}</div>}
                                </div>
                            </div> */}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default ViewInsightTradeIdeas;
