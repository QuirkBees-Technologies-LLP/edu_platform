import React, { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Copy,
  ChartLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ViewClientLiveIdeas from "../client-live-ideas/ViewClientLiveIdeas";
import ImageLightBox from "../client-live-ideas/ImageLightBox";
import { useLazyGetLiveIdeaSingleQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import QuotedReplyPreview from "@/components/ui/QuotedReplyPreview";
import ExpandableDescription from "@/components/ui/ExpandableDescription";
import { getImages } from "@/utils/mediaOrder";

const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
};

// The exact card design used on /live-ideas (ClientLiveIdeas.jsx) — reused here verbatim,
// including its real "View Details" modal and image lightbox (both from
// pages/student/client-live-ideas, the same ones /live-ideas itself uses). `liveIdea` is
// the raw Live Idea document straight from the API — untouched, no normalization.
//
// One adapter, not a data transform: this card's own source (getLiveIdeaById) populates
// the educator under `liveIdea.educatorId`, while the shared ViewClientLiveIdeas/EducatorImage
// components (built for /live-ideas' listing endpoint) read `selectedIdea.educatorDetails`.
// Renaming `liveIdea.educatorId` in place would violate "keep the original structure", so
// instead a new object carrying `educatorDetails` is built only at the point of handing data
// to that modal — the original `liveIdea` prop itself is never touched.
//
// showFollowUp: true (default) renders a follow-up live idea with the quoted-reply
// banner linking back to the original, as Educator Feed's unfiltered/mixed view wants.
// Passed false when this card is shown inside Educator Feed's own Live Ideas-only
// filter, where the data is already collapsed to each thread's latest item and should
// render with the normal (non-follow-up) design instead.
const LiveIdeaFeedCard = ({ liveIdea, showFollowUp = true }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Overrides `liveIdea` in the modal when the user opened it via "Follow-up to X" — shows
  // the ORIGINAL live idea being replied to (quote-reply style), not this card's own
  // content. Already carries `educatorDetails` (from getLiveIdeaSingle's own response
  // mapping), so unlike `liveIdea` it needs no adapter. Null means the modal shows this
  // card's own `liveIdea` as usual.
  const [modalOverride, setModalOverride] = useState(null);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [fetchLiveIdeaById] = useLazyGetLiveIdeaSingleQuery();

  const handleOpenPreviousLiveIdea = async () => {
    const previousLiveIdeaId = liveIdea?.previousLiveIdea?._id;
    if (!previousLiveIdeaId || isLoadingFollowUp) return;
    setIsLoadingFollowUp(true);
    try {
      const original = await fetchLiveIdeaById(previousLiveIdeaId).unwrap();
      setModalOverride(original?.data || original);
      setIsViewOpen(true);
    } catch (err) {
      console.error("Failed to load original live idea", err);
      toast.error("Could not open the original post. Please try again.");
    } finally {
      setIsLoadingFollowUp(false);
    }
  };

  const handleCopyField = async (fieldName, value) => {
    try {
      await navigator.clipboard.writeText(value ?? "N/A");
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const modalLiveIdea = { ...liveIdea, educatorDetails: liveIdea?.educatorId };

  // Stored order — exactly how the educator/admin arranged the images.
  const liveImages = getImages(liveIdea);

  return (
    <>
      {/* isolate: keeps this card's badge/button z-indexes from competing with sticky
          page chrome in the root stacking context. */}
      <div className="relative isolate rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35]">
        {/* Thread indicator: this live idea is a chained follow-up to a previous one.
            Clicking it opens the ORIGINAL live idea being replied to (quote-reply style),
            not this card's own content — matching a reply linking back to the message it
            quotes. */}
        {showFollowUp && liveIdea?.previousLiveIdea && (
          <QuotedReplyPreview
            title={liveIdea.previousLiveIdea.name}
            thumbnail={liveIdea.previousLiveIdea.image?.[0]}
            onClick={handleOpenPreviousLiveIdea}
            isLoading={isLoadingFollowUp}
          />
        )}
        {/* Header: pair + status — no educator name here, this is already the educator's
            own profile, so naming them on every card is redundant (kept on the general
            social feed, where posts from multiple educators mix together). */}
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="inline-flex items-center text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight min-w-0 truncate">
                {liveIdea?.name || "—"}
              </span>
              {liveIdea?.status && (
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider flex-shrink-0 whitespace-nowrap ${LabelMap[liveIdea.status] === "Active"
                    ? "text-cyan-600 dark:text-cyan-400"
                    : LabelMap[liveIdea.status] === "Pending"
                      ? "text-purple-600 dark:text-purple-400"
                      : LabelMap[liveIdea.status] === "Win"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : LabelMap[liveIdea.status] === "Partial Win"
                          ? "text-emerald-500 dark:text-emerald-400"
                          : LabelMap[liveIdea.status] === "Loss"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  {LabelMap[liveIdea.status] === "Win"
                    ? `WIN +${liveIdea.pips} pips`
                    : LabelMap[liveIdea.status] === "Loss"
                      ? `LOSS -${liveIdea.pips} pips`
                      : LabelMap[liveIdea.status]}
                </span>
              )}
            </div>

            {/* Type - Timeframe + date */}
            <div className="flex items-center justify-between gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              {(liveIdea?.type || liveIdea?.timeFrame) && (
                <span
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-extrabold flex-shrink-0 border leading-none ${liveIdea.type === "buy"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                >
                  {liveIdea.type === "buy" ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {liveIdea.type
                    ? liveIdea.type.charAt(0).toUpperCase() + liveIdea.type.slice(1).toLowerCase()
                    : ""}
                  {liveIdea.timeFrame
                    ? ` - ${Array.isArray(liveIdea.timeFrame) ? liveIdea.timeFrame.join("/") : liveIdea.timeFrame}`
                    : ""}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {liveIdea?.createdAt ? format(new Date(liveIdea.createdAt), "MMM dd, hh:mm a") : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Chart image — click opens the details modal */}
        <div
          className="-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px] cursor-pointer"
          onClick={() => {
            setModalOverride(null);
            setIsViewOpen(true);
          }}
        >
          <span className="absolute left-2 top-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize tracking-wide text-amber-600 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20">
            Live Idea
          </span>
          {liveImages.length > 0 ? (
            <>
              <img
                src={liveImages[currentIndex] || liveImages[0]}
                alt={liveIdea?.name}
                className="w-full h-[220px] object-cover object-right transition-opacity duration-300"
              />
              {/* Slider only once there's more than one image, matching the IQ Social card.
                  The arrows stop propagation so paging doesn't also open the details modal
                  this chart area opens on click. */}
              {liveImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === 0 ? liveImages.length - 1 : i - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === liveImages.length - 1 ? 0 : i + 1));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {liveImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          currentIndex === idx ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-slate-100 dark:bg-[#141422] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 opacity-40">
                <ChartLine size={28} className="text-slate-400 dark:text-slate-600" />
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600 tracking-wide">
                  No Chart Loading...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Price levels */}
        <div className="mb-2 space-y-1.5 flex-1">
          {/* Description always leads, above Entry/Invalidation/Exits — the caption reads
              first, matching the Follow-Up card layout. */}
          <ExpandableDescription html={liveIdea?.description || liveIdea?.message} />
          {liveIdea?.entry && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField("Entry", liveIdea.entry)}
            >
              <span className="text-[11px] text-slate-600 dark:text-white font-medium">Entry</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                {copiedField === "Entry" ? (
                  <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[9px]">📍</span> {liveIdea.entry}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {liveIdea?.invalidation && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField("Stop Loss", liveIdea.invalidation)}
            >
              <span className="text-[11px] text-slate-600 dark:text-white font-medium">
                Invalidation
              </span>
              <span className="text-[11px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                {copiedField === "Stop Loss" ? (
                  <span className="text-[9px] text-red-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[9px]">❌</span> {liveIdea.invalidation}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {["Exit1", "Exit2", "Exit3"].map((tpField, idx) => {
            const tpValue = liveIdea?.exits?.[idx];
            if (!tpValue && tpValue !== 0) return null;
            const fieldName = `Exit ${idx + 1}`;
            return (
              <div
                key={tpField}
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={() => handleCopyField(fieldName, tpValue)}
              >
                <span className="text-[11px] text-slate-600 dark:text-white font-medium">
                  {fieldName}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {copiedField === fieldName ? (
                    <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                  ) : null}
                  <span className="text-[9px]">🎯</span> {tpValue}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ViewClientLiveIdeas
        isViewOpen={isViewOpen}
        handleCloseView={() => {
          setIsViewOpen(false);
          setModalOverride(null);
        }}
        selectedIdea={modalOverride || modalLiveIdea}
        setIsLightBoxOpen={setIsLightBoxOpen}
      />
      <ImageLightBox
        isLightBoxOpen={isLightBoxOpen}
        setIsLightBoxOpen={setIsLightBoxOpen}
        selectedIdea={modalOverride || liveIdea}
      />
    </>
  );
};

export default LiveIdeaFeedCard;
