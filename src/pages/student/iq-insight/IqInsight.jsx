import { useCallback, useEffect, useRef, useState } from "react";
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
import ShowMoreLess from "../../../components/ui/showmoreless";
import Loader from "../../../components/ui/loader";
import { Eye, ThumbsUp, MessageCircle, Share2, FileText } from 'lucide-react';

const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
};

const statusColorMap = {
  active: "bg-green-50 text-green-700 ring-green-600/20",
  pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  win: "bg-blue-50 text-blue-700 ring-blue-600/20",
  partialWin: "bg-violet-50 text-violet-700 ring-violet-600/20",
  loss: "bg-red-50 text-red-700 ring-red-600/20",
};
const MarketCard = ({ pair, timeframe, analyst, timestamp, title, description, views, likes, comments, bgGradient }) => (
  <div className="bg-white dark:bg-[#0F0F1A] border rounded-2xl shadow-md">
    <div className="relative h-[300px] rounded-t-[20px] overflow-hidden">

      {/* IMAGE */}
      <img
        src="/media/images/2600x1600/banner_3.jpg"
        alt="Academy"
        className="w-full h-full object-cover"
      />

      {/* OVERLAY BADGES */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="bg-gray-100 px-4 py-2 rounded-lg">
          <span className="dark:text-white text-md font-medium">{pair}</span>
        </div>

        <div
          className={`${timeframe === "4H"
            ? "bg-primary"
            : timeframe === "Daily"
              ? "bg-primary"
              : timeframe === "1H"
                ? "bg-primary"
                : "bg-purple-500"
            } px-3 py-1 rounded-md`}
        >
          <span className="text-white text-sm">{timeframe}</span>
        </div>
      </div>
    </div>

    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          {analyst.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="dark:text-white font-semibold">{analyst}</div>
          <div className="text-slate-400 text-sm">{timestamp}</div>
        </div>
      </div>

      <h3 className="text-gray-700 dark:text-gray-800 font-semibold mb-2 text-lg line-clamp-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-6 mb-4 text-slate-400">
        <div className="flex items-center gap-2">
          <Eye size={18} />
          <span className="text-sm">{views}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThumbsUp size={18} />
          <span className="text-sm">{likes}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={18} />
          <span className="text-sm">{comments}</span>
        </div>
        <button className="ml-auto hover:text-primary transition-colors">
          <Share2 size={18} />
        </button>
      </div>

      <div className="flex gap-3 flex-col xl:flex-row">
        <button className="flex-1 bg-gray-200 hover:bg-gray-100 dark:text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <FileText size={18} />
          Full Analysis
        </button>
        <button className="px-6 bg-primary hover:bg-primary text-white py-3 rounded-lg font-medium transition-colors">
          Show More
        </button>
      </div>
    </div>
  </div >
);
const IqInsight = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  const observer = useRef();

  const { data, isFetching, isLoading } = useGetClientTradeAnalysisQuery({
    page: page,
    limit: limit,
  });

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setTradeIdeas(data.data); // replace data if first page
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

  const [activeMarket, setActiveMarket] = useState('All Markets');
  const [activeTimeframe, setActiveTimeframe] = useState('DAILY');

  const marketData = [
    {
      pair: 'USDJPY',
      timeframe: '4H',
      analyst: 'Ricardo Garcia',
      timestamp: 'Nov 17, 2025, 07:02 AM',
      title: 'Key resistance at 151.95 with potential reversal pattern forming',
      description: 'Please refer to the weekly overview for reference. Everything is...',
      views: '1.2K',
      likes: '87',
      comments: '23',
      bgGradient: 'bg-gradient-to-br from-slate-600 to-slate-800'
    },
    {
      pair: 'USDCAD',
      timeframe: 'Daily',
      analyst: 'Florian Krauß',
      timestamp: 'Nov 16, 2025, 03:02 PM',
      title: 'Bullish continuation expected after consolidation phase',
      description: 'Please refer to the weekly overview for reference. Everything is...',
      views: '2.8K',
      likes: '156',
      comments: '23',
      bgGradient: 'bg-gradient-to-br from-slate-600 to-slate-800'
    },
    {
      pair: 'EURUSD',
      timeframe: '1H',
      analyst: 'Florian Krauß',
      timestamp: 'Nov 16, 2025, 02:53 PM',
      title: 'Major support zone tested, watching for breakout confirmation',
      description: 'Please refer to the weekly overview for reference. Everything is...',
      views: '3.4K',
      likes: '203',
      comments: '23',
      bgGradient: 'bg-gradient-to-br from-slate-600 to-slate-800'
    },
    {
      pair: 'GBPJPY',
      timeframe: '4H',
      analyst: 'Ricardo Garcia',
      timestamp: 'Nov 17, 2025, 06:45 AM',
      title: 'Strong momentum building above key moving averages',
      description: 'Please refer to the weekly overview for reference. Everything is...',
      views: '1.5K',
      likes: '92',
      comments: '18',
      bgGradient: 'bg-gradient-to-br from-slate-600 to-slate-800'
    },
    {
      pair: 'XAUUSD',
      timeframe: 'Daily',
      analyst: 'Florian Krauß',
      timestamp: 'Nov 16, 2025, 01:30 PM',
      title: 'Gold reaches critical resistance, potential pullback expected',
      description: 'Please refer to the weekly overview for reference. Everything is...',
      views: '4.1K',
      likes: '245',
      comments: '31',
      bgGradient: 'bg-gradient-to-br from-slate-600 to-slate-800'
    },
    {
      pair: 'BTCUSD',
      timeframe: 'Weekly',
      analyst: 'Ricardo Garcia',
      timestamp: 'Nov 15, 2025, 09:15 AM',
      title: 'Weekly chart shows strong bullish structure formation',
      description: 'Please refer to the weekly overview for reference. Everything is...',
      views: '5.2K',
      likes: '312',
      comments: '45',
      bgGradient: 'bg-gradient-to-br from-slate-600 to-slate-800'
    }
  ];

  const markets = ['All Markets', 'Forex', 'Crypto', 'Indices'];
  const timeframes = ['1H', '4H', 'DAILY', 'WEEKLY'];
  return (
    <div className="container-fluid pb-5">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Insight" />
          <ToolbarDescription>
            {/* Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform. */}
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      <div className="">
        <div className="flex justify-between items-center flex-wrap mb-8 gap-3">
          <div className="flex gap-3 flex-wrap">
            <div className="p-2 flex overflow-auto bg-gray-200 rounded-xl gap-1 sm:gap-2">
              {markets.map(market => (
                <button
                  key={market}
                  onClick={() => setActiveMarket(market)}
                  className={`px-3 sm:px-6 py-2.5 text-xs sm:text-md rounded-lg font-semibold transition-all
                        ${activeMarket === market
                      ? 'bg-primary text-white shadow-lg shadow-primary/50'
                      : ' text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  {market}
                </button>
              ))}
            </div>
            <div className="p-2 flex overflow-auto bg-gray-200 rounded-xl gap-1 sm:gap-2">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 sm:px-6 py-2.5 text-xs sm:text-md rounded-lg font-semibold transition-all ${activeTimeframe === tf
                      ? 'bg-primary text-white shadow-lg shadow-primary/50'
                      : 'text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search pairs or analysis..."
              className="bg-gray-200 dark:text-white pl-12 pr-6 py-3 rounded-lg w-80 focus:outline-none placeholder-slate-500"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {marketData.map((data, index) => (
            <MarketCard key={index} {...data} />
          ))}
        </div>
        {/* <div className="col-span-12 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {isLoading ? (
              <Loader />
            ) : tradeIdeas.length > 0 ? (
              tradeIdeas.map((idea, index) => (
                <div
                  key={idea._id}
                  className="card border-2 hover:bg-gray-200 overflow-hidden flex flex-col h-full"
                >
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedIdea(idea);
                      setIsViewOpen(true);
                    }}
                    ref={
                      index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null
                    }
                  >
                    {idea.image && idea.image.length > 0 && (
                      <>
                        <img
                          src={idea.image[idea.currentIndex ?? 0]}
                          alt={idea.name}
                          className="w-full h-[220px] object-cover transition-all duration-500"
                        />

                        {idea.image.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === idea._id
                                      ? {
                                          ...t,
                                          currentIndex:
                                            (t.currentIndex ?? 0) === 0
                                              ? t.image.length - 1
                                              : (t.currentIndex ?? 0) - 1,
                                        }
                                      : t
                                  )
                                );
                              }}
                              className="!left-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md absolute top-1/2 -translate-y-1/2"
                            >
                              <ChevronLeft size={20} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === idea._id
                                      ? {
                                          ...t,
                                          currentIndex:
                                            (t.currentIndex ?? 0) ===
                                            t.image.length - 1
                                              ? 0
                                              : (t.currentIndex ?? 0) + 1,
                                        }
                                      : t
                                  )
                                );
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2!right-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md -translate-y-1/2"
                            >
                              <ChevronRight size={20} />
                            </button>

                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                              {idea.image.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTradeIdeas((prev) =>
                                      prev.map((t) =>
                                        t._id === idea._id
                                          ? { ...t, currentIndex: idx }
                                          : t
                                      )
                                    );
                                  }}
                                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    (idea.currentIndex ?? 0) === idx
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
                  </div>

                  <div className="card-border card-rounded-b flex flex-col gap-2 justify-between min-h-[210px]">
                    <div className="px-5 py-4.5 flex-grow">
                      <div className="flex item-center justify-between mb-2">
                        <div className="font-bold mr-3 text-gray-900">
                          {idea?.name}
                        </div>
                      </div>
                      <ShowMoreLess
                        className="text-gray-900 text-sm mt-2 leading-relaxed"
                        html={idea?.description || "No description"}
                        limit={65}
                      />
                    </div>

                    <div className="border-t bg-gray-100 px-5 py-3">
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
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-900 my-10">
                No IQ Ideas to load.
              </div>
            )}
          </div>
        </div> */}

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
        />
      </div>
    </div>
  );
};

export default IqInsight;
