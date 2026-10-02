import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowUp,
  CirclePlay,
  Send,
  Share2,
  Check,
  Volume2,
  Calendar,
  Clock3,
  VolumeX,
  TrendingDown,
  TrendingUp,
  UserPlus,
  UserCheck,
  Copy,
  ChartLine,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthContext } from "@/auth";
import { Sparkles, TrendingUpDown, RotateCw } from "lucide-react";
import { Bitcoin, BarChart3, ArrowRight, BookOpen } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useGetEducatorWithCoursesQuery,
  useLazyGetSecureVideoQuery,
} from "../../../store/api/client/clientCoursesApiSlice";
import { useToggleFollowMutation } from "../../../store/api/client/clientEductorApiSlice";
import VideoPlayerModal from "./VideoPlayerModal";
import ClientViewLiveSession from "../client-live-session/ClientViewLiveSession";
import RecordingThumbnail from "./RecordingThumbnail";
import ViewInsightTradeIdeas from "../iq-insight/ViewInsightTradeIdeas";
import InsightImageLightBox from "../iq-insight/ImageLightBox";
import ViewClientTradeIdeas from "../client-trade-ideas/ViewClientTradeIdeas";
import ViewClientLiveIdeas from "../client-live-ideas/ViewClientLiveIdeas";
import LiveIdeaImageLightBox from "../client-live-ideas/ImageLightBox";
import { format } from "date-fns";
import InfoImage from "../../../../public/media/images/info.jpg";
import videotutorial from "../../../../public/media/videos/videotutorial.mp4";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import RatingModal from "./RatingModel";
import { useLayout } from "../../../providers";
import {
  useGetLiveTradeIdeaQuery,
  useLazyGetTradeAnalysisByIdQuery,
  useGetEducatorIdeasQuery,
  useGetEducatorInsightsQuery,
} from "../../../store/api/client/clientTradeIdeasApiSlice";
import { useGetEducatorPostsQuery } from "../../../store/api/client/clientSocialApiSlilce";
import ImageLightBox from "../client-trade-ideas/ImageLightBox";
import { getOrderedImageUrls, getImages } from "@/utils/mediaOrder";
import PageContainer from "@/components/container/PageContainer";

const PAGE_WIDTH = "wide";
import QuotedReplyPreview from "@/components/ui/QuotedReplyPreview";
import ExpandableDescription from "@/components/ui/ExpandableDescription";
import EducatorFeed from "./EducatorFeed";
import { useResponsive } from "../../../hooks";

const htmlToPlainText = (html) => {
  if (!html) return "";
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
};

const IqEducators = () => {
  const [triggerSecureVideo] = useLazyGetSecureVideoQuery();
  const [toggleFollow, { isLoading: isFollowLoading }] = useToggleFollowMutation();
  const [callId, setCallId] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [recording, setRecording] = useState(null);
  const [idea, setIdea] = useState(null);
  const [liveIdea, setLiveIdea] = useState(null);
  const [insight, setInsight] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [isViewOpen1, setIsViewOpen1] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState({});
  const [isLightBoxOpen1, setIsLightBoxOpen1] = useState(false);
  const [isLiveIdeaViewOpen, setIsLiveIdeaViewOpen] = useState(false);
  const [selectedLiveIdea, setSelectedLiveIdea] = useState({});
  const [isLiveIdeaLightBoxOpen, setIsLiveIdeaLightBoxOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isLgUp = useResponsive("up", "lg");
  const [liveStatus, setLiveStatus] = useState(null);
  const isLive = liveStatus === "live";
  const leftColRef = useRef(null);
  const [leftColHeight, setLeftColHeight] = useState(null);
  useEffect(() => {
    const el = leftColRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height;
      if (height) setLeftColHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const videoRowRef = useRef(null);
  const [videoRowHeight, setVideoRowHeight] = useState(null);
  useEffect(() => {
    const el = videoRowRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height;
      if (height) setVideoRowHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const GRID_ROW_GAP_PX = 32;
  const [showRatingModal, setShowRatingModal] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuthContext();
  const LabelMap = {
    active: "Active",
    pending: "Pending",
    win: "Win",
    partialWin: "Partial Win",
    loss: "Loss",
    breakEven: "Break Even",
  };

  const userName = auth?.user?.name;
  const isEducator = auth?.user?.role === "educator";

  const getHeaderGradient = () => {
    const firstCategory = response?.data?.educator?.categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      return "bg-gradient-to-r from-[#7C3AED] to-[#1a0a2e]";
    } else if (categoryName.includes("digital marketing") || categoryName.includes("digitalmarketing")) {
      return "bg-gradient-to-r from-[#38BDF8] to-[#0c4a6e]";
    } else if (categoryName.includes("e-commerce") || categoryName.includes("ecommerce") || categoryName.includes("e commerce")) {
      return "bg-gradient-to-r from-[#167E8C] via-[#1B2746] to-[#152B37]";
    } else {
      return "bg-gradient-to-r from-[#2B44D3] to-[#0D0D21]";
    }
  };

  const getButtonColor = () => {
    const firstCategory = response?.data?.educator?.categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      return "border-[#7C3AED] bg-[#7C3AED] hover:bg-[#6D28D9]";
    } else if (categoryName.includes("digital marketing") || categoryName.includes("digitalmarketing")) {
      return "border-[#38BDF8] bg-[#38BDF8] hover:bg-[#0EA5E9]";
    } else if (categoryName.includes("e-commerce") || categoryName.includes("ecommerce") || categoryName.includes("e commerce")) {
      return "border-[#16B8C7] bg-[#16B8C7] hover:bg-[#073439]";
    } else {
      return "border-[#2B44D3] bg-[#2B44D3] hover:bg-[#1E3A8A]";
    }
  };

  const getSliderAccent = () => {
    const firstCategory = response?.data?.educator?.categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      return "accent-[#7C3AED]";
    } else if (categoryName.includes("digital marketing") || categoryName.includes("digitalmarketing")) {
      return "accent-[#38BDF8]";
    } else if (categoryName.includes("e-commerce") || categoryName.includes("ecommerce") || categoryName.includes("e commerce")) {
      return "accent-[#16B8C7]";
    } else {
      return "accent-[#2B44D3]";
    }
  };


  const getMasterClassButtonStyle = () => {
    const firstCategory = response?.data?.educator?.categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      return "bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 border-[#7C3AED]/50 hover:shadow-[#7C3AED]/30";
    } else if (categoryName.includes("digital marketing") || categoryName.includes("digitalmarketing")) {
      return "bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border-[#38BDF8]/50 hover:shadow-[#38BDF8]/30";
    } else if (categoryName.includes("e-commerce") || categoryName.includes("ecommerce") || categoryName.includes("e commerce")) {
      return "bg-[#16B8C7]/20 hover:bg-[#16B8C7]/30 border-[#16B8C7]/50 hover:shadow-[#16B8C7]/30";
    } else {
      return "bg-[#2B44D3]/20 hover:bg-[#2B44D3]/30 border-[#2B44D3]/50 hover:shadow-[#2B44D3]/30";
    }
  };

  const { id } = useParams();

  useGetEducatorPostsQuery({ educatorId: id, page: 1, limit: 10 }, { skip: !id });
  useGetEducatorIdeasQuery({ educatorId: id, page: 1, limit: 10 }, { skip: !id });
  useGetEducatorInsightsQuery({ educatorId: id, page: 1, limit: 10 }, { skip: !id });
  const {
    data: liveTradeIdeas,
    refetch: refetchLiveIdeas,
    isFetching: isFetchingLiveIdeas,
    isLoading: isLoadingLiveIdeasQuery,
  } = useGetLiveTradeIdeaQuery({
    page: 1,
    limit: 10,
    id: id,
    latestOnly: true,
  }, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: response,
    refetch: refetchEducator,
    isFetching: isFetchingEducator,
    isLoading: isLoadingEducator,
  } = useGetEducatorWithCoursesQuery(id, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });

  const educatorCategoryName = response?.data?.educator?.categories?.[0]?.name?.toLowerCase() ?? "";
  const isDigitalMarketing = educatorCategoryName.includes("digital marketing") || educatorCategoryName.includes("digitalmarketing") || educatorCategoryName.includes("e-commerce") || educatorCategoryName.includes("ecommerce") || educatorCategoryName.includes("e commerce");

  const [fetchTradeAnalysisById] = useLazyGetTradeAnalysisByIdQuery();

  const [feedReady, setFeedReady] = useState(false);
  const pageReady = !isLoadingEducator && !isLoadingLiveIdeasQuery && feedReady;
  const [feedEmpty, setFeedEmpty] = useState(false);

  useEffect(() => {

    if (liveTradeIdeas && liveTradeIdeas?.data) {
      setLiveIdea(liveTradeIdeas?.data);
    }

  }, [liveTradeIdeas, liveIdea]);

  useEffect(() => {
    if (response?.data?.educator?.isFollowing !== undefined) {
      setIsFollowing(response.data.educator.isFollowing);
    }
  }, [response]);

  const handleToggleFollow = async () => {
    if (isFollowLoading) return;
    setIsFollowing((prev) => !prev);
    try {
      await toggleFollow(id).unwrap();
      refetchEducator();
    } catch (error) {
      setIsFollowing((prev) => !prev);
      console.error("Follow toggle error:", error);
    }
  };

  const handleRefresh = () => {
    refetchLiveIdeas();
  };

  const { volume, setVolume, isMuted, setIsMuted } = useLayout();

  const toggleMute = () => setIsMuted((v) => !v);
  const decVolume = () => setVolume((v) => Math.max(0, +(v - 0.1).toFixed(2)));
  const incVolume = () => setVolume((v) => Math.min(1, +(v + 0.1).toFixed(2)));
  const onSliderChange = (val) => {
    setVolume(Number(val));
    if (isMuted && Number(val) > 0) setIsMuted(false);
  };



  const handleCloseView = () => {
    setIsViewOpen(false);
  };
  const handleCloseView1 = () => {
    setIsViewOpen1(false);
  };
  const handleCloseLiveIdeaView = () => {
    setIsLiveIdeaViewOpen(false);
  };

  const handleCopyField = async (id, fieldName, value) => {
    try {
      await navigator.clipboard.writeText(value ?? "N/A");
      setCopiedField({ id, field: fieldName });
      setTimeout(() => setCopiedField(null), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const [loadingFollowUpId, setLoadingFollowUpId] = useState(null);

  const [imageIndexById, setImageIndexById] = useState({});
  const stepImage = (id, count, delta) =>
    setImageIndexById((prev) => ({
      ...prev,
      [id]: (((prev[id] ?? 0) + delta) % count + count) % count,
    }));

  const renderIdeaCard = (courseIdea, extraClassName = "") => {
    const modalIdea = { ...courseIdea, educatorDetails: courseIdea?.educatorId };
    const orderedImages = getOrderedImageUrls(courseIdea);
    const currentIndex = imageIndexById[courseIdea?._id] ?? 0;
    return (
      <div
        key={courseIdea?._id}
        className={`relative isolate rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35] ${extraClassName}`}
      >
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="inline-flex items-center text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight min-w-0 truncate">
                {courseIdea?.name || "—"}
              </span>
              {courseIdea?.status && (
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider flex-shrink-0 whitespace-nowrap ${LabelMap[courseIdea.status] === "Active"
                    ? "text-cyan-600 dark:text-cyan-400"
                    : LabelMap[courseIdea.status] === "Pending"
                      ? "text-purple-600 dark:text-purple-400"
                      : LabelMap[courseIdea.status] === "Win"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : LabelMap[courseIdea.status] === "Partial Win"
                          ? "text-emerald-500 dark:text-emerald-400"
                          : LabelMap[courseIdea.status] === "Loss"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  {LabelMap[courseIdea.status] === "Win"
                    ? `WIN +${courseIdea.pips} pips`
                    : LabelMap[courseIdea.status] === "Loss"
                      ? `LOSS -${courseIdea.pips} pips`
                      : LabelMap[courseIdea.status]}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              {(courseIdea?.type || courseIdea?.timeFrame) && (
                <span
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-extrabold flex-shrink-0 border leading-none ${courseIdea.type === "buy"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                >
                  {courseIdea.type === "buy" ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {courseIdea.type
                    ? courseIdea.type.charAt(0).toUpperCase() + courseIdea.type.slice(1).toLowerCase()
                    : ""}
                  {courseIdea.timeFrame
                    ? ` - ${Array.isArray(courseIdea.timeFrame) ? courseIdea.timeFrame.join("/") : courseIdea.timeFrame}`
                    : ""}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {courseIdea?.createdAt ? format(new Date(courseIdea.createdAt), "MMM dd, hh:mm a") : ""}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px] ${isEducator ? "" : "cursor-pointer"}`}
          onClick={() => {
            if (isEducator) return;
            setSelectedIdea(modalIdea);
            setIsViewOpen(true);
          }}
        >
          {orderedImages.length > 0 ? (
            <>
              <img
                src={orderedImages[currentIndex] || orderedImages[0]}
                alt={courseIdea?.name}
                className="w-full h-[220px] object-cover object-right transition-opacity duration-300"
              />
              {orderedImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stepImage(courseIdea?._id, orderedImages.length, -1);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stepImage(courseIdea?._id, orderedImages.length, 1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {orderedImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          currentIndex === idx ? "bg-white" : "bg-white/40"
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

        <div className="mb-2 space-y-1.5">
          <ExpandableDescription html={courseIdea?.description} />
          {courseIdea?.entry && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField(courseIdea._id, "Entry", courseIdea.entry)}
            >
              <span className="text-[11px] text-slate-600 dark:text-white font-medium">Entry</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                {copiedField?.id === courseIdea._id && copiedField?.field === "Entry" ? (
                  <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[9px]">📍</span> {courseIdea.entry}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {courseIdea?.invalidation && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField(courseIdea._id, "Stop Loss", courseIdea.invalidation)}
            >
              <span className="text-[11px] text-slate-600 dark:text-white font-medium">
                Invalidation
              </span>
              <span className="text-[11px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                {copiedField?.id === courseIdea._id && copiedField?.field === "Stop Loss" ? (
                  <span className="text-[9px] text-red-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[9px]">❌</span> {courseIdea.invalidation}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {["Exit1", "Exit2", "Exit3"].map((tpField, idx) => {
            const tpValue = courseIdea?.exits?.[idx];
            if (!tpValue && tpValue !== 0) return null;
            const fieldName = `Exit ${idx + 1}`;
            return (
              <div
                key={tpField}
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={() => handleCopyField(courseIdea._id, fieldName, tpValue)}
              >
                <span className="text-[11px] text-slate-600 dark:text-white font-medium">
                  {fieldName}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {copiedField?.id === courseIdea._id && copiedField?.field === fieldName ? (
                    <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                  ) : null}
                  <span className="text-[9px]">🎯</span> {tpValue}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLiveIdeaCard = (liveIdeaData, extraClassName = "") => {
    const modalLiveIdea = { ...liveIdeaData, educatorDetails: liveIdeaData?.educatorId };
    const liveImages = getImages(liveIdeaData);
    const currentIndex = imageIndexById[liveIdeaData?._id] ?? 0;
    return (
      <div
        key={liveIdeaData?._id}
        className={`relative isolate rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35] ${extraClassName}`}
      >
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="inline-flex items-center text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-1 rounded-lg leading-tight min-w-0 truncate">
                {liveIdeaData?.name || "—"}
              </span>
              {liveIdeaData?.status && (
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider flex-shrink-0 whitespace-nowrap ${LabelMap[liveIdeaData.status] === "Active"
                    ? "text-cyan-600 dark:text-cyan-400"
                    : LabelMap[liveIdeaData.status] === "Pending"
                      ? "text-purple-600 dark:text-purple-400"
                      : LabelMap[liveIdeaData.status] === "Win"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : LabelMap[liveIdeaData.status] === "Partial Win"
                          ? "text-emerald-500 dark:text-emerald-400"
                          : LabelMap[liveIdeaData.status] === "Loss"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-600 dark:text-slate-400"
                    }`}
                >
                  {LabelMap[liveIdeaData.status] === "Win"
                    ? `WIN +${liveIdeaData.pips} pips`
                    : LabelMap[liveIdeaData.status] === "Loss"
                      ? `LOSS -${liveIdeaData.pips} pips`
                      : LabelMap[liveIdeaData.status]}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
              {(liveIdeaData?.type || liveIdeaData?.timeFrame) && (
                <span
                  className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-extrabold flex-shrink-0 border leading-none ${liveIdeaData.type === "buy"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                >
                  {liveIdeaData.type === "buy" ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {liveIdeaData.type
                    ? liveIdeaData.type.charAt(0).toUpperCase() + liveIdeaData.type.slice(1).toLowerCase()
                    : ""}
                  {liveIdeaData.timeFrame
                    ? ` - ${Array.isArray(liveIdeaData.timeFrame) ? liveIdeaData.timeFrame.join("/") : liveIdeaData.timeFrame}`
                    : ""}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {liveIdeaData?.createdAt ? format(new Date(liveIdeaData.createdAt), "MMM dd, hh:mm a") : ""}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px] ${isEducator ? "" : "cursor-pointer"}`}
          onClick={() => {
            if (isEducator) return;
            setSelectedLiveIdea(modalLiveIdea);
            setIsLiveIdeaViewOpen(true);
          }}
        >
          {liveImages.length > 0 ? (
            <>
              <img
                src={liveImages[currentIndex] || liveImages[0]}
                alt={liveIdeaData?.name}
                className="w-full h-[220px] object-cover object-right transition-opacity duration-300"
              />
              {liveImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stepImage(liveIdeaData?._id, liveImages.length, -1);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stepImage(liveIdeaData?._id, liveImages.length, 1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {liveImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          currentIndex === idx ? "bg-white" : "bg-white/40"
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

        <div className="mb-2 space-y-1.5">
          <ExpandableDescription html={liveIdeaData?.description || liveIdeaData?.message} />
          {liveIdeaData?.entry && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField(liveIdeaData._id, "Entry", liveIdeaData.entry)}
            >
              <span className="text-[11px] text-slate-600 dark:text-white font-medium">Entry</span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                {copiedField?.id === liveIdeaData._id && copiedField?.field === "Entry" ? (
                  <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[9px]">📍</span> {liveIdeaData.entry}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {liveIdeaData?.invalidation && (
            <div
              className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
              onClick={() => handleCopyField(liveIdeaData._id, "Stop Loss", liveIdeaData.invalidation)}
            >
              <span className="text-[11px] text-slate-600 dark:text-white font-medium">
                Invalidation
              </span>
              <span className="text-[11px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                {copiedField?.id === liveIdeaData._id && copiedField?.field === "Stop Loss" ? (
                  <span className="text-[9px] text-red-500 mr-1">Copied</span>
                ) : null}
                <span className="text-[9px]">❌</span> {liveIdeaData.invalidation}
                <Copy size={10} className="text-slate-400 dark:text-white/50" />
              </span>
            </div>
          )}
          {["Exit1", "Exit2", "Exit3"].map((tpField, idx) => {
            const tpValue = liveIdeaData?.exits?.[idx];
            if (!tpValue && tpValue !== 0) return null;
            const fieldName = `Exit ${idx + 1}`;
            return (
              <div
                key={tpField}
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={() => handleCopyField(liveIdeaData._id, fieldName, tpValue)}
              >
                <span className="text-[11px] text-slate-600 dark:text-white font-medium">
                  {fieldName}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {copiedField?.id === liveIdeaData._id && copiedField?.field === fieldName ? (
                    <span className="text-[9px] text-emerald-500 mr-1">Copied</span>
                  ) : null}
                  <span className="text-[9px]">🎯</span> {tpValue}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleOpenPreviousAnalysisInsight = async (previousAnalysisId) => {
    if (!previousAnalysisId || loadingFollowUpId) return;
    setLoadingFollowUpId(previousAnalysisId);
    try {
      const original = await fetchTradeAnalysisById(previousAnalysisId).unwrap();
      setSelectedInsight(original?.data || original);
      setIsViewOpen1(true);
    } catch (err) {
      console.error("Failed to load original insight", err);
      toast.error("Could not open the original post. Please try again.");
    } finally {
      setLoadingFollowUpId(null);
    }
  };

  const renderInsightCard = (insight, extraClassName = "") => {
    const modalInsight = {
      ...insight,
      name: insight?.title,
      image: insight?.photos,
      educatorDetails: insight?.createdBy,
    };
    const orderedThumbnail = getOrderedImageUrls(insight)[0];
    return (
      <div
        key={insight?._id}
        className={`relative isolate rounded-2xl p-[1.125rem] bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col border border-slate-200 dark:border-[#1F1F35] ${extraClassName}`}
      >
        <QuotedReplyPreview
          title={insight?.previousAnalysis?.title}
          thumbnail={insight?.previousAnalysis?.photos?.[0]}
          reserveSpace
          onClick={(e) => {
            if (!insight?.previousAnalysis) return;
            e.stopPropagation();
            handleOpenPreviousAnalysisInsight(insight.previousAnalysis._id);
          }}
          isLoading={!!insight?.previousAnalysis && loadingFollowUpId === insight.previousAnalysis._id}
        />
        <div className="flex items-start gap-1 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-white/60 font-bold whitespace-nowrap">
                {insight?.createdAt ? format(new Date(insight.createdAt), "MMM dd, hh:mm a") : ""}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`-mx-[1.125rem] mb-2 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px] ${isEducator ? "" : "cursor-pointer"}`}
          onClick={() => {
            if (isEducator) return;
            setSelectedInsight(modalInsight);
            setIsViewOpen1(true);
          }}
        >
          {orderedThumbnail ? (
            <img
              src={orderedThumbnail}
              alt={insight?.title}
              className="w-full h-[220px] object-cover object-center"
            />
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

        <div className="mb-2 space-y-1.5">
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
      </div>
    );
  };
  //  useEffect(() => {
  //   if (response?.data?.schedules?.length > 0) {
  //     const now = new Date();

  //     // Pehle sirf aaj ke schedules filter karo
  //     const todaySchedules = response.data.schedules.filter((item) => {
  //       const scheduleDate = new Date(item.date);
  //       return scheduleDate.toDateString() === now.toDateString();
  //     });

  //     if (todaySchedules.length > 0) {
  //       // Time ke according sort karo
  //       const sorted = todaySchedules.sort((a, b) => {
  //         return new Date(a.date) - new Date(b.date);
  //       });

  //       // Abhi ke baad ka first schedule lo (upcoming)
  //       const upcoming = sorted.find((item) => new Date(item.date) > now);

  //       // Agar upcoming mila to use set karo, nahi to latest past ka set karo
  //       setCallId(upcoming ? upcoming.callId : sorted[sorted.length - 1].callId);
  //     }
  //   }
  // }, [response]);

  useEffect(() => {
    if (response?.data?.schedules && response.data.schedules.length > 0) {
      setCallId(response.data.schedules[0].callId);
    }
  }, [response]);

  const handleShowMasterClasses = () => {
    if (isEducator) return;
    navigate(`/master-class/${id}`);
  };


  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Mr. Anderson",
      time: "1 Day ago",
      text: "Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I'll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?",
    },
    {
      id: 2,
      sender: "Mrs. Anderson",
      time: "1 Day ago",
      text: "Long before you sit dow to put digital pen to paper.",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const newId =
      messages.length > 0 ? Math.max(...messages.map((msg) => msg.id)) + 1 : 1;
    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: newId,
        sender: "You",
        time: "Just now",
        text: newMessage.trim(),
      },
    ]);
    setNewMessage("");
  };

  const handleOpen = async (videoKey) => {
    // const { data } = await triggerSecureVideo(videoKey);
    // if (data?.url) {
    //   setVideoUrl(data.url);
    //   setOpen(true);
    // }
    setVideoUrl(videoKey);
    setOpen(true);
  };

  function handleShare() {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setShowShareToast(true);
        setTimeout(() => {
          setShowShareToast(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        setShowShareToast(true);
        setTimeout(() => {
          setShowShareToast(false);
        }, 3000);
      });
  }

  const renderRecordingCard = (course, extraClassName = "") => (
    <div
      key={course?._id}
      className={`cursor-pointer border rounded-xl shadow-sm flex flex-col h-full ${extraClassName}`}
    >
      <div className="rounded-t-xl overflow-hidden" onClick={() => setRecording(course)}>
        <RecordingThumbnail
          videoUrl={course?.url}
          seekTime={2}
          image={course?.thumbnail}
          defaultImage={response?.data?.educator?.bannerImage}
          onRecordingClick={() => handleOpen(course?.url)}
          sizeClassName="aspect-video"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-base font-normal leading-6 line-clamp-2 min-h-12"
          title={course?.call_title}
        >
          {course?.call_title}
        </h3>
        <div className="card-footer justify-between pt-4 p-0 mt-auto">
          <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
            <Calendar size={16} /> {new Date(course?.start_time).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <PageContainer width={PAGE_WIDTH} className="pb-10">
      {!pageReady && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="mt-3 text-sm text-gray-400">Loading educator profile...</span>
        </div>
      )}
      <div className={pageReady ? "" : "hidden"}>
      {showShareToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 ease-in-out animate-bounce">
          <Check size={20} className="animate-pulse" />
          <span className="font-medium">Link copied to clipboard!</span>
        </div>
      )}


      <div className={`${getHeaderGradient()} rounded-2xl mb-8 p-6 sm:p-8 border border-white/10 shadow-xl grid grid-cols-1 lg:grid-cols-3 items-center gap-6 lg:gap-0 lg:divide-x lg:divide-white/10`}>
        <div className="flex items-center flex-wrap justify-center lg:justify-start gap-6 lg:pr-6">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img
              src={response?.data?.educator?.image}
              alt="Educator Profile"
              className="relative w-24 h-24 sm:w-28 sm:h-28 object-cover object-top rounded-full border-4 border-white shadow-xl"
            />
          </div>

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="text-white font-bold text-md sm:text-xl mb-2 tracking-tight drop-shadow-md">
              {response?.data?.educator?.first_name}{" "}
              {response?.data?.educator?.last_name}
            </h3>

            {response?.data?.educator?.educatorRole && (
              <div className="mb-3">
                <span className="bg-white/15 text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
                  {response.data.educator.educatorRole}
                </span>
              </div>
            )}

            <button
              onClick={handleShowMasterClasses}
              disabled={isEducator}
              className={`group relative inline-flex items-center gap-2 px-6 py-2.5 ${getMasterClassButtonStyle()} text-white rounded-full text-sm font-medium transition-all duration-300 shadow-lg overflow-hidden ${isEducator ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <BookOpen size={18} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative">Go to My MasterClass</span>
              <ArrowRight size={16} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-2 lg:px-6">
          {response?.data?.educator?.bio && (
            <>
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <span className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-blue-400/70" />
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-white/90 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
                  About Me
                </span>
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent to-blue-400/70" />
              </div>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-md">
                {response.data.educator.bio}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center lg:items-end gap-2 lg:pl-6">
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="relative w-full sm:w-[800px] bg-white dark:bg-gray-100 rounded-2xl p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-gray-700  mb-3 font-semibold text-xs md:text-xs lg:text-sm mt-5 block text-center">
                  Change in Sound Option from Automatic (Default) to Allow,{" "}
                  <br /> like in the Image
                </span>
                <div
                  className="overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => isVolumeOpen(true)}
                >
                  <img src={InfoImage} alt="Info" />
                </div>

                <span
                  className=" text-gray-700 mb-3 font-semibold text-xs md:text-xs lg:text-sm mt-5 block text-center

  "
                >
                  Or follow the video tutorial
                </span>
                <div className="overflow-hidden rounded-lg mx-auto block w-fit">
                  <video width="500" height="240" muted loop controls>
                    <source src={videotutorial} type="video/mp4" />
                  </video>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className={`absolute top-3 right-3 ${getButtonColor()} text-white px-3 py-1 rounded-lg shadow`}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => handleShare()}
            className="border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-colors w-full lg:w-auto justify-center"
          >
            <Share2 size={13} />
            Share
          </button>

          <button
            onClick={handleToggleFollow}
            disabled={isFollowLoading}
            className={`border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-colors w-full lg:w-auto justify-center ${isFollowLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
          >
            {isFollowing ? (
              <>
                <UserCheck size={13} />
                Following
              </>
            ) : (
              <>
                <UserPlus size={13} />
                Follow
              </>
            )}
          </button>

          <button
            onClick={() => setShowRatingModal(true)}
            className={`border ${getButtonColor()} text-white px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors w-full lg:w-auto justify-center`}
          >
            <span className="text-yellow-300">⭐</span> Rate Me
          </button>
        </div>
      </div>
      <div
        className="grid grid-cols-12 gap-y-8 md:gap-x-8"
        style={
          isLgUp && !isLive && videoRowHeight
            ? { gridTemplateRows: `${videoRowHeight}px auto` }
            : undefined
        }
      >
        <div
          ref={videoRowRef}
          className={`self-start ${isLive ? "col-span-12" : "col-span-12 lg:col-span-8 3xl:col-span-9 4xl:col-span-10"}`}
        >
          <ClientViewLiveSession
            bannerImage={response?.data?.educator?.bannerImage}
            callId={callId}
            educatorData={response?.data?.educator?.description}
            headerGradient={getHeaderGradient()}
            onStatusChange={setLiveStatus}
          />
        </div>

        {isLgUp && !isLive && (
          <div
            className={`col-span-12 lg:col-span-4 3xl:col-span-3 4xl:col-span-2 flex flex-col self-start ${feedEmpty ? "" : "row-span-2"}`}
          >
            <EducatorFeed
              educatorId={id}
              headerGradient={getHeaderGradient()}
              onReady={() => setFeedReady(true)}
              onEmptyChange={setFeedEmpty}
              maxHeight={
                !feedEmpty && videoRowHeight && leftColHeight
                  ? videoRowHeight + GRID_ROW_GAP_PX + leftColHeight
                  : undefined
              }
            />
          </div>
        )}

        <div ref={leftColRef} className="col-span-12 lg:col-span-8 3xl:col-span-9 4xl:col-span-10 flex flex-col gap-8 self-start">

          {!isLgUp && (
            <EducatorFeed
              educatorId={id}
              headerGradient={getHeaderGradient()}
              onReady={() => setFeedReady(true)}
              maxHeight={900}
            />
          )}

          {response?.data?.masterClasses?.length > 0 && <div className="text-gray-900 mb-8">
            <div className={`${getHeaderGradient()} text-white p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Master Classes</h2>
                {!isEducator && <button
                  className="text-xs font-medium text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-1 rounded-full transition-all"
                  onClick={() => navigate(`/master-class/${id}`)}
                >
                  View All
                </button>}
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.masterClasses?.length > 0 ? (
                <div className="flex gap-4">
                  {response?.data?.masterClasses?.map((mc) => (
                    <div
                      key={mc?._id}
                      className={`w-full sm:w-1/2 md:w-1/3 3xl:w-1/4 4xl:w-1/5 border rounded-xl shadow-sm flex-shrink-0 ${isEducator ? '' : 'cursor-pointer'}`}
                      onClick={() => { if (!isEducator) navigate(`/master-class/${id}`); }}
                    >
                      <div className="rounded-t-xl overflow-hidden">
                        <img
                          src={mc?.imageUrl || mc?.strategyBanner}
                          alt={mc?.title}
                          className="w-full h-36 object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-md font-normal mb-2">
                          {mc?.title}
                        </h3>
                        {mc?.category?.name && (
                          <p className="text-xs text-gray-500 mb-1">{mc?.category?.name}</p>
                        )}
                        {mc?.language && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {mc?.language}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">No Masterclasses Found</span>
                </div>
              )}
            </div>
          </div>}

          {response?.data?.recordings?.length > 0 && <div className="text-gray-900 mb-8">
            <div className={`${getHeaderGradient()} text-white p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Recordings</h2>
                <button
                  className="text-xs font-medium text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-1 rounded-full transition-all"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Show Less" : "View All"}
                </button>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.recordings?.length > 0 ? (
                showAll ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4">
                    {response?.data?.recordings?.map((course) => renderRecordingCard(course))}
                  </div>
                ) : (
                  <div className="flex gap-4 items-stretch">
                    {response?.data?.recordings?.map((course) =>
                      renderRecordingCard(
                        course,
                        "w-full sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] 3xl:w-[calc((100%-3rem)/4)] 4xl:w-[calc((100%-4rem)/5)] flex-shrink-0"
                      )
                    )}
                  </div>
                )
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">No Recordings Found</span>
                </div>
              )}
            </div>
          </div>}

          {response?.data?.idea?.length > 0 && <div className="text-gray-900 mb-8">
            <div className={`${getHeaderGradient()} text-white p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Ideas</h2>
                {!isEducator && <button
                  onClick={() => setIdea((prev) => !prev)}
                  className="text-xs font-medium text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-1 rounded-full transition-all"
                >
                  {idea ? "Show Less" : "View All"}
                </button>}
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.idea?.length > 0 ? (
                idea ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4 items-start">
                    {response?.data?.idea?.map((course) => renderIdeaCard(course))}
                  </div>
                ) : (
                  <div className="flex gap-4 items-stretch overflow-x-auto pb-2">
                    {response?.data?.idea?.map((course) =>
                      renderIdeaCard(course, "w-[280px] sm:w-[320px] flex-shrink-0")
                    )}
                  </div>
                )
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">No Idea Found</span>
                </div>
              )}
            </div>
          </div>}

          {response?.data?.insight?.length > 0 && <div className="text-gray-900 mb-8">
            <div className={`${getHeaderGradient()} text-white p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Insights</h2>
                {!isEducator && <button
                  onClick={() => setInsight((prev) => !prev)}
                  className="text-xs font-medium text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-1 rounded-full transition-all"
                >
                  {insight ? "Show Less" : "View All"}
                </button>}
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.insight?.length > 0 ? (
                insight ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4 items-start">
                    {response?.data?.insight?.map((course) => renderInsightCard(course))}
                  </div>
                ) : (
                  <div className="flex gap-4 items-stretch overflow-x-auto pb-2">
                    {response?.data?.insight?.map((course) =>
                      renderInsightCard(course, "w-[280px] sm:w-[320px] flex-shrink-0")
                    )}
                  </div>
                )
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    No insight Found
                  </span>
                </div>
              )}
            </div>
          </div>}

          {liveIdea?.length > 0 && <div className="text-gray-900 mb-8">
            <div className={`${getHeaderGradient()} text-white p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium">Live Ideas</h2>

                </div>
                <button
                  onClick={() => {
                    setLiveIdea((prev) => !prev)
                    handleRefresh()
                  }}
                  disabled={isFetchingLiveIdeas}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <RotateCw
                    size={18}
                    className={
                      isFetchingLiveIdeas
                        ? "animate-spin"
                        : ""
                    }

                  />

                </button>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {liveIdea?.length > 0 ? (
                <div className="flex gap-4 items-stretch overflow-x-auto pb-2">
                  {liveIdea?.map((liveIdeaData) =>
                    renderLiveIdeaCard(liveIdeaData, "w-[280px] sm:w-[320px] flex-shrink-0")
                  )}
                </div>

              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">No Live idea Found</span>
                </div>
              )}
            </div>
          </div>}
        </div>

        {isLgUp && isLive && (
          <div className="col-span-12 lg:col-span-4 3xl:col-span-3 4xl:col-span-2 flex flex-col self-start">
            <EducatorFeed
              educatorId={id}
              headerGradient={getHeaderGradient()}
              onReady={() => setFeedReady(true)}
              onEmptyChange={setFeedEmpty}
              maxHeight={!feedEmpty ? leftColHeight || undefined : undefined}
            />
          </div>
        )}
      </div>

      <VideoPlayerModal
        open={open}
        onOpenChange={setOpen}
        videoUrl={videoUrl}
        data={recording}
      />

      <ViewClientTradeIdeas
        isViewOpen={isViewOpen}
        setIsLightBoxOpen={setIsLightBoxOpen}
        handleCloseView={handleCloseView}
        selectedIdea={selectedIdea}
      />

      <ViewClientLiveIdeas
        isViewOpen={isLiveIdeaViewOpen}
        setIsLightBoxOpen={setIsLiveIdeaLightBoxOpen}
        handleCloseView={handleCloseLiveIdeaView}
        selectedIdea={selectedLiveIdea}
      />

      <ViewInsightTradeIdeas
        isViewOpen={isViewOpen1}
        setIsLightBoxOpen={setIsLightBoxOpen1}
        handleCloseView={handleCloseView1}
        selectedIdea={selectedInsight}
      />
      <Lightbox
        open={isVolumeOpen}
        close={() => setIsVolumeOpen(false)}
        slides={[{ src: InfoImage }]}
      />

      {showRatingModal && (
        <RatingModal
          showRatingModal={showRatingModal}
          setShowRatingModal={setShowRatingModal}
          educatorId={id}
        />
      )}
      {
        isLightBoxOpen && (
          <ImageLightBox
            isLightBoxOpen={isLightBoxOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            selectedIdea={selectedIdea}
          />
        )
      }
      {
        isLiveIdeaLightBoxOpen && (
          <LiveIdeaImageLightBox
            isLightBoxOpen={isLiveIdeaLightBoxOpen}
            setIsLightBoxOpen={setIsLiveIdeaLightBoxOpen}
            selectedIdea={selectedLiveIdea}
          />
        )
      }
      {
        isLightBoxOpen1 && (
          <InsightImageLightBox
            isLightBoxOpen={isLightBoxOpen1}
            setIsLightBoxOpen={setIsLightBoxOpen1}
            selectedIdea={selectedInsight}
          />
        )
      }
      </div>
    </PageContainer>
  );
};

export default IqEducators;
