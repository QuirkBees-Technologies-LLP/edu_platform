import React, { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import {
  Loader2,
  CirclePlay,
  ChevronDown,
  Check,
  RotateCcw,
} from "lucide-react";
import { Accordion, AccordionItem } from "@/components/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAllMasterClassQuery,
  useLazyGetMasterClassByIdQuery,
} from "../../../store/api/client/clientMasterClassApiSlice";

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
import { useGetAllEducatorsQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { useGetAcademyCategoryQuery } from "../../../store/api/client/clientAcademyCategoryApiSlice";
import { useGetAdminStrategyListQuery, useGetStrategiesNameQuery } from "../../../store/api/client/clientStrategiesApiSlice";

/**
 * Utility function to convert various video URLs to embeddable format
 */
const getEmbedUrl = (url) => {
  if (!url) return "";

  // YouTube
  if (url?.includes("youtube.com/watch?v=")) {
    const videoId = url?.split("v=")?.[1]?.split("&")?.[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }
  if (url?.includes("youtu.be/")) {
    const videoId = url?.split("youtu.be/")?.[1]?.split("?")?.[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  // Vimeo
  if (url?.includes("vimeo.com/")) {
    const parts = url?.split("vimeo.com/")?.[1]?.split("/") || [];
    const videoId = parts?.[0]?.split("?")?.[0];
    const hash = parts?.[1] ? parts?.[1]?.split("?")?.[0] : null;
    if (!videoId) return "";
    return hash
      ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
      : `https://player.vimeo.com/video/${videoId}`;
  }

  // Dailymotion
  if (url?.includes("dailymotion.com/video/")) {
    const videoId = url?.split("dailymotion.com/video/")?.[1]?.split("?")?.[0];
    return videoId ? `https://www.dailymotion.com/embed/video/${videoId}` : "";
  }

  // Loom
  if (url?.includes("loom.com/share/")) {
    const videoId = url?.split("loom.com/share/")?.[1]?.split("?")?.[0];
    return videoId ? `https://www.loom.com/embed/${videoId}` : "";
  }

  // Dyntube - Case 1: app.dyntube.com/#/video
  if (url?.includes("app.dyntube.com/#/video/")) {
    const match = url?.match(/video\/([^/]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  // Dyntube - Case 2: videos.dyntube.com/iframes
  if (url?.includes("videos.dyntube.com/iframes/")) {
    const match = url?.match(/iframes\/([^/?#]+)/);
    if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
  }

  // Dyntube - Case 3: player.dyntube.com/video
  if (url?.includes("player.dyntube.com/video/")) {
    const match = url?.match(/video\/([^/?#]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  // Dyntube - Case 4: fallback generic
  if (url?.includes("dyntube.com/")) return url;

  return url;
};

const Banner = () => (
  <div className="card rounded-2xl overflow-hidden border border-gray-300">
    <img
      src="/media/images/2026-0218-MasterclassBanner-Desktop.webp"
      alt="MasterClass Banner"
      className="w-full h-auto object-cover"
    />
  </div>
);

const MasterClassForStudent = () => {
  // ==================== STATE MANAGEMENT ===================

  // Initialize selectedStrategyId: URL param > location state > null
  const [selectedStrategyId, setSelectedStrategyId] = useState(null);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeEducatorId, setActiveEducatorId] = useState(null);
  const [activeStrategyId, setActiveStrategyId] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [tradingType, setTradingType] = useState([]);
  const [tradingMethod, setTradingMethod] = useState([]);
  const [timeZone, setTimeZone] = useState([]);
  const [educator, setEducator] = useState("");

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetAcademyCategoryQuery();
  const activeCategory = categoryData?.data?.find(
    (c) => c?._id === activeCategoryId,
  );

  const isDigitalMarketing =
    activeCategory?.name?.toLowerCase()?.includes("digital") ||
    activeCategory?.slug?.toLowerCase()?.includes("digital");

  // Get selected language from Redux
  const selectedLanguage = useSelector(selectSelectedLanguage);
  const { data: educatorsData } = useGetAllEducatorsQuery();

  // ==================== API CALLS ====================
  // Fetch all strategies

  const {
    data: strategiesData,
    isLoading: strategiesLoading,
    error: strategiesError,
    refetch: refetchStrategies,
  } = useGetAllMasterClassQuery(
    {
      params: {
        language: selectedLanguage,
        tradingType,
        tradingMethod,
        timeZone,
        category: activeCategoryId,
        educatorId: educator,
        strategies: activeStrategyId,
      },
    },
    // { refetchOnMountOrArgChange: true }
  );

  // Lazy query for fetching individual strategy details
  const [
    fetchStrategy,
    { data: strategyData, isLoading: strategyLoading, error: strategyError },
  ] = useLazyGetMasterClassByIdQuery();

  const { data: strategiesName, isLoading: isStrategNameLoading } =
    useGetAdminStrategyListQuery();

  // ==================== DATA EXTRACTION ====================
  const strategies = strategiesData?.data || [];
  const currentStrategy = strategyData?.data || null;

  // ==================== SIDE EFFECTS ====================
  /**
   * When a strategy is selected, fetch its detailed data
   */
  useEffect(() => {
    if (selectedStrategyId) {
      fetchStrategy(selectedStrategyId);
    }
  }, [selectedStrategyId, fetchStrategy]);

  /**
   * Auto-select the first lecture from the first section when strategy is loaded
   */
  useEffect(() => {
    if (currentStrategy?.sections?.length > 0) {
      const firstSection = currentStrategy.sections[0];
      if (firstSection?.lectures?.length > 0) {
        const firstLecture = firstSection.lectures[0];
        setActiveLectureId(firstLecture?._id);
        setActiveLecture(firstLecture);
      }
    }
  }, [currentStrategy]);

  // ==================== EVENT HANDLERS ====================
  const selectStrategy = (strategyId) => {
    setSelectedStrategyId(strategyId);
    setActiveLectureId(null);
    setActiveLecture(null);
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle lecture selection
   */
  const handleLectureClick = (lecture) => {
    setActiveLectureId(lecture?._id);
    setActiveLecture(lecture);
  };

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

  const handleMultiSelect = (value, currentSelected, setSelected) => {

    console.log(value, currentSelected, setSelected)

    if (currentSelected.includes(value)) {
      setSelected(currentSelected.filter((item) => item !== value));
    } else {
      setSelected([...currentSelected, value]);
    }
  };

  const renderFiltersAndReset = () => (
    <>
      {!isDigitalMarketing && (
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
                            handleMultiSelect(
                              item?.value,
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
              setEducator(null);
              setActiveEducatorId(null);
              setActiveStrategyId(null);
              setActiveCategoryId(null);
            }}
            className="h-11 px-4 flex items-center gap-2 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 bg-slate-400 hover:bg-slate-700 text-white rounded-md font-medium transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </>
      )}
    </>
  );

  // ==================== LOADING STATE ====================
  if (strategiesLoading) {
    return (
      <div className="min-h-screen">
        <Container width="fluid" className="mx-auto px-5">
          <Banner />

          {/* Loading State */}
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-600">Loading MasterClass...</span>
          </div>
        </Container>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (strategiesError) {
    return (
      <div className="min-h-screen">
        <Container width="fluid" className="mx-auto px-5">
          <Banner />

          {/* Error State */}
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-red-500 text-lg mb-4">
              Failed to load MasterClass
            </div>
            <p className="text-gray-600">
              {strategiesError?.data?.message ||
                "Something went wrong. Please try again later."}
            </p>
          </div>
        </Container>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <Container width="fluid" className="mx-auto px-5">


        <div className="flex gap-4 mb-6 justify-between flex-wrap">
          {viewType == "grid" && !isDigitalMarketing && (
            <div className="flex gap-4 overflow-x-auto pb-4 items-start">
              {/* All Strategies Option */}
              <button
                onClick={() => setActiveStrategyId(null)}
                className="flex flex-col items-center gap-2 group min-w-[72px]"
              >
                <div
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all bg-white dark:bg-gray-800 ${activeStrategyId === null
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
                  className={`text-xs font-medium text-center whitespace-nowrap transition-colors ${activeStrategyId === null
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
                  setActiveEducatorId(null);
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

        <div className="flex items-center gap-3 pb-5">
          {renderFiltersAndReset()}{" "}
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
                {/* {isLoading && (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          )} */}

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
        </div>

        {/* Banner - Static, never changes */}
        <Banner />

        {/* ========== DYNAMIC CONTENT AREA ========== */}
        {/* This section updates when a strategy is selected */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 mt-5">
          {/* ========== LESSONS PANEL (LEFT SIDEBAR) ========== */}
          {currentStrategy?.sections?.length > 0 ? (
            <div className="md:w-[430px]">
              <div className="max-h-[675px] left_sidebar overflow-y-auto rounded-xl shadow card divide-y divide-gray-200">
                <Accordion allowMultiple={false} defaultIndex={0}>
                  {currentStrategy.sections.map((section, index) => (
                    <AccordionItem
                      key={section?._id || index}
                      title={`${index + 1}. ${section?.title || "Section"}`}
                    >
                      {section?.lectures?.map((lecture) => (
                        <div
                          key={lecture?._id}
                          onClick={() => handleLectureClick(lecture)}
                          className={`flex items-center p-4 border-t border-gray-100 cursor-pointer transition 
                                                        ${activeLectureId ===
                              lecture?._id
                              ? "bg-gray-300 dark:bg-slate-800"
                              : "hover:bg-gray-50 dark:hover:bg-slate-900"
                            }`}
                        >
                          <CirclePlay className="mr-2 text-gray-400" />
                          <span className="text-gray-800 font-medium text-xs">
                            {lecture?.title}
                          </span>
                        </div>
                      ))}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ) : currentStrategy ? (
            <div className="md:w-[350px]">
              <div className="max-h-[675px] left_sidebar rounded-xl shadow card bg-gray-50 dark:bg-gray-100">
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-600 mb-2">
                      Coming Soon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Lessons will be added soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ========== VIDEO PLAYER AREA (MAIN CONTENT) ========== */}
          {currentStrategy && (
            <div className="flex-1">
              <div className="card rounded-2xl border border-gray-300 overflow-hidden">
                <div className="w-full h-[425px] dark:bg-black flex items-center justify-center bg-gray-200">
                  {/* Show loading while fetching strategy details */}
                  {strategyLoading ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                      <h3 className="text-xl text-gray-200">
                        Loading MasterClass details...
                      </h3>
                    </div>
                  ) : activeLecture?.content ? (
                    <iframe
                      src={getEmbedUrl(activeLecture?.content)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={activeLecture?.title || "Video Player"}
                    />
                  ) : currentStrategy?.sections?.length > 0 ? (
                    <div className="text-center">
                      <div className="text-8xl mb-5 opacity-30 text-white">
                        ▶
                      </div>
                      <h3 className="text-xl text-white">
                        Select a lecture to start watching
                      </h3>
                    </div>
                  ) : currentStrategy ? (
                    // Strategy selected but no sections/lessons available
                    <div className="text-center text-gray-400">
                      <div className="text-8xl mb-5 opacity-30">▶</div>
                      <h3 className="text-xl text-gray-200">
                        No lessons available for this MasterClass
                      </h3>
                      <p className="text-sm text-gray-400 mt-2">
                        Lessons will be added soon
                      </p>
                    </div>
                  ) : null}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* About Strategy */}
        {currentStrategy && (
          <div className="card rounded-2xl border border-gray-300 p-8 mb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-300">
              {/* {currentStrategy?.imageUrl && (
                <img
                  src={currentStrategy?.imageUrl}
                  alt={currentStrategy?.title || "MasterClass"}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )} */}
              <div>
                <h3 className="text-2xl font-semibold">
                  {currentStrategy?.title}
                </h3>
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
              <div className="lg:col-span-2">
                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  About This MasterClass
                </div>
                <p className="text-[15px] leading-relaxed text-gray-900">
                  {currentStrategy?.aboutStrategy ||
                    currentStrategy?.description}
                </p>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  MasterClass Details
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Display tags with alternating colors */}
                  {currentStrategy.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className={`px-4 py-2 rounded-full text-xs font-medium ${i < 2
                        ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                        : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400"
                        }`}
                    >
                      {tag}
                    </span>
                  ))}

                  {/* Display category badge */}
                  {currentStrategy?.category && (
                    <span className="px-4 py-2 rounded-full text-xs font-medium bg-purple-500/20 border border-purple-500/40 text-purple-400">
                      {currentStrategy?.category?.name}
                    </span>
                  )}
                </div>
              </div>
            </div>


          </div>
        )}

        {/* ========== AVAILABLE STRATEGIES GRID ========== */}
        {/* This section is always visible */}
        <div className="mt-10 pb-12">
          <h2 className="text-2xl font-semibold mb-6">
            Available Master Classes
          </h2>

          {/* Show message if no strategies found */}
          {strategies.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No MasterClass available at the moment.
            </div>
          ) : (
            // Display strategy cards in a responsive grid
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {strategies?.map((strategy) => {
                const educator = strategy?.educators?.[0];
                const educatorName = educator
                  ? `${educator?.first_name?.trim() || ""} ${educator?.last_name?.trim() || ""}`.trim()
                  : null;
                const hasMoreEducators = (strategy?.educators?.length || 0) > 1;
                return (
                  <div
                    key={strategy?._id}
                    onClick={() => selectStrategy(strategy?._id)}
                    className={`group card rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col ${selectedStrategyId === strategy?._id
                      ? "border-purple-500 shadow-2xl shadow-purple-500/30 ring-2 ring-purple-400/60"
                      : "border-gray-200 hover:border-purple-300 hover:shadow-sm hover:shadow-purple-100/60"
                      }`}
                  >
                    {/* ── Banner with gradient overlay + educator info ── */}
                    <div className="relative w-full h-48 overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-900 via-purple-700 to-orange-500">
                      {strategy?.strategyBanner ? (
                        <img
                          src={strategy?.strategyBanner}
                          alt={strategy?.title || "Strategy"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Dark gradient scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Selected checkmark badge */}
                      {/* {selectedStrategyId === strategy?._id && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/60 ring-2 ring-white/30">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )} */}

                      {/* Category pill — top left */}
                      {strategy?.category?.name && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/25">
                            {strategy?.category?.name}
                          </span>
                        </div>
                      )}

                      {/* Educator info — bottom of banner */}
                      {educatorName && (
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                          {/* Avatar stack */}
                          <div className="flex -space-x-2">
                            {strategy?.educators?.slice(0, 3)?.map((edu, i) =>
                              edu?.image ? (
                                <img
                                  key={edu?._id || i}
                                  src={edu?.image}
                                  alt={`${edu?.first_name} ${edu?.last_name}`}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-white/60 shadow-md"
                                />
                              ) : (
                                <div
                                  key={edu?._id || i}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 border-2 border-white/60 flex items-center justify-center shadow-md"
                                >
                                  <span className="text-white text-xs font-bold">
                                    {edu?.first_name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                          {/* Name + role */}
                          <div className="flex flex-col leading-tight">
                            <span className="text-white text-xs font-semibold drop-shadow-sm line-clamp-1">
                              {educatorName}{hasMoreEducators && ` +${strategy?.educators?.length - 1}`}
                            </span>
                            {/* <span className="text-white/65 text-[10px]">Instructor</span> */}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Card Body ── */}
                    <div className="flex flex-col flex-grow p-5">
                      {/* Title */}
                      <h3 className="text-[15px] font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-purple-600 transition-colors duration-200">
                        {strategy?.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 flex-grow mb-4">
                        {strategy?.description || "Explore this master class and enhance your trading skills."}
                      </p>

                      {/* Divider */}
                      <div className="border-t border-gray-100 mb-4" />

                      {/* CTA Button */}
                      <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40 active:scale-[0.97]">
                        Start Learning →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default MasterClassForStudent;
