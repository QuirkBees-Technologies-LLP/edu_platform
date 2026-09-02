import React, { forwardRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { format } from "date-fns";
import StudentIqSlider from "./StudentIqSlider";
import EducatorImage from "../client-trade-ideas/EducatorImage";
import { Link } from "react-router-dom";
import { getEmbedUrl } from "@/utils/videoUtils";
import { getOrderedImageUrls } from "@/utils/mediaOrder";

const ViewInsightTradeIdeas = forwardRef(
  ({ isViewOpen, handleCloseView, selectedIdea, setIsLightBoxOpen }, ref) => {
    const [dyntubeModalOpen, setDyntubeModalOpen] = useState(false);

    // Educator-chosen display order (Task 14). The slider itself only ever holds
    // image/TradingView-snapshot slides (getOrderedImageUrls already interleaves those
    // two correctly) — the DynTube video isn't a slide here, it's its own block, so the
    // one more thing "order" can express at this level is whether that block appears
    // above or below the slider.
    const orderedImages = getOrderedImageUrls(selectedIdea);
    const mediaOrder =
      selectedIdea?.mediaOrder?.length > 0
        ? selectedIdea.mediaOrder
        : ["image", "tradingview", "dyntube"];
    const dyntubeIndex = mediaOrder.indexOf("dyntube");
    const firstImageGroupIndex = Math.min(
      ...["image", "tradingview"]
        .map((key) => mediaOrder.indexOf(key))
        .filter((idx) => idx !== -1)
    );
    const dyntubeFirst =
      dyntubeIndex !== -1 &&
      (firstImageGroupIndex === -1 || dyntubeIndex < firstImageGroupIndex);

    const sliderBlock = orderedImages.length > 0 && (
      <div className="">
        <StudentIqSlider
          sliderImages={orderedImages}
          setIsLightBoxOpen={setIsLightBoxOpen}
          selectedIdea={selectedIdea}
        />
      </div>
    );

    const dyntubeBlock = selectedIdea?.dyntubeUrl && (
      <div className="px-4 mt-3">
        <div
          className="relative w-full rounded-xl overflow-hidden bg-black cursor-pointer group"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setDyntubeModalOpen(true)}
        >
          <iframe
            src={getEmbedUrl(selectedIdea.dyntubeUrl)}
            className="w-full h-full"
            loading="lazy"
            tabIndex={-1}
            scrolling="no"
            style={{ pointerEvents: 'none', border: 'none', overflow: 'hidden' }}
            title="DynTube Video"
          />
        </div>
      </div>
    );

    return (
      <>
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
                  {dyntubeFirst ? (
                    <>
                      {dyntubeBlock}
                      {sliderBlock}
                    </>
                  ) : (
                    <>
                      {sliderBlock}
                      {dyntubeBlock}
                    </>
                  )}

                  <div className="flex items-center">
                    <Link to={`/iq-educators/${selectedIdea?.educatorDetails?._id}`}>
                      <EducatorImage
                        educator={selectedIdea?.educatorDetails}
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
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* DynTube Video Modal */}
        {selectedIdea?.dyntubeUrl && (
          <Dialog open={dyntubeModalOpen} onOpenChange={setDyntubeModalOpen}>
            <DialogContent
              className="max-w-5xl w-full p-0 !overflow-hidden bg-black border-gray-800 !max-h-[85vh] flex flex-col"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DialogHeader className="px-5 pt-4 pb-2 shrink-0">
                <DialogTitle className="text-white text-lg font-semibold truncate pr-8">
                  Video
                </DialogTitle>
                <DialogDescription className="sr-only">
                  DynTube video player
                </DialogDescription>
              </DialogHeader>
              <div className="w-full flex-1 min-h-0 p-4 pt-0">
                <div className="aspect-video w-full h-full max-h-full">
                  {dyntubeModalOpen && (
                    <iframe
                      src={getEmbedUrl(selectedIdea.dyntubeUrl)}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="DynTube Video Player"
                      style={{ border: 'none' }}
                    />
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
);

export default ViewInsightTradeIdeas;

