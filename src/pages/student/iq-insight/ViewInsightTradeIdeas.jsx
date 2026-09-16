import React, { forwardRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import StudentIqSlider from "./StudentIqSlider";
import EducatorImage from "../client-trade-ideas/EducatorImage";
import { Link } from "react-router-dom";
import { getEmbedUrl } from "@/utils/videoUtils";
import { getOrderedImageUrls } from "@/utils/mediaOrder";
import QuotedReplyPreview from "@/components/ui/QuotedReplyPreview";
import { useLazyGetTradeAnalysisByIdQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";

const ViewInsightTradeIdeas = forwardRef(
  ({ isViewOpen, handleCloseView, selectedIdea, setIsLightBoxOpen }, ref) => {
    const [dyntubeModalOpen, setDyntubeModalOpen] = useState(false);
    const [isLoadingParent, setIsLoadingParent] = useState(false);
    const [fetchTradeAnalysisById] = useLazyGetTradeAnalysisByIdQuery();

    // Which item the modal is currently showing — starts as the item it was opened for,
    // but can navigate deeper into the follow-up thread via the parent preview below
    // (WhatsApp-style: opening B while viewing C shows A as B's own parent, and so on),
    // without closing/reopening the dialog. Reset to `selectedIdea` every time the dialog
    // opens, so a fresh open never starts mid-thread from a previous visit.
    const [viewedIdea, setViewedIdea] = useState(selectedIdea);
    useEffect(() => {
      if (isViewOpen) setViewedIdea(selectedIdea);
    }, [isViewOpen, selectedIdea]);

    const handleOpenParent = async () => {
      const parentId = viewedIdea?.previousAnalysis?._id;
      if (!parentId || isLoadingParent) return;
      setIsLoadingParent(true);
      try {
        const original = await fetchTradeAnalysisById(parentId).unwrap();
        setViewedIdea(original?.data || original);
      } catch (err) {
        console.error("Failed to load original insight", err);
        toast.error("Could not open the original post. Please try again.");
      } finally {
        setIsLoadingParent(false);
      }
    };

    // Educator-chosen display order (Task 14). The slider itself only ever holds
    // image/TradingView-snapshot slides (getOrderedImageUrls already interleaves those
    // two correctly) — the DynTube video isn't a slide here, it's its own block, so the
    // one more thing "order" can express at this level is whether that block appears
    // above or below the slider.
    const orderedImages = getOrderedImageUrls(viewedIdea);
    const mediaOrder =
      viewedIdea?.mediaOrder?.length > 0
        ? viewedIdea.mediaOrder
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
          selectedIdea={viewedIdea}
        />
      </div>
    );

    const dyntubeBlock = viewedIdea?.dyntubeUrl && (
      <div className="px-4 mt-3">
        <div
          className="relative w-full rounded-xl overflow-hidden bg-black cursor-pointer group"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setDyntubeModalOpen(true)}
        >
          <iframe
            src={getEmbedUrl(viewedIdea.dyntubeUrl)}
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
          <DialogContent
            forceMount
            className="max-w-[600px]"
            ref={ref}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="sr-only">
              <DialogTitle className="sr-only">text</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 px-0">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <div className="flex items-center px-4 pb-3 pt-3">
                    <div className="mr-2 text-lg text-gray-900 font-semibold">
                      {viewedIdea?.name}
                    </div>
                  </div>
                  {/* Follow-up thread: shows the item this one is a reply to, if any.
                      Clicking it navigates the modal to that parent (which may itself show
                      its own parent, recursing to the immediate previous item at every
                      level of the chain). */}
                  {viewedIdea?.previousAnalysis && (
                    <div className="px-4">
                      <QuotedReplyPreview
                        title={viewedIdea.previousAnalysis.title}
                        thumbnail={viewedIdea.previousAnalysis.photos?.[0]}
                        onClick={handleOpenParent}
                        isLoading={isLoadingParent}
                      />
                    </div>
                  )}
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
                    <Link to={`/iq-educators/${viewedIdea?.educatorDetails?._id}`}>
                      <EducatorImage
                        educator={viewedIdea?.educatorDetails}
                      />
                    </Link>
                    <div className="">
                      <Link
                        to={`/iq-educators/${viewedIdea?.educatorDetails?._id}`}
                        className="text-2sm text-gray-800 hover:text-primary mb-px"
                      >
                        {viewedIdea?.educatorDetails?.first_name}{" "}
                        {viewedIdea?.educatorDetails?.last_name}
                      </Link>
                    </div>
                  </div>
                  <div className="flex mt-2">
                    <div className="text-2sm text-gray-700 mb-px">
                      {viewedIdea?.category
                        ? viewedIdea?.category?.name
                        : "-"}
                    </div>
                  </div>
                  {/* TradingView Links */}
                  {viewedIdea?.tradingViewLinks?.length > 0 && viewedIdea.tradingViewLinks.some(l => l && l.trim()) && (
                    <div className="px-4 mt-3">
                      <div className="text-xs text-gray-500 uppercase font-semibold mb-1.5">TradingView Charts</div>
                      <div className="flex flex-col gap-1">
                        {viewedIdea.tradingViewLinks.filter(l => l && l.trim()).map((link, idx) => (
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
        {viewedIdea?.dyntubeUrl && (
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
                      src={getEmbedUrl(viewedIdea.dyntubeUrl)}
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
