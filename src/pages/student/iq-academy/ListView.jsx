import React from "react";
import { useNavigate } from "react-router-dom";
import { isSameDay } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Calendar, Clock, ChevronDown, Check, RotateCcw } from "lucide-react";
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
import "swiper/css";
import "swiper/css/navigation";

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

// Status type options
const statusTypeOptions = [
  { value: "ONGOING", label: "Ongoing" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "PAST", label: "Past" },
];

// Timezone color mapping
const timeZoneColors = {
  new_york: "bg-[#b2a3e9]",
  london: "bg-[#FFE5E5]",
  asian: "bg-[#FFF5E5]",
};

// Timezone light background colors for course list
const timeZoneLightBgColors = {
  new_york: "bg-[#E5DEFF]",
  london: "bg-[#CCFBF1]",
  asian: "bg-[#FFF5E5]",
};

// Timezone text colors
const timeZoneTextColors = {
  new_york: "text-[#4E34E3]",
  london: "text-[#14B8A6]",
  asian: "text-[#E3A534]",
};

// Digital Marketing category colors (Sky Blue theme)
const digitalMarketingColors = {
  solid: "bg-[#2196F3]",
  light: "bg-[#E3F2FD]",
  text: "text-[#2196F3]",
};

// Helper function to check if category is Digital Marketing
const isDigitalMarketingCategory = (categoryData) => {
  const categoryName = categoryData?.name?.toLowerCase() || "";
  const categorySlug = categoryData?.slug?.toLowerCase() || "";
  return (
    categoryName === "digital marketing" ||
    categoryName === "digitalmarketing" ||
    categorySlug === "digital-marketing" ||
    categorySlug === "digitalmarketing"
  );
};

// Helper function to capitalize words (replaces underscores and capitalizes each word)
const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    ?.replace(/_/g, " ")
    ?.replace(/\b\w/g, (char) => char?.toUpperCase()) || "";
};

export default function ListView({
  strategyEducators,
  strategies,
  activeEducatorId,
  setActiveEducatorId,
  activeStrategyId,
  setActiveStrategyId,
  activeEducator,
  tradingType,
  setTradingType,
  tradingMethod,
  setTradingMethod,
  timeZone,
  setTimeZone,
  statusType,
  setStatusType,
  activeCategoryData,
}) {
  const navigate = useNavigate();

  const isToday = (datetime) => isSameDay(new Date(), new Date(datetime));

  // Check if current category is Digital Marketing
  const isDigitalMkt = isDigitalMarketingCategory(activeCategoryData);

  const handleMultiSelect = (value, currentValues, setValues) => {
    const exists = currentValues.includes(value);
    const updated = exists
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setValues(updated);
  };

  // Get color based on educator's timezone or Digital Marketing category
  const getTimeZoneColor = (educatorTimeZone) => {
    // If Digital Marketing category, use Digital Marketing color
    if (isDigitalMkt) return digitalMarketingColors.solid;

    if (!educatorTimeZone) return "bg-gray-300";
    // Handle if timeZone is an array (take first value)
    const tz = Array.isArray(educatorTimeZone)
      ? educatorTimeZone[0]
      : educatorTimeZone;
    return timeZoneColors[tz?.toLowerCase()] || "bg-gray-300";
  };

  // Get course colors based on educator's timezone or Digital Marketing category
  const getTimeZoneCourseColors = (educatorTimeZone, isHighlighted) => {
    // If Digital Marketing category, use Digital Marketing colors
    if (isDigitalMkt) {
      if (isHighlighted) {
        return `${digitalMarketingColors.solid} text-white`;
      }
      return `${digitalMarketingColors.light} ${digitalMarketingColors.text}`;
    }

    if (!educatorTimeZone)
      return isHighlighted
        ? "bg-gray-500 text-white"
        : "bg-gray-200 text-gray-700";
    const tz = Array.isArray(educatorTimeZone)
      ? educatorTimeZone[0]
      : educatorTimeZone;
    const tzLower = tz?.toLowerCase();

    if (isHighlighted) {
      return `${timeZoneColors[tzLower] || "bg-gray-500"} text-white`;
    }
    return `${timeZoneLightBgColors[tzLower] || "bg-gray-200"} ${timeZoneTextColors[tzLower] || "text-gray-700"}`;
  };

  return (
    <div className="block list_view">
      {/* 🔥 STRATEGY SLIDER */}
      {strategies?.length > 0 && (
        <div className="mb-6 relative">
          {/* Left Arrow */}
          <button
            className="swiper-button-prev-strategy absolute left-0 top-1/2 -translate-y-1/2 z-10 
             w-9 h-9 flex items-center justify-center rounded-full 
             bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
          >
            ❮
          </button>

          {/* Right Arrow */}
          <button
            className="swiper-button-next-strategy absolute right-0 top-1/2 -translate-y-1/2 z-10 
             w-9 h-9 flex items-center justify-center rounded-full 
             bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
          >
            ❯
          </button>
          <div className="w-full overflow-hidden">
            <Swiper
              slidesPerView={3}
              spaceBetween={10}
              navigation={{
                prevEl: ".swiper-button-prev-strategy",
                nextEl: ".swiper-button-next-strategy",
              }}
              modules={[Navigation]}
              className="mySwiper w-full px-10"
              breakpoints={{
                0: { slidesPerView: 2 },
                550: { slidesPerView: 3 },
                640: { slidesPerView: 5 },
                1199: { slidesPerView: 6 },
              }}
            >
              {/* All Strategies Button */}
              <SwiperSlide>
                <div
                  onClick={() => setActiveStrategyId("all")}
                  className="flex flex-col items-center cursor-pointer select-none"
                >
                  <div
                    className={`w-20 h-20 mt-4 rounded-xl p-[3px] transition-all ${activeStrategyId === "all"
                      ? "bg-primary ring-2 ring-offset-2 ring-primary shadow-lg"
                      : ""
                      }`}
                  >
                    <div
                      className={`w-full h-full rounded-[10px] flex items-center justify-center transition-all ${activeStrategyId === "all"
                        ? "bg-white dark:bg-gray-800"
                        : "bg-white dark:bg-gray-800"
                        }`}
                    >
                      {/* <span
                        className={`text-xl font-bold transition-all ${
                          activeStrategyId === "all"
                            ? "text-primary"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      > */}

                      <img
                        src="/media/Icons/All.jpeg"
                        className="w-full h-full rounded-lg object-cover bg-white pointer-events-none"
                        alt=""
                      />
                      {/* </span> */}
                    </div>
                  </div>
                  <p
                    className={`mt-2 text-xs font-medium text-center truncate w-20 ${activeStrategyId === "all"
                      ? "text-primary font-semibold"
                      : "text-gray-800 dark:text-white-200"
                      }`}
                  >
                    All
                  </p>
                </div>
              </SwiperSlide>

              {strategies?.map((strategy) => (
                <SwiperSlide key={strategy?._id}>
                  <div
                    onClick={() => setActiveStrategyId(strategy?._id)}
                    className="flex flex-col items-center cursor-pointer select-none"
                  >
                    <div
                      className={`w-20 h-20 mt-4 rounded-xl p-[4px] transition-all ${activeStrategyId === strategy?._id
                        ? "bg-primary ring-2 ring-offset-2 ring-primary shadow-lg"
                        : ""
                        }`}
                    >
                      {strategy?.imageUrl ? (
                        <img
                          src={strategy?.imageUrl}
                          alt={strategy?.title}
                          className="w-full h-full rounded-lg object-cover bg-white pointer-events-none"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                            {strategy?.title?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-800 dark:text-white-200 text-center  w-20">
                      {strategy?.title}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* 🔥 FILTER SELECTS */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {/* Trading Type Multi-Select */}
        <div className="flex items-center gap-2 relative">
          <Popover>
            <PopoverTrigger asChild>
              <button className="min-w-56 h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]">
                <span className="truncate text-sm">
                  {tradingType.length > 0
                    ? `${tradingType.length} Trading Style Selected`
                    : "Select Trading Style"}
                </span>
                <ChevronDown size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[225px] p-0">
              <Command>
                <CommandGroup>
                  {tradingTypeOptions.map((item) => {
                    const selected = tradingType.includes(item.value);
                    return (
                      <CommandItem
                        key={item.value}
                        onSelect={() =>
                          handleMultiSelect(
                            item.value,
                            tradingType,
                            setTradingType,
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
                        {item.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {tradingType.length > 0 && (
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
              <button className="min-w-56 h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]">
                <span className="truncate text-sm">
                  {tradingMethod.length > 0
                    ? `${tradingMethod.length} Trading Method Selected`
                    : "Select Trading Method"}
                </span>
                <ChevronDown size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[225px] p-0">
              <Command>
                <CommandGroup>
                  {tradingMethodOptions.map((item) => {
                    const selected = tradingMethod.includes(item.value);
                    return (
                      <CommandItem
                        key={item.value}
                        onSelect={() =>
                          handleMultiSelect(
                            item.value,
                            tradingMethod,
                            setTradingMethod,
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
                        {item.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {tradingMethod.length > 0 && (
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
              <button className="min-w-56 h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]">
                <span className="truncate text-sm">
                  {timeZone.length > 0
                    ? `${timeZone.length} Time Zone Selected`
                    : "Select Time Zone"}
                </span>
                <ChevronDown size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[225px] p-0">
              <Command>
                <CommandGroup>
                  {timeZoneOptions.map((item) => {
                    const selected = timeZone.includes(item.value);
                    return (
                      <CommandItem
                        key={item.value}
                        onSelect={() =>
                          handleMultiSelect(item.value, timeZone, setTimeZone)
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
                        {item.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {timeZone.length > 0 && (
            <button
              type="button"
              onClick={() => setTimeZone([])}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              ✖
            </button>
          )}
        </div>

        {/* 🔥 RESET ALL FILTERS BUTTON */}
        {
          <button
            type="button"
            onClick={() => {
              setTradingType([]);
              setTradingMethod([]);
              setTimeZone([]);
              setActiveStrategyId("all");
              setActiveEducatorId("all");
            }}
            className="h-11 px-4 flex items-center gap-2   dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 bg-slate-400 hover:bg-slate-700 text-white rounded-md font-medium transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        }
      </div>

      {/* 🔥 EDUCATOR SLIDER */}
      {strategyEducators.length > 0 ? (
        <div className="mb-6 relative">
          {/* Left Arrow */}
          <button
            className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 
             w-9 h-9 flex items-center justify-center rounded-full 
             bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
          >
            ❮
          </button>

          {/* Right Arrow */}
          <button
            className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 
             w-9 h-9 flex items-center justify-center rounded-full 
             bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
          >
            ❯
          </button>
          <div className="w-fulloverflow-hidden">
            <Swiper
              slidesPerView={3}
              spaceBetween={10}
              navigation={{
                prevEl: ".swiper-button-prev-custom",
                nextEl: ".swiper-button-next-custom",
              }}
              modules={[Navigation]}
              className="mySwiper w-full px-10"
              breakpoints={{
                0: { slidesPerView: 2 },
                550: { slidesPerView: 3 },
                640: { slidesPerView: 5 },
                1199: { slidesPerView: 6 },
              }}
            >
              {/* All Educators Button */}
              <SwiperSlide>
                <div
                  onClick={() => setActiveEducatorId("all")}
                  className="flex flex-col items-center cursor-pointer select-none"
                >
                  <div
                    className={`w-20 h-20 mt-10 rounded-full p-[3px] transition-all ${activeEducatorId === "all"
                      ? "bg-primary ring-2 ring-offset-2 ring-primary shadow-lg"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-primary/70"
                      }`}
                  >
                    <div className="w-full h-full rounded-full bg-transparent flex items-center justify-center overflow-hidden">
                      <img
                        src="/media/Icons/All.jpeg"
                        className="w-full h-full object-contain bg-transparent pointer-events-none rounded-full"
                        alt="All"
                      />
                    </div>
                  </div>

                  <p
                    className={`mt-2 text-xs font-medium text-center truncate w-20 ${activeEducatorId === "all"
                      ? "text-primary font-semibold"
                      : "text-gray-800 dark:text-white-200"
                      }`}
                  >
                    All
                  </p>
                </div>
              </SwiperSlide>

              {strategyEducators?.map((educator) => (
                <SwiperSlide key={educator?._id}>
                  <div
                    onClick={() => setActiveEducatorId(educator?._id)}
                    className="flex flex-col items-center cursor-pointer select-none"
                  >
                    <div
                      className={`w-20 h-20 mt-10 rounded-full p-[4px] transition-all ${activeEducatorId === educator?._id
                        ? `${getTimeZoneColor(educator?.timeZone)} ring-2 ring-offset-2 ring-white`
                        : getTimeZoneColor(educator?.timeZone)
                        }`}
                    >
                      <img
                        src={educator?.image}
                        alt={educator?.first_name}
                        className="w-full h-full rounded-full object-cover bg-white pointer-events-none"
                      />
                    </div>

                    <p className="mt-2 text-xs font-medium text-gray-800 text-center truncate w-24">
                      {educator?.first_name} {educator?.last_name}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full mb-6">
          <div className="text-center">
            <p className="text-lg sm:text-xl tracking-widest text-gray-500">
              No Session Found
            </p>
          </div>
        </div>
      )}

      {/* 🔥 TIMEZONE/CATEGORY LEGEND HEADER */}
      {strategyEducators.length > 0 && (
        <div className="card rounded-2xl shadow p-5 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {isDigitalMkt ? (
              // Digital Marketing category selected - show only Digital Marketing color
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#2196F3] border border-[#E3F2FD]"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-800">Digital Marketing</span>
              </div>
            ) : (
              // Other categories - show timezone colors
              <>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#E3A534] border border-[#FFF5E5]"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-800">Asian Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#14B8A6] border border-[#CCFBF1]"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-800">London Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#b2a3e9] border border-[#E5DEFF]"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-800">New York Session</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🔥 ONGOING CARD */}
      <div className="card rounded-2xl shadow p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ongoing
        </h3>
        <div className="flex flex-col gap-4">
          {activeEducatorId === "all" ? (
            strategyEducators?.flatMap((edu) => edu?.ongoing || [])?.length >
              0 ? (
              strategyEducators?.flatMap((edu) =>
                (edu?.ongoing || []).map((course, i) => (
                  <div
                    key={`${edu._id}-ongoing-${i}`}
                    className="grid grid-cols-1 md:grid-cols-[200px_250px_1fr] gap-3 items-stretch"
                  >
                    {/* Educator Card */}
                    <div
                      className={`p-3 rounded-xl flex items-center gap-3 ${getTimeZoneCourseColors(edu?.timeZone, false)}`}
                    >
                      <img
                        src={edu?.image}
                        alt={edu?.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium truncate">
                        {edu?.first_name} {edu?.last_name}
                      </span>
                    </div>
                    {/* Educator Info Card - Badges */}
                    <div className="p-3 rounded-xl bg-indigo-900 dark:bg-indigo-950 flex flex-col gap-2 text-sm min-h-[100px] justify-center">
                      {/* Row 1: Strategies */}
                      {edu?.strategies?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.strategies?.map((s, idx) => (
                            <span key={`strategy-${idx}`} className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                              {s?.title}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Row 2: Trading Styles */}
                      {edu?.tradingStyle?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.tradingStyle?.map((s, idx) => (
                            <span key={`style-${idx}`} className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
                              {capitalizeWords(s)}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Row 3: Trading Methods */}
                      {edu?.tradingMethod?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.tradingMethod?.map((m, idx) => (
                            <span key={`method-${idx}`} className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium">
                              {capitalizeWords(m)}
                            </span>
                          ))}
                        </div>
                      )}
                      {(!edu?.strategies?.length && !edu?.tradingStyle?.length && !edu?.tradingMethod?.length) && (
                        <span className="text-gray-900 italic">No info</span>
                      )}
                    </div>
                    {/* Schedule Card */}
                    <div
                      onClick={() => navigate(`/iq-educators/${edu?._id}`)}
                      className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${getTimeZoneCourseColors(course?.timeZone, course?.datetime && isToday(course?.datetime))}`}
                    >
                      <span className="text-sm font-medium">
                        {course?.title}
                      </span>
                      <div className="flex items-center gap-5">
                        {course?.datetime && (
                          <>
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <Clock size={18} />
                              <span className="text-xs">
                                {new Date(course.datetime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <Calendar size={18} />
                              <span className="text-xs">
                                {new Date(course.datetime)
                                  .toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    weekday: "short",
                                  })
                                  .replace(",", "-")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )),
              )
            ) : (
              <p className="text-sm text-gray-500">No ongoing sessions.</p>
            )
          ) : activeEducator?.ongoing?.length > 0 ? (
            activeEducator.ongoing.map((course, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[200px_250px_1fr] gap-3 items-stretch"
              >
                {/* Educator Card */}
                <div
                  className={`p-3 rounded-xl flex items-center gap-3 ${getTimeZoneCourseColors(activeEducator?.timeZone, false)}`}
                >
                  <img
                    src={activeEducator?.image}
                    alt={activeEducator?.first_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium truncate">
                    {activeEducator?.first_name} {activeEducator?.last_name}
                  </span>
                </div>
                {/* Educator Info Card - Badges */}
                <div className="p-3 rounded-xl bg-indigo-900 dark:bg-indigo-950 flex flex-col gap-2 text-sm min-h-[100px] justify-center">
                  {/* Row 1: Strategies */}
                  {activeEducator?.strategies?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.strategies?.map((s, idx) => (
                        <span key={`strategy-${idx}`} className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                          {s?.title}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Row 2: Trading Styles */}
                  {activeEducator?.tradingStyle?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.tradingStyle?.map((s, idx) => (
                        <span key={`style-${idx}`} className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
                          {capitalizeWords(s)}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Row 3: Trading Methods */}
                  {activeEducator?.tradingMethod?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.tradingMethod?.map((m, idx) => (
                        <span key={`method-${idx}`} className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium">
                          {capitalizeWords(m)}
                        </span>
                      ))}
                    </div>
                  )}
                  {(!activeEducator?.strategies?.length && !activeEducator?.tradingStyle?.length && !activeEducator?.tradingMethod?.length) && (
                    <span className="text-gray-400 italic">No info</span>
                  )}
                </div>
                {/* Schedule Card */}
                <div
                  onClick={() =>
                    navigate(`/iq-educators/${activeEducator?._id}`)
                  }
                  className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${getTimeZoneCourseColors(course?.timeZone, course?.datetime && isToday(course?.datetime))}`}
                >
                  <span className="text-sm font-medium">{course?.title}</span>
                  <div className="flex items-center gap-5">
                    {course?.datetime && (
                      <>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Clock size={18} />
                          <span className="text-xs">
                            {new Date(course.datetime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Calendar size={18} />
                          <span className="text-xs">
                            {new Date(course.datetime)
                              .toLocaleDateString("en-GB", {
                                day: "2-digit",
                                weekday: "short",
                              })
                              .replace(",", "-")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No ongoing sessions.</p>
          )}
        </div>
      </div>

      {/* 🔥 UPCOMING CARD */}
      <div className="card rounded-2xl shadow p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming
        </h3>
        <div className="flex flex-col gap-4">
          {activeEducatorId === "all" ? (
            strategyEducators?.flatMap((edu) => edu?.upcoming || [])?.length >
              0 ? (
              strategyEducators?.flatMap((edu) =>
                (edu?.upcoming || []).map((course, i) => (
                  <div
                    key={`${edu?._id}-upcoming-${i}`}
                    className="grid grid-cols-1 md:grid-cols-[200px_250px_1fr] gap-3 items-stretch"
                  >
                    {/* Educator Card */}
                    <div
                      className={`p-3 rounded-xl flex items-center gap-3 ${getTimeZoneCourseColors(edu?.timeZone, false)}`}
                    >
                      <img
                        src={edu?.image}
                        alt={edu?.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium ">
                        {edu?.first_name} {edu?.last_name}
                      </span>
                    </div>
                    {/* Educator Info Card - Badges */}
                    <div className="p-3 rounded-xl bg-indigo-900 dark:bg-indigo-950 flex flex-col gap-2 text-sm min-h-[100px] justify-center">
                      {/* Row 1: Strategies */}
                      {edu?.strategies?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.strategies?.map((s, idx) => (
                            <span key={`strategy-${idx}`} className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                              {s?.title}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Row 2: Trading Styles */}
                      {edu?.tradingStyle?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.tradingStyle?.map((s, idx) => (
                            <span key={`style-${idx}`} className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
                              {capitalizeWords(s)}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Row 3: Trading Methods */}
                      {edu?.tradingMethod?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.tradingMethod?.map((m, idx) => (
                            <span key={`method-${idx}`} className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium">
                              {capitalizeWords(m)}
                            </span>
                          ))}
                        </div>
                      )}
                      {(!edu?.strategies?.length && !edu?.tradingStyle?.length && !edu?.tradingMethod?.length) && (
                        <span className="text-gray-800">No info</span>
                      )}
                    </div>
                    {/* Schedule Card */}
                    <div
                      onClick={() => navigate(`/iq-educators/${edu?._id}`)}
                      className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${getTimeZoneCourseColors(course?.timeZone, false)}`}
                    >
                      <span className="text-sm font-medium">
                        {course?.title}
                      </span>
                      <div className="flex items-center gap-5">
                        {course?.datetime && (
                          <>
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <Clock size={18} />
                              <span className="text-xs">
                                {new Date(course.datetime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <Calendar size={18} />
                              <span className="text-xs">
                                {new Date(course.datetime)
                                  .toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    weekday: "short",
                                  })
                                  .replace(",", "-")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )),
              )
            ) : (
              <p className="text-sm text-gray-500">No upcoming sessions.</p>
            )
          ) : activeEducator?.upcoming?.length > 0 ? (
            activeEducator.upcoming.map((course, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[200px_250px_1fr] gap-3 items-stretch"
              >
                {/* Educator Card */}
                <div
                  className={`p-3 rounded-xl flex items-center gap-3 ${getTimeZoneCourseColors(activeEducator?.timeZone, false)}`}
                >
                  <img
                    src={activeEducator?.image}
                    alt={activeEducator?.first_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium truncate">
                    {activeEducator?.first_name} {activeEducator?.last_name}
                  </span>
                </div>
                {/* Educator Info Card - Badges */}
                <div className="p-3 rounded-xl bg-indigo-900 dark:bg-indigo-950 flex flex-col gap-2 text-sm min-h-[100px] justify-center">
                  {/* Row 1: Strategies */}
                  {activeEducator?.strategies?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.strategies?.map((s, idx) => (
                        <span key={`strategy-${idx}`} className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                          {s?.title}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Row 2: Trading Styles */}
                  {activeEducator?.tradingStyle?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.tradingStyle?.map((s, idx) => (
                        <span key={`style-${idx}`} className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
                          {capitalizeWords(s)}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Row 3: Trading Methods */}
                  {activeEducator?.tradingMethod?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.tradingMethod?.map((m, idx) => (
                        <span key={`method-${idx}`} className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium">
                          {capitalizeWords(m)}
                        </span>
                      ))}
                    </div>
                  )}
                  {(!activeEducator?.strategies?.length && !activeEducator?.tradingStyle?.length && !activeEducator?.tradingMethod?.length) && (
                    <span className="text-gray-400 italic">No info</span>
                  )}
                </div>
                {/* Schedule Card */}
                <div
                  onClick={() =>
                    navigate(`/iq-educators/${activeEducator?._id}`)
                  }
                  className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${getTimeZoneCourseColors(course?.timeZone, false)}`}
                >
                  <span className="text-sm font-medium">{course?.title}</span>
                  <div className="flex items-center gap-5">
                    {course?.datetime && (
                      <>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Clock size={18} />
                          <span className="text-xs">
                            {new Date(course.datetime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Calendar size={18} />
                          <span className="text-xs">
                            {new Date(course.datetime)
                              .toLocaleDateString("en-GB", {
                                day: "2-digit",
                                weekday: "short",
                              })
                              .replace(",", "-")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No upcoming sessions.</p>
          )}
        </div>
      </div>

      {/* 🔥 PAST CARD */}
      <div className="card rounded-2xl shadow p-5 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Past
        </h3>
        <div className="flex flex-col gap-4">
          {activeEducatorId === "all" ? (
            strategyEducators?.flatMap((edu) => edu?.past || [])?.length > 0 ? (
              strategyEducators?.flatMap((edu) =>
                (edu?.past || []).map((course, i) => (
                  <div
                    key={`${edu?._id}-past-${i}`}
                    className="grid grid-cols-1 md:grid-cols-[200px_250px_1fr] gap-3 items-stretch"
                  >
                    {/* Educator Card */}
                    <div
                      className={`p-3 rounded-xl flex items-center gap-3 ${getTimeZoneCourseColors(edu?.timeZone, false)}`}
                    >
                      <img
                        src={edu?.image}
                        alt={edu?.first_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium truncate">
                        {edu?.first_name} {edu?.last_name}
                      </span>
                    </div>
                    {/* Educator Info Card - Badges */}
                    <div className="p-3 rounded-xl bg-indigo-900 dark:bg-indigo-950 flex flex-col gap-2 text-sm min-h-[100px] justify-center">
                      {/* Row 1: Strategies */}
                      {edu?.strategies?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.strategies?.map((s, idx) => (
                            <span key={`strategy-${idx}`} className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                              {s?.title}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Row 2: Trading Styles */}
                      {edu?.tradingStyle?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.tradingStyle?.map((s, idx) => (
                            <span key={`style-${idx}`} className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
                              {capitalizeWords(s)}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Row 3: Trading Methods */}
                      {edu?.tradingMethod?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu?.tradingMethod?.map((m, idx) => (
                            <span key={`method-${idx}`} className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium">
                              {capitalizeWords(m)}
                            </span>
                          ))}
                        </div>
                      )}
                      {(!edu?.strategies?.length && !edu?.tradingStyle?.length && !edu?.tradingMethod?.length) && (
                        <span className="text-gray-400 italic">No info</span>
                      )}
                    </div>
                    {/* Schedule Card */}
                    <div
                      onClick={() => navigate(`/iq-educators/${edu?._id}`)}
                      className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${getTimeZoneCourseColors(course?.timeZone, false)}`}
                    >
                      <span className="text-sm font-medium">
                        {course?.title}
                      </span>
                      <div className="flex items-center gap-5">
                        {course?.datetime && (
                          <>
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <Clock size={18} />
                              <span className="text-xs">
                                {new Date(course.datetime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                              <Calendar size={18} />
                              <span className="text-xs">
                                {new Date(course.datetime)
                                  .toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    weekday: "short",
                                  })
                                  .replace(",", "-")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )),
              )
            ) : (
              <p className="text-sm text-gray-500">No past sessions.</p>
            )
          ) : activeEducator?.past?.length > 0 ? (
            activeEducator.past.map((course, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[200px_250px_1fr] gap-3 items-stretch"
              >
                {/* Educator Card */}
                <div
                  className={`p-3 rounded-xl flex items-center gap-3 ${getTimeZoneCourseColors(activeEducator?.timeZone, false)}`}
                >
                  <img
                    src={activeEducator?.image}
                    alt={activeEducator?.first_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium truncate">
                    {activeEducator?.first_name} {activeEducator?.last_name}
                  </span>
                </div>
                {/* Educator Info Card - Badges */}
                <div className="p-3 rounded-xl bg-indigo-900 dark:bg-indigo-950 flex flex-col gap-2 text-sm min-h-[100px] justify-center">
                  {/* Row 1: Strategies */}
                  {activeEducator?.strategies?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.strategies?.map((s, idx) => (
                        <span key={`strategy-${idx}`} className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                          {s?.title}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Row 2: Trading Styles */}
                  {activeEducator?.tradingStyle?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.tradingStyle?.map((s, idx) => (
                        <span key={`style-${idx}`} className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
                          {capitalizeWords(s)}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Row 3: Trading Methods */}
                  {activeEducator?.tradingMethod?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeEducator?.tradingMethod?.map((m, idx) => (
                        <span key={`method-${idx}`} className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-medium">
                          {capitalizeWords(m)}
                        </span>
                      ))}
                    </div>
                  )}
                  {(!activeEducator?.strategies?.length && !activeEducator?.tradingStyle?.length && !activeEducator?.tradingMethod?.length) && (
                    <span className="text-gray-400 italic">No info</span>
                  )}
                </div>
                {/* Schedule Card */}
                <div
                  onClick={() =>
                    navigate(`/iq-educators/${activeEducator?._id}`)
                  }
                  className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${getTimeZoneCourseColors(course?.timeZone, false)}`}
                >
                  <span className="text-sm font-medium">{course?.title}</span>
                  <div className="flex items-center gap-5">
                    {course?.datetime && (
                      <>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Clock size={18} />
                          <span className="text-xs">
                            {new Date(course.datetime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Calendar size={18} />
                          <span className="text-xs">
                            {new Date(course.datetime)
                              .toLocaleDateString("en-GB", {
                                day: "2-digit",
                                weekday: "short",
                              })
                              .replace(",", "-")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No past sessions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
