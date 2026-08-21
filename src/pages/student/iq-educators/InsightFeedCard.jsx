import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Eye, ChevronLeft, ChevronRight, ChartLine } from "lucide-react";
import ViewInsightTradeIdeas from "../iq-insight/ViewInsightTradeIdeas";
import ImageLightBox from "../iq-insight/ImageLightBox";

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
  const navigate = useNavigate();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const modalInsight = {
    ...insight,
    name: insight?.title,
    image: insight?.photos,
    educatorDetails: insight?.createdBy,
  };

  return (
    <>
      <div className="relative rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35]">
        {/* Header: educator */}
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight max-w-full cursor-pointer hover:bg-blue-500/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (insight?.createdBy?._id) {
                    navigate(`/iq-educators/${insight.createdBy._id}`);
                  }
                }}
                title={`View ${insight?.createdBy?.first_name || ""}'s profile`}
              >
                <img
                  src={insight?.createdBy?.image || ""}
                  alt={insight?.createdBy?.first_name}
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                />
                <span className="truncate">
                  {insight?.createdBy?.first_name} {insight?.createdBy?.last_name}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {insight?.createdAt ? format(new Date(insight.createdAt), "MMM dd, hh:mm a") : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Chart image */}
        <div className="-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px]">
          <span className="absolute left-2 top-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-extrabold capitalize tracking-wide text-white bg-violet-500/90 backdrop-blur-sm">
            Insight
          </span>
          {insight?.photos && insight.photos.length > 0 ? (
            <>
              <img
                src={insight.photos[currentIndex] || insight.photos[0]}
                alt={insight?.title}
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
              {insight.photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === 0 ? insight.photos.length - 1 : i - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex((i) => (i === insight.photos.length - 1 ? 0 : i + 1));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {insight.photos.map((_, idx) => (
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

        {/* View Details */}
        <button
          className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 dark:hover:text-white font-semibold py-2 mt-2 rounded-lg flex items-center justify-center gap-1.5 text-[12px] transition-colors"
          onClick={() => setIsViewOpen(true)}
        >
          <Eye size={14} /> View Details
        </button>
      </div>

      <ViewInsightTradeIdeas
        isViewOpen={isViewOpen}
        handleCloseView={() => setIsViewOpen(false)}
        selectedIdea={modalInsight}
        setIsLightBoxOpen={setIsLightBoxOpen}
      />
      <ImageLightBox
        isLightBoxOpen={isLightBoxOpen}
        setIsLightBoxOpen={setIsLightBoxOpen}
        selectedIdea={modalInsight}
      />
    </>
  );
};

export default InsightFeedCard;
