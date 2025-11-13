import React, { useState } from "react";
import { OctagonAlert, QrCode, Sparkles, TrendingUpDown } from "lucide-react";
import { Bitcoin, BarChart3, ArrowRight } from "lucide-react";
import { Calendar, Target, Users, Trophy, Clock } from "lucide-react";
import { Zap, Lightbulb } from "lucide-react";
import { MessageCircle, ThumbsUp, Megaphone } from "lucide-react";
import { Play } from "lucide-react";
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
      <div className="container-fluid pb-8">
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
                      {/* <span className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-11 text-2xl text-gray-50 font-medium tracking-widest">
                                                COURSES
                                            </span> */}
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
                        {/* <Link to="/iq-vault">
                          <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                            View IQ Vault
                          </button>
                        </Link> */}
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
                      {/* <span className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-11 text-2xl text-gray-50 font-medium tracking-widest">
                                                MENTORSHIP
                                            </span> */}
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
                        {/* <Link to="/iq-academy">
                          <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                            View IQ Academy
                          </button>
                        </Link> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-12">
                  <div className="card rounded-none rounded-b-xl relative group overflow-hidden">
                    {/* Full Overlay */}
                    {/* <div className="absolute inset-0 bg-gray-300 dark:bg-gray-100 flex flex-col items-center justify-center text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 rounded-xl">
                                            <p className="mt-2">No This feature is under-development</p>
                                        </div> */}

                    <div className="card-body p-0 relative">
                      <img
                        src="/media/images/2600x1600/banner_3.jpg"
                        className="w-full object-cover rounded-t-xl"
                        alt=""
                      />
                      {/* <span className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-11 text-2xl text-gray-50 font-medium tracking-widest">
                                                GUIDANCE
                                            </span> */}
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
                            // onClick={handleRouteClick}
                          >
                            View Strategies
                          </button>
                        )}
                        {/* <Link to="/iq-strategies">
                          <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                            View Strategies
                          </button>
                        </Link> */}
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

                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(178.03deg,rgba(43,76,107,0)_35.61%,rgba(0,0,0,0.8)_91.24%)]
                  transition duration-300"
                  ></div>

                  {/* Default Content */}
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

                  {/* Hover Extra Data */}
                  {/* <div className="absolute inset-0 bg-gray-300 dark:bg-gray-100 flex flex-col items-center justify-center text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-1 rounded-xl">
                                        <p className="text-center p-4">
                                            No This feature is under-development
                                        </p>
                                    </div> */}
                </div>

                {/* <div className="card rounded-2xl shadow-md p-6 border">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                        Fast Start Training
                                    </h2>

                                    <div className="space-y-5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Locations:</span>
                                            <span className="font-medium text-gray-800">79</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Founded:</span>
                                            <span className="font-medium text-gray-800">2011</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                                                Subscribed
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Area:</span>
                                            <span className="font-medium text-gray-800">Worldwide</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">CEO:</span>
                                            <a
                                                href="#"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Luis von Ahn
                                            </a>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sector:</span>
                                            <span className="font-medium text-gray-800">Online Education</span>
                                        </div>
                                    </div>
                                </div> */}

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
                  {/* Hover Overlay */}
                  {/* <div
                    className="absolute inset-0 bg-gray-300 dark:bg-gray-100 opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 z-1 flex flex-col items-center justify-center text-center p-4"
                  >
                    <h3 className="">No This feature is under-development</h3>
                  </div> */}

                  {/* Header */}
                  <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl relative z-1">
                    <h3 className="text-white font-semibold text-sm">
                      General Updates
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
                      {/* <Lightbulb className="w-6 h-6" /> */}
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
      </div>
    </>
  );
};

export default ClientDashboard;
