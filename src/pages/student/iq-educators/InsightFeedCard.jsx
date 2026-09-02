import React, { useState } from "react";
import { format } from "date-fns";
import { ChartLine, Link2 } from "lucide-react";
import ViewInsightTradeIdeas from "../iq-insight/ViewInsightTradeIdeas";
import ImageLightBox from "../iq-insight/ImageLightBox";
import { useLazyGetTradeAnalysisByIdQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";

// The exact card design used on /iq-insight (IqInsight.jsx) for a plain Insight (no
// entry/invalidation/exit/status — those are trade-idea-only fields TradeAnalysis
// documents don't have) — reused verbatim, including its real "View Details" modal and
// image lightbox (both from pages/student/iq-insight, the same ones /iq-insight itself
// uses). `insight` is the raw TradeAnalysis document straight from the API — untouched.
//
// One adapter, not a data transform: this card's own source (getEducatorInsights) returns
// the real field names (`.title`, `.photos`, `.createdBy`), while the shared
// ViewInsightTradeIdeas/EducatorImage components (built for /iq-insight's own listing
// endpoint, which renames those fields) read `.name`, `.image`, `.educatorDetails`.
// Renaming them on `insight` itself would violate "keep the original structure", so a
// new object carrying those aliases is built only at the point of handing data to that
// modal — the original `insight` prop is never touched.
const InsightFeedCard = ({ insight }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  // Overrides modalInsight when the user opened the modal via "Follow-up to X" — shows
  // the ORIGINAL insight being replied to (quote-reply style), not this card's own
  // content. Null means the modal shows this card's own insight as usual.
  const [modalOverride, setModalOverride] = useState(null);
  const [fetchTradeAnalysisById] = useLazyGetTradeAnalysisByIdQuery();

  const modalInsight = {
    ...insight,
    name: insight?.title,
    image: insight?.photos,
    educatorDetails: insight?.createdBy,
  };

  const handleOpenPreviousAnalysis = async () => {
    const previousAnalysisId = insight?.previousAnalysis?._id;
    if (!previousAnalysisId) return;
    try {
      const original = await fetchTradeAnalysisById(previousAnalysisId).unwrap();
      setModalOverride(original?.data || original);
      setIsViewOpen(true);
    } catch (err) {
      console.error("Failed to load original insight", err);
    }
  };

  return (
    <>
      <div className="relative rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35]">
        {/* Thread indicator: this insight is a chained follow-up to a previous one.
            Clicking it opens the ORIGINAL insight being replied to (quote-reply style),
            not this card's own content. */}
        {insight?.previousAnalysis && (
          <div className="mb-2">
            <div
              className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-primary cursor-pointer hover:underline w-fit"
              onClick={handleOpenPreviousAnalysis}
            >
              <Link2 size={11} className="flex-shrink-0" />
              <span className="truncate">
                Follow-up to <span className="font-bold">{insight.previousAnalysis.title}</span>
              </span>
            </div>
            <div className="ml-[6px] mt-1 h-3 w-px bg-slate-300 dark:bg-white/15" />
          </div>
        )}
        {/* Header — no educator name here, this is already the educator's own profile, so
            naming them on every card is redundant (kept on the general social feed, where
            posts from multiple educators mix together). */}
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {insight?.createdAt ? format(new Date(insight.createdAt), "MMM dd, hh:mm a") : ""}
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
          <span className="absolute left-2 top-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize tracking-wide text-white bg-violet-500/55 backdrop-blur-sm">
            Insight
          </span>
          {insight?.photos && insight.photos.length > 0 ? (
            <img
              src={insight.photos[0]}
              alt={insight?.title}
              className="w-full h-[220px] object-cover object-center"
            />
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

        {/* Title + description */}
        <div className="mb-2 space-y-1.5 flex-1">
          {insight?.title && (
            <div className="px-1 py-1">
              <span className="text-[14px] font-extrabold text-slate-800 dark:text-white">
                {insight.title}
              </span>
            </div>
          )}
          {insight?.description && (
            <div
              className="px-1 py-1 text-[12px] text-slate-600 dark:text-slate-300 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: insight.description }}
            />
          )}
        </div>
      </div>

      <ViewInsightTradeIdeas
        isViewOpen={isViewOpen}
        handleCloseView={() => {
          setIsViewOpen(false);
          setModalOverride(null);
        }}
        selectedIdea={modalOverride || modalInsight}
        setIsLightBoxOpen={setIsLightBoxOpen}
      />
      <ImageLightBox
        isLightBoxOpen={isLightBoxOpen}
        setIsLightBoxOpen={setIsLightBoxOpen}
        selectedIdea={modalOverride || modalInsight}
      />
    </>
  );
};

export default InsightFeedCard;
