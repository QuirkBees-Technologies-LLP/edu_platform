import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import {
  useGetAcademyCategoryQuery,
  useGetAcademySingleCategoryQuery,
} from "../../../store/api/client/clientAcademyCategoryApiSlice";
import { useGetCategoryWiseStrategyQuery, useGetAdminStrategyListQuery } from "../../../store/api/client/clientStrategiesApiSlice";
import Loader from "../../../components/ui/loader";
import { addDays, startOfWeek } from "date-fns";
import { CalendarDays, List, RotateCcw, ChevronDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
} from "../../../components/ui/command";
import GridView from "./GridView";
import ListView from "./ListView";

function toEST(date) {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
}


// Filter options
const tradingTypeOptions = [
  { value: "scalper", label: "Scalper" },
  { value: "day_trader", label: "Day Trader" },
  { value: "swing_trader", label: "Swing Trader" },
  { value: "news_trading", label: "News Trading" },
];

const tradingMethodOptions = [
  { value: "price_action", label: "Price Action" },
  { value: "institutional", label: "Institutional" },
  // { value: "wyckoff", label: "Wyckoff" },
  // { value: "elliot", label: "Elliot" },
  { value: "harmonics", label: "Harmonics" },
];

const timeZoneOptions = [
  { value: "new_york", label: "New York" },
  { value: "london", label: "London" },
  { value: "asian", label: "Asian" },
];

export default function IqAcademy() {
  const selectedLanguage = useSelector(selectSelectedLanguage);
  const navigate = useNavigate();

  const [weekOffset, setWeekOffset] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeEducatorId, setActiveEducatorId] = useState("all");
  const [activeStrategyId, setActiveStrategyId] = useState("all");
  const [viewType, setViewType] = useState("grid");

  // Reset filters when view type changes
  useEffect(() => {
    setTradingType([]);
    setTradingMethod([]);
    setTimeZone([]);
    setStatusType("");
    setActiveStrategyId("all");
    setActiveEducatorId("all");
  }, [viewType]);



  // Filter states for list view (arrays for multi-select)
  const [tradingType, setTradingType] = useState([]);
  const [tradingMethod, setTradingMethod] = useState([]);
  const [timeZone, setTimeZone] = useState([]);
  const [statusType, setStatusType] = useState(""); // ONGOING, UPCOMING, PAST

  /* Helper function for multi-select logic */
  const handleMultiSelect = (value, currentSelected, setSelected) => {
    if (currentSelected?.includes(value)) {
      setSelected(currentSelected?.filter((item) => item !== value));
    } else {
      setSelected([...(currentSelected || []), value]);
    }
  };

  const startOfCurrentWeek = startOfWeek(toEST(new Date()), {
    weekStartsOn: 0,
  });
  const displayedWeekStart = addDays(startOfCurrentWeek, weekOffset * 7);
  const displayedWeekEnd = addDays(displayedWeekStart, 6);

  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(displayedWeekStart, i)
  );

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetAcademyCategoryQuery();

  const { data: strategiesName, isLoading: isStrategNameLoading } =
    useGetAdminStrategyListQuery();

  const activeCategory = categoryData?.data?.find(
    (c) => c?._id === activeCategoryId
  );

  const isDigitalMarketing =
    activeCategory?.name?.toLowerCase()?.includes("digital") ||
    activeCategory?.slug?.toLowerCase()?.includes("digital");

  // Reset filters when category changes to Digital Marketing
  useEffect(() => {
    if (isDigitalMarketing) {
      setTradingType([]);
      setTradingMethod([]);
      setTimeZone([]);
      setStatusType("");
      setActiveStrategyId("all");
      setActiveEducatorId("all");
    }
  }, [activeCategoryId, isDigitalMarketing]);

  useEffect(() => {
    if (!isCategoryLoading && categoryData?.data?.length > 0) {
      setActiveCategoryId(categoryData?.data?.[0]?._id);
    }
  }, [isCategoryLoading, categoryData]);

  const { data: singleCategoryData, isLoading: isDetailLoading } =
    useGetAcademySingleCategoryQuery(
      {
        id: activeCategoryId,
        language: selectedLanguage,
        startDate: displayedWeekStart?.toISOString(),
        endDate: displayedWeekEnd?.toISOString(),
        tradingType: tradingType?.length > 0 ? tradingType?.join(",") : undefined,
        tradingMethod: tradingMethod?.length > 0 ? tradingMethod?.join(",") : undefined,
        timeZone: timeZone?.length > 0 ? timeZone?.join(",") : undefined,
        type: statusType,
        strategyId: activeStrategyId !== "all" ? activeStrategyId : undefined,
      },
      { skip: !activeCategoryId || viewType !== "grid" }
    );

  // Fetch strategy data for list view
  const { data: strategyData, isLoading: isStrategyLoading } =
    useGetCategoryWiseStrategyQuery(
      {
        id: activeCategoryId,
        language: selectedLanguage,
        startDate: displayedWeekStart?.toISOString(),
        endDate: displayedWeekEnd?.toISOString(),
        tradingType: tradingType?.length > 0 ? tradingType?.join(",") : undefined,
        tradingMethod: tradingMethod?.length > 0 ? tradingMethod?.join(",") : undefined,
        timeZone: timeZone?.length > 0 ? timeZone?.join(",") : undefined,
        type: statusType,
        strategyId: activeStrategyId !== "all" ? activeStrategyId : undefined,
      },
      { skip: !activeCategoryId || viewType !== "list" }
    );

  const educators = singleCategoryData?.data?.category?.educators || [];
  const strategyEducators = strategyData?.data?.category?.educators || [];

  useEffect(() => {
    // activeEducatorId defaults to "all", no need to set to first educator
  }, [educators, strategyEducators, viewType]);

  // For "all" selection, combine all educators' courses
  const activeEducator = activeEducatorId === "all"
    ? {
      _id: "all",
      first_name: "All",
      last_name: "Educators",
      image: null,
      ongoing: (viewType === "list" ? strategyEducators : educators).flatMap(e => e?.ongoing || []),
      upcoming: (viewType === "list" ? strategyEducators : educators).flatMap(e => e?.upcoming || []),
      past: (viewType === "list" ? strategyEducators : educators).flatMap(e => e?.past || []),
      courses: (viewType === "list" ? strategyEducators : educators).flatMap(e =>
        (e?.ongoing || []).concat(e?.upcoming || []).concat(e?.past || []).concat(e?.courses || [])
      ),
    }
    : viewType === "list"
      ? strategyEducators?.find((e) => e?._id === activeEducatorId)
      : educators?.find((e) => e?._id === activeEducatorId);

  const isInitialLoading =
    isCategoryLoading ||
    (viewType === "grid" && isDetailLoading) ||
    (viewType === "list" && isStrategyLoading) ||
    !activeCategoryId;

  /* --- RENDER HELPERS --- */

  const renderWeekTabs = () => (
    <div className="flex gap-6">
      <button
        onClick={() => setWeekOffset(0)}
        className={`pb-3 ${weekOffset === 0
          ? "border-b-2 border-primary text-primary font-semibold"
          : "text-gray-500 hover:text-gray-700"
          }`}
      >
        {viewType === "list" ? "Today's Schedule" : "Current Week"}
      </button>

      {viewType !== "list" && (
        <button
          onClick={() => setWeekOffset(1)}
          className={`pb-3 ${weekOffset === 1
            ? "border-b-2 border-primary text-primary font-semibold"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Next Week
        </button>
      )}
    </div>
  );

  const renderViewToggle = () => (
    <div className="hidden md:flex bg-gray-100 rounded-lg p-1 w-fit">
      <button
        onClick={() => setViewType("grid")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${viewType === "grid"
          ? "bg-primary text-white shadow font-semibold"
          : "text-gray-500 hover:text-gray-700"
          }`}
      >
        <CalendarDays size={20} />
      </button>

      <button
        onClick={() => setViewType("list")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${viewType === "list"
          ? "bg-primary text-white shadow font-semibold"
          : "text-gray-500 hover:text-gray-700"
          }`}
      >
        <List size={20} />
      </button>
    </div>
  );



  const renderFiltersAndReset = () => (
    <>
      {/* Trading Type Multi-Select */}
      <div className="flex items-center gap-2 relative">
        <Popover>
          <PopoverTrigger asChild>
            <button className="min-w-40 xl:min-w-56 h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]">
              <span className="truncate text-sm">
                {tradingType?.length > 0
                  ? `${tradingType?.length} Style Selected`
                  : "Select Trading Style"}
              </span>
              <ChevronDown size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[225px] p-0">
            <Command>
              <CommandGroup>
                {tradingTypeOptions?.map((item) => {
                  const selected = tradingType?.includes(item?.value);
                  return (
                    <CommandItem
                      key={item?.value}
                      onSelect={() =>
                        handleMultiSelect(item?.value, tradingType, setTradingType)
                      }
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
                      {item?.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {tradingType?.length > 0 && (
          <button
            type="button"
            onClick={() => setTradingType([])}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            ✖
          </button>
        )}
      </div>

      {/* Trading Method Multi-Select */}
      <div className="flex items-center gap-2 relative">
        <Popover>
          <PopoverTrigger asChild>
            <button className="min-w-40 xl:min-w-56 h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]">
              <span className="truncate text-sm">
                {tradingMethod?.length > 0
                  ? `${tradingMethod?.length} Method Selected`
                  : "Select Trading Method"}
              </span>
              <ChevronDown size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[225px] p-0">
            <Command>
              <CommandGroup>
                {tradingMethodOptions?.map((item) => {
                  const selected = tradingMethod?.includes(item?.value);
                  return (
                    <CommandItem
                      key={item?.value}
                      onSelect={() =>
                        handleMultiSelect(
                          item?.value,
                          tradingMethod,
                          setTradingMethod
                        )
                      }
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
                      {item?.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {tradingMethod?.length > 0 && (
          <button
            type="button"
            onClick={() => setTradingMethod([])}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            ✖
          </button>
        )}
      </div>

      {/* Time Zone Multi-Select */}
      <div className="flex items-center gap-2 relative">
        <Popover>
          <PopoverTrigger asChild>
            <button className="min-w-40 xl:min-w-56 h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]">
              <span className="truncate text-sm">
                {timeZone?.length > 0
                  ? `${timeZone?.length} Zone Selected`
                  : "Select Time Zone"}
              </span>
              <ChevronDown size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[225px] p-0">
            <Command>
              <CommandGroup>
                {timeZoneOptions?.map((item) => {
                  const selected = timeZone?.includes(item?.value);
                  return (
                    <CommandItem
                      key={item?.value}
                      onSelect={() =>
                        handleMultiSelect(item?.value, timeZone, setTimeZone)
                      }
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
                      {item?.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {timeZone?.length > 0 && (
          <button
            type="button"
            onClick={() => setTimeZone([])}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            ✖
          </button>
        )}
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={() => {
          setTradingType([]);
          setTradingMethod([]);
          setTimeZone([]);
          setActiveStrategyId("all");
          setActiveEducatorId("all");
        }}
        className="h-11 px-4 flex items-center gap-2 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 bg-slate-400 hover:bg-slate-700 text-white rounded-md font-medium transition-colors"
      >
        <RotateCcw size={16} />
        Reset
      </button>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      {isInitialLoading && (
        <div className="py-10 flex justify-center">
          <Loader />
        </div>
      )}

      {isStrategNameLoading && (
        <div className="py-10 flex justify-center">
          <Loader />
        </div>
      )}


      {/* CATEGORY TABS */}
      <div className="flex gap-4 mb-6 justify-between flex-wrap">
        {viewType == "grid" && !isDigitalMarketing && (
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {/* All Strategies Option */}
            <button
              onClick={() => setActiveStrategyId("all")}
              className="flex flex-col items-center gap-2 group min-w-[72px]"
            >
              <div
                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all bg-white dark:bg-gray-800 ${activeStrategyId === "all"
                  ? "border-2 border-primary scale-110 shadow-sm mt-1"
                  : "border-2 border-transparent group-hover:border-gray-200"
                  }`}
              >
                <img
                  src="/media/Icons/All.jpeg"
                  className="w-full h-full rounded-full object-cover bg-white pointer-events-none"
                  alt=""
                />
              </div>
              <span
                className={`text-xs font-medium text-center whitespace-nowrap transition-colors ${activeStrategyId === "all"
                  ? "text-primary"
                  : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                  }`}
              >
                All
              </span>
            </button>
            {strategiesName?.data?.map((strategy) => (
              <button
                key={strategy?._id}
                onClick={() => {
                  setActiveStrategyId(strategy?._id);
                }} // Added min-w to prevent shrinking
                className="flex flex-col items-center gap-2 group min-w-[72px]"
              >
                <div
                  className={`relative w-14 h-14 rounded-full p-0.5 border-2 transition-all duration-200 ${activeStrategyId === strategy?._id
                    ? "border-primary scale-110 shadow-sm mt-1"
                    : "border-transparent group-hover:border-gray-200"
                    }`}
                >
                  <img
                    src={strategy?.imageUrl}
                    alt={strategy?.title}
                    className="w-full h-full rounded-full object-cover bg-gray-100"
                  />
                </div>
                <span
                  className={`text-xs font-medium text-center whitespace-nowrap transition-colors ${activeStrategyId === strategy?._id
                    ? "text-primary"
                    : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                    }`}
                >
                  {strategy?.title}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-4 ml-auto overflow-x-auto pb-2">
          {categoryData?.data?.map((cat) => (
            <button
              key={cat?._id}
              onClick={() => {
                setActiveCategoryId(cat?._id);
                setActiveEducatorId("all");
              }}
              className={`border-b-2 text-md whitespace-nowrap ${activeCategoryId === cat?._id
                ? "border-gray-500 text-black dark:text-gray-500"
                : "border-transparent text-gray-500"
                }`}
            >
              {cat?.name}
            </button>
          ))}
        </div>
      </div>


      {/* Mobile View Toggle Buttons - Center */}

      <div className="flex md:hidden justify-center mb-6">
        <div className="bg-gray-200 dark:bg-gray-100 rounded-xl p-1.5 flex">
          <button
            onClick={() => setViewType("list")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition ${viewType === "list"
              ? "bg-primary text-white shadow-lg font-semibold"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <List size={18} />
          </button>

          <button
            onClick={() => setViewType("grid")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition ${viewType === "grid"
              ? "bg-primary text-white shadow-lg font-semibold"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <CalendarDays size={18} />
          </button>
        </div>
      </div>

      {/* VIEW-SPECIFIC HEADER LAYOUT */}
      {viewType === "grid" ? (
        /* GRID VIEW LAYOUT: Week Tabs (left) - Filters & View (Right) */
        <div className="hidden md:flex flex-row items-center justify-between mb-6 gap-4">
          {/* Left: Week Tabs */}
          {renderWeekTabs()}

          {/* Right: Filters + View Toggle */}
          {viewType === "grid" && (
            <div className="flex items-center gap-3">
              {!isDigitalMarketing && renderFiltersAndReset()}
              {renderViewToggle()}
            </div>
          )}
        </div>
      ) : (
        /* LIST VIEW LAYOUT (Original): Week Tabs + View (Row 1), Filters (Row 2, Centered) */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            {renderWeekTabs()}
            {renderViewToggle()}
          </div>
          {/* <div className="flex flex-wrap justify-center gap-4 mb-6">
            {renderFiltersAndReset()}
          </div> */}
        </>
      )}


      {/* Desktop View */}
      <div className="hidden md:block">
        {viewType === "grid" ? (
          <GridView
            educators={educators}
            days={days}
            isLoading={isInitialLoading}
            activeCategoryId={activeCategoryId}
            singleCategoryData={singleCategoryData}
          />
        ) : (
          <ListView
            strategyEducators={strategyEducators}
            strategies={strategyData?.data?.strategy || []}
            activeEducatorId={activeEducatorId}
            setActiveEducatorId={setActiveEducatorId}
            activeStrategyId={activeStrategyId}
            setActiveStrategyId={setActiveStrategyId}
            activeEducator={activeEducator}
            tradingType={tradingType}
            setTradingType={setTradingType}
            tradingMethod={tradingMethod}
            setTradingMethod={setTradingMethod}
            timeZone={timeZone}
            setTimeZone={setTimeZone}
            statusType={statusType}
            setStatusType={setStatusType}
            activeCategoryData={categoryData?.data?.find(c => c?._id === activeCategoryId)}
          />
        )}
      </div>

      {/* Mobile View - Switch between List and Grid */}
      <div className="block md:hidden">
        {viewType === "grid" ? (
          <GridView
            educators={educators}
            days={days}
            isLoading={isInitialLoading}
            activeCategoryId={activeCategoryId}
            singleCategoryData={singleCategoryData}
          />
        ) : (
          <ListView
            strategyEducators={strategyEducators}
            strategies={strategyData?.data?.strategy || []}
            activeEducatorId={activeEducatorId}
            setActiveEducatorId={setActiveEducatorId}
            activeStrategyId={activeStrategyId}
            setActiveStrategyId={setActiveStrategyId}
            activeEducator={activeEducator}
            tradingType={tradingType}
            setTradingType={setTradingType}
            tradingMethod={tradingMethod}
            setTradingMethod={setTradingMethod}
            timeZone={timeZone}
            setTimeZone={setTimeZone}
            statusType={statusType}
            setStatusType={setStatusType}
            activeCategoryData={categoryData?.data?.find(c => c?._id === activeCategoryId)}
          />
        )}
      </div>
    </div>
  );
}
