import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react"; // Added Check icon
import { useAuthContext } from "@/auth";
import { Sparkles, TrendingUpDown, RotateCw } from "lucide-react";
import { Bitcoin, BarChart3, ArrowRight, BookOpen } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useGetEducatorWithCoursesQuery,
  useLazyGetSecureVideoQuery,
} from "../../../store/api/client/clientCoursesApiSlice";
import VideoPlayerModal from "./VideoPlayerModal";
import ClientViewLiveSession from "../client-live-session/ClientViewLiveSession";
import RecordingThumbnail from "./RecordingThumbnail";
import ShowMoreLess from "../../../components/ui/showmoreless";
import ViewInsightTradeIdeas from "./ViewInsightTradeIdeas";
import ViewClientTradeIdeas from "./ViewClientTradeIdeas";
import { format, formatDistanceToNow } from "date-fns";
import InfoImage from "../../../../public/media/images/info.jpg";
import videotutorial from "../../../../public/media/videos/videotutorial.mp4";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import RatingModal from "./RatingModel";
import { useLayout } from "../../../providers";
import { useGetLiveTradeIdeaQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import ImageLightBox from "../client-trade-ideas/ImageLightBox";

const IqEducators = () => {
  const [triggerSecureVideo] = useLazyGetSecureVideoQuery();
  const [callId, setCallId] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false); // Add toast state
  const [showAll, setShowAll] = useState(false);
  const [courseAll, setCourseAll] = useState(false);
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

  const [isOpen, setIsOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [liveFeedImage, setLiveFeedImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Get gradient background based on educator's first category from API response
  const getHeaderGradient = () => {
    const firstCategory = response?.data?.educator?.categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      // Crypto - Purple gradient
      return "bg-gradient-to-r from-[#7C3AED] to-[#1a0a2e]";
    } else if (categoryName.includes("digital marketing") || categoryName.includes("digitalmarketing")) {
      // Digital Marketing - Light Blue gradient
      return "bg-gradient-to-r from-[#38BDF8] to-[#0c4a6e]";
    } else {
      // Forex (default) - Blue gradient
      return "bg-gradient-to-r from-[#2B44D3] to-[#0D0D21]";
    }
  };

  // Get button color based on educator's first category
  const getButtonColor = () => {
    const firstCategory = response?.data?.educator?.categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      // Crypto - Purple
      return "border-[#7C3AED] bg-[#7C3AED] hover:bg-[#6D28D9]";
    } else if (categoryName.includes("digital marketing") || categoryName.includes("digitalmarketing")) {
      // Digital Marketing - Light Blue
      return "border-[#38BDF8] bg-[#38BDF8] hover:bg-[#0EA5E9]";
    } else {
      // Forex (default) - Blue
      return "border-[#2B44D3] bg-[#2B44D3] hover:bg-[#1E3A8A]";
    }
  };

  // Get slider accent color based on educator's first category
  const getSliderAccent = () => {
    const firstCategory = response?.data?.educator?.categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      return "accent-[#7C3AED]";
    } else if (categoryName.includes("digital marketing") || categoryName.includes("digitalmarketing")) {
      return "accent-[#38BDF8]";
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
    } else {
      return "bg-[#2B44D3]/20 hover:bg-[#2B44D3]/30 border-[#2B44D3]/50 hover:shadow-[#2B44D3]/30";
    }
  };

  const { id } = useParams();
  const {
    data: response,
    refetch: refetchEducator,
    isFetching: isFetchingEducator,
  } = useGetEducatorWithCoursesQuery(id);

  // Check if educator's first category is Digital Marketing
  const educatorCategoryName = response?.data?.educator?.categories?.[0]?.name?.toLowerCase() ?? "";
  const isDigitalMarketing = educatorCategoryName.includes("digital marketing") || educatorCategoryName.includes("digitalmarketing");

  const {
    data: liveTradeIdeas,
    refetch: refetchLiveIdeas,
    isFetching: isFetchingLiveIdeas,
  } = useGetLiveTradeIdeaQuery({
    page: 1,
    limit: 10,
    id: id,
  });

  useEffect(() => {

    if (liveTradeIdeas && liveTradeIdeas?.data) {
      setLiveIdea(liveTradeIdeas?.data);
    }

  }, [liveTradeIdeas, liveIdea]);

  const handleRefresh = () => {
    // refetchEducator();
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

  // State for the new message input
  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Ref for the messages container to enable auto-scrolling
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent form submission and page reload
    if (newMessage.trim() === "") return; // Don't send empty messages

    const newId =
      messages.length > 0 ? Math.max(...messages.map((msg) => msg.id)) + 1 : 1;
    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`; // Basic time

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: newId,
        sender: "You", // Assuming the user is "You"
        time: "Just now", // Can be improved to actual time or "X minutes ago"
        text: newMessage.trim(),
      },
    ]);
    setNewMessage(""); // Clear the input field
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
        // Show toast notification
        setShowShareToast(true);
        // Hide toast after 3 seconds
        setTimeout(() => {
          setShowShareToast(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        // Show error toast
        setShowShareToast(true);
        setTimeout(() => {
          setShowShareToast(false);
        }, 3000);
      });
  }

  const makeClickableLinks = (text) =>
    text?.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, (url) => {
      const clickableUrl = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${clickableUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`;
    });

  const getRelativeTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (diffInSeconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };


  return (
    <div className="container-fluid pb-10">
      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 ease-in-out animate-bounce">
          <Check size={20} className="animate-pulse" />
          <span className="font-medium">Link copied to clipboard!</span>
        </div>
      )}


      {/* speaker center */}
      <div className={`${getHeaderGradient()} rounded-2xl mb-8 p-8 sm:p-8 flex items-center justify-between sm:flex-row flex-col gap-4`}>
        <div className="flex items-center gap-20 sm:flex-row flex-col sm:justify-start justify-center">
          <div className="flex items-center flex-wrap justify-center sm:justify-start gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img
                src={response?.data?.educator?.image}
                alt="Educator Profile"
                className="relative w-24 h-24 sm:w-28 sm:h-28 object-cover object-top rounded-full border-4 border-white shadow-xl"
              />
            </div>

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-white font-bold text-md sm:text-xl mb-3 tracking-tight drop-shadow-md">
                {response?.data?.educator?.first_name}{" "}
                {response?.data?.educator?.last_name}
              </h3>

              <button
                onClick={handleShowMasterClasses}
                className={`group relative inline-flex items-center gap-2 px-6 py-2.5 ${getMasterClassButtonStyle()} text-white rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:-translate-y-0.5 overflow-hidden`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <BookOpen size={18} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">Go to My MasterClass</span>
                <ArrowRight size={16} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-lg border border-white/20 backdrop-blur-sm w-fit">
          <button
            onClick={toggleMute}
            className="text-white hover:text-yellow-300 transition p-1"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={decVolume}
            className="text-white text-lg px-1 hover:text-yellow-300 transition"
          >
            –
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onSliderChange(e.target.value)}
            className={`w-24 ${getSliderAccent()} cursor-pointer`}
          />

          <button
            onClick={incVolume}
            className="text-white text-lg px-1 hover:text-yellow-300 transition"
          >
            +
          </button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className={`border ${getButtonColor()} text-white px-4 py-1 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1 transition-colors`}
            >
              <Volume2 size={18} />
            </button>

            {isOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                onClick={() => setIsOpen(false)}
              >
                <div
                  className="relative w-full sm:w-[800px] bg-white dark:bg-gray-100 rounded-2xl p-6 shadow-lg"
                  onClick={(e) => e.stopPropagation()} // prevent modal close on inner click
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
              className={`border ${getButtonColor()} text-white px-4 py-1 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1 transition-colors`}
            >
              <Share2 size={16} />
              Share
            </button>


          </div>
          <button
            onClick={() => setShowRatingModal(true)}
            className={`border ${getButtonColor()} text-white px-4 py-1 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1 transition-colors w-fit`}
          >
            ⭐ Rate Me
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
        <div className="col-span-12 xl:col-span-12 space-y-8 mb-8">
          <ClientViewLiveSession
            bannerImage={response?.data?.educator?.bannerImage}
            callId={callId}
            educatorData={response?.data?.educator?.description}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
        <div className="col-span-12 xl:col-span-8 space-y-8">

          {/* Live Idea - Hide for Digital Marketing */}


          {!isDigitalMarketing && <div className="text-gray-900">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
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
                <div className="flex gap-4">
                  {liveIdea?.map((liveIdeaData) => (
                    <div
                      key={liveIdeaData?._id}
                      className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer"
                      onClick={() => {
                        setSelectedIdea(liveIdeaData);
                        setIsLightBoxOpen(true);
                      }}
                    >
                      {/* IMAGE CONTAINER */}
                      <div className="relative rounded-t-xl overflow-hidden">
                        <img
                          src={liveIdeaData?.image?.[0]}
                          alt={liveIdeaData?.name}
                          className="w-full h-36 object-cover"
                        />

                        {/* 🔥 OVERLAY START */}
                        <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              className={`px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2 ${liveIdeaData?.type === "buy"
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                            >
                              {liveIdeaData?.type === "buy" ? (
                                <TrendingUp size={16} />
                              ) : (
                                <TrendingDown size={16} />
                              )}
                              {liveIdeaData?.type?.toUpperCase()}
                            </button>

                            <div className="bg-gray-800 px-2 py-1 rounded-lg font-semibold text-xs text-white">
                              {liveIdeaData?.name}
                            </div>
                          </div>

                          {LabelMap[liveIdeaData?.status] === "Active" && (
                            <div className="bg-cyan-700 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                              Active
                            </div>
                          )}

                          {LabelMap[liveIdeaData?.status] === "Pending" && (
                            <div className="bg-purple-700 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                              Pending
                            </div>
                          )}

                          {LabelMap[liveIdeaData?.status] === "Win" && (
                            <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                              ★ WIN +{liveIdeaData?.pips} pips
                            </div>
                          )}

                          {LabelMap[liveIdeaData?.status] === "Loss" && (
                            <div className="bg-red-500 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                              ▲ LOSS -{liveIdeaData?.pips} pips
                            </div>
                          )}

                          {LabelMap[liveIdeaData?.status] === "Partial Win" && (
                            <div className="bg-purple-500 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                              ▲ PARTIAL WIN {liveIdeaData?.pips} pips
                            </div>
                          )}

                          {LabelMap[liveIdeaData?.status] === "Break Even" && (
                            <div className="bg-blue-500 text-white px-2 py-1 rounded-lg font-semibold text-xs">
                              Break Even
                            </div>
                          )}

                        </div>
                        {/* 🔥 OVERLAY END */}
                      </div>

                      {/* DATE */}
                      <div className="p-4 flex items-center justify-between">
                        {/* LEFT: Full Date */}
                        <div className="text-sm text-gray-600">
                          {format(new Date(liveIdeaData?.createdAt), "dd/MM/yyyy hh:mm a")}
                        </div>

                        {/* RIGHT: Relative Time */}
                        <div
                          className="text-sm text-gray-600"
                          title={format(new Date(liveIdeaData?.createdAt), "dd MMM yyyy, hh:mm a")}
                        >
                          {getRelativeTime(liveIdeaData?.createdAt)}
                        </div>
                      </div>


                    </div>

                  ))}
                </div>

              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">No Live idea Found</span>
                </div>
              )}
            </div>
          </div>}





          {/* Course  */}
          <div className="text-gray-900 ">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Courses</h2>
                <button
                  onClick={() => setCourseAll((prev) => !prev)}
                  className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary"
                >
                  {courseAll ? "Show Less" : "View All"}
                </button>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.courses?.length > 0 ? (
                courseAll ? (
                  // GRID VIEW (sabhi courses ek sath)
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {response?.data?.courses?.map((course) => (
                      <div
                        key={course._id}
                        className="w-full border rounded-xl shadow-sm cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/iq-vault?mainSection=${course.section}&language=${course.language}&categoryId=${course.category._id}&courseId=${course._id}`
                          )
                        }
                      >
                        <div className="rounded-t-xl overflow-hidden">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-36 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {course.address}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // SLIDER VIEW (default horizontal scroll)
                  <div className="flex gap-4">
                    {response?.data?.courses?.map((course) => (
                      <div
                        key={course._id}
                        className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/iq-vault?mainSection=${course.section}&language=${course.language}&categoryId=${course.category._id}&courseId=${course._id}`
                          )
                        }
                      >
                        <div className="rounded-t-xl overflow-hidden">
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-36 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {course.address}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    No Courses Found
                  </span>
                </div>
              )}
            </div>
          </div>



          {/* Recordings - Show for Digital Marketing only (after Courses) */}
          {isDigitalMarketing && <div className="text-gray-900 mb-8">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Recordings</h2>
                <button
                  className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Show Less" : "View All"}
                </button>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.recordings?.length > 0 ? (
                showAll ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {response?.data?.recordings?.map((course) => (
                      <div
                        key={course?._id}
                        className="w-full cursor-pointer border rounded-xl shadow-sm"
                      >
                        <div
                          className="rounded-t-xl overflow-hidden"
                          onClick={() => setRecording(course)}
                        >
                          <RecordingThumbnail
                            videoUrl={course?.url}
                            seekTime={2}
                            image={course?.thumbnail}
                            defaultImage={response?.data?.educator?.bannerImage}
                            onRecordingClick={() => handleOpen(course?.url)}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course?.call_title}
                          </h3>
                          <div className="card-footer justify-between pt-4 p-0 mt-4">
                            <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />{" "}
                              {new Date(course?.start_time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4">
                    {response?.data?.recordings?.map((course) => (
                      <div
                        key={course?._id}
                        className="w-full sm:w-1/2 md:w-1/3 cursor-pointer border rounded-xl shadow-sm flex-shrink-0"
                      >
                        <div
                          className="rounded-t-xl overflow-hidden"
                          onClick={() => setRecording(course)}
                        >
                          <RecordingThumbnail
                            videoUrl={course?.url}
                            seekTime={2}
                            image={course?.thumbnail}
                            defaultImage={response?.data?.educator?.bannerImage}
                            onRecordingClick={() => handleOpen(course?.url)}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course?.call_title}
                          </h3>
                          <div className="card-footer justify-between pt-4 p-0 mt-4">
                            <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />{" "}
                              {new Date(course?.start_time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">No Recordings Found</span>
                </div>
              )}
            </div>
          </div>}

          {/* Master Classes - Show for Digital Marketing only, below Recordings, only if data exists */}
          {isDigitalMarketing && response?.data?.masterClasses?.length > 0 && (
            <div className="text-gray-900 mb-8">
              <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium">Master Classes</h2>
                  <button
                    className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary"
                    onClick={() => navigate(`/master-class/${id}`)}
                  >
                    View All
                  </button>
                </div>
              </div>

              <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
                <div className="flex gap-4">
                  {response?.data?.masterClasses?.map((mc) => (
                    <div
                      key={mc?._id}
                      className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/master-class/${id}`)}
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
              </div>
            </div>
          )}

          {/* Idea - Hide for Digital Marketing */}
          {!isDigitalMarketing && <div className="text-gray-900 mb-28">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Idea</h2>
                <button
                  onClick={() => setIdea((prev) => !prev)}
                  className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary"
                >
                  {idea ? "Show Less" : "View All"}
                </button>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.idea?.length > 0 ? (
                idea ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {response?.data?.idea?.map((course) => (
                      <div
                        key={course?._id}
                        className="w-full border rounded-xl shadow-sm cursor-pointer"
                        onClick={() => {
                          setSelectedIdea(course);
                          setIsViewOpen(true);
                        }}
                      // onClick={() =>
                      //   navigate(
                      //     `/iq-vault?mainSection=${course.section}&language=${course.language}&categoryId=${course.category._id}&courseId=${course._id}`
                      //   )
                      // }
                      >
                        <div className="rounded-t-xl overflow-hidden">
                          <img
                            src={course?.image?.[0]}
                            alt={course?.name}
                            className="w-full h-36 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course?.name}
                          </h3>
                          <ShowMoreLess
                            className="text-xs text-gray-600"
                            html={course?.description || "No description"}
                            limit={65}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // SLIDER VIEW (default horizontal scroll)
                  <div className="flex gap-4">
                    {response?.data?.idea?.map((course) => (
                      <div
                        key={course?._id}
                        className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer"
                        onClick={() => {
                          setSelectedIdea(course);
                          setIsViewOpen(true);
                        }}
                      // onClick={() =>
                      //   navigate(
                      //     `/iq-vault?mainSection=${course.section}&language=${course.language}&categoryId=${course.category._id}&courseId=${course._id}`
                      //   )
                      // }
                      >
                        <div className="rounded-t-xl overflow-hidden">
                          <img
                            src={course?.image?.[0]}
                            alt={course?.name}
                            className="w-full h-36 object-cover"
                          />
                        </div>
                        <div className="p-4 d-flex">
                          <div className="justify-between">
                            <h3 className="text-md font-normal mb-2">
                              {course?.name}
                            </h3>
                          </div>

                          <ShowMoreLess
                            className="text-xs text-gray-600"
                            html={course?.description || "No description"}
                            limit={65}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">No Idea Found</span>
                </div>
              )}
            </div>
          </div>}

          {/* Insight - Hide for Digital Marketing */}

          {!isDigitalMarketing && <div className="text-gray-900 mb-28">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Insights</h2>
                <button
                  onClick={() => setInsight((prev) => !prev)}
                  className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary"
                >
                  {insight ? "Show Less" : "View All"}
                </button>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.insight?.length > 0 ? (
                insight ? (
                  // GRID VIEW (sabhi courses ek sath)
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {response?.data?.insight?.map((course) => (
                      <div
                        key={course?._id}
                        className="w-full border rounded-xl shadow-sm cursor-pointer"
                        onClick={() => {
                          setSelectedInsight(course);
                          setIsViewOpen1(true);
                        }}
                      // onClick={() =>
                      //   navigate(
                      //     `/iq-vault?mainSection=${course.section}&language=${course.language}&categoryId=${course.category._id}&courseId=${course._id}`
                      //   )
                      // }
                      >
                        <div className="rounded-t-xl overflow-hidden">
                          <img
                            src={course?.photos?.[0]}
                            alt={course?.title}
                            className="w-full h-36 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course?.title}
                          </h3>
                          <ShowMoreLess
                            className="text-xs text-gray-600"
                            html={course?.description || "No description"}
                            limit={65}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // SLIDER VIEW (default horizontal scroll)
                  <div className="flex gap-4">
                    {response?.data?.insight?.map((course) => (
                      <div
                        key={course?._id}
                        className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer"
                        onClick={() => {
                          setSelectedInsight(course);
                          setIsViewOpen1(true);
                        }}
                      // onClick={() =>
                      //   navigate(
                      //     `/iq-vault?mainSection=${course.section}&language=${course.language}&categoryId=${course.category._id}&courseId=${course._id}`
                      //   )
                      // }
                      >
                        <div className="rounded-t-xl overflow-hidden">
                          <img
                            src={course?.photos?.[0]}
                            alt={course?.title}
                            className="w-full h-36 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course?.title}
                          </h3>
                          <ShowMoreLess
                            className="text-xs text-gray-600"
                            html={course?.description || "No description"}
                            limit={65}
                          />
                        </div>
                      </div>
                    ))}
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
        </div>

        {/* Sidebar */}
        <div className=" col-span-12 xl:col-span-4">
          <div className="grid grid-cols-12 gap-6">
            {/* <div className="col-span-12 md:col-span-6 xl:col-span-12 space-y-6">
              <div className="card rounded-2xl shadow-md overflow-hidden">
                <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-white font-semibold text-sm">Chatbox</h3>
                </div>

                <div className="p-4 overflow-y-auto flex flex-col space-y-4 relative group">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                      <div className="text-sm text-gray-900 font-medium">
                        {message.sender}{" "}
                        <span className="text-xs text-gray-600 font-normal ml-1">
                          {message.time}
                        </span>
                      </div>
                      <div className="text-xs font-normal rounded-lg text-gray-800 break-words leading-[1.9]">
                        {message.text}
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />

                  <div className="absolute inset-0 flex text-center items-center bg-gray-50 dark:bg-gray-100 justify-center text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition duration-300">
                    No This feature is under-development
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="p-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <input
                        type="text"
                        placeholder="Your comment..."
                        className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-xs dark:bg-gray-100"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />

                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 duration-200 focus:outline-none"
                        aria-label="Send message"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div> */}
            <div className="col-span-12 md:col-span-6 xl:col-span-12">
              <div className="card rounded-2xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-white font-semibold text-sm">
                    Live Feed
                  </h3>
                  <div className="flex space-x-2 bg-[#2D265F] rounded-full p-1">
                    {/* <button
                      onClick={() => setActiveTab("feed")}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        activeTab === "feed"
                          ? "bg-white text-[#1A1446]"
                          : "text-white"
                      }`}
                    >
                      Feed
                    </button>
                    <button
                      onClick={() => setActiveTab("ideas")}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        activeTab === "ideas"
                          ? "bg-white text-[#1A1446]"
                          : "text-white"
                      }`}
                    >
                      Ideas
                    </button> */}
                  </div>
                </div>

                {/* Updates */}
                <div className="p-4 space-y-3 live_updates iq_educators overflow-auto relative group">
                  {/* Hover Overlay */}
                  {/* <div className="absolute h-screen inset-0 flex text-center items-center bg-gray-50 dark:bg-gray-100 justify-center text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition duration-300">
                    No This feature is under-development
                  </div> */}

                  {/* Messages */}
                  {response?.data?.PostData?.length > 0 ? (
                    response?.data?.PostData?.map((update) => (
                      <div
                        key={update?._id}
                        className="bg-[#F5F2FF] dark:bg-gray-100 rounded-xl p-4"
                      >
                        <div className="flex flex-col gap-4 mb-4">
                          <img
                            src={update?.author?.image}
                            alt={update?.author?.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h4 className="text-sm font-normal mb-1 text-gray-900">
                              {update?.author?.first_name}{" "}
                              {update?.author?.last_name}
                            </h4>
                            <p className="text-xs font-normal text-gray-600">
                              {update?.createdAt
                                ? formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })
                                : ""}
                            </p>
                          </div>
                        </div>

                        {update?.content && (
                          <div className="mb-3">
                            <p
                              className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words"
                              dangerouslySetInnerHTML={{
                                __html: makeClickableLinks(update?.content),
                              }}
                            />
                          </div>
                        )}

                        {/* Post Images */}
                        {update?.images?.length > 0 && (
                          <div
                            className={`grid ${update?.images?.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2 mt-2`}
                          >
                            {update.images.map((img, imgIdx) => {
                              const imgUrl = img?.url ?? (typeof img === "string" ? img : null);
                              const imgKey = img?._id || imgUrl || imgIdx;
                              return imgUrl ? (
                                <div
                                  key={imgKey}
                                  className="relative w-full overflow-hidden rounded-xl bg-black/5 group cursor-pointer"
                                  onClick={() => setLiveFeedImage(imgUrl)}
                                >
                                  <img
                                    src={imgUrl}
                                    alt="post"
                                    className="w-full aspect-square object-contain transition-all duration-300 ease-in-out group-hover:scale-105"
                                  />
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                      <div className="text-sm text-gray-900 font-medium text-center">
                        🚀 No updates available right now. Stay tuned for fresh
                        content!
                      </div>
                    </div>
                  )}

                  {/* Cards */}
                  {/* {trades.map((trade) => (
                                        <div key={trade.id} className="card rounded-2xl overflow-hidden w-full relative z-0">
                                        <img src={trade.image} alt={trade.pair} className="w-full h-40 object-cover" />
                                        <div className="p-4">
                                            <div className="flex justify-between items-start sm:flex-row flex-col sm:gap-0 gap-3">
                                            <div className="flex items-center gap-2">
                                                <ArrowUp className="text-green-500 w-8 h-8 shrink-0" />
                                                <div>
                                                <h3 className="font-medium text-gray-800 text-sm mb-1">{trade.pair}</h3>
                                                <p className="text-2xs font-normal text-gray-500 line-clamp-1">{trade.date}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`bg-${trade.statusColor}-100 text-${trade.statusColor}-700 text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                                            >
                                                {trade.status}
                                            </span>
                                            </div>

                                            <div className="mt-6 space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Entry</span>
                                                <span className="font-medium text-gray-800">{trade.entry}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Stop Loss</span>
                                                <span className="font-medium text-gray-800">{trade.stopLoss}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Exit 1</span>
                                                <span className="font-medium text-gray-800">{trade.exit1}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Exit 2</span>
                                                <span className="font-medium text-gray-800">{trade.exit2}</span>
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    ))} */}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-12">
              <div className="card rounded-2xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
                  <h3 className="text-white font-semibold text-sm">
                    Analysis Updates
                  </h3>
                  <div className="flex space-x-2 bg-[#2D265F] rounded-full p-1">
                    {/* <button
                      onClick={() => setActiveTab("feed")}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        activeTab === "feed"
                          ? "bg-white text-[#1A1446]"
                          : "text-white"
                      }`}
                    >
                      Feed
                    </button>
                    <button
                      onClick={() => setActiveTab("ideas")}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        activeTab === "ideas"
                          ? "bg-white text-[#1A1446]"
                          : "text-white"
                      }`}
                    >
                      Ideas
                    </button> */}
                  </div>
                </div>

                {/* Updates */}
                <div className="p-4 space-y-3 live_updates iq_educators overflow-auto relative group">
                  {/* Hover Overlay */}
                  {/* <div className="absolute h-screen inset-0 flex text-center items-center bg-gray-50 dark:bg-gray-100 justify-center text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition duration-300">
                    No This feature is under-development
                  </div> */}

                  {/* Messages */}
                  {response?.data?.analysisData?.length > 0 ? (
                    response?.data?.analysisData?.map((update) => (
                      <div
                        key={update?._id}
                        className="bg-[#F5F2FF] dark:bg-gray-100 rounded-xl p-4"
                      >
                        <div className="flex flex-col gap-4 mb-4">
                          <img
                            src={update?.author?.image}
                            alt={update?.author?.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h4 className="text-sm font-normal mb-1 text-gray-900">
                              {update?.author?.first_name}{" "}
                              {update?.author?.last_name}
                            </h4>
                            <p className="text-xs font-normal text-gray-600">
                              {update?.createdAt
                                ? formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })
                                : ""}
                            </p>
                          </div>
                        </div>

                        {update?.content && (
                          <div className="mb-3">
                            <p
                              className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words"
                              dangerouslySetInnerHTML={{
                                __html: makeClickableLinks(update?.content),
                              }}
                            />
                          </div>
                        )}

                        {/* Post Images */}
                        {update?.images?.length > 0 && (
                          <div
                            className={`grid ${update?.images?.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2 mt-2`}
                          >
                            {update.images.map((img, imgIdx) => {
                              const imgUrl = img?.url ?? (typeof img === "string" ? img : null);
                              const imgKey = img?._id || imgUrl || imgIdx;
                              return imgUrl ? (
                                <div
                                  key={imgKey}
                                  className="relative w-full overflow-hidden rounded-xl bg-black/5 group cursor-pointer"
                                  onClick={() => setLiveFeedImage(imgUrl)}
                                >
                                  <img
                                    src={imgUrl}
                                    alt="post"
                                    className="w-full aspect-square object-contain transition-all duration-300 ease-in-out group-hover:scale-105"
                                  />
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                      <div className="text-sm text-gray-900 font-medium text-center">
                        🚀 No updates available right now. Stay tuned for fresh
                        content!
                      </div>
                    </div>
                  )}

                  {/* Cards */}
                  {/* {trades.map((trade) => (
                                        <div key={trade.id} className="card rounded-2xl overflow-hidden w-full relative z-0">
                                        <img src={trade.image} alt={trade.pair} className="w-full h-40 object-cover" />
                                        <div className="p-4">
                                            <div className="flex justify-between items-start sm:flex-row flex-col sm:gap-0 gap-3">
                                            <div className="flex items-center gap-2">
                                                <ArrowUp className="text-green-500 w-8 h-8 shrink-0" />
                                                <div>
                                                <h3 className="font-medium text-gray-800 text-sm mb-1">{trade.pair}</h3>
                                                <p className="text-2xs font-normal text-gray-500 line-clamp-1">{trade.date}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`bg-${trade.statusColor}-100 text-${trade.statusColor}-700 text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                                            >
                                                {trade.status}
                                            </span>
                                            </div>

                                            <div className="mt-6 space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Entry</span>
                                                <span className="font-medium text-gray-800">{trade.entry}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Stop Loss</span>
                                                <span className="font-medium text-gray-800">{trade.stopLoss}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Exit 1</span>
                                                <span className="font-medium text-gray-800">{trade.exit1}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-normal text-sm">Exit 2</span>
                                                <span className="font-medium text-gray-800">{trade.exit2}</span>
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    ))} */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recording - Hide for Digital Marketing (shown above after Courses) */}
        {!isDigitalMarketing && <div className=" col-span-12 xl:col-span-12 mt-8 space-y-8 mb-8 ">
          <div className="text-gray-900 mb-2">
            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Recordings</h2>
                <button
                  className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Show Less" : "View All"}
                </button>
              </div>
            </div>

            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
              {response?.data?.recordings?.length > 0 ? (
                showAll ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {response?.data?.recordings?.map((course) => (
                      <div
                        key={course._id}
                        className="w-full cursor-pointer border rounded-xl shadow-sm"
                      >
                        <div
                          className="rounded-t-xl overflow-hidden"
                          onClick={() => setRecording(course)}
                        >
                          <RecordingThumbnail
                            videoUrl={course?.url}
                            seekTime={2}
                            image={course?.thumbnail}
                            defaultImage={response?.data?.educator?.bannerImage}
                            onRecordingClick={() => handleOpen(course?.url)}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course.call_title}
                          </h3>
                          <div className="card-footer justify-between pt-4 p-0 mt-4">
                            <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />{" "}
                              {new Date(
                                course?.start_time
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4">
                    {response?.data?.recordings?.map((course) => (
                      <div
                        key={course._id}
                        className="w-full sm:w-1/2 md:w-1/3 cursor-pointer border rounded-xl shadow-sm flex-shrink-0"
                      >
                        <div
                          className="rounded-t-xl overflow-hidden"
                          onClick={() => setRecording(course)}
                        >
                          <RecordingThumbnail
                            videoUrl={course?.url}
                            seekTime={2}
                            image={course?.thumbnail}
                            defaultImage={response?.data?.educator?.bannerImage}
                            onRecordingClick={() => handleOpen(course?.url)}
                          // onRecordingClick={() => handleOpen(course?.url)}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-normal mb-2">
                            {course.call_title}
                          </h3>
                          <div className="card-footer justify-between pt-4 p-0 mt-4">
                            <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />{" "}
                              {new Date(
                                course?.start_time
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    No Recordings Found
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>}
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

      {/* Live Feed / Analysis Image Lightbox */}
      {liveFeedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setLiveFeedImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={liveFeedImage}
              alt="post"
              className="rounded-2xl max-w-full max-h-[90vh] border border-gray-200 dark:border-[#2C2F36]"
            />
            <button
              onClick={() => setLiveFeedImage(null)}
              className="absolute top-3 right-3 bg-white dark:bg-[#1F1F23] text-black dark:text-[#EDEDED] hover:bg-gray-200 dark:hover:bg-[#3B3B42] px-3 py-1 rounded-lg shadow-md transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default IqEducators;
