import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { useTourStep } from "@/hooks/useTourStep";
import {
  useGetAllEducatorsQuery,
  useGetClientLiveIdeasQuery,
  useGetClientTradeIdeasQuery,
} from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ViewClientTradeIdeas from "./ViewClientLiveIdeas";
import ImageLightBox from "./ImageLightBox";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  ChartLine,
} from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
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
import { Check, ChevronDown } from "lucide-react";
import Loader from "../../../components/ui/loader";
import { useGetCommonCategoryQuery } from "../../../store/api/client/clientEductorApiSlice";
import SearchFilterInput from "../../../components/SearchFilterInput";
import CustomDateRangePicker from "../../../components/CustomDateRangePicker";
import ExpandableDescription from "@/components/ui/ExpandableDescription";
import { getLatestFirstImages } from "@/utils/mediaOrder";
import ViewClientLiveIdeas from "./ViewClientLiveIdeas";
const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
};

const ClientLiveIdeas = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [totalSummary, setTotalSummary] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [category, setCategory] = useState([]);
  const [status, setStatus] = useState("");
  const [activeIdea, setActiveIdea] = useState("all");
  const [educator, setEducator] = useState("");
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
    useGetClientLiveIdeasQuery({
      page,
      limit,
      status,
      categoryName: category.length > 0 ? category : undefined,
      activeIdea: activeIdea ? activeIdea : "all",
      educator,
      startDate: selectedDateRange.start
        ? format(selectedDateRange.start, "yyyy-MM-dd 00:00:00")
        : "",
      endDate: selectedDateRange.end
        ? format(selectedDateRange.end, "yyyy-MM-dd 23:59:59")
        : "",
      // Show the original live idea, or its current latest Follow-Up in place of it —
      // never every Follow-Up as its own separate entry.
      latestOnly: true,
    });

  const { data: categoryList } = useGetCommonCategoryQuery();
  const { data: educatorsData } = useGetAllEducatorsQuery();
  const categories =
    [
      { name: "Forex", _id: "1" },
      { name: "Crypto", _id: "2" },
      { name: "Indices", _id: "3" },
      { name: "Commodities", _id: "4" },
    ] || [];

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setTradeIdeas(data.data);
        setTotalSummary(data.totalSummary); // replace data if first page
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
    // setTradeIdeas([]);
    setPage(1);
    refetch();
  }, [status, category]);

  // ─── Live Ideas Tour ──────────────────────────────────────────────────────────────────────
  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isLoading,
    getSteps: () => {
      const steps = [];
      const filterBar = document.querySelector('.li-filter-bar');
      if (filterBar) steps.push({ element: filterBar, title: '🔍 Filter Live Ideas', intro: 'Narrow down live ideas using these filters by direction (All/Buy/Sell), date range, status, educator, or asset class.', position: 'bottom' });
      const statsRow = document.querySelector('.li-stats-row');
      if (statsRow) steps.push({ element: statsRow, title: '📊 Live Ideas Summary', intro: 'A quick view of results: <strong>Winning Ideas</strong> (green), <strong>Losing Ideas</strong> (red), and total <strong>Net Pips</strong>. This updated based on your active filters.', position: 'bottom' });
      const firstCard = document.querySelector('.li-first-card');
      if (firstCard) steps.push({ element: firstCard, title: '🟢 Live Idea Card', intro: 'Each card shows a live trade idea with the direction (Buy/Sell), the educator, title, and current status (Active / Pending / Win / Loss).', position: 'right' });
      const viewBtn = document.querySelector('.li-view-btn');
      if (viewBtn) steps.push({ element: viewBtn, title: '👁️ View Details', intro: 'Click to open the full trade idea with all the educator\'s notes and context.', position: 'top' });
      return steps;
    },
    onDone: () => navigate('/trading-strategies', { state: { continueTour: true } }),
    delay: 1200,
  });
  // ─────────────────────────────────────────────────────────────────────────────────

  const handleCloseView = () => {
    setIsViewOpen(false);
  };

  const statusPriority = {
    pending: 1,
    active: 2,
    default: 3,
  };

  const call = () => {
    window.alert("Link is not provide..!");
  };

  const [copiedField, setCopiedField] = useState({ id: null, field: null });

  const handleCopyField = async (tradeId, fieldName, value) => {
    try {
      await navigator.clipboard.writeText(value ?? "N/A");
      setCopiedField({ id: tradeId, field: fieldName });
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
  const ideaType = ["all", "buy", "sell"];

  const handleDateRangeChangeCallback = (startDate, endDate, rangeName) => {
    setSelectedDateRange({
      start: startDate,
      end: endDate,
      rangeName,
    });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-1 mb-2 li-filter-bar">
        <div className="flex gap-3 sm:gap-6 pb-2 flex-wrap">
          <div className="flex flex-wrap items-center sm:justify-start gap-3 mb-2">
            <div className="py-1 px-2 flex overflow-auto bg-gray-100 rounded-md gap-3 sm:gap-3.5 shadow-md">
              {ideaType.map((idea) => (
                <button
                  key={idea}
                  onClick={() => {
                    setActiveIdea(idea);
                    setTradeIdeas([]);
                    setRefreshKey((prev) => prev + 1);
                    setPage(1);
                  }}
                  className={`
         p-2 flex items-center text-xs sm:text-sm rounded-md font-medium transition-all
        ${activeIdea === idea
                      ? "bg-primary text-white shadow-lg shadow-primary/50"
                      : "text-gray-600 hover:bg-gray-300"
                    }
      `}
                >
                  {(idea === "all" && "All Live Ideas") ||
                    idea.charAt(0).toUpperCase() + idea.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 relative">
              <CustomDateRangePicker
                handleDateRangeChangeCallback={handleDateRangeChangeCallback}
              />
            </div>
            <div className="flex items-center gap-2  relative">
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
            </div>
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

            <div className="flex items-center gap-2 relative ">
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
                        No Asset lass found
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
          </div>
        </div>

        {/* {
          <div className="flex gap-3 sm:gap-6 pb-4 flex-wrap">
            <SearchFilterInput
              searchText={searchText}
              handleSearchChange={handleSearchChange}
              className="mt-[-4px]"
            />
          </div>
        } */}
      </div>
      <div className="grid grid-cols-12 gap-6 mb-6 li-stats-row">
        {/* Winning Trades */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4">
          <div
            className="flex items-center justify-between
                  border rounded-2xl px-5 py-4 shadow-md "
          >
            <div className="flex flex-col  ">
              <span className="text-gray-700 text-sm">Winning Ideas</span>
              <span className="text-emerald-400  font-bold">
                {totalSummary.map((item) => item.winCount) || 0}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-emerald-400 text-xl">
                <ArrowUpRight />
              </span>
            </div>
          </div>
        </div>

        {/* Losing Trades */}
        <div className="col-span-12 sm:col-span-6 md:col-span-4">
          <div
            className="flex items-center justify-between 
                  border rounded-2xl px-5 py-4 shadow-md"
          >
            <div className="flex flex-col  ">
              <span className="text-gray-700 text-sm">Losing Ideas</span>
              <span className="text-red-400  font-bold">
                {" "}
                {totalSummary.map((item) => item.loseCount) || 0}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-red-400 text-xl">
                <ArrowDownRight />
              </span>
            </div>
          </div>
        </div>

        {/* Total Pips */}
        <div className="col-span-12 md:col-span-4">
          <div
            className="flex items-center justify-between 
                  border rounded-2xl px-5 py-4 shadow-md"
          >
            <div className="flex flex-col  ">
              <span className="text-gray-700 text-sm">Total Pips</span>
              <span className="text-amber-400 font-bold">
                {totalSummary.map((item) => item.netPips) > 0 && "+ "}
                {totalSummary.map((item) => item.netPips) || 0}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-amber-400 text-xl">
                <TrendingUp />
              </span>
            </div>
          </div>
        </div>
      </div>

      {isLoading && page === 1 ? (
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
      ) : isFetching && !isLoading && page === 1 ? (
        <div className="col-span-12 flex items-center justify-center py-20">
          <div className="text-gray-700 text-lg font-semibold">
            <Loader />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradeIdeas?.map((trade, index) => (
            <div
              key={trade._id}
              className={`relative isolate rounded-2xl p-[1.125rem] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col h-full border border-slate-200 dark:border-[#1F1F35] ${index === 0 ? ' li-first-card' : ''}`}
              ref={index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null}
            >
              {/* ── Header: Strategy Name (primary) + Signal Type ── */}
              <div className="flex items-start gap-1 mb-2">
                <div className="flex-1 min-w-0">
                  {/* Strategy name + Status */}
                  {/* Row 1: Educator - Pair + Status */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight min-w-0">
                      <img
                        src={`${trade?.educatorDetails?.image || ""}`}
                        alt={trade?.educatorDetails?.first_name}
                        className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="flex items-center min-w-0">
                        <span className="truncate">{trade?.educatorDetails?.first_name} {trade?.educatorDetails?.last_name}</span>
                        <span className="flex-shrink-0 whitespace-nowrap">&nbsp;- {trade.name || "—"}</span>
                      </span>
                    </span>
                    {trade.status && (
                      <span
                        className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0 whitespace-nowrap ${LabelMap[trade.status] === 'Active' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' :
                          LabelMap[trade.status] === 'Pending' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' :
                            LabelMap[trade.status] === 'Win' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                              LabelMap[trade.status] === 'Partial Win' ? 'bg-emerald-400/15 text-emerald-500 dark:text-emerald-400' :
                                LabelMap[trade.status] === 'Loss' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                                  'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {LabelMap[trade.status] === 'Win' ? `WIN +${trade.pips} pips` :
                          LabelMap[trade.status] === 'Loss' ? `LOSS -${trade.pips} pips` :
                            LabelMap[trade.status]}
                      </span>
                    )}
                  </div>

                  {/* Row 2: Type - Timeframe */}
                  <div className="flex items-center justify-between gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
                    {(trade.type || trade.timeFrame) && (
                      <span
                        className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-extrabold flex-shrink-0 border leading-none ${trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                          }`}
                      >
                        {trade.type === 'buy' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {trade.type ? trade.type.charAt(0).toUpperCase() + trade.type.slice(1).toLowerCase() : ""}
                        {trade.timeFrame ? ` - ${Array.isArray(trade.timeFrame) ? trade.timeFrame.join('/') : trade.timeFrame}` : ""}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                      {trade.createdAt ? format(new Date(trade.createdAt), "MMM dd, hh:mm a") : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Chart Image Thumbnail ── */}
              <div className="-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px]">
                {trade.image && trade.image.length > 0 ? (
                  <>
                    <img
                      // Newest image first, so a follow-up's latest chart leads. Only the
                      // lookup flips — the length/index checks around it are order-agnostic.
                      src={getLatestFirstImages(trade)[trade.currentIndex ?? 0]}
                      alt={trade.pair || trade.name}
                      className="w-full h-[220px] object-cover object-right transition-opacity duration-300 cursor-pointer"
                      onClick={() => {
                        setSelectedIdea(trade);
                        setIsLightBoxOpen(true);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIdea(trade);
                        setIsLightBoxOpen(true);
                      }}
                      className="absolute right-2 bottom-2 text-white p-1.5 bg-black/50 hover:bg-black/70 rounded-md backdrop-blur-sm transition-colors z-30"
                    >
                      <Eye size={14} />
                    </button>
                    {trade.image.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTradeIdeas((prev) =>
                              prev.map((t) =>
                                t._id === trade._id
                                  ? {
                                    ...t,
                                    currentIndex: (t.currentIndex ?? 0) === 0 ? t.image.length - 1 : (t.currentIndex ?? 0) - 1,
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
                                t._id === trade._id
                                  ? {
                                    ...t,
                                    currentIndex: (t.currentIndex ?? 0) === t.image.length - 1 ? 0 : (t.currentIndex ?? 0) + 1,
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
                          {trade.image.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${(trade.currentIndex ?? 0) === idx ? "bg-white" : "bg-white/40"
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
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600 tracking-wide">No Chart Loading...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Structured Price Levels / Content ── */}
              <div className="mb-2 space-y-1.5 flex-1">
                {/* Description always leads, above Entry/Invalidation/Exits — the caption
                    reads first, matching the Follow-Up card layout. */}
                <ExpandableDescription html={trade?.description || trade?.message} />
                {trade.entry && (
                  <div
                    className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                    onClick={() => handleCopyField(trade._id, "Entry", trade.entry)}
                  >
                    <span className="text-[12px] text-slate-600 dark:text-white font-medium">Entry</span>
                    <span className="text-[12px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                      {copiedField.id === trade._id && copiedField.field === "Entry" ? (
                        <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                      ) : null}
                      <span className="text-[10px]">📍</span> {trade.entry}
                      <Copy size={10} className="text-slate-400 dark:text-white/50" />
                    </span>
                  </div>
                )}
                {trade.invalidation && (
                  <div
                    className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                    onClick={() => handleCopyField(trade._id, "Stop Loss", trade.invalidation)}
                  >
                    <span className="text-[12px] text-slate-600 dark:text-white font-medium">Invalidation</span>
                    <span className="text-[12px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                      {copiedField.id === trade._id && copiedField.field === "Stop Loss" ? (
                        <span className="text-[9px] text-red-500 mr-1">Copied</span>
                      ) : null}
                      <span className="text-[10px]">❌</span> {trade.invalidation}
                      <Copy size={10} className="text-slate-400 dark:text-white/50" />
                    </span>
                  </div>
                )}
                {["Exit1", "Exit2", "Exit3"].map((tpField, idx) => {
                  const tpValue = trade?.exits?.[idx];
                  if (!tpValue && tpValue !== 0) return null;
                  const fieldName = `Exit ${idx + 1}`;
                  return (
                    <div
                      key={tpField}
                      className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                      onClick={() => handleCopyField(trade._id, fieldName, tpValue)}
                    >
                      <span className="text-[12px] text-slate-600 dark:text-white font-medium">{fieldName}</span>
                      <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        {copiedField.id === trade._id && copiedField.field === fieldName ? (
                          <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                        ) : null}
                        <span className="text-[10px]">🎯</span> {tpValue}
                        <Copy size={10} className="text-slate-400 dark:text-white/50" />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* View Details Button */}
              <button
                className={`w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 dark:hover:text-white font-semibold py-2 mt-2 rounded-lg flex items-center justify-center gap-1.5 text-[12px] transition-colors${index === 0 ? ' li-view-btn' : ''}`}
                onClick={() => {
                  setSelectedIdea(trade);
                  setIsViewOpen(true);
                }}
              >
                <Eye size={14} /> View Details
              </button>
            </div>
          ))}

          <ViewClientLiveIdeas
            isViewOpen={isViewOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            handleCloseView={handleCloseView}
            selectedIdea={selectedIdea}
          />
          <ImageLightBox
            isLightBoxOpen={isLightBoxOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            selectedIdea={selectedIdea}
          />
        </div>
      )}
      {isFetching && page > 1 && (
        <p className="text-center text-gray-600 mt-4 text-sm">
          Loading more...
        </p>
      )}
    </div>
  );
};

export default ClientLiveIdeas;
