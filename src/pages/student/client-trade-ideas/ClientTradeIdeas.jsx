import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { useTourStep } from "@/hooks/useTourStep";
import {
  useGetAllEducatorsQuery,
  useGetClientTradeIdeasQuery,
} from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ViewClientTradeIdeas from "./ViewClientTradeIdeas";
import ImageLightBox from "./ImageLightBox";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
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
const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
};

const ClientTradeIdeas = () => {
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
    useGetClientTradeIdeasQuery({
      page,
      limit,
      status,
      educator,
      categoryName: category.length > 0 ? category : undefined,
      activeIdea: activeIdea ? activeIdea : "all",
      startDate: selectedDateRange.start
        ? format(selectedDateRange.start, "yyyy-MM-dd 00:00:00")
        : "",
      endDate: selectedDateRange.end
        ? format(selectedDateRange.end, "yyyy-MM-dd 23:59:59")
        : "",
    });

  const { data: educatorsData } = useGetAllEducatorsQuery();
  const { data: categoryList } = useGetCommonCategoryQuery();
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
        // Append new unique items only
        setTradeIdeas((prevIdeas) => {
          const newIdeas = data.data.filter(
            (idea) => !prevIdeas.some((prev) => prev._id === idea._id),
          );
          return [...prevIdeas, ...newIdeas];
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

  // ─── Trade Ideas Tour ────────────────────────────────────────────────────────────────────
  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isLoading,
    getSteps: () => {
      const steps = [];
      const filterBar = document.querySelector('.ti-filter-bar');
      if (filterBar) steps.push({ element: filterBar, title: '🔍 Filter Trade Ideas', intro: 'Refine trade ideas using the filters above filter by direction (Buy/Sell), date range, result (Win/Loss/Active), specific educator, or asset class (Forex, Crypto, etc.).', position: 'bottom' });
      const statsRow = document.querySelector('.ti-stats-row');
      if (statsRow) steps.push({ element: statsRow, title: '📊 Performance Summary', intro: 'A quick snapshot of results: <strong>Winning Ideas</strong>, <strong>Losing Ideas</strong>, and total <strong>Net Pips</strong> based on the current filters.', position: 'bottom' });
      const firstCard = document.querySelector('.ti-first-card');
      if (firstCard) steps.push({ element: firstCard, title: '📈 Trade Idea Card', intro: 'Each card shows the trade direction (Buy/Sell), the educator, entry price, stop loss, and take profit targets. The status badge tells you if the trade is <strong>Active, Pending, Won, or Lost</strong>.', position: 'right' });
      const viewBtn = document.querySelector('.ti-view-btn');
      if (viewBtn) steps.push({ element: viewBtn, title: '👁️ View Details', intro: 'Click to open the full trade idea including the chart, detailed notes, and the educator\'s complete analysis.', position: 'top' });
      return steps;
    },
    onDone: () => navigate('/iq-insight', { state: { continueTour: true } }),
    delay: 500,
  });
  // ────────────────────────────────────────────────────────────────────────────────────

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
      <div className="flex flex-wrap items-center justify-between gap-1 mb-2 ti-filter-bar">
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
                  {(idea === "all" && "All Ideas") ||
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
      <div className="grid grid-cols-12 gap-6 mb-6 ti-stats-row">
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
              className={`bg-white dark:bg-[#0F0F1A] border rounded-2xl shadow-md${index === 0 ? ' ti-first-card' : ''}`}
              ref={index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null}
            >
              {/* Chart placeholder */}
              <div className="relative h-[300px] rounded-t-[20px] overflow-hidden">
                {/* <img
                  src="/media/images/2600x1600/banner_3.jpg"
                  alt="Academy"
                  className="w-full h-full object-cover"
                /> */}

                {/* <div className="relative h-[28vh] w-full overflow-hidden"> */}
                {trade.image && trade.image.length > 0 && (
                  <>
                    <img
                      src={trade.image[trade.currentIndex ?? 0]}
                      alt={trade.pair}
                      className="w-full h-full object-cover cursor-pointer transition-all duration-500"
                      onClick={() => {
                        setSelectedIdea(trade);
                        setIsLightBoxOpen(true);
                      }}
                    />

                    <button
                      onClick={() => {
                        setSelectedIdea(trade);
                        setIsLightBoxOpen(true);
                      }}
                      className="absolute left-2 bottom-2 text-primary p-2 bg-white bg-opacity-90 rounded-full shadow z-30"
                    >
                      <Eye size={20} />
                    </button>

                    {trade.image.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            setTradeIdeas((prev) =>
                              prev.map((t) =>
                                t._id === trade._id
                                  ? {
                                    ...t,
                                    currentIndex:
                                      (t.currentIndex ?? 0) === 0
                                        ? t.image.length - 1
                                        : (t.currentIndex ?? 0) - 1,
                                  }
                                  : t,
                              ),
                            );
                          }}
                          className="!left-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md absolute top-1/2 -translate-y-1/2"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <button
                          onClick={() => {
                            setTradeIdeas((prev) =>
                              prev.map((t) =>
                                t._id === trade._id
                                  ? {
                                    ...t,
                                    currentIndex:
                                      (t.currentIndex ?? 0) ===
                                        t.image.length - 1
                                        ? 0
                                        : (t.currentIndex ?? 0) + 1,
                                  }
                                  : t,
                              ),
                            );
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2!right-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md -translate-y-1/2"
                        >
                          <ChevronRight size={20} />
                        </button>

                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                          {trade.image.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === trade._id
                                      ? { ...t, currentIndex: idx }
                                      : t,
                                  ),
                                );
                              }}
                              className={`w-2.5 h-2.5 rounded-full transition-colors ${(trade.currentIndex ?? 0) === idx
                                ? "bg-primary"
                                : "bg-gray-300 hover:bg-gray-400"
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                {/* </div> */}

                {/* OVERLAY BLOCK */}
                <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2 ${trade.type === "buy"
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      {trade.type === "buy" ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {trade.type.toUpperCase()}
                    </button>

                    <div className="bg-gray-800 px-2 py-1 rounded-lg font-semibold text-xs text-white">
                      {trade.name}
                    </div>
                  </div>

                  {LabelMap[trade.status] === "Active" && (
                    <div className="bg-cyan-700 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      {LabelMap[trade.status]}
                    </div>
                  )}
                  {LabelMap[trade.status] === "Pending" && (
                    <div className="bg-purple-700 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      {LabelMap[trade.status]}
                    </div>
                  )}

                  {LabelMap[trade.status] === "Win" && (
                    <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                      <span>★</span>
                      WIN +{trade.pips} pips
                    </div>
                  )}

                  {LabelMap[trade.status] === "Loss" && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                      <span>▲</span>
                      LOSS -{trade.pips} pips
                    </div>
                  )}
                  {LabelMap[trade.status] === "Partial Win" && (
                    <div className="bg-purple-500 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                      <span>▲</span>
                      PARTIAL WIN {trade.pips} pips
                    </div>
                  )}
                  {LabelMap[trade.status] === "Break Even" && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                      Break Even
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Trader Info */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white cursor-pointer ${trade.avatarColor
                        }`}
                      onClick={() => navigate(`/iq-educators/${trade?.educatorDetails?._id}`)}
                    >
                      <img
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        src={`${trade?.educatorDetails?.image}`}
                        alt=""
                      />
                    </div>
                    <div>
                      <div
                        className="dark:text-white font-semibold cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/iq-educators/${trade?.educatorDetails?._id}`)}
                      >
                        {trade?.educatorDetails?.first_name}{" "}
                        {trade?.educatorDetails?.last_name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {Array.isArray(trade?.educatorDetails?.categories) &&
                          trade?.educatorDetails?.categories?.length > 0
                          ? trade?.educatorDetails?.categories
                            .map((cat) => cat)
                            .join(", ")
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-600 text-sm">
                    {trade.createdAt
                      ? format(
                        new Date(trade.createdAt),
                        "MMM dd, yyyy, hh:mm a",
                      )
                      : ""}
                  </div>
                </div>

                {/* Trade Details */}
                <div className="space-y-3 mb-6">
                  {/* ENTRY */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 dark:text-white-200">
                      Entry
                    </span>

                    <span className="font-mono flex items-center gap-2 text-dark dark:text-white">
                      {copiedField.id === trade._id &&
                        copiedField.field === "Entry" ? (
                        <span className="text-black dark:text-white text-xs bg-transparent">
                          Copied!
                        </span>
                      ) : (
                        trade.entry && (
                          <button
                            onClick={() =>
                              handleCopyField(trade._id, "Entry", trade.entry)
                            }
                            className="text-gray-800 dark:text-white-200 flex items-center"
                          >
                            <Copy size={14} />
                          </button>
                        )
                      )}

                      {trade.entry}
                    </span>
                  </div>

                  {/* STOP LOSS */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Invalidation</span>

                    <span className="text-red-600 font-mono flex items-center gap-2">
                      {copiedField.id === trade._id &&
                        copiedField.field === "Stop Loss" ? (
                        <span className="text-dark bg-white text-xs">
                          Copied!
                        </span>
                      ) : (
                        trade.invalidation && (
                          <button
                            onClick={() =>
                              handleCopyField(
                                trade._id,
                                "Stop Loss",
                                trade.invalidation,
                              )
                            }
                            className="text-red-600 flex items-center"
                          >
                            <Copy size={14} />
                          </button>
                        )
                      )}

                      {trade.invalidation}
                    </span>
                  </div>

                  {["Exit1", "Exit2", "Exit3"].map((tpField, idx) => {
                    const tpValue = trade?.exits?.[idx] ?? "N/A";
                    const fieldName = `Exit ${idx + 1}`;

                    return (
                      <div
                        className="flex justify-between items-center"
                        key={tpField}
                      >
                        <span className="text-gray-800">{fieldName}</span>

                        <span className="text-emerald-600 font-mono flex items-center gap-2">
                          {copiedField.id === trade._id &&
                            copiedField.field === fieldName ? (
                            <span className="text-dark bg-white text-xs">
                              Copied!
                            </span>
                          ) : (
                            tpValue !== "N/A" && (
                              <button
                                onClick={() =>
                                  handleCopyField(trade._id, fieldName, tpValue)
                                }
                                className="text-gray-800 flex items-center"
                              >
                                <Copy size={14} />
                              </button>
                            )
                          )}

                          {tpValue}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* View Details Button */}
                <button
                  className={`w-full bg-gray-200 hover:bg-gray-700/50 border dark:text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors${index === 0 ? ' ti-view-btn' : ''}`}
                  onClick={() => {
                    setSelectedIdea(trade);
                    setIsViewOpen(true);
                  }}
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            </div>
          ))}

          <ViewClientTradeIdeas
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

export default ClientTradeIdeas;
