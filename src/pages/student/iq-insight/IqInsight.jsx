import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import {
  useGetClientTradeAnalysisQuery,
  useGetClientTradeIdeasQuery,
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
import Loader from "../../../components/ui/loader";
import { Eye, ThumbsUp, MessageCircle, Share2, FileText } from "lucide-react";
import SearchFilterInput from "../../../components/SearchFilterInput";
import debounce from "lodash.debounce";

const ShowMoreLess = ({
  text = "",
  html = "",
  limit = 100,
  showMoreText = " . . .",
  showLessText = " . . .",
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isHtml = !!html;
  const content = isHtml ? html : text;
  const plainText = isHtml ? html.replace(/<[^>]+>/g, "") : text;
  const isLong = plainText.length > limit;

  const displayed =
    expanded || !isLong ? content : plainText.substring(0, limit);

  return (
    <div
      className={
        className ? className : "text-sm text-gray-700 leading-relaxed"
      }
    >
      {isHtml ? (
        <span dangerouslySetInnerHTML={{ __html: displayed }} />
      ) : (
        <span>{displayed}</span>
      )}
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-primary cursor-pointer hover:underline"
        >
          {expanded ? showLessText : showMoreText}
        </span>
      )}
    </div>
  );
};

const IqInsight = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeMarket, setActiveMarket] = useState("All");
  const [activeTimeframe, setActiveTimeframe] = useState("WEEKLY");
  const [refreshKey, setRefreshKey] = useState(0);

  const observer = useRef();

  const { data, isFetching, isLoading, isError } =
    useGetClientTradeAnalysisQuery({
      page: page,
      limit: limit,
      search: searchText,
      // timeframe: activeTimeframe,
      markets: activeMarket,
      refreshKey,
    });

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    // if (data?.data.length === 0) {
    //   setTradeIdeas([]);
    // }
    if (data?.data) {
      if (page === 1) {
        setTradeIdeas(data.data);
      } else {
        // Append new unique items only
        setTradeIdeas((prevIdeas) => {
          const newIdeas = data.data.filter(
            (idea) => !prevIdeas.some((prev) => prev._id === idea._id)
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
    [isFetching, page, totalPages]
  );

  const handleCloseView = () => {
    setIsViewOpen(false);
  };
  const handleCloseImageView = () => {
    setSelectedIdea({});
  };

  const marketData = [
    {
      pair: "USDJPY",
      timeframe: "4H",
      analyst: "Ricardo Garcia",
      timestamp: "Nov 17, 2025, 07:02 AM",
      title: "Key resistance at 151.95 with potential reversal pattern forming",
      description:
        "Please refer to the weekly overview for reference. Everything is...",
      views: "1.2K",
      likes: "87",
      comments: "23",
      bgGradient: "bg-gradient-to-br from-slate-600 to-slate-800",
    },
    {
      pair: "USDCAD",
      timeframe: "Daily",
      analyst: "Florian Krauß",
      timestamp: "Nov 16, 2025, 03:02 PM",
      title: "Bullish continuation expected after consolidation phase",
      description:
        "Please refer to the weekly overview for reference. Everything is...",
      views: "2.8K",
      likes: "156",
      comments: "23",
      bgGradient: "bg-gradient-to-br from-slate-600 to-slate-800",
    },
    {
      pair: "EURUSD",
      timeframe: "1H",
      analyst: "Florian Krauß",
      timestamp: "Nov 16, 2025, 02:53 PM",
      title: "Major support zone tested, watching for breakout confirmation",
      description:
        "Please refer to the weekly overview for reference. Everything is...",
      views: "3.4K",
      likes: "203",
      comments: "23",
      bgGradient: "bg-gradient-to-br from-slate-600 to-slate-800",
    },
    {
      pair: "GBPJPY",
      timeframe: "4H",
      analyst: "Ricardo Garcia",
      timestamp: "Nov 17, 2025, 06:45 AM",
      title: "Strong momentum building above key moving averages",
      description:
        "Please refer to the weekly overview for reference. Everything is...",
      views: "1.5K",
      likes: "92",
      comments: "18",
      bgGradient: "bg-gradient-to-br from-slate-600 to-slate-800",
    },
    {
      pair: "XAUUSD",
      timeframe: "Daily",
      analyst: "Florian Krauß",
      timestamp: "Nov 16, 2025, 01:30 PM",
      title: "Gold reaches critical resistance, potential pullback expected",
      description:
        "Please refer to the weekly overview for reference. Everything is...",
      views: "4.1K",
      likes: "245",
      comments: "31",
      bgGradient: "bg-gradient-to-br from-slate-600 to-slate-800",
    },
    {
      pair: "BTCUSD",
      timeframe: "Weekly",
      analyst: "Ricardo Garcia",
      timestamp: "Nov 15, 2025, 09:15 AM",
      title: "Weekly chart shows strong bullish structure formation",
      description:
        "Please refer to the weekly overview for reference. Everything is...",
      views: "5.2K",
      likes: "312",
      comments: "45",
      bgGradient: "bg-gradient-to-br from-slate-600 to-slate-800",
    },
  ];

  // const markets = ["All", "Forex", "Crypto", "Indices"];
  const markets = ["All", "Forex", "Crypto"];
  const timeframes = ["1H", "4H", "DAILY", "WEEKLY"];

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchText(value);
        setPage(1);
      }, 500),
    []
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

  const ShowMoreLess = ({
    text = "",
    html = "",
    limit = 100,
    showMoreText = " . . .",
    className,
    onOpen,
  }) => {
    const isHtml = !!html;
    const content = isHtml ? html : text;
    const plainText = isHtml ? html.replace(/<[^>]+>/g, "") : text;
    const isLong = plainText.length > limit;

    const displayed = plainText.substring(0, limit);

    return (
      <div className={className || "text-sm text-gray-700 leading-relaxed"}>
        {isHtml ? (
          <span dangerouslySetInnerHTML={{ __html: displayed }} />
        ) : (
          <span>{displayed}</span>
        )}

        {isLong && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onOpen && onOpen();
            }}
            className="text-primary cursor-pointer "
          >
            {showMoreText}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Insight" />
          <ToolbarDescription>
            {/* Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform. */}
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>
      <div className="flex justify-between items-center flex-wrap mb-8 gap-5">
        <div className="flex gap-3.5 flex-wrap">
          <div className="sm:px-3 p-2 flex overflow-auto bg-gray-200 rounded-xl gap-3 sm:gap-3.5 shadow-md border-purple-200 dark:border-gray-200">
            {markets.map((market) => (
              <button
                key={market}
                onClick={() => {
                  setActiveMarket(market);
                  setTradeIdeas([]);
                  setRefreshKey((prev) => prev + 1);
                  setPage(1);
                }}
                className={`sm:px-4 py-2 text-xs sm:text-md rounded-lg font-semibold transition-all
                        ${
                          activeMarket === market
                            ? "bg-sky-500 text-white shadow-lg shadow-primary/50"
                            : " text-gray-600 hover:bg-gray-300"
                        }`}
              >
                {market}
              </button>
            ))}
          </div>
          {/* <div className="p-2 flex overflow-auto bg-gray-200 rounded-xl gap-1 sm:gap-2 shadow-md border-purple-200 dark:border-gray-200">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setActiveTimeframe(tf);
                  setTradeIdeas([]);
                  setRefreshKey((prev) => prev + 1);
                  setPage(1);
                }}
                className={`sm:px-4 py-2 text-xs sm:text-md rounded-lg font-semibold transition-all ${
                  activeTimeframe === tf
                    ? "bg-primary text-white shadow-lg shadow-primary/50"
                    : "text-gray-600 hover:bg-gray-300"
                }`}
              >
                {tf}
              </button>
            ))}
          </div> */}
        </div>

        <div className="flex gap-3 sm:gap-6 flex-wrap mr-3">
          <SearchFilterInput
            searchText={searchText}
            handleSearchChange={handleSearchChange}
            className="w-full sm:w-auto rounded-xl h-11"
          />
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
                // <div
                //   key={idea._id}
                //   className="card border-2 hover:bg-gray-200 overflow-hidden h-fit"
                // >
                //   <div
                //     className="overflow-hidden cursor-pointer"
                //     onClick={() => {
                //       setSelectedIdea(idea);
                //       setIsViewOpen(true);
                //     }}
                //     ref={
                //       index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null
                //     }
                //   >
                //     <img
                //       src={idea?.image?.[0]}
                //       className="w-full h-[220px] object-cover "
                //       alt=""
                //     />
                //   </div>
                //   <div className="card-border card-rounded-b flex flex-col gap-2 justify-between min-h-[210px]">
                //     <div className="px-5 py-4.5 ">
                //       <div className="flex item-center justify-between  mb-2">
                //         <div className="font-bold mr-3 text-gray-900">
                //           {idea?.name}
                //         </div>
                //       </div>
                //       <ShowMoreLess
                //         className="text-gray-900 text-sm mt-2 leading-relaxed"
                //         html={idea?.description || "No description"}
                //         limit={65}
                //       />
                //     </div>
                //     <div className="border-1 border-solid border-current bg-gray-100 px-5 py-3">
                //       <div className="flex items-center">
                //         <EducatorImage educator={idea?.educatorDetails} />
                //         <div>
                //           <Link
                //             to={`/iq-educators/${idea?.educatorDetails?._id}`}
                //             className="text-2sm text-gray-800 hover:text-primary mb-px"
                //           >
                //             {idea?.educatorDetails?.first_name}{" "}
                //             {idea?.educatorDetails?.last_name}{" "}
                //           </Link>
                //           <div className="text-2sm text-gray-700 mb-px">
                //             {format(idea?.createAt, "MMM dd, yyyy, hh:mm a")}
                //           </div>
                //         </div>
                //       </div>
                //     </div>
                //   </div>
                // </div>
                <div
                  key={idea?._id}
                  className="card border-2  shadow-md border-purple-200 dark:border-gray-200 overflow-hidden flex flex-col h-full"
                >
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    // onClick={() => {
                    //   setSelectedIdea(idea);
                    //   setIsViewOpen(true);
                    // }}
                    ref={
                      index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null
                    }
                  >
                    {idea?.image && idea?.image.length > 0 && (
                      <>
                        {idea?.isLoading && (
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
                            <Loader />
                          </div>
                        )}

                        {/* Image */}
                        <img
                          src={idea?.image[idea.currentIndex ?? 0]}
                          alt={idea?.name}
                          className={`w-full h-[220px] object-cover transition-opacity duration-200 ${idea?.isLoading ? "opacity-0" : "opacity-100"}`}
                        />

                        <button
                          onClick={() => {
                            setSelectedIdea(idea);
                            setIsLightBoxOpen(true);
                          }}
                          className="absolute top-2 right-2 text-primary p-2 bg-white bg-opacity-90 rounded-full shadow"
                        >
                          <Eye size={20} />
                        </button>

                        {/* Arrows */}
                        {idea?.image.length > 1 && (
                          <>
                            {/* Left */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                const newIndex =
                                  (idea.currentIndex ?? 0) === 0
                                    ? idea?.image.length - 1
                                    : (idea.currentIndex ?? 0) - 1;

                                // Start Loading
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === idea?._id
                                      ? { ...t, isLoading: true }
                                      : t
                                  )
                                );

                                // Preload next image
                                const img = new Image();
                                img.src = idea?.image[newIndex];
                                img.onload = () => {
                                  setTradeIdeas((prev) =>
                                    prev.map((t) =>
                                      t._id === idea?._id
                                        ? {
                                            ...t,
                                            currentIndex: newIndex,
                                            isLoading: false,
                                          }
                                        : t
                                    )
                                  );
                                };
                              }}
                              className="left-3 z-10 bg-white/60 hover:bg-white text-gray-700 rounded-full p-1 shadow-md absolute top-1/2 -translate-y-1/2"
                            >
                              <ChevronLeft size={20} />
                            </button>

                            {/* Right */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                const newIndex =
                                  (idea.currentIndex ?? 0) ===
                                  idea.image.length - 1
                                    ? 0
                                    : (idea.currentIndex ?? 0) + 1;

                                // Start Loading
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === idea._id
                                      ? { ...t, isLoading: true }
                                      : t
                                  )
                                );

                                // Preload next image
                                const img = new Image();
                                img.src = idea.image[newIndex];
                                img.onload = () => {
                                  setTradeIdeas((prev) =>
                                    prev.map((t) =>
                                      t._id === idea._id
                                        ? {
                                            ...t,
                                            currentIndex: newIndex,
                                            isLoading: false,
                                          }
                                        : t
                                    )
                                  );
                                };
                              }}
                              className="right-3 z-10 bg-white/60 hover:bg-white text-gray-700 rounded-full p-1 shadow-md absolute top-1/2 -translate-y-1/2"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}

                        {/* Dots */}
                        {idea?.image.length > 1 && (
                          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                            {idea.image.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  // Start Loading
                                  setTradeIdeas((prev) =>
                                    prev.map((t) =>
                                      t._id === idea._id
                                        ? { ...t, isLoading: true }
                                        : t
                                    )
                                  );

                                  const img = new Image();
                                  img.src = idea.image[idx];
                                  img.onload = () => {
                                    setTradeIdeas((prev) =>
                                      prev.map((t) =>
                                        t._id === idea._id
                                          ? {
                                              ...t,
                                              currentIndex: idx,
                                              isLoading: false,
                                            }
                                          : t
                                      )
                                    );
                                  };
                                }}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                  (idea.currentIndex ?? 0) === idx
                                    ? "bg-primary"
                                    : "bg-gray-300 hover:bg-gray-400"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Body + Footer */}
                  <div className="flex flex-col gap-2 justify-between min-h-[200px]">
                    <div className=" bg-gray-100 px-3 py-3">
                      <div className="flex items-center">
                        <EducatorImage educator={idea?.educatorDetails} />
                        <div>
                          <Link
                            to={`/iq-educators/${idea?.educatorDetails?._id}`}
                            className="text-2sm text-gray-800 hover:text-primary mb-px"
                          >
                            {idea?.educatorDetails?.first_name}{" "}
                            {idea?.educatorDetails?.last_name}
                          </Link>
                          <div className="text-2sm text-gray-700 mb-px">
                            {format(idea?.createAt, "MMM dd, yyyy, hh:mm a")}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="px-5 py-2 flex-1 flex flex-col">
                      <div className="flex item-center justify-between mb-2 min-h-10">
                        <div className="font-bold mr-3 text-sky-500">
                          {idea?.name}
                        </div>
                      </div>
                      <div className="text-gray-900 text-sm leading-relaxed h-20 overflow-hidden">
                        <ShowMoreLess
                          html={idea?.description || "No description"}
                          limit={100}
                          onOpen={() => {
                            setSelectedIdea(idea);
                            setIsViewOpen(true);
                          }}
                        />
                      </div>
                      <div className="mt-auto">
                        <button
                          onClick={() => {
                            setSelectedIdea(idea);
                            setIsViewOpen(true);
                          }}
                          className="w-full bg-teal-800 hover:bg-teal-900 border dark:text-white font-sm py-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
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
      </div>
    </div>
  );
};

export default IqInsight;
