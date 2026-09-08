import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { useTourStep } from "@/hooks/useTourStep";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import {
  useGetAllEducatorsQuery,
  useGetClientTradeAnalysisQuery,
  useGetClientTradeIdeasQuery,
  useLazyGetTradeAnalysisByIdQuery,
} from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ImageLightBox from "./ImageLightBox";
// import EducatorImage from "./EducatorImage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import {
  ChevronLeft,
  ChevronRight,
  Container,
  ShieldAlert,
  Videotape,
  Check,
  ChevronDown,
  Play,
} from "lucide-react";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import ViewInsightTradeIdeas from "./ViewInsightTradeIdeas";
import EducatorImage from "../client-trade-ideas/EducatorImage";
import { getEmbedUrl } from "@/utils/videoUtils";
import { getOrderedMediaSlides } from "@/utils/mediaOrder";
import Loader from "../../../components/ui/loader";
import QuotedReplyPreview from "../../../components/ui/QuotedReplyPreview";
import { Eye, ThumbsUp, MessageCircle, Share2, FileText, Copy, ChartLine, TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SearchFilterInput from "../../../components/SearchFilterInput";
import debounce from "lodash.debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import CustomDateRangePicker from "../../../components/CustomDateRangePicker";

// const ShowMoreLess = ({
//   text = "",
//   html = "",
//   limit = 100,
//   showMoreText = " . . .",
//   showLessText = " . . .",
//   className,
// }) => {
//   const [expanded, setExpanded] = useState(false);
//
//   const isHtml = !!html;
//   const content = isHtml ? html : text;
//   const plainText = isHtml ? html.replace(/<[^>]+>/g, "") : text;
//   const isLong = plainText.length > limit;
//
//   const displayed =
//     expanded || !isLong ? content : plainText.substring(0, limit);
//
//   return (
//     <div
//       className={
//         className ? className : "text-sm text-gray-700 leading-relaxed"
//       }
//     >
//       {isHtml ? (
//         <span dangerouslySetInnerHTML={{ __html: displayed }} />
//       ) : (
//         <span>{displayed}</span>
//       )}
//       {isLong && (
//         <span
//           onClick={() => setExpanded(!expanded)}
//           className="text-primary cursor-pointer hover:underline"
//         >
//           {expanded ? showLessText : showMoreText}
//         </span>
//       )}
//     </div>
//   );
// };

const IqInsight = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [dyntubeModalUrl, setDyntubeModalUrl] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [educator, setEducator] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedDateRange, setSelectedDateRange] = useState({
    start: null,
    end: null,
    rangeName: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useAuthContext();

  const observer = useRef();

  const { data, isFetching, isLoading, isError, refetch } =
    useGetClientTradeAnalysisQuery({
      page: page,
      limit: limit,
      search: searchText,
      educator,
      status,
      categoryName: category.length > 0 ? category : undefined,
      startDate: selectedDateRange.start
        ? format(selectedDateRange.start, "yyyy-MM-dd 00:00:00")
        : "",
      endDate: selectedDateRange.end
        ? format(selectedDateRange.end, "yyyy-MM-dd 23:59:59")
        : "",
    });
  const { data: educatorsData } = useGetAllEducatorsQuery();
  const [fetchTradeAnalysisById] = useLazyGetTradeAnalysisByIdQuery();

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    // if (data?.data.length === 0) {
    //   setTradeIdeas([]);
    // }
    if (data?.data) {
      if (page === 1) {
        setTradeIdeas(data.data);
      } else {
        // Merge in this page: update any item already loaded (e.g. edited since it was
        // first fetched) with its fresh copy, in place, and append genuinely new ones —
        // a plain "skip if already present" filter was silently keeping stale data for
        // anything beyond page 1 forever, since a refetch of a later page would just get
        // discarded instead of updating the matching item already in local state.
        setTradeIdeas((prevIdeas) => {
          const merged = new Map(prevIdeas.map((idea) => [idea._id, idea]));
          data.data.forEach((idea) => merged.set(idea._id, idea));
          return Array.from(merged.values());
        });
      }
    }
  }, [data, page]);

  const lastTradeIdeaRef = useCallback(
    (node) => {
      if (isFetching || page >= totalPages) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, page, totalPages],
  );

  useEffect(() => {
    setPage(1);
    refetch();
  }, [status, category]);

  const handleCloseView = () => {
    setIsViewOpen(false);
  };

  // "Follow-up to X" opens the ORIGINAL insight being replied to, not the follow-up
  // itself (quote-reply style) — previousAnalysis on the list item is only shallow-
  // populated (title/createdAt), so the full original is fetched on demand here.
  // Tracked by id (not a plain boolean) since this handler is shared across every card in
  // the list — only the card whose follow-up was actually clicked should show a spinner.
  const [loadingFollowUpId, setLoadingFollowUpId] = useState(null);
  const handleOpenPreviousAnalysis = async (previousAnalysisId) => {
    if (!previousAnalysisId || loadingFollowUpId) return;
    setLoadingFollowUpId(previousAnalysisId);
    try {
      const original = await fetchTradeAnalysisById(previousAnalysisId).unwrap();
      setSelectedIdea(original?.data || original);
      setIsViewOpen(true);
    } catch (err) {
      console.error("Failed to load original insight", err);
      toast.error("Could not open the original post. Please try again.");
    } finally {
      setLoadingFollowUpId(null);
    }
  };

  // ─── IQ Insight Tour ───────────────────────────────────────────────────────────────────────────────
  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isLoading,
    getSteps: () => {
      const steps = [];
      const filterBar = document.querySelector('.insight-filter-bar');
      if (filterBar) steps.push({ element: filterBar, title: '🔍 Filter Insights', intro: 'Refine insights using the filters above — filter by date range, status, specific educator, asset class (Forex, Crypto, etc.), or search by keyword.', position: 'bottom' });
      const firstCard = document.querySelector('.insight-first-card');
      if (firstCard) steps.push({ element: firstCard, title: '📊 Market Analysis Card', intro: 'Each card shows a market analysis post from an educator including their name, post date, title, and a content preview. Click <strong>View Details</strong> to read the full analysis.', position: 'right' });
      return steps;
    },
    onDone: () => navigate('/live-ideas', { state: { continueTour: true } }),
    delay: 1000,
  });
  // ─────────────────────────────────────────────────────────────────────────────────
  const handleCloseImageView = () => {
    setSelectedIdea({});
  };

  const [copiedField, setCopiedField] = useState({ id: null, field: null });

  const handleCopyField = async (id, fieldName, value) => {
    try {
      await navigator.clipboard.writeText(value ?? "N/A");
      setCopiedField({ id, field: fieldName });
      setTimeout(() => setCopiedField({ id: null, field: null }), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const statusLabelMap = {
    active: "Active",
    pending: "Pending",
    win: "Win",
    loss: "Loss",
    breakEven: "Break Even",
    partialWin: "Partial Win",
  };
  const statusOptions = [
    "active",
    "pending",
    "win",
    "loss",
    "breakEven",
    "partialWin",
  ];

  const categories = [
    { name: "Forex", _id: "1" },
    { name: "Crypto", _id: "2" },
    { name: "Indices", _id: "3" },
    { name: "Commodities", _id: "4" },
  ];

  const handleDateRangeChangeCallback = (startDate, endDate, rangeName) => {
    setSelectedDateRange({
      start: startDate,
      end: endDate,
      rangeName,
    });
    setPage(1);
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchText(value);
        setPage(1);
      }, 500),
    [],
  );

  // bg - teal - 800;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setTradeIdeas([]);
    setPage(1);
    setRefreshKey((prev) => prev + 1);
    debouncedSearch(value);
  };

  // const ShowMoreLess = ({
  //   text = "",
  //   html = "",
  //   limit = 100,
  //   showMoreText = " . . .",
  //   className,
  //   onOpen,
  // }) => {
  //   const isHtml = !!html;
  //   const content = isHtml ? html : text;
  //   const plainText = isHtml ? html.replace(/<[^>]+>/g, "") : text;
  //   const isLong = plainText.length > limit;
  //
  //   const displayed = plainText.substring(0, limit);
  //
  //   return (
  //     <div className={className || "text-sm text-gray-700 leading-relaxed"}>
  //       {isHtml ? (
  //         <span dangerouslySetInnerHTML={{ __html: displayed }} />
  //       ) : (
  //         <span>{displayed}</span>
  //       )}
  //
  //       {isLong && (
  //         <span
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             onOpen && onOpen();
  //           }}
  //           className="text-primary cursor-pointer "
  //         >
  //           {showMoreText}
  //         </span>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-1 mb-2 insight-filter-bar">
        <div className="flex gap-3 sm:gap-6 pb-2 flex-wrap">
          <div className="flex flex-wrap items-center sm:justify-start gap-3 mb-2">


            {/* Asset Class Multi-select Filter */}
            <div className="flex items-center gap-2 relative">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="min-w-56 h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]">
                    <span className="truncate text-sm">
                      {category.length > 0
                        ? `${category.length} Asset Class Selected`
                        : "Select Asset Class"}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-[225px] p-0">
                  <Command>
                    {categories.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No Asset Class found
                      </div>
                    ) : (
                      <CommandGroup>
                        {categories.map((item) => {
                          const selected = category.includes(item.name);

                          return (
                            <CommandItem
                              key={item._id}
                              onSelect={() => {
                                setCategory((prev) => {
                                  const exists = prev.includes(item.name);
                                  const updated = exists
                                    ? prev.filter((name) => name !== item.name)
                                    : [...prev, item.name];

                                  return updated;
                                });
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <div
                                className={`h-4 w-4 border rounded flex items-center justify-center ${selected
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white dark:bg-[#1c1f26]"
                                  }`}
                              >
                                {selected && <Check size={14} />}
                              </div>

                              {item.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>

              {category?.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCategory([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  ✖
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 relative">
              <CustomDateRangePicker
                handleDateRangeChangeCallback={handleDateRangeChangeCallback}
              />
            </div>

            {/* Status Filter */}
            {/* <div className="flex items-center gap-2 relative">
              <Select
                value={status || ""}
                onValueChange={(val) => {
                  setStatus(val);
                }}
              >
                <SelectTrigger className="w-[190px] h-11">
                  <SelectValue placeholder="Select Status">
                    {status ? statusLabelMap[status] : "Select Status"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {statusOptions.map((key) => (
                    <SelectItem key={key} value={key}>
                      {statusLabelMap[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {status && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  ✖
                </button>
              )}
            </div> */}

            {/* Educator Filter */}
            <div className="flex items-center gap-2 relative">
              <Select
                value={educator || ""}
                onValueChange={(val) => {
                  setEducator(val);
                }}
              >
                <SelectTrigger className="w-[190px] h-11">
                  <SelectValue placeholder="Select educator">
                    {educator
                      ? educatorsData?.data?.find((e) => e._id === educator)
                        ?.first_name?.last_name
                      : "Select educator"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {isLoading && (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  )}

                  {educatorsData?.data?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.first_name} {item.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {educator && (
                <button
                  type="button"
                  onClick={() => setEducator("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  ✖
                </button>
              )}
            </div>



            {/* Search Filter */}
            <div className="flex items-center gap-2 relative insight-search">
              <SearchFilterInput
                searchText={searchText}
                handleSearchChange={handleSearchChange}
                className="w-full sm:w-auto rounded-md h-11"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {isError && (
              <div className="col-span-12 flex items-center justify-center py-20">
                <div className="text-gray-700 text-lg font-semibold">
                  No records found
                </div>
              </div>
            )}
            {isLoading ? (
              <Loader />
            ) : tradeIdeas.length === 0 &&
              !isLoading &&
              !isError &&
              !isFetching &&
              page === 1 ? (
              <div className="col-span-12 flex items-center justify-center py-20">
                <div className="text-gray-700 text-lg font-semibold">
                  No records found
                </div>
              </div>
            ) : tradeIdeas.length > 0 ? (
              tradeIdeas.map((idea, index) => (
                <div
                  key={idea._id}
                  className={`relative rounded-2xl p-[1.125rem] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col h-full border border-slate-200 dark:border-[#1F1F35] ${index === 0 ? ' insight-first-card' : ''}`}
                  ref={index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null}
                >
                  {/* Quote-reply preview: this insight is a chained follow-up to a previous
                      one — shows a condensed preview of that ORIGINAL insight, not this
                      card's own content. */}
                  {idea?.previousAnalysis && (
                    <QuotedReplyPreview
                      title={idea.previousAnalysis.title}
                      thumbnail={idea.previousAnalysis.photos?.[0]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreviousAnalysis(idea.previousAnalysis._id);
                      }}
                      isLoading={loadingFollowUpId === idea.previousAnalysis._id}
                    />
                  )}
                  {/* ── Header: Strategy Name (primary) + Signal Type ── */}
                  <div className="flex items-start gap-1 mb-2">
                    <div className="flex-1 min-w-0">
                      {/* Row 1: Educator */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight max-w-full cursor-pointer hover:bg-blue-500/20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idea?.educatorDetails?._id) {
                              navigate(`/iq-educators/${idea.educatorDetails._id}`);
                            }
                          }}
                          title={`View ${idea?.educatorDetails?.first_name || ""}'s profile`}
                        >
                          <img
                            src={`${idea?.educatorDetails?.image || ""}`}
                            alt={idea?.educatorDetails?.first_name}
                            className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="truncate">{idea?.educatorDetails?.first_name} {idea?.educatorDetails?.last_name}</span>
                        </span>
                      </div>

                      {/* Row 2: Type - Timeframe */}
                      <div className="flex items-center justify-between gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
                        {(idea.type || idea.timeFrame || idea.timeframe) && (
                          <span
                            className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-extrabold flex-shrink-0 border leading-none ${idea.type === 'buy' || idea.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : idea.type === 'sell' || idea.type === 'Sell' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              }`}
                          >
                            {idea.type === 'buy' || idea.type === 'Buy' ? <TrendingUp size={14} /> : idea.type === 'sell' || idea.type === 'Sell' ? <TrendingDown size={14} /> : null}
                            {idea.type ? idea.type.charAt(0).toUpperCase() + idea.type.slice(1).toLowerCase() : "Insight"}
                            {(idea.timeFrame || idea.timeframe) ? ` - ${Array.isArray(idea.timeFrame || idea.timeframe) ? (idea.timeFrame || idea.timeframe).join('/') : (idea.timeFrame || idea.timeframe)}` : ""}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                          {(idea.createdAt || idea.createAt) ? format(new Date(idea.createdAt || idea.createAt), "MMM dd, hh:mm a") : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Chart Image / Video Carousel ── */}
                  {(() => {
                    // Build carousel items in the educator-chosen display order between
                    // images / TradingView snapshots / DynTube video (Task 14).
                    const slides = getOrderedMediaSlides(idea);
                    const totalSlides = slides.length;
                    const currentIdx = idea.currentIndex ?? 0;
                    const currentSlide = slides[currentIdx];
                    const isDyntubeSlide = currentSlide?.type === "dyntube";

                    if (totalSlides === 0) {
                      return (
                        <div className="-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px]">
                          <div className="absolute inset-0 bg-slate-100 dark:bg-[#141422] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                              <ChartLine size={28} className="text-slate-400 dark:text-slate-600" />
                              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600 tracking-wide">No Chart Loading...</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px]">
                        {isDyntubeSlide ? (
                          /* DynTube video slide */
                          <div
                            className="absolute inset-0 cursor-pointer group"
                            onClick={() => setDyntubeModalUrl(idea.dyntubeUrl)}
                          >
                            <iframe
                              src={getEmbedUrl(idea.dyntubeUrl)}
                              className="w-full h-full"
                              loading="lazy"
                              tabIndex={-1}
                              scrolling="no"
                              style={{ pointerEvents: 'none', border: 'none', overflow: 'hidden' }}
                              title="DynTube Video"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          </div>
                        ) : (
                          /* Image slide */
                          <>
                            <img
                              src={currentSlide?.url}
                              alt={idea.pair || idea.name}
                              className="w-full h-[220px] object-cover object-right transition-opacity duration-300 cursor-pointer"
                              onClick={() => {
                                setSelectedIdea(idea);
                                setIsLightBoxOpen(true);
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIdea(idea);
                                setIsLightBoxOpen(true);
                              }}
                              className="absolute right-2 bottom-2 text-white p-1.5 bg-black/50 hover:bg-black/70 rounded-md backdrop-blur-sm transition-colors z-30"
                            >
                              <Eye size={14} />
                            </button>
                          </>
                        )}

                        {/* Navigation arrows (show when more than 1 slide) */}
                        {totalSlides > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === idea._id
                                      ? {
                                        ...t,
                                        currentIndex: currentIdx === 0 ? totalSlides - 1 : currentIdx - 1,
                                      }
                                      : t
                                  )
                                );
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === idea._id
                                      ? {
                                        ...t,
                                        currentIndex: currentIdx === totalSlides - 1 ? 0 : currentIdx + 1,
                                      }
                                      : t
                                  )
                                );
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                            >
                              <ChevronRight size={16} />
                            </button>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                              {Array.from({ length: totalSlides }).map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${currentIdx === idx ? "bg-white" : "bg-white/40"
                                    }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* ── Structured Price Levels / Content ── */}
                  <div className="mb-2 space-y-1.5 flex-1">
                    <div className="px-1 py-1 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        {(idea.pair || idea.name) && (
                          <span className="text-[14px] font-extrabold text-slate-800 dark:text-white truncate">
                            {idea.pair || idea.name}
                          </span>
                        )}
                      </div>
                      {idea.status && (
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0 ${idea.status === 'Active' || idea.status === 'active' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' :
                            idea.status === 'Pending' || idea.status === 'pending' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' :
                              idea.status === 'Win' || idea.status === 'win' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                idea.status === 'Partial Win' || idea.status === 'partial_win' ? 'bg-emerald-400/15 text-emerald-500 dark:text-emerald-400' :
                                  idea.status === 'Loss' || idea.status === 'loss' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                                    'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          {(idea.status === 'Win' || idea.status === 'win') && idea.pips ? `WIN +${idea.pips} pips` :
                            (idea.status === 'Loss' || idea.status === 'loss') && idea.pips ? `LOSS -${idea.pips} pips` :
                              idea.status}
                        </span>
                      )}
                    </div>
                    {idea.entry && (
                      <div
                        className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                        onClick={() => handleCopyField(idea._id, "Entry", idea.entry)}
                      >
                        <span className="text-[12px] text-slate-600 dark:text-white font-medium">Entry</span>
                        <span className="text-[12px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                          {copiedField.id === idea._id && copiedField.field === "Entry" ? (
                            <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                          ) : null}
                          <span className="text-[10px]">📍</span> {idea.entry}
                          <Copy size={10} className="text-slate-400 dark:text-white/50" />
                        </span>
                      </div>
                    )}
                    {idea.invalidation && (
                      <div
                        className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                        onClick={() => handleCopyField(idea._id, "Stop Loss", idea.invalidation)}
                      >
                        <span className="text-[12px] text-slate-600 dark:text-white font-medium">Invalidation</span>
                        <span className="text-[12px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                          {copiedField.id === idea._id && copiedField.field === "Stop Loss" ? (
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
                          onClick={() => handleCopyField(idea._id, fieldName, tpValue)}
                        >
                          <span className="text-[12px] text-slate-600 dark:text-white font-medium">{fieldName}</span>
                          <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            {copiedField.id === idea._id && copiedField.field === fieldName ? (
                              <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                            ) : null}
                            <span className="text-[10px]">🎯</span> {tpValue}
                            <Copy size={10} className="text-slate-400 dark:text-white/50" />
                          </span>
                        </div>
                      );
                    })}
                    {(!idea.entry && !idea.invalidation && (!idea.exits || idea.exits.length === 0)) && (idea.description || idea.message || idea.name) && (
                      <div className="px-1 py-1 text-[12px] text-slate-600 dark:text-slate-300 line-clamp-3">
                        <div dangerouslySetInnerHTML={{ __html: idea.description || idea.message || idea.name }} />
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    className={`w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 dark:hover:text-white font-semibold py-2 mt-2 rounded-lg flex items-center justify-center gap-1.5 text-[12px] transition-colors${index === 0 ? ' insight-view-btn' : ''}`}
                    onClick={() => {
                      setSelectedIdea(idea);
                      setIsViewOpen(true);
                    }}
                  >
                    <Eye size={14} /> View Details
                  </button>
                </div>
              ))
            ) : (
              isFetching &&
              !isLoading && (
                <div className="col-span-12 flex items-center justify-center py-20">
                  <div className="text-gray-700 text-lg font-semibold">
                    <Loader />
                  </div>
                </div>
              )
            )}
          </div>
          {isFetching && page > 1 && (
            <div className="text-center py-5 text-gray-500">
              Loading more...
            </div>
          )}
        </div>

        <ViewInsightTradeIdeas
          isViewOpen={isViewOpen}
          setIsLightBoxOpen={setIsLightBoxOpen}
          handleCloseView={handleCloseView}
          selectedIdea={selectedIdea}
        />
        <ImageLightBox
          isLightBoxOpen={isLightBoxOpen}
          setIsLightBoxOpen={setIsLightBoxOpen}
          selectedIdea={selectedIdea}
          handleCloseView={handleCloseImageView}
        />

        {/* DynTube Direct Video Player Modal */}
        <Dialog open={!!dyntubeModalUrl} onOpenChange={(open) => { if (!open) setDyntubeModalUrl(null); }}>
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
                {dyntubeModalUrl && (
                  <iframe
                    src={getEmbedUrl(dyntubeModalUrl)}
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
      </div>
    </div>
  );
};

export default IqInsight;
