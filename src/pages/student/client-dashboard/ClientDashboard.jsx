import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  ChevronRight,
  Download,
  GraduationCap,
  OctagonAlert,
  Play,
  Headphones,
  Filter,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useGetLiveEducatorListQuery } from "../../../store/api/client/clientLiveSessionApiSlice";
import { usePostQuery } from "../../../store/api/client/clientSocialApiSlilce";
import { useCompleteTourMutation } from "../../../store/api/client/clientProfileApiSlice";
import { Container } from "@/components/container";

import introJs from "intro.js";
import "intro.js/introjs.css";

const isStreamLive = (stream) => {
  if (stream?.isLive === true || stream?.live === true || stream?.is_live === true) return true;
  const status = String(stream?.status ?? stream?.liveStatus ?? "").toLowerCase();
  return status === "live" || status === "active";
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [socialType, setSocialType] = useState("ALL");
  const [posts, setPosts] = useState([]);
  const { auth, saveAuth } = useAuthContext();
  const [completeTour] = useCompleteTourMutation();
  const tourStartedRef = React.useRef(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const markTourComplete = useCallback(async () => {
    try {
      if (tourStartedRef.current) {
        tourStartedRef.current = false;
      }
      await completeTour().unwrap();
      if (auth) {
        saveAuth({
          ...auth,
          user: { ...auth.user, hasSeenTour: true },
        });
      }
    } catch (err) {
      console.error("Failed to mark tour complete:", err);
    }
  }, [completeTour, auth, saveAuth]);

  const limit = 10;
  const page = 1;

  const { data: Posts, isLoading: isPostsLoading } = usePostQuery(
    { page, limit, socialType: socialType === "ALL" ? "" : socialType.toLowerCase() },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (Posts?.posts) {
      setPosts(Posts?.posts);
    }
  }, [Posts]);

  const {
    data: liveEducator,
    isLoading: educatorsLoading,
    refetch: refetchLiveStreams,
  } = useGetLiveEducatorListQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });
  const liveStreams = (liveEducator?.streams || []).filter(isStreamLive);

  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const timeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now - posted;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return posted.toLocaleDateString();
  };

  const userName =
    auth?.user?.first_name ||
    auth?.user?.firstName ||
    auth?.user?.name ||
    "Manny";

  useEffect(() => {
    const refreshLiveStatus = () => {
      if (document.visibilityState === "hidden") return;
      refetchLiveStreams();
    };

    document.addEventListener("visibilitychange", refreshLiveStatus);
    window.addEventListener("focus", refreshLiveStatus);
    window.addEventListener("pageshow", refreshLiveStatus);
    const poll = window.setInterval(refreshLiveStatus, 15000);
    return () => {
      document.removeEventListener("visibilitychange", refreshLiveStatus);
      window.removeEventListener("focus", refreshLiveStatus);
      window.removeEventListener("pageshow", refreshLiveStatus);
      window.clearInterval(poll);
    };
  }, [refetchLiveStreams]);

  useEffect(() => {
    const user = auth?.user;
    const isStudent = user?.role === "student";
    const hasSeenTour = user?.hasSeenTour;

    if (isStudent && hasSeenTour !== true && !tourStartedRef.current) {
      tourStartedRef.current = true;
      const timer = setTimeout(() => {
        startTour();
      }, 1000);

      return () => {
        clearTimeout(timer);
        tourStartedRef.current = false;
      };
    }
  }, [auth?.user?.hasSeenTour, auth?.user?.role]);

  const startTour = () => {
    const steps = [];

    // Step 1: Welcome Card in center
    steps.push({
      title: "Welcome to IQonic! 👋",
      intro: `
         <div class="welcome-tour-card">
          <h2 class="text-3xl md:text-5xl font-bold mb-4">Welcome to Your Dashboard, ${auth?.user?.firstName || auth?.user?.name || "Trader"}!</h2>
          <p class="text-lg md:text-xl text-gray-100" style="color: #f3f4f6; font-weight: 500;">We're thrilled to have you here. This quick tour will guide you through the key features of your dashboard covering both <strong>Trading Education</strong> and <strong>Digital Marketing</strong> so you can get the most out of your experience.</p>
        </div>
      `,
    });

    // Step 2: Live Educator
    const live = document.querySelector(".live-card");
    if (live) {
      steps.push({
        element: live,
        title: "📡 Live Now",
        intro: "If an educator is streaming right now, they'll show up here.<br><br>Tap any card to jump straight into their live session.",
        position: "right"
      });
    }


    // Step 3: IQ Academy
    const academy = document.querySelector(".academy-card");
    if (academy) {
      steps.push({
        element: academy,
        title: "🎓 IQ Academy",
        intro: "This is your course library structured lessons on <strong>Forex</strong>, <strong>Crypto</strong>, and <strong>Digital Marketing</strong>.<br><br>Everything from beginner fundamentals to advanced techniques, all in one place.",
        position: 'bottom'
      });
    }

    // Step 4: Fast Start Training
    const fast = document.querySelector(".fast-start-card");
    if (fast) {
      steps.push({
        element: fast,
        title: "⚡ Fast Start Training",
        intro: "Best place to start if you're new.<br><br>Short, focused video lessons that walk you through the basics so you can get up to speed fast.",
        position: 'left'
      });
    }

    // Step 4.5: IQ Live
    const iqLive = document.querySelector(".iq-live-card");
    if (iqLive) {
      steps.push({
        element: iqLive,
        title: "📅 IQ Live Scheduled Sessions",
        intro: "See what's coming up across the platform.<br><br>Browse scheduled live sessions for <strong>Trading</strong> (Forex, Crypto, market analysis) or <strong>Digital Marketing</strong> and join when they go live.",
        position: 'right'
      });
    }

    // Step 5: IQ Strategies
    const strategies = document.querySelector(".strategies-card");
    if (strategies) {
      steps.push({
        element: strategies,
        title: "📊 IQ Strategies",
        intro: "Each strategy here comes from one of our educators, complete with video breakdowns.<br><br>Pick one that matches your style  whether you're just starting out or looking to level up.",
        position: 'left'
      });
    }

    // Step 6: IQ Social
    const socialCard = document.querySelector(".social-card");
    if (socialCard) {
      steps.push({
        element: socialCard,
        title: "💬 IQ Social",
        intro: "Your direct line to the educators you follow.<br><br>Market insights, trade ideas, and platform announcements all in a single feed.",
        position: 'left'
      });
    }

    // Step 7: Live Activity Feed
    const socialFeed = document.querySelector(".social-feed");
    if (socialFeed) {
      steps.push({
        element: socialFeed,
        title: "📰 Activity Feed",
        intro: "The latest posts from educators and the IQonic team show up here in real time.<br><br>Scroll through to stay in the loop.",
        position: 'right'
      });
    }

    if (steps.length === 0) return;

    const tour = introJs.tour().setOptions({
      steps,
      hidePrev: true,
      nextLabel: "Next →",
      prevLabel: "← Back",
      skipLabel: "Skip",
      doneLabel: "Continue →",
      showProgress: true,
      showBullets: false,
      overlayOpacity: 0.8,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      scrollToElement: false,
      tooltipClass: "custom-intro-tooltip",
    });

    tour.onchange(function (targetElement) {
      if (this._currentStep === 0 || !targetElement) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset;
      const middle = absoluteTop - (window.innerHeight / 2) + (rect.height / 2);

      window.scrollTo({ top: middle, behavior: "smooth" });
    });

    let isCompleted = false;
    let userClickedSkip = false;
    const handleSkipClick = (e) => {
      if (e.target.closest?.('.introjs-skipbutton')) {
        userClickedSkip = true;
      }
    };
    document.addEventListener('click', handleSkipClick, true);

    tour.oncomplete(() => {
      document.removeEventListener('click', handleSkipClick, true);
      if (!userClickedSkip) {
        isCompleted = true;
      }
      if (tourStartedRef.current) {
        tourStartedRef.current = false;
      }
    });
    tour.onexit(() => {
      document.removeEventListener('click', handleSkipClick, true);
      if (isCompleted) {
        navigate('/fast-start-training', { state: { continueTour: true } });
      } else {
        markTourComplete();
      }
    });

    tour.start();
  };

  useEffect(() => {
    if (isFilterModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFilterModalOpen]);

  return (
    <>
      <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="p-5 max-w-[600px] bg-white dark:bg-[#0C061A] border border-gray-200 dark:border-purple-900 text-gray-900 dark:text-white">
          <DialogHeader></DialogHeader>
          <div className="flex justify-center text-3xl text-yellow-500 mb-3.5 mx-auto">
            <OctagonAlert size={40} />
          </div>
          <p className="mb-4 text-gray-600 dark:text-gray-300 text-center">
            This feature is not available in your current plan. <br />
            Please upgrade to access it.
          </p>
        </DialogContent>
      </Dialog>

      <div className="relative min-h-screen bg-white dark:bg-[#05020A] text-white overflow-x-hidden -mt-16 pt-20 transition-colors duration-200">
        {/* Radial Background Flare */}
        <div className="absolute top-0 left-0 right-0 h-[520px] bg-[radial-gradient(ellipse_100%_70%_at_25%_0%,rgba(67,38,125,0.48)_0%,rgba(33,18,68,0.28)_50%,rgba(5,2,10,0)_90%)] pointer-events-none z-0 hidden dark:block" />

        <Container className="relative z-10">
          {/* Header Row: Welcome & Top Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-6 w-full">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-700 dark:text-white uppercase tracking-[0.25em]">
                WELCOME BACK
              </span>
              <h1 className="text-2xl md:text-[30px] font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>👋</span> Hello, <span className="text-[#8B5CF6]">{userName}</span>
              </h1>
            </div>

            {/* Exact Figma Buttons */}
            <div className="flex items-center gap-3.5 shrink-0">
              {/* 1. Fast Start Training Button */}
              <button
                onClick={() => navigate('/fast-start-training')}
                className="group relative flex cursor-pointer items-center gap-3 rounded-[14px] border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 shadow-sm transition-all duration-300 dark:border-transparent dark:text-white dark:shadow-[0_0_10px_rgba(113,243,189,0.1)] dark:[background-image:linear-gradient(180deg,#071411_0%,#0C1E1A_100%),linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.08)_38%,rgba(113,243,189,0.28)_100%)] dark:[background-origin:border-box] dark:[background-clip:padding-box,border-box]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 dark:border-white/10 dark:bg-[#102621]">
                  <Play size={11} className="ml-0.5 fill-emerald-600 text-emerald-600 dark:fill-[#71F3BD] dark:text-[#71F3BD]" />
                </div>
                <span className="pr-1 text-[14px] font-medium tracking-tight text-gray-800 dark:text-white/95">
                  Fast Start Training
                </span>
              </button>

              {/* 2. Need Help? Button */}
              <button
                onClick={() => navigate('/support')}
                className="group relative flex cursor-pointer items-center gap-3 rounded-[14px] border border-gray-200 bg-gray-100 px-4 py-2 text-gray-900 shadow-sm transition-all duration-300 dark:border-transparent dark:text-white dark:shadow-[0_0_10px_rgba(168,85,247,0.14)] dark:[background-image:linear-gradient(180deg,#0C0814_0%,#1A1030_100%),linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(255,255,255,0.08)_38%,rgba(196,160,255,0.4)_100%)] dark:[background-origin:border-box] dark:[background-clip:padding-box,border-box]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-purple-200 bg-purple-100 dark:border-white/10 dark:bg-[#1D1236]">
                  <Headphones size={14} className="text-purple-600 dark:text-[#D2B5FF]" />
                </div>
                <span className="pr-1 text-[14px] font-medium tracking-tight text-gray-800 dark:text-white/95">
                  Need Help?
                </span>
              </button>
            </div>
          </div>
        </Container>

        <Container className="relative z-10">
          <div className="flex flex-col gap-8 pb-12 w-full">

            {/* 1. YOUR LEARNING JOURNEY */}
            <div className="flex flex-col gap-3 w-full">
              <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-wide">
                Your Learning Journey
              </h2>
              <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[1000px] sm:min-w-0 items-stretch">

                  {/* Card 1: Academy */}
                  <div
                    onClick={() => navigate("/iq-vault")}
                    className="relative rounded-[22px] border border-gray-300 dark:border-[#7C3AED]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-md dark:shadow-[0_0_20px_rgba(124,58,237,0.25)] bg-white dark:bg-[#0C051A]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/academy_300x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-900/60 to-transparent dark:from-[#250B48] dark:via-[#1A0736]/80 dark:to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Graduation Cap Icon (No Container Box) */}
                        <div className="text-purple-300 dark:text-[#C084FC] mb-1">
                          <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Academy</h3>
                        <p className="text-[11px] text-gray-400 dark:text-gray-800 line-clamp-2 leading-tight font-normal">
                          Build your foundation with core education.
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                        <ChevronRight size={14} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Strategies */}
                  <div
                    onClick={() => window.open("https://base.iqonic.life/login.html", "_blank")}
                    className="relative rounded-[22px] border border-blue-300 dark:border-[#2563EB]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-md dark:shadow-[0_0_20px_rgba(37,99,235,0.25)] bg-white dark:bg-[#0A0E23]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/iqcharts_400x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/60 to-transparent dark:from-[#0F225A] dark:via-[#0A1740]/80 dark:to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Bar Chart Icon (No Container Box) */}
                        <div className="text-blue-300 dark:text-[#60A5FA] mb-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 19h4v-7H4v7zm6 0h4V5h-4v14zm6 0h4v-11h-4v11z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Strategies</h3>
                        <p className="text-[11px] text-gray-400 dark:text-gray-800 line-clamp-2 leading-tight font-normal">
                          Learn proven strategies and advanced techniques.
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                        <ChevronRight size={14} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Live Streams */}
                  <div
                    onClick={() => navigate("/iq-academy")}
                    className="relative rounded-[22px] border border-fuchsia-300 dark:border-[#C026D3]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-md dark:shadow-[0_0_20px_rgba(192,38,211,0.25)] bg-white dark:bg-[#180524]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/livestream_400x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-950/90 via-fuchsia-900/60 to-transparent dark:from-[#4A0864] dark:via-[#310542]/80 dark:to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Rounded Play Box Icon */}
                        <div className="text-fuchsia-300 dark:text-[#E879F9] mb-1">
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 13V8l6 4-6 4z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Live Streams</h3>
                        <p className="text-[11px] text-gray-400 dark:text-gray-800 line-clamp-2 leading-tight font-normal">
                          Join our live sessions.
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                        <ChevronRight size={14} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Strategy Alerts */}
                  <div
                    onClick={() => navigate("/trading-signals")}
                    className="relative rounded-[22px] border border-amber-300 dark:border-[#D97706]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-md dark:shadow-[0_0_20px_rgba(217,119,6,0.25)] bg-white dark:bg-[#1F0E04]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/iqsocial_400x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-900/60 to-transparent dark:from-[#522304] dark:via-[#361702]/80 dark:to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Bell Icon */}
                        <div className="text-amber-300 dark:text-[#FBBF24] mb-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Strategy Alerts</h3>
                        <p className="text-[11px] text-gray-400 dark:text-gray-800 line-clamp-2 leading-tight font-normal">
                          Real-time alerts from IQONIC strategies.
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                        <ChevronRight size={14} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Ideas & Insights */}
                  <div
                    onClick={() => navigate("/ideas")}
                    className="relative rounded-[22px] border border-yellow-300 dark:border-[#CA8A04]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-md dark:shadow-[0_0_20px_rgba(202,138,4,0.25)] bg-white dark:bg-[#1A1604]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/1400x400 banner.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-950/90 via-yellow-900/60 to-transparent dark:from-[#473B06] dark:via-[#2F2704]/80 dark:to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Lightbulb Icon */}
                        <div className="text-yellow-300 dark:text-[#EAB308] mb-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Ideas & Insights</h3>
                        <p className="text-[11px] text-gray-400 dark:text-gray-800 line-clamp-2 leading-tight font-normal">
                          Explore market ideas, insights, and live trading setups.
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                        <ChevronRight size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MAIN 2-COLUMN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start w-full">
              {/* LEFT COLUMN: YOUR SOCIAL FEED */}
              <div className="lg:col-span-7 flex flex-col gap-4 w-full min-w-0">
                {/* Header Row: Title & Filter Icon */}
                <div className="flex items-center justify-between w-full pb-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Your Social Feed
                  </h2>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFilterModalOpen(!isFilterModalOpen);
                        document.body.style.overflow = !isFilterModalOpen ? 'hidden' : 'unset';
                      }}
                      className="text-gray-800 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <Filter size={18} />
                    </button>

                    {/* Filter Modal Overlay with Background Blur & Scroll Lock */}
                    {isFilterModalOpen && (
                      <div
                        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                        onClick={() => {
                          setIsFilterModalOpen(false);
                          document.body.style.overflow = 'unset';
                        }}
                      >
                        <div
                          className="relative w-[420px] rounded-2xl bg-white dark:bg-[#1A1C23] border border-gray-200 dark:border-white/15 p-6 shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                        >

                          {/* Modal Header with Filter Icon */}
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 mb-5">
                            <div className="flex items-center gap-2 text-gray-800 dark:text-white">
                              <Filter size={16} className="text-purple-600 dark:text-gray-800" />
                              <span className="text-sm font-bold tracking-wider uppercase">
                                IQ Social - Filters
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsFilterModalOpen(false);
                                document.body.style.overflow = 'unset';
                              }}
                              className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm cursor-pointer p-1"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Filter Columns */}
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            {/* Corporate Column */}
                            <div className="flex flex-col gap-3">
                              <h4 className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-xs tracking-wider uppercase border-b border-gray-200 dark:border-white/10 pb-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 dark:text-blue-400">
                                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                                Corporate
                              </h4>
                              <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                                <li className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  General
                                </li>
                                <li className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  Atlas
                                </li>
                                <li className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  Thrive
                                </li>
                              </ul>
                            </div>

                            {/* Education Column */}
                            <div className="flex flex-col gap-3">
                              <h4 className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-xs tracking-wider uppercase border-b border-gray-200 dark:border-white/10 pb-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400 dark:text-purple-400">
                                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                </svg>
                                Education
                              </h4>
                              <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                                <li className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  Posts
                                </li>
                                <li className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  Ideas
                                </li>
                                <li className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  Insights
                                </li>
                                <li className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                  Live ideas
                                </li>
                              </ul>
                            </div>

                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  {["ALL", "CORPORATE", "EDUCATION"].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setSocialType(pill)}
                      className={`flex h-[26px] cursor-pointer items-center gap-1 rounded-lg border-0 px-2.5 text-[10px] font-semibold tracking-wide transition-colors ${socialType === pill
                        ? "bg-[#4F4F4F] text-white"
                        : pill === "EDUCATION"
                          ? "bg-[#160E26] text-[#B0AEC0] hover:text-white"
                          : "bg-[#100A2E] text-[#B0AEC0] hover:text-white"
                        }`}
                    >
                      {pill === "CORPORATE" && <Building2 size={10} strokeWidth={2} />}
                      {pill === "EDUCATION" && <GraduationCap size={10} strokeWidth={2} />}
                      <span>{pill}</span>
                    </button>
                  ))}
                </div>

                {/* Feed Items List */}
                <div className="flex flex-col gap-4 mt-1">
                  {isPostsLoading ? (
                    <div className="text-center py-10 text-gray-500 text-sm">Loading feed...</div>
                  ) : posts.length > 0 ? (
                    posts
                      .filter((post) => {
                        if (socialType === "ALL") return true;
                        return (post.category || "").toUpperCase() === socialType;
                      })
                      .map((post) => {
                        const isCorporate = (post.category || "").toUpperCase() === "CORPORATE";
                        const postImage =
                          (Array.isArray(post.images) && post.images.length > 0
                            ? (typeof post.images[0] === 'string' ? post.images[0] : post.images[0]?.url)
                            : null) ||
                          post.mediaUrl ||
                          post.imageUrl ||
                          post.image;

                        return (

                          <div
                            key={post._id}
                            className={`relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#07020E] p-5 flex flex-col gap-4 shadow-xl dark:shadow-2xl transition-all ${isCorporate ? "border-l-blue-500 dark:border-l-[#3B82F6]" : "border-l-purple-500 dark:border-l-[#A855F7]"
                              } border-l-[7px]`}
                          >

                            {/* Left Side Ambient Glow Background */}
                            <div
                              className={`absolute inset-y-0 left-0 w-32 pointer-events-none ${isCorporate
                                ? "bg-gradient-to-r from-[#2563EB]/15 via-[#1D4ED8]/3 to-transparent"
                                : "bg-gradient-to-r from-[#A855F7]/15 via-[#581C87]/5 to-transparent"
                                }`}
                            />

                            {/* Header: Avatar + User Details + Options */}
                            <div className="relative z-10 flex items-start justify-between w-full">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={post.author?.image || "/media/avatars/300-1.jpg"}
                                  alt={post.author?.first_name || "User"}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/20 shrink-0"
                                />

                                <div className="flex flex-col gap-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-gray-800 dark:text-white tracking-tight">
                                      {post.author?.first_name || "IQONIC"}{" "}
                                      {post.author?.last_name || "TEAM"}
                                    </span>

                                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-normal">
                                      • {timeAgo(post.createdAt)}
                                    </span>
                                  </div>

                                  {/* Category & Post Type Labels */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 rounded-[5px] text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 ${isCorporate
                                        ? "bg-blue-100 dark:bg-[#182848] text-blue-800 dark:text-[#7DD3FC]"
                                        : "bg-purple-100 dark:bg-[#2D124D] text-purple-800 dark:text-[#C084FC]"
                                        }`}
                                    >
                                      {isCorporate ? (
                                        <svg
                                          width="9"
                                          height="9"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                        >
                                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                                        </svg>
                                      ) : (
                                        <svg
                                          width="9"
                                          height="9"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                        >
                                          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                                        </svg>
                                      )}

                                      {post.category || "EDUCATION"}
                                    </span>

                                    <span className="px-2 py-0.5 rounded-[5px] text-[9px] font-bold tracking-wider uppercase bg-purple-50 dark:bg-[#180E2B] text-purple-800 dark:text-[#A78BFA] border border-purple-200 dark:border-[#3B1D6E]/40">
                                      {post.postType || "POST"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* More Options */}
                              {/* <button
                                type="button"
                                aria-label="More options"
                                className="relative z-10 shrink-0 text-gray-400 hover:text-white transition-colors cursor-pointer text-base"
                              >
                                •••
                              </button> */}
                            </div>

                            {/* Post Content */}
                            <p className="relative z-10 text-xs sm:text-sm text-gray-800 dark:text-white/90 font-normal leading-relaxed tracking-normal pr-2 break-words">
                              {post.content?.replace(/<[^>]+>/g, "")}
                            </p>

                            {/* Media Attachment */}
                            {postImage && (
                              <div className="relative z-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 mt-2 w-full bg-gray-50 dark:bg-[#05020A]">
                                <img
                                  src={postImage}
                                  alt="Post media"
                                  className="w-full h-auto max-h-[400px] object-cover rounded-2xl block"
                                />
                              </div>
                            )}

                            {/* Footer Action Bar */}
                            <div className="relative z-10 flex items-center justify-between pt-3 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 border-t dark:border-white/10 text-gray-300 text-xs mt-1">
                              <div className="flex items-center gap-4 sm:gap-6">
                                {/* Likes */}
                                <button
                                  type="button"
                                  className="flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-colors cursor-pointer"
                                >
                                  <Heart size={18} />
                                  <span className="text-xs font-medium text-gray-800 dark:text-white/80">
                                    {post.likesCount || 20}
                                  </span>
                                </button>

                                {/* Comments */}
                                <button
                                  type="button"
                                  className="flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-colors cursor-pointer"
                                >
                                  <MessageCircle size={18} />
                                  <span className="text-xs font-medium text-gray-800 dark:text-white/80">
                                    {post.commentsCount || 12}
                                  </span>
                                </button>

                                {/* Shares */}
                                <button
                                  type="button"
                                  className="flex items-center gap-2 hover:text-purple-400 dark:hover:text-purple-300 transition-colors cursor-pointer"
                                >
                                  <Share2 size={18} />
                                  <span className="text-xs font-medium text-gray-800 dark:text-white/80">
                                    {post.sharesCount || 31}
                                  </span>
                                </button>
                              </div>

                              {/* Bookmark */}
                              <button
                                type="button"
                                aria-label="Bookmark post"
                                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                        );
                      })
                  ) : (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-400 text-xs bg-white dark:bg-[#07020E] rounded-3xl border border-gray-200 dark:border-white/10">
                      No posts available right now.
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: LIVESTREAMS SCHEDULE */}
              <div className="lg:col-span-5 flex flex-col gap-5 w-full min-w-0">
                {/* Header: Title & View Calendar */}
                <div className="flex items-start justify-between w-full px-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-800 dark:text-gray-400 uppercase tracking-[0.22em]">
                      TODAY'S SCHEDULE
                    </span>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                      Livestreams
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate("/iq-academy")}
                    className="text-xs font-medium text-gray-800 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer pt-2 flex items-center gap-1"
                  >
                    <span>View calendar</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                {/* Main Card Container */}
                <div className="rounded-t-[32px] rounded-b-[24px] bg-[#05020A] border border-white/10 p-5 flex flex-col gap-5 shadow-2xl min-h-[480px]">

                  {/* Timezone Selector Row ("EST v") */}
                  {/* <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 pl-1 pb-1 cursor-pointer hover:text-white transition">
                    <span>EST</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div> */}

                  {/* Livestreams List with Timeline */}
                  <div className="flex flex-col gap-3 relative">
                    {liveStreams.length > 0 ? (
                      <div className="relative space-y-3">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-[112px] top-6 bottom-6 w-[1px] bg-[#221742]" />

                        {liveStreams.map((stream, idx) => {
                          const isLiveNow = stream.isLive || idx === 0;

                          const educatorName =
                            stream.educator?.first_name
                              ? `${stream.educator.first_name} ${stream.educator.last_name || ''}`
                              : stream.educatorName || stream.author?.first_name;

                          const educatorImage =
                            stream.educator?.image ||
                            stream.educatorImage ||
                            stream.educatorAvatar ||
                            stream.author?.image ||
                            stream.image ||
                            "/media/avatars/300-1.jpg";

                          const sessionTitle = stream.title || stream.sessionTitle;
                          const educatorRole =
                            stream.educator?.educatorRole ||
                            stream.educatorRole ||
                            (typeof stream.category === 'object' ? stream.category?.name : stream.category)

                          const formatStreamTime = (rawTime) => {
                            if (!rawTime) return "10:00 am";

                            if (typeof rawTime === 'string' && (rawTime.includes('am') || rawTime.includes('pm'))) {
                              return rawTime;
                            }

                            const date = new Date(rawTime);
                            if (isNaN(date.getTime())) return "10:00 am";

                            return date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }).toLowerCase();
                          };

                          const rawTime =
                            stream.time ||
                            stream.startTime ||
                            stream.start_at ||
                            stream.createdAt ||
                            stream.scheduleTime;

                          const sessionTime = formatStreamTime(rawTime);

                          return (
                            <div
                              key={stream._id || idx}
                              className={`relative flex items-center gap-3 p-3.5 rounded-2xl transition-all ${isLiveNow
                                ? "bg-[#0B0B26] border border-[#23235A] shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                                : "bg-transparent hover:bg-white/[0.02]"
                                }`}
                            >
                              {/* Time Label */}
                              <span className="text-xs font-bold text-white tracking-tight w-16 shrink-0 text-left">
                                {sessionTime}
                              </span>

                              {/* Timeline Glowing Node Dot */}
                              <div className="relative z-10 shrink-0 mx-1">
                                <div
                                  className={`w-3 h-3 rounded-full border-2 border-[#05020A] ${isLiveNow
                                    ? "bg-[#4338CA] shadow-[0_0_12px_#6366F1]"
                                    : "bg-[#31235B]"
                                    }`}
                                />
                              </div>

                              {/* Educator Round Image & Title Row */}
                              <div className="flex-1 flex items-center justify-between pl-2">
                                <div className="flex items-center gap-3.5">
                                  <img
                                    src={educatorImage}
                                    alt={educatorName}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "/media/avatars/300-1.jpg";
                                    }}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-[#38266D] shrink-0"
                                  />
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-[#A5B4FC] uppercase tracking-wider">
                                      {educatorName}
                                    </span>
                                    <span className="text-sm font-bold text-white tracking-tight leading-snug">
                                      {sessionTitle}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-medium">
                                      {educatorRole}
                                    </span>
                                  </div>
                                </div>

                                {/* LIVE Pill Badge */}
                                {isLiveNow && (
                                  <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#3B82F6] text-white shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                    ● LIVE
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="flex items-center justify-center min-h-[300px] text-gray-500 text-xs">
                        No live sessions scheduled right now.
                      </div>
                    )}
                  </div>

                </div>

                {/* IQ Social App Download Banner */}
                <div className="flex flex-col gap-3 w-full mt-2">
                  {/* Header Title Outside Container */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight px-1">
                    Quick Access
                  </h3>

                  {/* Main Outer Container */}
                  <div className="rounded-[28px] bg-[#070210] border border-[#2B164C] p-4.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 shadow-2xl">

                    {/* Left Side: App Icon Outer Box + Title + Users Count */}
                    <div className="flex items-center gap-3.5 min-w-max shrink-0">
                      {/* Outer Dark Shadow Box */}
                      <div className="w-14 h-14 rounded-[20px] bg-[#0E051F] border border-[#23113E] flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                        {/* Inner Gradient App Icon Box */}
                        <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#7C3AED] to-[#581C87] flex items-center justify-center text-white shadow-md">
                          {/* Dual Orbit Ring SVG Logo */}
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="7" strokeDasharray="4 2" />
                            <circle cx="12" cy="12" r="3.5" />
                          </svg>
                        </div>
                      </div>

                      {/* App Title & Subtitle */}
                      <div className="flex flex-col justify-center gap-0.5 whitespace-nowrap">
                        <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                          IQ Social
                        </h4>
                        <span className="text-xs text-[#8E8A9F] font-normal">
                          10K+ Users
                        </span>
                      </div>
                    </div>

                    {/* Right Side: Download Store Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Download iOS Button */}
                      <button
                        onClick={() => window.open("https://apps.apple.com/in/app/iq-social/id6752330121", "_blank")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A0B33] border border-[#381B66] hover:bg-[#230F45] transition-all cursor-pointer text-white shadow-sm shrink-0"
                      >
                        {/* App Store Logo */}
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A0B33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L4.5 15h15L12 2z" />
                            <path d="M7 11h10" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium tracking-tight text-white whitespace-nowrap">
                          Download iOS
                        </span>
                      </button>

                      {/* Download Android Button */}
                      <button
                        onClick={() => window.open("https://play.google.com/store/apps/details?id=com.eductionplatform", "_blank")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A0B33] border border-[#381B66] hover:bg-[#230F45] transition-all cursor-pointer text-white shadow-sm shrink-0"
                      >
                        {/* Play Store Logo */}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M3.5 20.2V3.8c0-.7.8-1.1 1.4-.7l13.8 8.2c.6.4.6 1.2 0 1.6L4.9 20.9c-.6.4-1.4 0-1.4-.7z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium tracking-tight text-white whitespace-nowrap">
                          Download Android
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default ClientDashboard;