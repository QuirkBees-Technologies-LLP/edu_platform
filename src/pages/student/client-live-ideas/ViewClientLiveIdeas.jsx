import React, { forwardRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientTradeSlider from "./ClientLiveIdeaSlider";
import { format } from "date-fns";
import { toast } from "sonner";
import EducatorImage from "./EducatorImage";
import { Link } from "react-router-dom";
import QuotedReplyPreview from "@/components/ui/QuotedReplyPreview";
import { useLazyGetLiveIdeaSingleQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { getImages } from "@/utils/mediaOrder";

const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
};

const ViewClientLiveIdeas = forwardRef(
  ({ isViewOpen, handleCloseView, selectedIdea, setIsLightBoxOpen }, ref) => {
    const [fetchLiveIdeaById] = useLazyGetLiveIdeaSingleQuery();
    const [isLoadingParent, setIsLoadingParent] = useState(false);

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
      const parentId = viewedIdea?.previousLiveIdea?._id;
      if (!parentId || isLoadingParent) return;
      setIsLoadingParent(true);
      try {
        const original = await fetchLiveIdeaById(parentId).unwrap();
        setViewedIdea(original?.data || original);
      } catch (err) {
        console.error("Failed to load original live idea", err);
        toast.error("Could not open the original post. Please try again.");
      } finally {
        setIsLoadingParent(false);
      }
    };

    return (
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
                <div className="flex items-center justify-between px-4 pb-3 pt-3">
                  <div className="mr-2 text-lg text-gray-900 font-semibold">
                    {viewedIdea?.name}
                  </div>
                  {viewedIdea?.status && (
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0 ${LabelMap[viewedIdea.status] === "Active"
                        ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                        : LabelMap[viewedIdea.status] === "Pending"
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : LabelMap[viewedIdea.status] === "Win"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : LabelMap[viewedIdea.status] === "Partial Win"
                              ? "bg-emerald-400/15 text-emerald-500 dark:text-emerald-400"
                              : LabelMap[viewedIdea.status] === "Loss"
                                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                : "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                      {LabelMap[viewedIdea.status] === "Win" && viewedIdea.pips
                        ? `WIN +${viewedIdea.pips} pips`
                        : LabelMap[viewedIdea.status] === "Loss" && viewedIdea.pips
                          ? `LOSS -${viewedIdea.pips} pips`
                          : LabelMap[viewedIdea.status]}
                    </span>
                  )}
                </div>

                {/* Follow-up thread: shows the item this one is a reply to, if any.
                    Clicking it navigates the modal to that parent (which may itself show
                    its own parent, recursing to the immediate previous item at every
                    level of the chain). */}
                {viewedIdea?.previousLiveIdea && (
                  <div className="px-4">
                    <QuotedReplyPreview
                      title={viewedIdea.previousLiveIdea.name}
                      thumbnail={viewedIdea.previousLiveIdea.image?.[0]}
                      onClick={handleOpenParent}
                      isLoading={isLoadingParent}
                    />
                  </div>
                )}

                <div className="">
                  <ClientTradeSlider
                    // Same stored order as the card this modal opened from, so the slider
                    // leads with the image the card showed.
                    sliderImages={getImages(viewedIdea)}
                    setIsLightBoxOpen={setIsLightBoxOpen}
                    selectedIdea={viewedIdea}
                  />
                </div>

                <div className="flex items-center mt-5 px-4">
                  <Link to={`/iq-educators/${viewedIdea?.educatorDetails?._id}`}>
                    <EducatorImage
                      educator={viewedIdea?.educatorDetails}
                    // defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)}
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
                <div className="flex mt-2 px-4">
                  <div className="text-2sm text-gray-700 mb-px">
                    {/* {viewedIdea?.educatorDetails?.categories
                          ? viewedIdea?.categories?.name
                          : "Category not assigned"} */}
                    {Array.isArray(viewedIdea?.educatorDetails?.categories) &&
                      viewedIdea?.educatorDetails?.categories?.length > 0
                      ? viewedIdea?.educatorDetails?.categories
                        .map((cat) => cat)
                        .join(", ")
                      : viewedIdea?.category?.name || "Category not assigned"}
                  </div>
                </div>

                {/* Description — the copy entered on the update form, shown as the post's caption */}
                {viewedIdea?.description && (
                  <div className="px-4 mt-4">
                    <div
                      className="text-2sm text-gray-800"
                      dangerouslySetInnerHTML={{ __html: viewedIdea.description }}
                    />
                  </div>
                )}

                {/* TradingView links */}
                {viewedIdea?.tradingViewLinks?.length > 0 &&
                  viewedIdea.tradingViewLinks.some((l) => l && l.trim()) && (
                    <div className="px-4 mt-4">
                      <div className="text-2sm font-semibold text-gray-800 mb-1">
                        TradingView Charts
                      </div>
                      <div className="flex flex-col gap-1">
                        {viewedIdea.tradingViewLinks
                          .filter((l) => l && l.trim())
                          .map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2sm text-primary hover:underline truncate"
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
    );
  }
);

export default ViewClientLiveIdeas;
