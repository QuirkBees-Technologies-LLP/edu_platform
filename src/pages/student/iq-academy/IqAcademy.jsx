import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import {
  useGetAcademyCategoryQuery,
  useGetAcademySingleCategoryQuery,
} from "../../../store/api/client/clientAcademyCategoryApiSlice";
import { useGetCategoryWiseStrategyQuery } from "../../../store/api/client/clientStrategiesApiSlice";
import { useGetStrategiesNameQuery } from "../../../store/api/client/clientStrategiesApiSlice";
import Loader from "../../../components/ui/loader";
import { addDays, startOfWeek } from "date-fns";
import { CalendarDays, List } from "lucide-react";
import GridView from "./GridView";
import ListView from "./ListView";

function toEST(date) {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
}

export default function IqAcademy() {
  const selectedLanguage = useSelector(selectSelectedLanguage);
  const navigate = useNavigate();

  const [weekOffset, setWeekOffset] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeEducatorId, setActiveEducatorId] = useState("all");
  const [activeStrategyId, setActiveStrategyId] = useState("all");
  const [viewType, setViewType] = useState("grid");

  // Filter states for list view (arrays for multi-select)
  const [tradingType, setTradingType] = useState([]);
  const [tradingMethod, setTradingMethod] = useState([]);
  const [timeZone, setTimeZone] = useState([]);
  const [statusType, setStatusType] = useState(""); // ONGOING, UPCOMING, PAST

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
    useGetStrategiesNameQuery();

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
        startDate: displayedWeekStart.toISOString(),
        endDate: displayedWeekEnd.toISOString(),
      },
      { skip: !activeCategoryId || viewType !== "grid" }
    );

  // Fetch strategy data for list view
  const { data: strategyData, isLoading: isStrategyLoading } =
    useGetCategoryWiseStrategyQuery(
      {
        id: activeCategoryId,
        language: selectedLanguage,
        startDate: displayedWeekStart.toISOString(),
        endDate: displayedWeekEnd.toISOString(),
        tradingType: tradingType.length > 0 ? tradingType.join(",") : undefined,
        tradingMethod: tradingMethod.length > 0 ? tradingMethod.join(",") : undefined,
        timeZone: timeZone.length > 0 ? timeZone.join(",") : undefined,
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
      ? strategyEducators.find((e) => e._id === activeEducatorId)
      : educators.find((e) => e._id === activeEducatorId);

  const isInitialLoading =
    isCategoryLoading ||
    (viewType === "grid" && isDetailLoading) ||
    (viewType === "list" && isStrategyLoading) ||
    !activeCategoryId;

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
      <div className="flex gap-4 mb-6 justify-between">
        {viewType == "grid" && (
          <div className="flex gap-4">
            {
              strategiesName?.data?.map((strategy) => (
                <button
                  key={strategy._id}
                  onClick={() => {
                    setActiveStrategyId(strategy._id);
                  }}
                  className={`pb-2 border-b-2 text-sm ${activeStrategyId === strategy._id
                    ? "border-gray-500 text-black dark:text-gray-500"
                    : "border-transparent text-gray-500"
                    }`}
                >
                  {strategy.title}
                </button>
              ))
            }
          </div>
        )}
        <div className="flex gap-4">
          {categoryData?.data?.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setActiveCategoryId(cat._id);
                setActiveEducatorId("all");
              }}
              className={`pb-2 border-b-2 text-sm ${activeCategoryId === cat._id
                ? "border-gray-500 text-black dark:text-gray-500"
                : "border-transparent text-gray-500"
                }`}
            >
              {cat.name}
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

      {/* WEEK TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* Left: Week Tabs */}
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

        {/* Right: View Tabs - Desktop */}
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
      </div>



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
            activeCategoryData={categoryData?.data?.find(c => c._id === activeCategoryId)}
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
            activeCategoryData={categoryData?.data?.find(c => c._id === activeCategoryId)}
          />
        )}
      </div>
    </div>
  );
}
