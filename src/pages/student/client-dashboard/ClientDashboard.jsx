import React, { useState } from "react";
import {
  Award, BookOpen, ChevronRight, CircleDot, Download, OctagonAlert, QrCode, Sparkles, TrendingUp, TrendingUpDown, Play,
  Zap,
  Globe,
  Activity
} from "lucide-react";
import { Bitcoin, BarChart3, ArrowRight } from "lucide-react";
import { Calendar, Target, Users, Trophy, Clock } from "lucide-react";
import { MessageCircle, ThumbsUp, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetLiveEducatorListQuery } from "../../../store/api/client/clientLiveSessionApiSlice";
import Loader from "../../../components/ui/loader";
import {
  useCorporatePostQuery,
  usePostQuery,
} from "../../../store/api/client/clientSocialApiSlilce";
import { formatDistanceToNow } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";

const ShowMoreLess = ({
  text = "",
  html = "",
  limit = 1000,
  showMoreText = " Show More",
  showLessText = " Show Less",
  className = "text-sm text-gray-700 leading-relaxed",
}) => {
  const [expanded, setExpanded] = useState(false);
  const isHtml = !!html;
  const content = isHtml ? html : text;
  const plainText = isHtml ? content.replace(/<[^>]+>/g, "") : text;
  // const isLong = plainText.length > limit;
  const isLong = false;

  return (
    <div className={className}>
      <div
        className={`${!expanded && isLong ? "line-clamp-4" : ""}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 cursor-pointer hover:underline font-medium"
        >
          {expanded ? showLessText : showMoreText}
        </span>
      )}
    </div>
  );
};

const ClientDashboard = () => {
  const liveSession = {
    instructor: "Diego Aguirre",
    thumbnail: "/api/placeholder/400/400"
  };
  const { auth } = useAuthContext();

  const allowedRoutes = auth?.user?.plan?.allowedSideBar;
  const { data: liveEducator, isLoading: educatorsLoading } =
    useGetLiveEducatorListQuery();
  const {
    data: corporatePost,
    isLoading,
    isFetching,
    isError,
  } = useCorporatePostQuery();

  const makeClickableLinks = (htmlOrText) => {
    if (!htmlOrText) return "";
    return htmlOrText.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, (url) => {
      const clickableUrl = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${clickableUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`;
    });
  };

  const liveStreams = liveEducator?.streams || [];

  const userName = auth?.user?.name;
  const categories = [
    {
      id: "forex",
      title: "FOREX",
      icon: <TrendingUpDown className="w-12 h-12" />,
      description:
        "Master the world's largest financial market with professional strategies",
      gradient: "from-purple-600 to-indigo-600",
      hoverGradient: "from-purple-700 to-indigo-700",
    },
    {
      id: "crypto",
      title: "CRYPTO",
      icon: <Bitcoin className="w-12 h-12" />,
      description:
        "Navigate the digital revolution with confidence and expertise",
      gradient: "from-orange-500 to-yellow-500",
      hoverGradient: "from-orange-600 to-yellow-600",
    },
    {
      id: "stocks",
      title: "STOCK OPTIONS",
      icon: <BarChart3 className="w-12 h-12" />,
      description: "Master options trading strategies for consistent returns",
      gradient: "from-emerald-500 to-teal-500",
      hoverGradient: "from-emerald-600 to-teal-600",
    },
  ];
  const sessions = [
    {
      id: 0,
      title: "Bitcoin Market Analysis",
      educator: "Jane Doe",
      avatar: "JD",
      viewers: 245,
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      id: 1,
      title: "Forex Fundamentals",
      educator: "Mike Smith",
      avatar: "MS",
      viewers: 189,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: 2,
      title: "Options Trading Basics",
      educator: "Sarah Chen",
      avatar: "SC",
      viewers: 312,
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      id: 3,
      title: "Altcoin Deep Dive",
      educator: "Alex Wong",
      avatar: "AW",
      viewers: 156,
      gradient: "from-orange-500 to-yellow-500",
    },
    {
      id: 4,
      title: "Technical Analysis Masterclass",
      educator: "David Kim",
      avatar: "DK",
      viewers: 278,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: 5,
      title: "Risk Management Strategies",
      educator: "Emma Wilson",
      avatar: "EW",
      viewers: 203,
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  // const [activeTab, setActiveTab] = useState<'news' | 'feed'>('news');
  const newsItems = [
    {
      id: 1,
      type: "ANNOUNCEMENT",
      title: "New Forex Trading Course Launch",
      excerpt:
        "Master the fundamentals of forex trading with our comprehensive new course...",
      time: "10 mins ago",
      badge: "bg-purple-600",
    },
    {
      id: 2,
      type: "UPDATE",
      title: "Platform Maintenance Complete",
      excerpt: "All systems are operational. Thank you for your patience...",
      time: "2 hours ago",
      badge: "bg-blue-600",
    },
    {
      id: 3,
      type: "EVENT",
      title: "Weekly Trading Competition",
      excerpt: "Join our weekly competition with $10,000 in prizes...",
      time: "5 hours ago",
      badge: "bg-green-600",
    },
    {
      id: 4,
      type: "ALERT",
      title: "Market Volatility Warning",
      excerpt:
        "High volatility expected in crypto markets due to regulatory news...",
      time: "1 day ago",
      badge: "bg-orange-600",
    },
    {
      id: 5,
      type: "FEATURE",
      title: "New Trading Tools Released",
      excerpt:
        "Advanced charting tools and indicators now available in your dashboard...",
      time: "2 days ago",
      badge: "bg-indigo-600",
    },
  ];

  const feedItems = [
    {
      id: 1,
      author: "Jane Doe",
      avatar: "JD",
      message:
        "🚀 BTC breaking through resistance! This is exactly what we discussed in today's session.",
      likes: 42,
      comments: 15,
      time: "2 mins ago",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      id: 2,
      author: "Mike Smith",
      avatar: "MS",
      message:
        "New strategy alert! 🌟 Amazing setup we'll cover in tomorrow's session.",
      likes: 28,
      comments: 9,
      time: "15 mins ago",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: 3,
      author: "Sarah Chen",
      avatar: "SC",
      message:
        "Options flow showing unusual activity in tech stocks. Great learning opportunity! 📊",
      likes: 35,
      comments: 12,
      time: "1 hour ago",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      id: 4,
      author: "David Kim",
      avatar: "DK",
      message:
        "Technical analysis update: Key support levels holding strong across major pairs 💪",
      likes: 19,
      comments: 7,
      time: "3 hours ago",
      gradient: "from-blue-500 to-cyan-500",
    },
  ];

  const updates = [
    {
      id: 1,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-14.png",
    },
    {
      id: 2,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-15.png",
    },
    {
      id: 3,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-16.png",
    },
  ];

  const feedData = [
    {
      id: 1,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-14.png",
    },
    {
      id: 2,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-15.png",
    },
    {
      id: 3,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-16.png",
    },
    {
      id: 4,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-16.png",
    },
  ];

  const ideasData = [
    {
      id: 1,
      name: "Jenny Klabber",
      time: "Week ago",
      message: "I just released a new bootcamp covering my trading strategy.",
      avatar: "/media/avatars/300-14.png",
    },
  ];

  const slides = [
    {
      title: "RALPH DANQUAH",
      image: "/media/images/2600x1600/watch_live.jpg",
    },
    {
      title: "JOHN DOE",
      image: "/media/images/2600x1600/watch_live.jpg",
    },
    {
      title: "JANE SMITH",
      image: "/media/images/2600x1600/watch_live.jpg",
    },
  ];
  const [activeTab, setActiveTab] = useState("feed");
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isQRModalOpen, setQRModalOpen] = useState(false);
  const [qrType, setQrType] = useState("android"); // "android" or "ios"

  const data = activeTab === "feed" ? feedData : ideasData;
  const IQLive = "/iq-academy";
  const IQStrategies = "/iq-strategies";
  const IQAcademy = "/iq-vault";

  const handleRouteClick = () => {
    setUpgradeModalOpen(true);
  };

  return (
    <>
      <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        {/* <DialogContent className="p-5 max-w-[600px]"> */}
        <DialogContent className="p-5 max-w-[600px]">
          <DialogHeader></DialogHeader>

          <div className="flex justify-center text-3xl ki-alert-circle text-yellow-500 mb-3.5 mx-auto">
            <OctagonAlert size={40} />
          </div>
          {/* <div className="text-center">
            <i className="ki-filled text-3xl ki-alert-circle text-yellow-500 mb-3.5 mx-auto"></i>
          </div> */}

          <p className="mb-4 text-gray-700 text-center">
            This feature is not available in your current plan. <br />
            Please upgrade to access it.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={isQRModalOpen} onOpenChange={setQRModalOpen}>
        <DialogContent className="p-5 max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold text-gray-800">
              {qrType === "android"
                ? "Download Android Beta"
                : "Enroll for iOS Beta"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-6">
            <QRCodeCanvas
              value={
                qrType === "android"
                  ? "https://drive.google.com/drive/folders/1s9bCLuFn6lRv9BSBSfoFj78oE0Dvk0dQ?usp=sharing"
                  : "https://testflight.apple.com/join/qynfgnna"
              }
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mb-4">
            {qrType === "android"
              ? "Scan this QR code to download the Android Beta app"
              : "Scan this QR code to enroll for iOS Beta testing"}
          </p>
        </DialogContent>
      </Dialog>
      {/* ---- START: Educator Cards Section (Added by ChatGPT) ---- */}

      {/* ---- END: Educator Cards Section ---- */}

      {/* <div className="container-fluid pb-8">
        <div className="relative welcome_banner w-full mb-10 rounded-xl overflow-hidden">
          <div className="relative z-1 flex items-center justify-center md:justify-end h-full p-4">
            <div className="xl:hidden absolute inset-0 bg-black/40"></div>
            <div className="text-center z-1">
              <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200 md:pr-20">
                <span className="text-xl text-gray-50 font-medium tracking-widest">
                  RISE ABOVE ORDINARY
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
          <div className="col-span-12 md:col-span-8 xl:col-span-8 ">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 lg:gap-x-8 md:gap-y-8">
                <div className="col-span-12 lg:col-span-12">
                  <div className="card rounded-none rounded-b-xl relative">
                    <div className="card-body p-0 relative">
                      <img
                        src="/media/images/2600x1600/banner_1.jpg"
                        className="w-full object-cover rounded-t-xl"
                        alt=""
                      />
                      <div className="xl:hidden rounded-xl absolute inset-0 bg-black/40"></div>
                    </div>

                    <div className="p-4 md:p-7">
                      <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
                        <h5 className="font-semibold text-gray-900 text-md">
                          IQ Academy
                        </h5>
                        {allowedRoutes?.includes(IQAcademy) ? (
                          <Link to={IQAcademy}>
                            <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                              View IQ Academy
                            </button>
                          </Link>
                        ) : (
                          <button
                            className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium"
                            onClick={handleRouteClick}
                          >
                            View IQ Academy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-12">
                  <div className="card rounded-none rounded-b-xl relative">
                    <div className="card-body p-0 relative">
                      <img
                        src="/media/images/2600x1600/banner_2.jpg"
                        className="w-full object-cover rounded-t-xl"
                        alt=""
                      />
                      <div className="xl:hidden rounded-xl absolute inset-0 bg-black/40"></div>
                    </div>

                    <div className="p-4 md:p-7">
                      <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
                        <h5 className="font-semibold text-gray-900 text-md">
                          IQ Live
                        </h5>
                        {allowedRoutes?.includes(IQLive) ? (
                          <Link to={IQLive}>
                            <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                              View IQ Live
                            </button>
                          </Link>
                        ) : (
                          <button
                            className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium"
                            onClick={handleRouteClick}
                          >
                            View IQ Live
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-12">
                  <div className="card rounded-none rounded-b-xl relative group overflow-hidden">
                    <div className="card-body p-0 relative">
                      <img
                        src="/media/images/2600x1600/banner_3.jpg"
                        className="w-full object-cover rounded-t-xl"
                        alt=""
                      />
                    </div>

                    <div className="p-4 md:p-7 rounded-b-xl relative z-0">
                      <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
                        <h5 className="font-semibold text-gray-900 text-md">
                          IQ Strategies
                        </h5>
                        {allowedRoutes?.includes(IQStrategies) ? (
                          <Link to={IQStrategies}>
                            <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                              View Strategies
                            </button>
                          </Link>
                        ) : (
                          <button
                            className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium"
                          >
                            View Strategies
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 xl:col-span-4">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src="/media/images/2600x1600/fast_start.jpg"
                    alt="Fast Start Training"
                    className="w-full h-96 object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-[linear-gradient(178.03deg,rgba(43,76,107,0)_35.61%,rgba(0,0,0,0.8)_91.24%)]
                  transition duration-300"
                  ></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-4 pb-11 z-1">
                    <h2 className="text-gray-100 dark:text-gray-900 text-2xl font-bold tracking-wide">
                      FAST START <br /> TRAINING
                    </h2>
                    <Link to="/fast-start-training">
                      <button
                        className="mt-4 px-6 py-2 bg-white/10 backdrop-blur-sm text-gray-100 text-sm 
                       font-normal btn-lg rounded-2xl border border-white/30 
                       hover:bg-white/20 transition dark:text-gray-900"
                      >
                        Start Here
                      </button>
                    </Link>
                  </div>
                </div>

                

                <div className="card rounded-2xl shadow-md overflow-hidden">
                  <div className="bg-[#1A1446] px-5 py-5 flex justify-between items-center rounded-t-2xl border-none">
                    <h3 className="text-white font-semibold text-sm">
                      Live Now
                    </h3>
                    <div className="flex space-x-2">
                      <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-500"></span>
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    </div>
                  </div>
                  {educatorsLoading ? (
                    <div>
                      <Loader />
                    </div>
                  ) : liveStreams.length > 0 ? (
                    <Swiper
                      modules={[Pagination, Autoplay]}
                      spaceBetween={20}
                      slidesPerView={1}
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 3000 }}
                      className="w-full border-none"
                    >
                      {liveStreams.map((slide, index) => (
                        <SwiperSlide key={index}>
                          <div className="card shadow-md rounded-none overflow-hidden">
                            <div className="relative h-96 rounded-none overflow-hidden shadow-lg">
                              <img
                                src={slide?.educator?.image}
                                alt={slide?.educator?.first_name}
                                className="w-full h-full object-cover"
                              />

                              <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-4 pb-11">
                                <h2 className="text-gray-100 dark:text-gray-900 text-2xl font-bold tracking-wide">
                                  {slide?.educator?.first_name}{" "}
                                  {slide?.educator?.last_name}
                                </h2>
                                <Link
                                  to={`/iq-educators/${slide?.educator?._id}`}
                                >
                                  <button className="mt-4 px-6 py-2 bg-white/10 backdrop-blur-sm text-gray-100 dark:text-gray-900 text-sm font-normal btn-lg  rounded-2xl border border-white/30 hover:bg-white/20 transition">
                                    Watch Live
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <p className="text-gray-600 dark:text-gray-400">
                        No Live Educators
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-12">
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-500 to-primary-500" />
                    <div className="p-6 md:p-5 grid md:grid-cols-1 gap-8">
                      <div className="flex flex-col">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Beta Invite
                        </span>
                        <h1 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                          Be part of our beta testers.
                        </h1>
                        <p className="mt-2 text-slate-600">
                          New iOS and Android{" "}
                          <span className="font-medium text-slate-800">
                            Iqonic
                          </span>{" "}
                          App
                        </p>
                        <div className="mt-6 space-y-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden
                              className="h-4 w-4 text-emerald-600"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Early access to new features
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden
                              className="h-4 w-4 text-emerald-600"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Help shape the final release
                          </div>
                        </div>
                        <div className="mt-8">
                          <h4 className="w-full md:w-auto text-base rounded-xl font-medium text-primary cursor-pointer">
                            Click to join our Beta Tester Program.
                          </h4>
                          <p className="mt-3 text-xs text-slate-500">
                            Your leader will share the private download links.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 flex-col">
                        <div className="flex items-center gap-4">
                          <a
                            href="https://drive.google.com/drive/folders/1s9bCLuFn6lRv9BSBSfoFj78oE0Dvk0dQ?usp=sharing"
                            target="_blank"
                            className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs p-2 text-gray-800 font-medium w-[80%] md:w-[80%]"
                          >
                            <img
                              src="/media/images/android.png"
                              alt="Download Android Beta"
                              className="w-auto h-full"
                            />
                            Download Android Beta
                          </a>
                          <button
                            className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium"
                            onClick={() => {
                              setQrType("android");
                              setQRModalOpen(true);
                            }}
                          >
                            <QrCode />
                          </button>
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <a
                              href="https://testflight.apple.com/join/qynfgnna"
                              target="_blank"
                              className="btn btn-light btn-lg p-2 rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium w-[80%]"
                            >
                              <img
                                src="/media/images/apple.png"
                                alt="Enroll for iOS Beta"
                                className="w-auto h-full"
                              />
                              Download for iOS Beta
                            </a>
                            <button
                              className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium"
                              onClick={() => {
                                setQrType("ios");
                                setQRModalOpen(true);
                              }}
                            >
                              <QrCode />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12">
                <div className="card rounded-2xl shadow-md overflow-hidden relative group">

                  <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl relative z-1">
                    <h3 className="text-white font-semibold text-sm">
                      General Updates
                    </h3>
                    <div className="flex space-x-2 bg-[#2D265F] rounded-full p-1">
                      
                    </div>
                  </div>
                  <div className="p-4 space-y-3 live_updates overflow-auto relative">
                    {corporatePost?.posts?.map((update) => (
                      <div
                        key={update.id}
                        className="bg-[#F5F2FF] dark:bg-gray-100 rounded-xl p-4"
                      >
                        <div className="flex flex-col gap-4 mb-4">
                          <img
                            src={update.author.image}
                            alt={update.author.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h4 className="text-sm font-normal mb-1 text-gray-900">
                              {update.author.first_name} {"  "}
                              {update.author.last_name}
                            </h4>
                            <p className="text-xs font-normal text-gray-600">
                              {formatDistanceToNow(new Date(update.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-normal text-gray-700">
                          {update?.content &&
                            (() => {
                              const formattedContent = makeClickableLinks(
                                update?.content.replace(/\r?\n/g, "<br />")
                              );

                              return (
                                <ShowMoreLess
                                  html={formattedContent}
                                  limit={1000}
                                  className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words"
                                />
                              );
                            })()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-12">
                <button className="w-full bg-blue-gradient p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300  group">
                  <Link to="/iq-insight">
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-md font-normal text-gray-100 dark:text-gray-900">
                        Go to IQ Insight
                      </span>
                    </div>
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <div className="min-h-screen">
        {/* Add Tailwind CSS via CDN */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Beta Invite Banners */}
          {/* <div className="space-y-3 mb-6"> */}
          {/* IQ Social Beta */}
          {/* <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center justify-between flex-wrap gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Be part of our Beta Testers</h3>
                    <p className="text-sm text-gray-800">
                      Now in iOS and Android <span className="font-semibold dark:text-purple-400">IQ Social</span>
                    </p>
                    <div className="flex items-center flex-wrap gap-4 text-xs text-gray-800 mt-1">
                      <span>✓ Early access</span>
                      <span>✓ Help shape release</span>
                      <span>Click to join our Beta Tester Program</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-100 text-white text-xs rounded-lg flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Download Android
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-100 text-white text-xs rounded-lg flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Download for iOS
                  </button>
                </div>
              </div>
            </div> */}

          {/* IQ Sync App Beta */}
          {/* <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center justify-between flex-wrap gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Be part of our Beta Testers</h3>
                    <p className="text-sm text-gray-800">
                      Now in iOS and Android <span className="font-semibold dark:text-blue-400">IQ Sync App</span>
                    </p>
                    <div className="flex items-center flex-wrap gap-4 text-xs text-gray-800 mt-1">
                      <span>✓ Early access</span>
                      <span>✓ Help shape release</span>
                      <span>Click to join our Beta Tester Program</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-100 text-white text-xs rounded-lg flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Download Android
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-100 text-white text-xs rounded-lg flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Download for iOS
                  </button>
                </div>
              </div>
            </div> */}
          {/* </div> */}

          {/* Hero Banner */}
          {/* <div className="mb-8">
            <div className="h-64 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl xl:text-5xl font-bold text-white mb-3">RISE ABOVE ORDINARY</h1>
                <p className="text-lg text-gray-100 dark:text-gray-800">Master the markets with expert guidance</p>
              </div>
            </div>
          </div> */}

          {/* <div className="relative welcome_banner w-full mb-10 rounded-xl overflow-hidden">
            <div className="relative z-1 flex items-center justify-center md:justify-end h-full p-4">
              <div className="xl:hidden absolute inset-0 bg-black/40"></div>
              <div className="text-center z-1">
                <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200 md:pr-20">
                  <span className="text-xl text-gray-50 font-medium tracking-widest">
                    RISE ABOVE ORDINARY
                  </span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Main Grid */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-4">

                <div className="bg-gray-900/50 rounded-lg overflow-hidden border hover:border-purple-700 transition-all cursor-pointer group">
                  <div className="relative h-48">
                    <img src="/media/images/2600x1600/banner_1.jpg" alt="IQ Academy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">IQ Academy</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="dark:text-white font-bold mb-1">IQ ACADEMY</h3>
                    <p className="text-xs text-gray-800 mb-2">Comprehensive trading education</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700">3 Courses • 12 Lessons</span>
                      <ChevronRight className="w-4 h-4 dark:text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-lg overflow-hidden border border-green-800/50 hover:border-green-600 transition-all cursor-pointer group">
                  <div className="relative h-48">
                    <img src="/media/images/2600x1600/fast_start.jpg" alt="Fast Start" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-800/30 to-emerald-700/30"></div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Fast Start</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-1">FAST START TRAINING</h3>
                    <p className="text-xs text-gray-800 mb-2">Begin your trading journey</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs dark:text-green-400">Start Here →</span>
                      <ChevronRight className="w-4 h-4 text-gray-800" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg overflow-hidden border hover:border-red-700 transition-all cursor-pointer group">
                  <div className="relative h-48">
                    <img src="/media/images/2600x1600/banner_2.jpg" alt="IQ Live" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded flex items-center gap-1">
                        <CircleDot className="w-3 h-3" />
                        IQ Live
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="dark:text-white font-bold mb-1">IQ LIVE</h3>
                    <p className="text-xs text-gray-800 mb-2">Live trading sessions & webinars</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <CircleDot className="w-3 h-3 animate-pulse" />
                        Sessions Available
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-800" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg overflow-hidden border border-blue-800/50 hover:border-blue-600 transition-all cursor-pointer group">
                  <div className="relative h-48">
                    <img src="/media/images/2600x1600/banner_3.jpg" alt="IQ Strategies" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-purple-700/30"></div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Strategies</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-1">IQ STRATEGIES</h3>
                    <p className="text-xs text-gray-48000 mb-2">Advanced trading techniques</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs dark:text-blue-400">View Strategies →</span>
                      <ChevronRight className="w-4 h-4 text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-900/50 rounded-lg overflow-hidden border mb-4">
                <div className="relative" style={{ height: '300px' }}>
                  <img src="../../public/media/avatars/1.jpg" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">LIVE</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs text-gray-100 dark:text-gray-800">Live Now</p>
                    <h3 className="text-lg font-bold text-white mb-2">{liveSession.instructor}</h3>
                    <button className="w-full px-4 py-2 bg-white/90 text-black font-semibold rounded-lg">
                      Watch Live
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 rounded-lg p-3 border border-pink-800/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-pink-600 to-purple-600"></div>
                      <div>
                        <p className="text-sm dark:text-white">Follow IQonic</p>
                        <p className="text-xs text-gray-800">@iqonic_official</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-800" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-3 border border-purple-800/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-pink-600"></div>
                      <div>
                        <p className="text-sm dark:text-white">Síguenos</p>
                        <p className="text-xs text-gray-800">@iqonic_espanol</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-800" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-lg p-3 border border-blue-800/50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                      <div>
                        <p className="text-sm dark:text-white">Join Telegram</p>
                        <p className="text-xs text-gray-800">@iqonic_community</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Recent Activity */}
          {/* <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-lg border p-5">
              <h3 className="text-sm font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Company Recent Activities
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                    IQ
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">IQonic Team</span> published <span className="text-purple-400">Market Analysis Report</span>
                    </p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                    SP
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">Support</span> updated <span className="text-purple-400">Trading Guidelines</span>
                    </p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                    IQ
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">IQonic</span> scheduled <span className="text-purple-400">Weekend Trading Session</span>
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    AD
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">Admin</span> released <span className="text-purple-400">New Strategy Module</span>
                    </p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                    IQ
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">IQonic Team</span> added <span className="text-purple-400">Risk Management Course</span>
                    </p>
                    <p className="text-xs text-gray-500">8 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg border p-5">
              <h3 className="text-sm font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400" />
                IQ Social Recent Posts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                    DA
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">Diego Aguirre</span> started <span className="text-blue-400">Live Trading Session</span>
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    SC
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">Sarah Chen</span> posted <span className="text-blue-400">Forex Analysis</span>
                    </p>
                    <p className="text-xs text-gray-500">30 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    MT
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">Mike Torres</span> shared <span className="text-blue-400">Crypto Strategy Guide</span>
                    </p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-3 border-b border-gray-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    EW
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">Emma Wilson</span> completed <span className="text-blue-400">Risk Management Course</span>
                    </p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    JL
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="dark:text-white font-medium">John Lee</span> joined <span className="text-blue-400">Advanced Trading Group</span>
                    </p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Explore More */}
          {/* <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-lg overflow-hidden border border-purple-800/50 cursor-pointer group">
              <div className="h-32 flex items-center justify-center">
                <Users className="w-16 h-16 text-white dark:text-gtray-800" />
              </div>
              <div className="p-4 bg-gray-900/60">
                <h3 className="text-white font-bold mb-1">IQ SOCIAL</h3>
                <p className="text-xs dark:text-gray-800">Connect with traders worldwide</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-lg overflow-hidden border border-blue-800/50 cursor-pointer group">
              <div className="h-32 flex items-center justify-center">
                <TrendingUp className="w-16 h-16 text-white dark:text-gtray-800" />
              </div>
              <div className="p-4 bg-gray-900/60">
                <h3 className="text-white font-bold mb-1">IQ INSIGHT</h3>
                <p className="text-xs dark:text-gray-800">Market analysis & reports</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/40 to-yellow-900/40 rounded-lg overflow-hidden border border-orange-800/50 cursor-pointer group">
              <div className="h-32 flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white dark:text-gtray-800" />
              </div>
              <div className="p-4 bg-gray-900/60">
                <h3 className="text-white font-bold mb-1">IQ IDEAS</h3>
                <p className="text-xs dark:text-gray-800">Trading ideas & strategies</p>
              </div>
            </div>
          </div> */}





          {/* <div className="fixed inset-0"></div>
          <div className="fixed inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                                      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                      radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)`
          }}></div> */}

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* Hero Section with Live Session */}
            <div className="mb-8">
              <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-xl border border-white/10">
                <div className="absolute inset-0">
                  <img src="/media/images/2600x1600/dashboard_banner.jpg" alt="Hero" className="w-full h-full object-cover opacity-30" />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div> */}
                </div>

                <div className="relative h-full flex items-center justify-between p-8">
                  {/* Left Side - Hero Content */}
                  <div className="flex-1 max-w-2xl">
                    <h1 className="text-3xl xl:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                      RISE ABOVE ORDINARY
                    </h1>
                  </div>

                  {/* Right Side - Live Preview */}
                  <div className="hidden lg:block">
                    <div className="relative w-80 h-64 rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                      <img src='/media/images/2600x1600/watch_live.jpg' alt="Live Session" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-xs text-gray-300 dark:text-gray-900 mb-1">Trading Live</p>
                        <h3 className="text-white font-bold mb-1">{liveSession.instructor}</h3>
                        <p className="text-xs text-gray-400">{liveSession.title}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Features - Bento Grid */}
            <div className="grid grid-cols-12 gap-4 mb-8">
              {/* IQ Academy - Large Card */}
              <div className="col-span-12 xl:col-span-8">
                <div className="group relative xl:h-64">
                  {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div> */}
                  <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition shadow-md">
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="flex-1 p-8 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 rounded-lg mb-4">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-400 font-medium">FEATURED</span>
                          </div>
                          <h3 className="text-3xl font-bold dark:text-white mb-2">IQ Academy</h3>
                          <p className="text-gray-600 mb-4">Comprehensive trading education from basics to advanced strategies</p>
                        </div>
                        <button className="self-start px-4 py-2 btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium flex items-center gap-2 transition">
                          Start Learning
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-full md:w-72 relative overflow-hidden">
                        <img src="/media/images/2600x1600/fast_start.jpg" alt="Academy" className="w-full h-full object-cover" />
                        {/* <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900/50"></div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Start - Medium Card */}
              <div className="col-span-12 xl:col-span-4">
                <div className="group relative h-64">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
                  <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-green-500/20 hover:border-green-500/40 transition p-6 flex flex-col justify-between shadow-md">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold dark:text-white mb-2 truncate">Fast Start Training</h3>
                      <p className="text-gray-600 text-sm">Begin your journey with us, let us guide you to the whole process</p>
                    </div>
                    <button className="w-full py-2 bg-green-600/20 hover:bg-green-600/30 dark:text-green-100 text-green-900 rounded-lg transition">
                      Start Here →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Features Grid with Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {/* IQ Live with Image */}
              <div className="group relative ">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
                <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-red-500/20 hover:border-red-500/40 transition shadow-md">
                  <div className="h-full flex flex-col">
                    <div className=" relative overflow-hidden">
                      <img src="/media/images/2600x1600/watch_live.jpg" alt="IQ Live" className="w-full h-52 object-cover" />
                      {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div> */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-red-600/20 text-red-100 text-xs rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                          Live
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-bold dark:text-white mb-2">IQ Live</h3>
                      <p className="text-gray-600 text-sm mb-4">Join live trading sessions and webinars</p>
                      <div className="flex items-center justify-end">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* IQ Strategies with Image */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
                <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-blue-500/20 hover:border-blue-500/40 transition shadow-md">
                  <div className="h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <img src="/media/images/2600x1600/watch_live.jpg" alt="IQ Strategies" className="w-full h-52 object-cover" />
                      {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div> */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-100 text-xs rounded-full">
                          Advanced
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-bold dark:text-white mb-2">IQ Strategies</h3>
                      <p className="text-gray-600 text-sm mb-4">Advanced trading techniques and analysis</p>
                      <div className="flex items-center justify-end">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* IQ Social with Image */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
                <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition shadow-md">
                  <div className="h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <img src="/media/images/2600x1600/watch_live.jpg" alt="IQ Social" className="w-full h-52 object-cover" />
                      {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div> */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-100 text-xs rounded-full">
                          Community
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-bold dark:text-white mb-2">IQ Social</h3>
                      <p className="text-gray-600 text-sm mb-4">Connect with your favorite educators</p>
                      <div className="flex items-center justify-end">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed & Social Links */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Combined Activity Feed */}
              <div className="lg:col-span-2">
                <div className="card rounded-2xl border p-6 h-full shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      Live Activity Feed
                    </h3>
                    <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg">
                      <button
                        onClick={() => setActiveTab('live')}
                        className={`
      px-4 py-2 rounded-md text-sm font-medium transition-all
      ${activeTab === 'live'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-700/50'
                          }
    `}
                      >
                        Company
                      </button>

                      <button
                        onClick={() => setActiveTab('social')}
                        className={`
      px-4 py-2 rounded-md text-sm font-medium transition-all
      ${activeTab === 'social'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-700/50'
                          }
    `}
                      >
                        Social
                      </button>
                    </div>

                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition cursor-pointer">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                            {activeTab === 'live' ? 'IQ' : 'DA'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            <span className="dark:text-white font-medium">
                              {activeTab === 'live' ? 'IQonic Team' : 'Diego Aguirre'}
                            </span>
                            {' '}
                            <span className="text-gray-600">
                              {activeTab === 'live' ? 'published' : 'started'}
                            </span>
                            {' '}
                            <span className="text-purple-400">
                              {activeTab === 'live' ? 'Market Analysis' : 'Live Session'}
                            </span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{i * 10} minutes ago</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Links & Apps - Vertical Stack */}
              <div className="space-y-4 flex flex-col h-full">
                <h3 className="text-lg font-bold dark:text-white">Connect With Us</h3>

                {/* Follow IQonic */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition"></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-white/20 transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm dark:text-white font-medium">Follow IQonic</p>
                          <p className="text-xs text-gray-600">@iqonic_official</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
                    </div>
                  </div>
                </div>

                {/* Download our Apps Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 mt-4 mb-2">Download our Apps</h4>

                  {/* IQ Social App */}
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-3 hover:border-purple-500/40 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm dark:text-white font-medium">IQ Social</p>
                        <p className="text-xs text-purple-400">10K+ Beta Users</p>
                      </div>
                    </div>
                    <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition">
                      <Download className="w-4 h-4" />
                      Download Now
                    </button>
                  </div>

                  {/* IQ Sync App */}
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-blue-500/20 p-3 hover:border-blue-500/40 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm dark:text-white font-medium">IQ Sync</p>
                        <p className="text-xs text-blue-400">Cross-Platform</p>
                      </div>
                    </div>
                    <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition">
                      <Download className="w-4 h-4" />
                      Download Now
                    </button>
                  </div>
                </div>

                {/* Ideas and Insights Section */}
                <div className="space-y-3 flex-1">
                  <h4 className="text-sm font-bold text-gray-800 mt-6 mb-2">Ideas and Insights</h4>

                  {/* IQ Ideas Link */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-3 hover:border-orange-500/40 transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm dark:text-white font-medium">IQ Ideas</p>
                            <p className="text-xs text-orange-400">Trading ideas & strategies</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
                      </div>
                    </div>
                  </div>

                  {/* IQ Insights Link */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-3 hover:border-cyan-500/40 transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm dark:text-white font-medium">IQ Insights</p>
                            <p className="text-xs text-cyan-400">Market analysis & reports</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default ClientDashboard;
