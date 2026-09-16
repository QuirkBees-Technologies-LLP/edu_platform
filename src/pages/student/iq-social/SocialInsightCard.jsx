import React, { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChartLine,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getEmbedUrl } from "@/utils/videoUtils";
import { getOrderedMediaSlides } from "@/utils/mediaOrder";
import QuotedReplyPreview from "@/components/ui/QuotedReplyPreview";
import ViewInsightTradeIdeas from "../iq-insight/ViewInsightTradeIdeas";
import ImageLightBox from "../iq-insight/ImageLightBox";
import { useLazyGetTradeAnalysisByIdQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";

const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
};

// The exact card design used on /iq-insight (IqInsight.jsx) — reused here verbatim,
// including its real "View Details" modal and image lightbox (both from
// pages/student/iq-insight, the same ones /iq-insight itself uses). `insight` is the raw
// trade-analysis document straight from the API — untouched, no normalization.
//
// No adapter needed here: this card's source, useGetClientTradeAnalysisQuery, is the exact
// same hook /iq-insight itself calls, so the raw document already carries `.name`, `.image`,
// `.educatorDetails`, `.category` etc. — precisely what ViewInsightTradeIdeas expects — and
// can be handed to it directly.
const SocialInsightCard = ({ insight }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedField, setCopiedField] = useState(null);
  const [dyntubeModalOpen, setDyntubeModalOpen] = useState(false);
  // Overrides `insight` in the modal when the user opened it via "Follow-up to X" —
  // shows the ORIGINAL insight being replied to (quote-reply style), not this card's
  // own content. Null means the modal shows this card's own `insight` as usual.
  const [modalOverride, setModalOverride] = useState(null);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [fetchTradeAnalysisById] = useLazyGetTradeAnalysisByIdQuery();

  const handleOpenPreviousAnalysis = async (e) => {
    e.stopPropagation();
    const previousAnalysisId = insight?.previousAnalysis?._id;
    if (!previousAnalysisId || isLoadingFollowUp) return;
    setIsLoadingFollowUp(true);
    try {
      const original = await fetchTradeAnalysisById(previousAnalysisId).unwrap();
      setModalOverride(original?.data || original);
      setIsViewOpen(true);
    } catch (err) {
      console.error("Failed to load original insight", err);
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

  // Educator-chosen display order between images / TradingView snapshots / DynTube video
  // (Task 14) — slides render in whichever order was picked, not a hardcoded sequence.
  const slides = getOrderedMediaSlides(insight);
  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];
  const isDyntubeSlide = currentSlide?.type === "dyntube";

  return (
    <>
      {/* isolate: keeps this card's badge/button z-indexes from competing with the page's
          sticky toolbar (also z-20) and painting over the header while scrolling. */}
      <div className="relative isolate rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35] mb-6">
        {/* Thread indicator: this insight is a chained follow-up to a previous one.
            Clicking it opens the ORIGINAL insight being replied to (quote-reply style),
            not this card's own content — matching a reply linking back to the message
            it quotes. */}
        {insight?.previousAnalysis && (
          <QuotedReplyPreview
            title={insight.previousAnalysis.title}
            thumbnail={insight.previousAnalysis.photos?.[0]}
            onClick={handleOpenPreviousAnalysis}
            isLoading={isLoadingFollowUp}
          />
        )}
        {/* Header: educator */}
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight max-w-full">
                <img
                  src={insight?.educatorDetails?.image || ""}
                  alt={insight?.educatorDetails?.first_name}
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                />
                <span className="truncate">
                  {insight?.educatorDetails?.first_name} {insight?.educatorDetails?.last_name}
                </span>
              </span>
            </div>

            {/* Type - Timeframe + date */}
            <div className="flex items-center justify-between gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              {(insight?.type || insight?.timeFrame) && (
                <span
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-extrabold flex-shrink-0 border leading-none ${insight.type === "buy"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : insight.type === "sell"
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                >
                  {insight.type === "buy" ? (
                    <TrendingUp size={14} />
                  ) : insight.type === "sell" ? (
                    <TrendingDown size={14} />
                  ) : null}
                  {insight.type
                    ? insight.type.charAt(0).toUpperCase() + insight.type.slice(1).toLowerCase()
                    : "Insight"}
                  {insight.timeFrame
                    ? ` - ${Array.isArray(insight.timeFrame) ? insight.timeFrame.join("/") : insight.timeFrame}`
                    : ""}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {(insight?.createdAt || insight?.createAt)
                  ? format(new Date(insight.createdAt || insight.createAt), "MMM dd, hh:mm a")
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Chart image / DynTube video carousel */}
        <div className="-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px]">
          <span className="absolute left-2 top-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize tracking-wide text-violet-600 dark:text-violet-300 bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/20">
            Insight
          </span>
          {totalSlides > 0 ? (
            <>
              {isDyntubeSlide ? (
                <div
                  className="absolute inset-0 cursor-pointer group"
                  onClick={() => setDyntubeModalOpen(true)}
                >
                  <iframe
                    src={getEmbedUrl(insight.dyntubeUrl)}
                    className="w-full h-full"
                    loading="lazy"
                    tabIndex={-1}
                    scrolling="no"
                    style={{ pointerEvents: "none", border: "none", overflow: "hidden" }}
                    title="DynTube Video"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <>
                  <img
                    src={currentSlide?.url}
                    alt={insight?.name}
                    className="w-full h-[220px] object-cover object-right transition-opacity duration-300 cursor-pointer"
                    onClick={() => setIsLightBoxOpen(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightBoxOpen(true);
                    }}
                    className="absolute right-2 bottom-2 text-white p-1.5 bg-black/50 hover:bg-black/70 rounded-md backdrop-blur-sm transition-colors z-30"
                  >
                    <Eye size={14} />
                  </button>
                </>
              )}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === 0 ? totalSlides - 1 : i - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === totalSlides - 1 ? 0 : i + 1));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${currentIndex === idx ? "bg-white" : "bg-white/40"
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

        {/* Structured price levels / fallback description */}
        <div className="mb-2 space-y-1.5 flex-1">
          <div className="px-1 py-1 flex items-center justify-between gap-2 flex-wrap">
            {insight?.name && (
              <span className="text-[14px] font-extrabold text-slate-800 dark:text-white">
                {insight.name}
              </span>
            )}
            {insight?.status && (
              <span
                className={`inline-block px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0 ${LabelMap[insight.status] === "Active"
                  ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                  : LabelMap[insight.status] === "Pending"
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                    : LabelMap[insight.status] === "Win"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : LabelMap[insight.status] === "Partial Win"
                        ? "bg-emerald-400/15 text-emerald-500 dark:text-emerald-400"
                        : LabelMap[insight.status] === "Loss"
                          ? "bg-red-500/15 text-red-600 dark:text-red-400"
                          : "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                  }`}
              >
                {LabelMap[insight.status] === "Win" && insight.pips
                  ? `WIN +${insight.pips} pips`
                  : LabelMap[insight.status] === "Loss" && insight.pips
                    ? `LOSS -${insight.pips} pips`
                    : LabelMap[insight.status]}
              </span>
            )}
          </div>
          {insight?.entry && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField("Entry", insight.entry)}
            >
              <span className="text-[12px] text-slate-600 dark:text-white font-medium">Entry</span>
              <span className="text-[12px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                {copiedField === "Entry" ? (
                  <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[10px]">📍</span> {insight.entry}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {insight?.invalidation && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField("Stop Loss", insight.invalidation)}
            >
              <span className="text-[12px] text-slate-600 dark:text-white font-medium">
                Invalidation
              </span>
              <span className="text-[12px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                {copiedField === "Stop Loss" ? (
                  <span className="text-[9px] text-red-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[10px]">❌</span> {insight.invalidation}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {["Exit1", "Exit2", "Exit3"].map((tpField, idx) => {
            const tpValue = insight?.exits?.[idx];
            if (!tpValue && tpValue !== 0) return null;
            const fieldName = `Exit ${idx + 1}`;
            return (
              <div
                key={tpField}
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={() => handleCopyField(fieldName, tpValue)}
              >
                <span className="text-[12px] text-slate-600 dark:text-white font-medium">
                  {fieldName}
                </span>
                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {copiedField === fieldName ? (
                    <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                  ) : null}
                  <span className="text-[10px]">🎯</span> {tpValue}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            );
          })}
          {!insight?.entry &&
            !insight?.invalidation &&
            (!insight?.exits || insight.exits.length === 0) &&
            (insight?.description || insight?.message) && (
              <div
                className="px-1 py-1 text-[12px] text-slate-600 dark:text-slate-300 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: insight.description || insight.message }}
              />
            )}
        </div>

        {/* View Details */}
        <button
          className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 dark:hover:text-white font-semibold py-2 mt-2 rounded-lg flex items-center justify-center gap-1.5 text-[12px] transition-colors"
          onClick={() => {
            setModalOverride(null);
            setIsViewOpen(true);
          }}
        >
          <Eye size={14} /> View Details
        </button>
      </div>

      <ViewInsightTradeIdeas
        isViewOpen={isViewOpen}
        handleCloseView={() => {
          setIsViewOpen(false);
          setModalOverride(null);
        }}
        selectedIdea={modalOverride || insight}
        setIsLightBoxOpen={setIsLightBoxOpen}
      />
      <ImageLightBox
        isLightBoxOpen={isLightBoxOpen}
        setIsLightBoxOpen={setIsLightBoxOpen}
        selectedIdea={modalOverride || insight}
      />

      {/* DynTube Direct Video Player Modal (for the card's own carousel slide) */}
      {insight?.dyntubeUrl && (
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
                    src={getEmbedUrl(insight.dyntubeUrl)}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="DynTube Video Player"
                    style={{ border: "none" }}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SocialInsightCard;
