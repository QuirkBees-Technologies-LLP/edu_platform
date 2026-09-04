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
import ViewClientTradeIdeas from "../client-trade-ideas/ViewClientTradeIdeas";
import ImageLightBox from "../client-trade-ideas/ImageLightBox";
import { useLazyGetIdeaByIdQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { getOrderedImageUrls } from "@/utils/mediaOrder";
import QuotedReplyPreview from "@/components/ui/QuotedReplyPreview";

const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
};

// The exact card design used on /ideas (ClientTradeIdeas.jsx) — reused here verbatim,
// including its real "View Details" modal and image lightbox (both from
// pages/student/client-trade-ideas, the same ones /ideas itself uses). `idea` is the raw
// Idea document straight from the API — untouched, no normalization.
//
// No adapter needed here (unlike the Educator Feed's IdeaFeedCard): this card's source,
// useGetClientTradeIdeasQuery, is the exact same hook /ideas itself calls, so the raw
// document already carries `.educatorDetails` — precisely what ViewClientTradeIdeas
// expects — and can be handed to it directly.
const SocialIdeaCard = ({ idea }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedField, setCopiedField] = useState(null);
  // Overrides `idea` in the modal when the user opened it via "Follow-up to X" — shows the
  // ORIGINAL idea being replied to (quote-reply style), not this card's own content. Null
  // means the modal shows this card's own `idea` as usual.
  const [modalOverride, setModalOverride] = useState(null);
  const [fetchIdeaById] = useLazyGetIdeaByIdQuery();

  const handleOpenPreviousIdea = async () => {
    const previousIdeaId = idea?.previousIdea?._id;
    if (!previousIdeaId) return;
    try {
      const original = await fetchIdeaById(previousIdeaId).unwrap();
      setModalOverride(original?.data || original);
      setIsViewOpen(true);
    } catch (err) {
      console.error("Failed to load original idea", err);
      toast.error("Could not open the original post. Please try again.");
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

  // Educator-chosen display order between images and TradingView snapshots (Task 14).
  const orderedImages = getOrderedImageUrls(idea);

  return (
    <>
      <div className="relative rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35] mb-6">
        {/* Thread indicator: this idea is a chained follow-up to a previous one. Clicking
            it opens the ORIGINAL idea being replied to (quote-reply style), not this
            card's own content — matching a reply linking back to the message it quotes. */}
        {idea?.previousIdea && (
          <QuotedReplyPreview
            title={idea.previousIdea.name}
            description={idea.previousIdea.description}
            thumbnail={idea.previousIdea.image?.[0]}
            onClick={handleOpenPreviousIdea}
          />
        )}
        {/* Header: educator - pair + status */}
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight max-w-[75%]">
                <img
                  src={idea?.educatorDetails?.image || ""}
                  alt={idea?.educatorDetails?.first_name}
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                />
                <span className="flex items-center min-w-0">
                  <span className="truncate">
                    {idea?.educatorDetails?.first_name} {idea?.educatorDetails?.last_name}
                  </span>
                  <span className="flex-shrink-0 whitespace-nowrap">
                    &nbsp;- {idea?.name || "—"}
                  </span>
                </span>
              </span>
              {idea?.status && (
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider flex-shrink-0 ${LabelMap[idea.status] === "Active"
                    ? "text-cyan-600 dark:text-cyan-400"
                    : LabelMap[idea.status] === "Pending"
                      ? "text-purple-600 dark:text-purple-400"
                      : LabelMap[idea.status] === "Win"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : LabelMap[idea.status] === "Partial Win"
                          ? "text-emerald-500 dark:text-emerald-400"
                          : LabelMap[idea.status] === "Loss"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  {LabelMap[idea.status] === "Win"
                    ? `WIN +${idea.pips} pips`
                    : LabelMap[idea.status] === "Loss"
                      ? `LOSS -${idea.pips} pips`
                      : LabelMap[idea.status]}
                </span>
              )}
            </div>

            {/* Type - Timeframe + date */}
            <div className="flex items-center justify-between gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              {(idea?.type || idea?.timeFrame) && (
                <span
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-extrabold flex-shrink-0 border leading-none ${idea.type === "buy"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                >
                  {idea.type === "buy" ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {idea.type
                    ? idea.type.charAt(0).toUpperCase() + idea.type.slice(1).toLowerCase()
                    : ""}
                  {idea.timeFrame
                    ? ` - ${Array.isArray(idea.timeFrame) ? idea.timeFrame.join("/") : idea.timeFrame}`
                    : ""}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {idea?.createdAt ? format(new Date(idea.createdAt), "MMM dd, hh:mm a") : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Chart image */}
        <div className="-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px]">
          <span className="absolute left-2 top-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize tracking-wide text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20">
            Idea
          </span>
          {orderedImages.length > 0 ? (
            <>
              <img
                src={orderedImages[currentIndex] || orderedImages[0]}
                alt={idea?.name}
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
              {orderedImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === 0 ? orderedImages.length - 1 : i - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === orderedImages.length - 1 ? 0 : i + 1));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {orderedImages.map((_, idx) => (
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

        {/* Price levels */}
        <div className="mb-2 space-y-1.5">
          {idea?.entry && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField("Entry", idea.entry)}
            >
              <span className="text-[12px] text-slate-600 dark:text-white font-medium">Entry</span>
              <span className="text-[12px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                {copiedField === "Entry" ? (
                  <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[10px]">📍</span> {idea.entry}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {idea?.invalidation && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField("Stop Loss", idea.invalidation)}
            >
              <span className="text-[12px] text-slate-600 dark:text-white font-medium">
                Invalidation
              </span>
              <span className="text-[12px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                {copiedField === "Stop Loss" ? (
                  <span className="text-[9px] text-red-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[10px]">❌</span> {idea.invalidation}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {["Exit1", "Exit2", "Exit3"].map((tpField, idx) => {
            const tpValue = idea?.exits?.[idx];
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
          {idea?.description && (
            <div
              className="px-1 py-1 text-[12px] text-slate-600 dark:text-slate-300 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: idea.description }}
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

      <ViewClientTradeIdeas
        isViewOpen={isViewOpen}
        handleCloseView={() => {
          setIsViewOpen(false);
          setModalOverride(null);
        }}
        selectedIdea={modalOverride || idea}
        setIsLightBoxOpen={setIsLightBoxOpen}
      />
      <ImageLightBox
        isLightBoxOpen={isLightBoxOpen}
        setIsLightBoxOpen={setIsLightBoxOpen}
        selectedIdea={modalOverride || idea}
      />
    </>
  );
};

export default SocialIdeaCard;
