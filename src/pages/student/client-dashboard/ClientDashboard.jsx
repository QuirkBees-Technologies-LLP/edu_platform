// import React, { useState, useEffect, useCallback } from "react";
// import { ChevronLeft } from "lucide-react";
// import { FaGooglePlay, FaAppStoreIos } from "react-icons/fa";
// import {
//   BookOpen,
//   ChevronRight,
//   Download,
//   OctagonAlert,
//   Sparkles,
//   TrendingUp,
//   Play,
//   Zap,
//   Globe,
//   Activity,
//   Loader2,
// } from "lucide-react";
// import { ArrowRight } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuthContext } from "@/auth";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Pagination, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/pagination";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useGetLiveEducatorListQuery } from "../../../store/api/client/clientLiveSessionApiSlice";
// import Loader from "../../../components/ui/loader";

// import { QRCodeCanvas } from "qrcode.react";
// import { usePostQuery } from "../../../store/api/client/clientSocialApiSlilce";
// import { useCompleteTourMutation } from "../../../store/api/client/clientProfileApiSlice";

// import introJs from "intro.js";
// import "intro.js/introjs.css";

// const ClientDashboard = () => {
//   const navigate = useNavigate();
//   const [socialType, setSocialType] = useState("company");
//   const [posts, setPosts] = useState([]);
//   const liveSession = {
//     instructor: "Diego Aguirre",
//     thumbnail: "/api/placeholder/400/400",
//   };
//   const { auth, saveAuth } = useAuthContext();
//   const swiperRef = React.useRef(null);
//   const [completeTour] = useCompleteTourMutation();

//   const tourStartedRef = React.useRef(false);

//   const markTourComplete = useCallback(async () => {
//     try {
//       if (tourStartedRef.current) {
//         tourStartedRef.current = false;
//       }
//       await completeTour().unwrap();
//       if (auth) {
//         saveAuth({
//           ...auth,
//           user: { ...auth.user, hasSeenTour: true },
//         });
//       }
//     } catch (err) {
//       console.error("Failed to mark tour complete:", err);
//     }
//   }, [completeTour, auth, saveAuth]);
//   const allowedRoutes = auth?.user?.plan?.allowedSideBar;

//   const limit = 5;
//   const page = 1;

//   const {
//     data: Posts,
//     isLoading: isPostsLoading,
//     isFetching: isFetchingPosts,
//     isError: isPostsError,
//   } = usePostQuery(
//     { page, limit, socialType },
//     { refetchOnMountOrArgChange: true },
//   );

//   useEffect(() => {
//     if (Posts?.posts) {
//       setPosts(Posts?.posts);
//     }
//   }, [Posts]);

//   const { data: liveEducator, isLoading: educatorsLoading } =
//     useGetLiveEducatorListQuery();

//   const liveStreams = liveEducator?.streams || [];

//   const [activeTab, setActiveTab] = useState("feed");
//   const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
//   const [isQRModalOpen, setQRModalOpen] = useState(false);
//   const [qrType, setQrType] = useState("android");

//   const IQLive = "/iq-academy";
//   const IQInsight = "/iq-insight";
//   const IQIdea = "/ideas";
//   const IQAcademy = "/iq-vault";

//   const handleRouteClick = () => {
//     setUpgradeModalOpen(true);
//   };

//   const timeAgo = (date) => {
//     const now = new Date();
//     const posted = new Date(date);
//     const diffMs = now - posted;
//     const diffMin = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMin / 60);

//     if (diffMin < 1) return "Just now";
//     if (diffMin < 60) return `${diffMin} minutes ago`;
//     if (diffHours < 24) return `${diffHours} hours ago`;
//     return posted.toLocaleDateString();
//   };

//   const htmlToPlainText = (html) => {
//     if (!html) return "";
//     try {
//       const parser = new DOMParser();
//       const doc = parser.parseFromString(html, "text/html");
//       return (doc.body.textContent || "").trim();
//     } catch {
//       return html.replace(/<[^>]+>/g, "").trim();
//     }
//   };

//   const getShortContent = (content = "") => {
//     const clean = htmlToPlainText(content);
//     if (clean.length <= 120) return clean;
//     return clean.substring(0, 120);
//   };

//   useEffect(() => {
//     const user = auth?.user;
//     const isStudent = user?.role === "student";
//     const hasSeenTour = user?.hasSeenTour;

//     if (isStudent && hasSeenTour !== true && !tourStartedRef.current) {
//       tourStartedRef.current = true;
//       const timer = setTimeout(() => {
//         startTour();
//       }, 1000);

//       return () => {
//         clearTimeout(timer);
//         tourStartedRef.current = false;
//       };
//     }
//   }, [auth?.user?.hasSeenTour, auth?.user?.role]);

//   const startTour = () => {
//     const steps = [];

//     // Step 1: Welcome Card in center
//     steps.push({
//       title: "Welcome to IQonic! 👋",
//       intro: `
//          <div class="welcome-tour-card">
//           <h2 class="text-3xl md:text-5xl font-bold mb-4">Welcome to Your Dashboard, ${auth?.user?.firstName || auth?.user?.name || 'Trader'}!</h2>
//           <p class="text-lg md:text-xl text-gray-100" style="color: #f3f4f6; font-weight: 500;">We're thrilled to have you here. This quick tour will guide you through the key features of your dashboard covering both <strong>Trading Education</strong> and <strong>Digital Marketing</strong> so you can get the most out of your experience.</p>
//         </div>
//       `,
//     });

//     // Step 2: Live Educator
//     const live = document.querySelector(".live-card");
//     if (live) {
//       steps.push({
//         element: live,
//         title: "📡 Live Now",
//         intro: "If an educator is streaming right now, they'll show up here.<br><br>Tap any card to jump straight into their live session.",
//         position: 'right'
//       });
//     }

//     // Step 3: IQ Academy
//     const academy = document.querySelector(".academy-card");
//     if (academy) {
//       steps.push({
//         element: academy,
//         title: "🎓 IQ Academy",
//         intro: "This is your course library structured lessons on <strong>Forex</strong>, <strong>Crypto</strong>, and <strong>Digital Marketing</strong>.<br><br>Everything from beginner fundamentals to advanced techniques, all in one place.",
//         position: 'bottom'
//       });
//     }

//     // Step 4: Fast Start Training
//     const fast = document.querySelector(".fast-start-card");
//     if (fast) {
//       steps.push({
//         element: fast,
//         title: "⚡ Fast Start Training",
//         intro: "Best place to start if you're new.<br><br>Short, focused video lessons that walk you through the basics so you can get up to speed fast.",
//         position: 'left'
//       });
//     }

//     // Step 4.5: IQ Live
//     const iqLive = document.querySelector(".iq-live-card");
//     if (iqLive) {
//       steps.push({
//         element: iqLive,
//         title: "📅 IQ Live Scheduled Sessions",
//         intro: "See what's coming up across the platform.<br><br>Browse scheduled live sessions for <strong>Trading</strong> (Forex, Crypto, market analysis) or <strong>Digital Marketing</strong> and join when they go live.",
//         position: 'right'
//       });
//     }

//     // Step 5: IQ Strategies
//     const strategies = document.querySelector(".strategies-card");
//     if (strategies) {
//       steps.push({
//         element: strategies,
//         title: "📊 IQ Strategies",
//         intro: "Each strategy here comes from one of our educators, complete with video breakdowns.<br><br>Pick one that matches your style  whether you're just starting out or looking to level up.",
//         position: 'left'
//       });
//     }

//     // Step 6: IQ Social
//     const socialCard = document.querySelector(".social-card");
//     if (socialCard) {
//       steps.push({
//         element: socialCard,
//         title: "💬 IQ Social",
//         intro: "Your direct line to the educators you follow.<br><br>Market insights, trade ideas, and platform announcements all in a single feed.",
//         position: 'left'
//       });
//     }

//     // Step 7: Live Activity Feed
//     const socialFeed = document.querySelector(".social-feed");
//     if (socialFeed) {
//       steps.push({
//         element: socialFeed,
//         title: "📰 Activity Feed",
//         intro: "The latest posts from educators and the IQonic team show up here in real time.<br><br>Scroll through to stay in the loop.",
//         position: 'right'
//       });
//     }

//     if (steps.length === 0) return;

//     const tour = introJs.tour().setOptions({
//       steps,
//       hidePrev: true,
//       nextLabel: "Next →",
//       prevLabel: "← Back",
//       skipLabel: "Skip",
//       doneLabel: "Continue →",
//       showProgress: true,
//       showBullets: false,
//       overlayOpacity: 0.8,
//       exitOnOverlayClick: false,
//       exitOnEsc: true,
//       scrollToElement: false,
//       tooltipClass: "custom-intro-tooltip",
//     });

//     tour.onchange(function (targetElement) {
//       if (this._currentStep === 0 || !targetElement) {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         return;
//       }

//       const rect = targetElement.getBoundingClientRect();
//       const absoluteTop = rect.top + window.pageYOffset;
//       const middle = absoluteTop - (window.innerHeight / 2) + (rect.height / 2);

//       window.scrollTo({ top: middle, behavior: "smooth" });
//     });

//     let isCompleted = false;
//     let userClickedSkip = false;
//     const handleSkipClick = (e) => {
//       if (e.target.closest?.('.introjs-skipbutton')) {
//         userClickedSkip = true;
//       }
//     };
//     document.addEventListener('click', handleSkipClick, true);

//     tour.oncomplete(() => {
//       document.removeEventListener('click', handleSkipClick, true);
//       if (!userClickedSkip) {
//         isCompleted = true;
//       }
//       if (tourStartedRef.current) {
//         tourStartedRef.current = false;
//       }
//     });
//     tour.onexit(() => {
//       document.removeEventListener('click', handleSkipClick, true);
//       if (isCompleted) {
//         navigate('/fast-start-training', { state: { continueTour: true } });
//       } else {
//         markTourComplete();
//       }
//     });

//     tour.start();
//   };

//   return (
//     <>
//       <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
//         {/* <DialogContent className="p-5 max-w-[600px]"> */}
//         <DialogContent className="p-5 max-w-[600px]">
//           <DialogHeader></DialogHeader>

//           <div className="flex justify-center text-3xl ki-alert-circle text-yellow-500 mb-3.5 mx-auto">
//             <OctagonAlert size={40} />
//           </div>

//           <p className="mb-4 text-gray-700 text-center">
//             This feature is not available in your current plan. <br />
//             Please upgrade to access it.
//           </p>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isQRModalOpen} onOpenChange={setQRModalOpen}>
//         <DialogContent className="p-5 max-w-[400px]">
//           <DialogHeader>
//             <DialogTitle className="text-center text-lg font-semibold text-gray-800">
//               {qrType === "android"
//                 ? "Download Android Beta"
//                 : "Enroll for iOS Beta"}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="flex justify-center items-center p-6">
//             <QRCodeCanvas
//               value={
//                 qrType === "android"
//                   ? "https://drive.google.com/drive/folders/1s9bCLuFn6lRv9BSBSfoFj78oE0Dvk0dQ?usp=sharing"
//                   : "https://testflight.apple.com/join/qynfgnna"
//               }
//               size={200}
//               bgColor="#ffffff"
//               fgColor="#000000"
//               level="H"
//               includeMargin={true}
//             />
//           </div>
//           <p className="text-center text-sm text-gray-600 mb-4">
//             {qrType === "android"
//               ? "Scan this QR code to download the Android Beta app"
//               : "Scan this QR code to enroll for iOS Beta testing"}
//           </p>
//         </DialogContent>
//       </Dialog>


//       <div className="min-h-screen">
//         {/* Add Tailwind CSS via CDN */}
//         <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">

//           <div className="relative">
//             {/* Hero Section with Live Session */}
//             <div className="mb-8 hero-section">
//               <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-xl border border-white/10">
//                 <div
//                   className="absolute inset-0 bg-cover bg-center bg-no-repeat "
//                   style={{
//                     backgroundImage: "url('/media/images/1400x400 banner.jpg')",
//                   }}
//                 ></div>
//                 <div className="relative h-full flex items-center justify-between flex-col lg:flex-row p-8">
//                   {/* Left Side - Hero Content */}
//                   <div className="flex-1 max-w-2xl">
//                     <h1 className="text-2xl xl:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent text-center">
//                       {/* RISE ABOVE ORDINARY */}
//                     </h1>
//                   </div>


//                   <div className="">
//                     {educatorsLoading ? (
//                       <div className="relative w-80">
//                         <Loader />
//                       </div>
//                     ) : liveStreams.length > 0 ? (
//                       <div className="relative w-56 sm:w-80 live-card">
//                         {liveStreams.length > 1 && (
//                           <>
//                             {/* LEFT ARROW */}
//                             <button
//                               className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/40 dark:bg-white/20 hover:bg-white text-gray-700 rounded-full p-1 shadow-md"
//                               onClick={() => swiperRef.current?.slidePrev()}
//                             >
//                               <ChevronLeft size={20} />
//                             </button>

//                             {/* RIGHT ARROW */}
//                             <button
//                               className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white dark:bg-white/20 text-gray-700 rounded-full p-1 shadow-md"
//                               onClick={() => swiperRef.current?.slideNext()}
//                             >
//                               <ChevronRight size={20} />
//                             </button>
//                           </>
//                         )}

//                         <Swiper
//                           modules={[Pagination, Autoplay]}
//                           spaceBetween={20}
//                           slidesPerView={1}
//                           pagination={{ clickable: true }}
//                           autoplay={{ delay: 3000 }}
//                           onSwiper={(swiper) => (swiperRef.current = swiper)}
//                           className="w-56 sm:w-80 h-64 rounded-xl overflow-hidden"
//                         >
//                           {liveStreams.map((slide, index) => (
//                             <SwiperSlide key={index}>
//                               <div className="relative w-56 sm:w-80 h-64 rounded-xl overflow-hidden border border-white/20 shadow-2xl">
//                                 <img
//                                   src={slide?.educator?.image}
//                                   alt={slide?.educator?.first_name}
//                                   className="w-full h-full object-cover"
//                                 />

//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

//                                 <div className="absolute bottom-0 left-0 right-0 p-4">
//                                   <p className="text-xs text-gray-300 dark:text-gray-900 mb-1">
//                                     {slide?.educator?.categories?.[0]?.name ===
//                                       "Digital Marketing"
//                                       ? "Live Training"
//                                       : "Trading Live"}
//                                   </p>

//                                   <h3 className="text-white  font-bold mb-1">
//                                     {slide?.educator?.first_name}{" "}
//                                     {slide?.educator?.last_name}
//                                   </h3>

//                                   <p className="text-xs text-gray-400 dark:text-gray-600 pb-2">
//                                     {slide?.title || "Live market session"}
//                                   </p>
//                                 </div>

//                                 <div className="absolute inset-0 flex m-5 items-end justify-end">
//                                   <Link
//                                     to={`/iq-educators/${slide?.educator?._id}`}
//                                     className="w-12 h-12 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition"
//                                   >
//                                     <Play
//                                       className="w-6 h-6 text-white ml-1"
//                                       fill="white"
//                                     />
//                                   </Link>
//                                 </div>
//                               </div>
//                             </SwiperSlide>
//                           ))}
//                         </Swiper>
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center w-80 h-64">
//                         <p className="text-white">No Live Educators</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Main Features - Bento Grid */}
//             <div className="grid grid-cols-12 gap-4 mb-8">
//               {/* IQ Academy - Large Card */}
//               <div className="col-span-12 xl:col-span-8 academy-card">
//                 <div className="group relative xl:h-64">
//                   {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div> */}
//                   <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition shadow-md">
//                     <div
//                       className="flex flex-col md:flex-row h-full"
//                       onClick={() =>
//                         allowedRoutes.includes(IQAcademy)
//                           ? navigate(IQAcademy)
//                           : handleRouteClick()
//                       }
//                     >
//                       <div className="flex-1 p-8 flex flex-col justify-between">
//                         <div>
//                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 rounded-lg mb-4">
//                             <BookOpen className="w-4 h-4 text-purple-400" />
//                             <span className="text-xs text-purple-400 font-medium">
//                               FEATURED
//                             </span>
//                           </div>
//                           <h3 className="text-3xl font-bold dark:text-white mb-2">
//                             IQ Academy
//                           </h3>
//                           <p className="text-gray-600 mb-4">
//                             Comprehensive trading education from basics to
//                             advanced strategies
//                           </p>
//                         </div>
//                         <button className="self-start px-4 py-2 btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium flex items-center gap-2 transition">
//                           Start Learning
//                           <ArrowRight className="w-4 h-4" />
//                         </button>
//                       </div>
//                       <div className="w-full md:w-72 relative overflow-hidden">
//                         <img
//                           src="/media/images/academy_300x300.jpg"
//                           alt="Academy"
//                           className="w-full h-full object-cover"
//                         />
//                         {/* <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900/50"></div> */}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Fast Start - Medium Card */}
//               <div className="col-span-12 xl:col-span-4 fast-start-card">
//                 <div
//                   className="group relative h-64"
//                   onClick={() => navigate(`/fast-start-training`)}
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
//                   <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-green-500/20 hover:border-green-500/40 transition p-6 flex flex-col justify-between shadow-md">
//                     <div>
//                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
//                         <Zap className="w-6 h-6 text-white" />
//                       </div>
//                       <h3 className="text-xl font-bold dark:text-white mb-2 truncate">
//                         Fast Start Training
//                       </h3>
//                       <p className="text-gray-600 text-sm">
//                         Begin your journey with us, let us guide you to the
//                         whole process
//                       </p>
//                     </div>
//                     <button className="w-full py-2 bg-green-600/20 hover:bg-green-600/30 dark:text-green-100 text-green-900 rounded-lg transition">
//                       Start Here →
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Secondary Features Grid with Images */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
//               {/* IQ Live with Image */}

//               <div className="group relative iq-live-card">
//                 <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
//                 <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-red-500/20 hover:border-red-500/40 transition shadow-md">
//                   <div
//                     className="h-full flex flex-col"
//                     onClick={() =>
//                       allowedRoutes.includes(IQLive)
//                         ? navigate(IQLive)
//                         : handleRouteClick()
//                     }
//                   >
//                     <div className=" relative overflow-hidden">
//                       <img
//                         src="/media/images/livestream_400x300.jpg"
//                         alt="IQ Live"
//                         className="w-full h-52 object-cover"
//                       />
//                       {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div> */}
//                       <div className="absolute top-3 right-3">
//                         <span className="px-2 py-1 bg-red-300 text-dark text-xs rounded-full flex items-center gap-1">
//                           <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
//                           Live
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex-1 p-6">
//                       <h3 className="text-lg font-bold dark:text-white mb-2">
//                         IQ Live
//                       </h3>
//                       <p className="text-gray-600 text-sm mb-4">
//                         Join live trading sessions and webinars
//                       </p>
//                       <div className="flex items-center justify-end">
//                         <ChevronRight className="w-4 h-4 text-gray-600" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* IQ Strategies with Image */}
//               <div className="group relative strategies-card">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
//                 <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-blue-500/20 hover:border-blue-500/40 transition shadow-md">
//                   <div
//                     className="h-full flex flex-col"
//                     onClick={() =>
//                       window.open(
//                         "https://shield.iqonic.life/news.dhtml?usepage=ScannerAccess.html",
//                         "_blank",
//                       )
//                     }
//                   >
//                     <div className="relative overflow-hidden">
//                       <img
//                         src="/media/images/iqcharts_400x300.jpg"
//                         alt="IQ Strategies"
//                         className="w-full h-52 object-cover"
//                       />
//                       {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div> */}
//                       <div className="absolute top-3 right-3">
//                         <span className="px-2 py-1 bg-blue-800/20 text-blue-100 text-xs rounded-full">
//                           Advanced
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex-1 p-6">
//                       <h3 className="text-lg font-bold dark:text-white mb-2">
//                         IQ Strategies
//                       </h3>
//                       <p className="text-gray-600 text-sm mb-4">
//                         Advanced trading techniques and analysis
//                       </p>
//                       <div className="flex items-center justify-end">
//                         <ChevronRight className="w-4 h-4 text-gray-600" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* IQ Social with Image */}
//               <div className="group relative social-card">
//                 <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition"></div>
//                 <div className="relative h-full bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition shadow-md">
//                   <div
//                     className="h-full flex flex-col"
//                     onClick={() =>
//                       allowedRoutes.includes("/iq-social")
//                         ? navigate("/iq-social")
//                         : handleRouteClick()
//                     }
//                   >
//                     <div className="relative overflow-hidden">
//                       <img
//                         src="/media/images/iqsocial_400x300.jpg"
//                         alt="IQ Social"
//                         className="w-full h-52 object-cover"
//                       />
//                       {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div> */}
//                       <div className="absolute top-3 right-3">
//                         <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
//                           Community
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex-1 p-6">
//                       <h3 className="text-lg font-bold dark:text-white mb-2">
//                         IQ Social
//                       </h3>
//                       <p className="text-gray-600 text-sm mb-4">
//                         Connect with your favorite educators
//                       </p>
//                       <div className="flex items-center justify-end">
//                         <ChevronRight className="w-4 h-4 text-gray-600" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Activity Feed & Social Links */}
//             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//               {/* Combined Activity Feed */}
//               <div className="lg:col-span-2">
//                 <div className="card rounded-2xl border p-6 h-full shadow-md social-feed">
//                   {/* Header */}
//                   <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
//                     <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
//                       <Activity className="w-5 h-5 text-purple-400" />
//                       Live Activity Feed
//                     </h3>

//                     <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg">
//                       <button
//                         onClick={() => setSocialType("company")}
//                         className={`
//             px-4 py-2 rounded-md text-sm font-medium transition-all
//             ${socialType === "company"
//                             ? "bg-purple-600 text-white shadow-md"
//                             : "text-gray-600 hover:bg-gray-700/50"
//                           }
//           `}
//                       >
//                         Corporate
//                       </button>

//                       <button
//                         onClick={() => setSocialType("social")}
//                         className={`
//             px-4 py-2 rounded-md text-sm font-medium transition-all
//             ${socialType === "social"
//                             ? "bg-blue-600 text-white shadow-md"
//                             : "text-gray-600 hover:bg-gray-700/50"
//                           }
//           `}
//                       >
//                         Social
//                       </button>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     {isPostsLoading || isFetchingPosts ? (
//                       <>
//                         {[1, 2, 3, 4, 5].map((i) => (
//                           <div
//                             key={i}
//                             className="flex items-center gap-3 p-3  rounded-xl animate-pulse"
//                           >
//                             <div className="w-10 h-10 rounded-full  bg-gray-300  bg-gray-700/40"></div>

//                             <div className="flex-1 space-y-2">
//                               <div className="flex items-center justify-between">
//                                 <div className="w-24 h-4 bg-gray-700/40  bg-gray-300  rounded"></div>
//                                 <div className="w-14 h-4 bg-gray-700/40  bg-gray-300  rounded"></div>
//                               </div>

//                               <div className="w-full h-4 bg-gray-700/40  bg-gray-300  rounded"></div>

//                               <div className="w-3/4 h-4 bg-gray-700/40  bg-gray-300  rounded"></div>
//                             </div>

//                             <div className="w-4 h-4 bg-gray-700/40  bg-gray-300  rounded"></div>
//                           </div>
//                         ))}
//                       </>
//                     ) : posts.length > 0 ? (
//                       posts.map((post) => (
//                         <div
//                           key={post._id}
//                           className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition cursor-pointer"
//                           onClick={() =>
//                             navigate(`/iq-social?socialType=${socialType}`)
//                           }
//                         >
//                           <div className="relative">
//                             <img
//                               src={post.author?.image}
//                               alt={post.author?.first_name || "IQNOIC"}
//                               className="w-10 h-10 rounded-full object-cover"
//                             />
//                           </div>

//                           <div className="flex-1">
//                             <div className="flex items-center justify-between ">
//                               <p className="dark:text-white font-medium font-medium text-[11px]">
//                                 {post.author?.first_name || "IQNOIC"}{" "}
//                                 {post.author?.last_name || "EDUCATOR"}
//                               </p>
//                               <p className="text-xs text-gray-600 dark:text-gray-800 font-medium font-medium text-[11px]">
//                                 {timeAgo(post.createdAt || new Date())}
//                               </p>
//                             </div>

//                             <p className="text-xs text-gray-700 dark:text-gray-600 mt-1 font-medium text-[14px] ">
//                               {getShortContent(post.content)}
//                               {htmlToPlainText(post.content).length > 120 && (
//                                 <span
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     navigate(
//                                       `/iq-social?socialType=${socialType}`,
//                                     );
//                                   }}
//                                   className="ml-1 text-blue-600 dark:text-purple-400 font-medium cursor-pointer"
//                                 >
//                                   See more
//                                 </span>
//                               )}
//                             </p>
//                           </div>

//                           <ChevronRight className="w-4 h-4 text-gray-600" />
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-10 text-gray-500">
//                         No posts available right now.
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Social Links & Apps - Vertical Stack */}
//               <div className="space-y-4 flex flex-col h-full">
//                 <h3 className="text-lg font-bold dark:text-white">
//                   Connect With Us
//                 </h3>

//                 {/* Follow IQonic */}
//                 <a href="https://www.instagram.com/iqoniclife/?hl=es" target="_blank" rel="noopener noreferrer" className="group relative block">
//                   <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition"></div>
//                   <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-white/20 transition cursor-pointer">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
//                           <Globe className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <p className="text-sm dark:text-white font-medium">
//                             Follow IQonic
//                           </p>
//                           <p className="text-xs text-gray-600">
//                             @iqoniclife
//                           </p>
//                         </div>
//                       </div>
//                       <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
//                     </div>
//                   </div>
//                 </a>

//                 {/* Download our Apps Section */}
//                 <div className="space-y-3">
//                   <h4 className="text-sm font-bold text-gray-800 mt-4 mb-2">
//                     Download our Apps
//                   </h4>

//                   {/* IQ Social App */}
//                   <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-3 hover:border-purple-500/40 transition">
//                     <div className="flex items-center gap-2 mb-2">
//                       <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                         {/* <Sparkles className="w-4 h-4 text-white" /> */}
//                         <img
//                           src="/media/images/IQsocial_icon.svg"
//                           alt="IQ Social"
//                           className=" w-8 h-8"
//                         />
//                       </div>
//                       <div>
//                         <p className="text-sm dark:text-white font-medium">
//                           IQ Social
//                         </p>
//                         <p className="text-xs text-purple-400">
//                           10K+ Users
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <button
//                         onClick={() =>
//                           window.open(
//                             "https://play.google.com/store/apps/details?id=com.eductionplatform&pcampaignid=web_share",
//                             "_blank",
//                           )
//                         }
//                         className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition"
//                       >
//                         <FaGooglePlay className="w-4 h-4" b />
//                         Download Now
//                       </button>
//                       <button
//                         onClick={() =>
//                           window.open(
//                             "https://apps.apple.com/in/app/iq-social/id6752330121",
//                             "_blank",
//                           )
//                         }
//                         className="w-full py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition"
//                       >
//                         <FaAppStoreIos className="w-4 h-4" />
//                         Download Now
//                       </button>
//                     </div>
//                   </div>

//                   {/* IQ Sync App */}
//                   <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-blue-500/20 p-3 hover:border-blue-500/40 transition">
//                     <div className="flex items-center gap-2 mb-2">
//                       <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
//                         <img
//                           src="/media/images/IQsync_icon.svg"
//                           alt="IQ Sync"
//                           className=" w-8 h-8"
//                         />
//                       </div>
//                       <div>
//                         <p className="text-sm dark:text-white font-medium">
//                           IQ Sync
//                         </p>
//                         <p className="text-xs text-blue-400">Cross-Platform</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() =>
//                         window.open("https://qrco.de/iqsync", "_blank")
//                       }
//                       className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm rounded-lg flex items-center justify-center gap-2 transition"
//                     >
//                       <Download className="w-4 h-4" />
//                       Download Now
//                     </button>
//                   </div>
//                 </div>

//                 {/* Ideas and Insights Section */}

//                 <div className="space-y-3 flex-1">
//                   <h4 className="text-sm font-bold text-gray-800 mt-6 mb-2">
//                     Ideas and Insights
//                   </h4>

//                   {/* IQ Ideas Link */}
//                   <div className="group relative">
//                     <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition"></div>
//                     <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-3 hover:border-orange-500/40 transition cursor-pointer">
//                       <div
//                         className="flex items-center justify-between"
//                         onClick={() =>
//                           allowedRoutes.includes(IQIdea)
//                             ? navigate(IQIdea)
//                             : handleRouteClick()
//                         }
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
//                             <Sparkles className="w-4 h-4 text-white" />
//                           </div>
//                           <div>
//                             <p className="text-sm dark:text-white font-medium">
//                               IQ Ideas
//                             </p>
//                             <p className="text-xs text-orange-400">
//                               Trading ideas & strategies
//                             </p>
//                           </div>
//                         </div>
//                         <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* IQ Insights Link */}

//                   <div className="group relative">
//                     <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition"></div>
//                     <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-3 hover:border-cyan-500/40 transition cursor-pointer">
//                       <div
//                         className="flex items-center justify-between"
//                         onClick={() =>
//                           allowedRoutes.includes(IQInsight)
//                             ? navigate(IQInsight)
//                             : handleRouteClick()
//                         }
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
//                             <TrendingUp className="w-4 h-4 text-white" />
//                           </div>
//                           <div>
//                             <p className="text-sm dark:text-white font-medium">
//                               IQ Insights
//                             </p>
//                             <p className="text-xs text-cyan-400">
//                               Market analysis & reports
//                             </p>
//                           </div>
//                         </div>
//                         <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ClientDashboard;

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  Download,
  OctagonAlert,
  Play,
  HelpCircle,
  X,
  Globe,
  Sparkles,
  TrendingUp,
  Filter,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";
import { FaGooglePlay, FaAppStoreIos } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetLiveEducatorListQuery } from "../../../store/api/client/clientLiveSessionApiSlice";
import { QRCodeCanvas } from "qrcode.react";
import { usePostQuery } from "../../../store/api/client/clientSocialApiSlilce";
import { useCompleteTourMutation } from "../../../store/api/client/clientProfileApiSlice";

import introJs from "intro.js";
import "intro.js/introjs.css";
import { Container } from "@/components/container";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [socialType, setSocialType] = useState("ALL");
  const [posts, setPosts] = useState([]);
  const { auth, saveAuth } = useAuthContext();
  const [completeTour] = useCompleteTourMutation();
  const [fastStartOpen, setFastStartOpen] = useState(false);

  const tourStartedRef = React.useRef(false);

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

  const allowedRoutes = auth?.user?.plan?.allowedSideBar || [];
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

  const { data: liveEducator } = useGetLiveEducatorListQuery();
  const liveStreams = liveEducator?.streams || [];

  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isQRModalOpen, setQRModalOpen] = useState(false);
  const [qrType, setQrType] = useState("android");

  const IQInsight = "/iq-insight";
  const IQIdea = "/ideas";

  const handleRouteClick = () => {
    setUpgradeModalOpen(true);
  };

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
    const steps = [
      {
        title: "Welcome to IQonic! 👋",
        intro: `
          <div class="welcome-tour-card">
            <h2 class="text-3xl md:text-5xl font-bold mb-4">Welcome to Your Dashboard, ${userName}!</h2>
            <p class="text-lg md:text-xl text-gray-100" style="color: #f3f4f6; font-weight: 500;">We're thrilled to have you here.</p>
          </div>
        `,
      }
    ];

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

    tour.oncomplete(() => markTourComplete());
    tour.onexit(() => markTourComplete());
    tour.start();
  };

  return (
    <>
      <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="p-5 max-w-[600px] bg-[#0C061A] border border-purple-900 text-white">
          <DialogHeader></DialogHeader>
          <div className="flex justify-center text-3xl text-yellow-500 mb-3.5 mx-auto">
            <OctagonAlert size={40} />
          </div>
          <p className="mb-4 text-gray-300 text-center">
            This feature is not available in your current plan. <br />
            Please upgrade to access it.
          </p>
        </DialogContent>
      </Dialog>

      <div className="relative min-h-screen bg-[#F8F9FA] dark:bg-[#07030E] text-gray-900 dark:text-white overflow-x-hidden -mt-16 pt-20 transition-colors duration-200">
        {/* Figma Horizon Radial Flare */}
        <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.15),rgba(248,249,250,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.45),rgba(7,3,14,0))] pointer-events-none z-0" />

        <Container className="relative z-10">
          {/* Top Greeting Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-6 w-full">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                WELCOME BACK
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                👋 Hello, <span className="text-[#A855F7]">{userName}</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/fast-start-training')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#130728]/90 border border-[#3E1D75]/80 text-white hover:bg-[#1F0C3F] hover:border-purple-500 transition-all text-xs font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.2)] cursor-pointer"
              >
                <Play size={13} className="fill-emerald-400 text-emerald-400" />
                <span>Fast Start Training</span>
              </button>

              <button
                onClick={() => navigate('/support')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#130728]/90 border border-[#3E1D75]/80 text-white hover:bg-[#1F0C3F] transition-all text-xs font-semibold cursor-pointer">
                <HelpCircle size={14} className="text-purple-300" />
                <span>Need Help?</span>
              </button>
            </div>
          </div>
        </Container>

        <Container className="relative z-10">
          <div className="flex flex-col gap-8 pb-12 w-full">
            {/* 1. YOUR LEARNING JOURNEY (5 FIGMA CARDS) */}
            <div className="flex flex-col gap-3 w-full">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Your Learning Journey
              </h2>
              <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[1000px] sm:min-w-0 items-stretch">

                  {/* Card 1: Academy */}
                  <div
                    onClick={() => navigate("/iq-vault")}
                    className="relative group rounded-2xl p-4 bg-gradient-to-b from-[#180B35] to-[#0D051F] border border-purple-900/50 hover:border-purple-500/80 transition-all cursor-pointer flex flex-col justify-between h-36 overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white">Academy</h3>
                        <p className="text-[11px] text-purple-300/80 mt-0.5">Build your foundation with core education.</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
                        🎓
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Strategies */}
                  <div
                    onClick={() => window.open("https://base.iqonic.life/login.html", "_blank")}
                    className="relative group rounded-2xl p-4 bg-gradient-to-b from-[#180B35] to-[#0D051F] border border-purple-900/50 hover:border-purple-500/80 transition-all cursor-pointer flex flex-col justify-between h-36 overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white">Strategies</h3>
                        <p className="text-[11px] text-purple-300/80 mt-0.5">Proven power strategies and advanced formulas.</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-300">
                        📈
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Live Streams */}
                  <div
                    onClick={() => navigate("/iq-academy")}
                    className="relative group rounded-2xl p-4 bg-gradient-to-b from-[#220B45] to-[#120528] border border-purple-500/60 hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between h-36 overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white">Live Streams</h3>
                        <p className="text-[11px] text-purple-200 mt-0.5">Join live sessions with experts.</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-red-600/40 flex items-center justify-center text-red-300 animate-pulse">
                        ▶
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Strategy Alerts */}
                  <div
                    onClick={() => navigate("/trading-signals")}
                    className="relative group rounded-2xl p-4 bg-gradient-to-b from-[#180B35] to-[#0D051F] border border-purple-900/50 hover:border-purple-500/80 transition-all cursor-pointer flex flex-col justify-between h-36 overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white">Strategy Alerts</h3>
                        <p className="text-[11px] text-purple-300/80 mt-0.5">Real-time alerts from IQonic strategies.</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-amber-600/30 flex items-center justify-center text-amber-300">
                        ⚡
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Ideas & Insights */}
                  <div
                    onClick={() => navigate("/ideas")}
                    className="relative group rounded-2xl p-4 bg-gradient-to-b from-[#180B35] to-[#0D051F] border border-purple-900/50 hover:border-purple-500/80 transition-all cursor-pointer flex flex-col justify-between h-36 overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white">Ideas & Insights</h3>
                        <p className="text-[11px] text-purple-300/80 mt-0.5">Exclusive market ideas, insights, and trading setups.</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-teal-600/30 flex items-center justify-center text-teal-300">
                        💡
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 2. MAIN 2-COLUMN LAYOUT (FIGMA MATCH) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start w-full">

              {/* LEFT COLUMN: YOUR SOCIAL FEED */}
              <div className="lg:col-span-7 flex flex-col gap-4 w-full min-w-0">
                <div className="flex items-center justify-between w-full pb-1">
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Your Social Feed
                  </h2>
                  <button className="text-gray-400 hover:text-white p-1 transition cursor-pointer">
                    <Filter size={16} />
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  {["ALL", "CORPORATE", "EDUCATION"].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setSocialType(pill)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${socialType === pill
                        ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                        : "bg-[#130728] text-gray-400 border border-purple-900/30 hover:text-white"
                        }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* Feed Cards List */}
                <div className="flex flex-col gap-4 mt-2">
                  {isPostsLoading ? (
                    <div className="text-center py-10 text-gray-500">Loading feed...</div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <div
                        key={post._id}
                        className="rounded-2xl bg-[#0B0418] border border-purple-900/40 border-l-[4px] border-l-[#8B5CF6] p-4 flex flex-col gap-3 shadow-lg hover:border-purple-600/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author?.image || "/media/avatars/300-1.jpg"}
                            alt={post.author?.first_name || "User"}
                            className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {post.author?.first_name || "IQONIC"} {post.author?.last_name || "TEAM"}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-900/60 text-purple-300 font-medium">
                                EDUCATOR
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {timeAgo(post.createdAt)}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-200 leading-relaxed">
                          {post.content?.replace(/<[^>]+>/g, "")}
                        </p>

                        {post.mediaUrl && (
                          <div className="rounded-xl overflow-hidden border border-purple-900/30 mt-1 max-h-80">
                            <img src={post.mediaUrl} alt="Post media" className="w-full object-cover" />
                          </div>
                        )}

                        <div className="flex items-center gap-6 pt-2 border-t border-purple-900/30 text-gray-400 text-xs">
                          <button className="flex items-center gap-1.5 hover:text-purple-400 transition cursor-pointer">
                            <Heart size={14} /> <span>{post.likesCount || 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-purple-400 transition cursor-pointer">
                            <MessageCircle size={14} /> <span>{post.commentsCount || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500 text-xs bg-[#0B0418] rounded-2xl border border-purple-900/30">
                      No posts available right now.
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: LIVESTREAMS SCHEDULE & QUICK ACCESS */}
              <div className="lg:col-span-5 flex flex-col gap-6 w-full min-w-0">
                <div className="rounded-2xl bg-[#0B0418] border border-purple-900/40 p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                      Livestreams Schedule
                    </h3>
                    <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800/40">
                      EST ▾
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {liveStreams.length > 0 ? (
                      liveStreams.map((stream, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#130728] border border-purple-900/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-300">
                              {stream.title?.charAt(0) || "L"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white">{stream.title}</span>
                              <span className="text-[10px] text-purple-400">{stream.educatorName || "Educator"}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate("/iq-academy")}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Join
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-xs">
                        No live sessions scheduled right now.
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Access Apps Download */}
                <div className="rounded-2xl bg-[#0B0418] border border-purple-900/40 p-4 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                      Q
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">IQ Social</h4>
                      <span className="text-[10px] text-purple-400">10K+ Users</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => window.open("https://apps.apple.com/in/app/iq-social/id6752330121", "_blank")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#170B2E] border border-[#3B1F69] text-[10px] font-medium text-white hover:bg-[#25124A] transition-all cursor-pointer"
                    >
                      <Download size={11} /> iOS
                    </button>
                    <button
                      onClick={() => window.open("https://play.google.com/store/apps/details?id=com.eductionplatform", "_blank")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#170B2E] border border-[#3B1F69] text-[10px] font-medium text-white hover:bg-[#25124A] transition-all cursor-pointer"
                    >
                      <Download size={11} /> Android
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </Container>

        {/* Video Lightbox */}
        {fastStartOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setFastStartOpen(false)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#0A0414] border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-[#130728] border-b border-purple-900/50 flex items-center justify-between">
                <h3 className="text-white text-base font-bold flex items-center gap-2">
                  <Play size={16} className="text-emerald-400 fill-emerald-400" /> Fast Start Training
                </h3>
                <button
                  onClick={() => setFastStartOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-900/40">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Fast Start Training Video"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientDashboard;