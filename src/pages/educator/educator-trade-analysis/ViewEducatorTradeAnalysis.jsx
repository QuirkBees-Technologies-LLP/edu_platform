import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import EducatorTradeAnalysisSlider from "./EducatorTradeAnalysisSlider";

const ViewEducatorTradeAnalysis = forwardRef(
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
                    <EducatorTradeAnalysisSlider
                      sliderImages={selectedIdea?.image}
                      setIsLightBoxOpen={setIsLightBoxOpen}
                      selectedIdea={selectedIdea}
                    />
                  </div>
                  <div className="grid gap-5 p-5">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12">
                        {/* <div className="flex flex-col gap-2 py-4.5">
                                              <div className="flex gap-5 sm:gap-10 flex-wrap">
                                                  <div className='flex items-center gap-3'>
                                                      <div className="text-xs text-gray-800 uppercase">Entry</div>
                                                      <span class="mt-1 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">{selectedIdea?.entry ?? "-"}</span>
                                                  </div>
                                                  <div className='flex items-center gap-3'>
                                                      <div className="text-2sm text-gray-800 uppercase">Invalidation</div>
                                                      <span class="mt-1 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">{selectedIdea?.invalidation ?? "-"}</span>
                                                  </div>
                                              </div>
                                              <div>
                                                  <div className="text-2sm text-gray-800 uppercase mb-3">Exits</div>
                                                  <div className="flex items-center flex-wrap gap-2">
                                                      {selectedIdea?.exits?.length > 0 && selectedIdea?.exits?.map((exit, index) => (
                                                          <div key={index} className="flex items-center gap-2 mt-1">
                                                              <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">{index + 1}</div>
                                                              <div className="text-sm text-gray-900 font-semibold">{exit}</div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          </div> */}
                      </div>
                      {/* <div className="col-span-12">
                        <div className="card">
                          <div className="flex flex-col gap-4 px-5 py-4.5">
                            <div className="flex flex-col gap-3">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selectedIdea?.message ?? "-",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                  <div className="flex items-center py-5">
                    <img
                      src="/media/avatars/300-6.png"
                      className="rounded-full size-7 me-2"
                      alt=""
                    />
                    <div>
                      <a
                        className="text-2sm text-gray-800 hover:text-primary mb-px"
                        href="/public-profile/profiles/nft"
                      >
                        {selectedIdea?.createdBy?.first_name} {selectedIdea?.createdBy?.last_name}
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
export default ViewEducatorTradeAnalysis;
