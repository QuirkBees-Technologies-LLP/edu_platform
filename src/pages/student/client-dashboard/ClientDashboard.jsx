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

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   ChevronRight,
//   Download,
//   OctagonAlert,
//   Play,
//   HelpCircle,
//   X,
//   Globe,
//   Sparkles,
//   TrendingUp,
//   Filter,
//   Heart,
//   MessageCircle,
//   Share2
// } from "lucide-react";
// import { FaGooglePlay, FaAppStoreIos } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { useAuthContext } from "@/auth";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { useGetLiveEducatorListQuery } from "../../../store/api/client/clientLiveSessionApiSlice";
// import { QRCodeCanvas } from "qrcode.react";
// import { usePostQuery } from "../../../store/api/client/clientSocialApiSlilce";
// import { useCompleteTourMutation } from "../../../store/api/client/clientProfileApiSlice";

// import introJs from "intro.js";
// import "intro.js/introjs.css";
// import { Container } from "@/components/container";

// const ClientDashboard = () => {
//   const navigate = useNavigate();
//   const [socialType, setSocialType] = useState("ALL");
//   const [posts, setPosts] = useState([]);
//   const { auth, saveAuth } = useAuthContext();
//   const [completeTour] = useCompleteTourMutation();
//   const [fastStartOpen, setFastStartOpen] = useState(false);

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

//   const allowedRoutes = auth?.user?.plan?.allowedSideBar || [];
//   const limit = 10;
//   const page = 1;

//   const { data: Posts, isLoading: isPostsLoading } = usePostQuery(
//     { page, limit, socialType: socialType === "ALL" ? "" : socialType.toLowerCase() },
//     { refetchOnMountOrArgChange: true }
//   );

//   useEffect(() => {
//     if (Posts?.posts) {
//       setPosts(Posts?.posts);
//     }
//   }, [Posts]);

//   const { data: liveEducator } = useGetLiveEducatorListQuery();
//   const liveStreams = liveEducator?.streams || [];

//   const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
//   const [isQRModalOpen, setQRModalOpen] = useState(false);
//   const [qrType, setQrType] = useState("android");

//   const IQInsight = "/iq-insight";
//   const IQIdea = "/ideas";

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
//     if (diffMin < 60) return `${diffMin}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     return posted.toLocaleDateString();
//   };

//   const userName =
//     auth?.user?.first_name ||
//     auth?.user?.firstName ||
//     auth?.user?.name ||
//     "Manny";

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
//     const steps = [
//       {
//         title: "Welcome to IQonic! 👋",
//         intro: `
//           <div class="welcome-tour-card">
//             <h2 class="text-3xl md:text-5xl font-bold mb-4">Welcome to Your Dashboard, ${userName}!</h2>
//             <p class="text-lg md:text-xl text-gray-100" style="color: #f3f4f6; font-weight: 500;">We're thrilled to have you here.</p>
//           </div>
//         `,
//       }
//     ];

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

//     tour.oncomplete(() => markTourComplete());
//     tour.onexit(() => markTourComplete());
//     tour.start();
//   };

//   return (
//     <>
//       <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
//         <DialogContent className="p-5 max-w-[600px] bg-[#0C061A] border border-purple-900 text-white">
//           <DialogHeader></DialogHeader>
//           <div className="flex justify-center text-3xl text-yellow-500 mb-3.5 mx-auto">
//             <OctagonAlert size={40} />
//           </div>
//           <p className="mb-4 text-gray-300 text-center">
//             This feature is not available in your current plan. <br />
//             Please upgrade to access it.
//           </p>
//         </DialogContent>
//       </Dialog>

//       <div className="relative min-h-screen bg-[#F8F9FA] dark:bg-[#07030E] text-gray-900 dark:text-white overflow-x-hidden -mt-16 pt-20 transition-colors duration-200">
//         {/* Figma Horizon Radial Flare */}
//         <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.15),rgba(248,249,250,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.45),rgba(7,3,14,0))] pointer-events-none z-0" />

//         <Container className="relative z-10">
//           {/* Top Greeting Header */}
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-6 w-full">
//             <div className="flex flex-col gap-1">
//               <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
//                 WELCOME BACK
//               </span>
//               <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
//                 👋 Hello, <span className="text-[#A855F7]">{userName}</span>
//               </h1>
//             </div>

//             <div className="flex items-center gap-3 shrink-0">
//               <button
//                 onClick={() => navigate('/fast-start-training')}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#130728]/90 border border-[#3E1D75]/80 text-white hover:bg-[#1F0C3F] hover:border-purple-500 transition-all text-xs font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.2)] cursor-pointer"
//               >
//                 <Play size={13} className="fill-emerald-400 text-emerald-400" />
//                 <span>Fast Start Training</span>
//               </button>

//               <button
//                 onClick={() => navigate('/support')}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#130728]/90 border border-[#3E1D75]/80 text-white hover:bg-[#1F0C3F] transition-all text-xs font-semibold cursor-pointer">
//                 <HelpCircle size={14} className="text-purple-300" />
//                 <span>Need Help?</span>
//               </button>
//             </div>
//           </div>
//         </Container>

//         <Container className="relative z-10">
//           <div className="flex flex-col gap-8 pb-12 w-full">
//             {/* 1. YOUR LEARNING JOURNEY (5 FIGMA CARDS) */}
//             <div className="flex flex-col gap-3 w-full">
//               <h2 className="text-sm font-bold text-white tracking-wide">
//                 Your Learning Journey
//               </h2>
//               <div className="w-full overflow-x-auto pb-2 scrollbar-none">
//                 <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[1000px] sm:min-w-0 items-stretch">

//                   {/* Card 1: Academy */}
//                   <div
//                     onClick={() => navigate("/iq-vault")}
//                     className="relative group rounded-[20px] border border-purple-500/60 hover:border-purple-400 overflow-hidden cursor-pointer h-44 flex flex-col justify-end p-4 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_20px_rgba(124,58,237,0.25)] bg-[#0B0418]"
//                   >
//                     <div
//                       className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
//                       style={{ backgroundImage: "url('/media/images/academy_300x300.jpg')" }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#0A0414] via-[#0A0414]/75 to-transparent" />

//                     <div className="relative z-10 flex items-end justify-between w-full">
//                       <div className="flex flex-col gap-1 pr-2">
//                         <div className="w-7 h-7 rounded-lg bg-purple-600/40 border border-purple-400/50 backdrop-blur-md flex items-center justify-center text-purple-200 mb-0.5">
//                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//                             <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
//                             <path d="M6 12v5c3 3 9 3 12 0v-5" />
//                           </svg>
//                         </div>
//                         <h3 className="text-sm font-bold text-white">Academy</h3>
//                         <p className="text-[10px] text-gray-700 line-clamp-2 leading-tight">
//                           Build your foundation with core education.
//                         </p>
//                       </div>
//                       <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600 transition-all shadow-md">
//                         <ChevronRight size={14} className="text-white ml-0.5" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card 2: Strategies */}
//                   <div
//                     onClick={() => window.open("https://base.iqonic.life/login.html", "_blank")}
//                     className="relative group rounded-[20px] border border-blue-500/60 hover:border-blue-400 overflow-hidden cursor-pointer h-44 flex flex-col justify-end p-4 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_20px_rgba(59,130,246,0.25)] bg-[#0B0418]"
//                   >
//                     <div
//                       className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
//                       style={{ backgroundImage: "url('/media/images/iqcharts_400x300.jpg')" }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#0A0414] via-[#0A0414]/75 to-transparent" />

//                     <div className="relative z-10 flex items-end justify-between w-full">
//                       <div className="flex flex-col gap-1 pr-2">
//                         <div className="w-7 h-7 rounded-lg bg-blue-600/40 border border-blue-400/50 backdrop-blur-md flex items-center justify-center text-blue-200 mb-0.5">
//                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//                             <line x1="18" y1="20" x2="18" y2="10" />
//                             <line x1="12" y1="20" x2="12" y2="4" />
//                             <line x1="6" y1="20" x2="6" y2="14" />
//                           </svg>
//                         </div>
//                         <h3 className="text-sm font-bold text-white">Strategies</h3>
//                         <p className="text-[10px] text-gray-700 line-clamp-2 leading-tight">
//                           Learn proven strategies and advanced techniques.
//                         </p>
//                       </div>
//                       <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all shadow-md">
//                         <ChevronRight size={14} className="text-white ml-0.5" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card 3: Live Streams */}
//                   <div
//                     onClick={() => navigate("/iq-academy")}
//                     className="relative group rounded-[20px] border border-fuchsia-500/70 hover:border-fuchsia-400 overflow-hidden cursor-pointer h-44 flex flex-col justify-end p-4 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_25px_rgba(217,70,239,0.35)] bg-[#0B0418]"
//                   >
//                     <div
//                       className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
//                       style={{ backgroundImage: "url('/media/images/livestream_400x300.jpg')" }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#0A0414] via-[#0A0414]/75 to-transparent" />

//                     <div className="relative z-10 flex items-end justify-between w-full">
//                       <div className="flex flex-col gap-1 pr-2">
//                         <div className="w-7 h-7 rounded-lg bg-fuchsia-600/50 border border-fuchsia-400/50 backdrop-blur-md flex items-center justify-center text-fuchsia-200 mb-0.5">
//                           <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
//                             <path d="M8 5v14l11-7z" />
//                           </svg>
//                         </div>
//                         <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
//                           Live Streams
//                           <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
//                         </h3>
//                         <p className="text-[10px] text-gray-700 line-clamp-2 leading-tight">
//                           Join our live sessions.
//                         </p>
//                       </div>
//                       <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-fuchsia-600 transition-all shadow-md">
//                         <ChevronRight size={14} className="text-white ml-0.5" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card 4: Strategy Alerts */}
//                   <div
//                     onClick={() => navigate("/trading-signals")}
//                     className="relative group rounded-[20px] border border-amber-500/60 hover:border-amber-400 overflow-hidden cursor-pointer h-44 flex flex-col justify-end p-4 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_20px_rgba(245,158,11,0.25)] bg-[#0B0418]"
//                   >
//                     <div
//                       className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
//                       style={{ backgroundImage: "url('/media/images/iqsocial_400x300.jpg')" }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#0A0414] via-[#0A0414]/75 to-transparent" />

//                     <div className="relative z-10 flex items-end justify-between w-full">
//                       <div className="flex flex-col gap-1 pr-2">
//                         <div className="w-7 h-7 rounded-lg bg-amber-600/40 border border-amber-400/50 backdrop-blur-md flex items-center justify-center text-amber-200 mb-0.5">
//                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//                             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
//                             <path d="M13.73 21a2 2 0 0 1-3.46 0" />
//                           </svg>
//                         </div>
//                         <h3 className="text-sm font-bold text-white">Strategy Alerts</h3>
//                         <p className="text-[10px] text-gray-700 line-clamp-2 leading-tight">
//                           Real-time alerts from IQONIC strategies.
//                         </p>
//                       </div>
//                       <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-amber-600 transition-all shadow-md">
//                         <ChevronRight size={14} className="text-white ml-0.5" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Card 5: Ideas & Insights */}
//                   <div
//                     onClick={() => navigate("/ideas")}
//                     className="relative group rounded-[20px] border border-yellow-500/60 hover:border-yellow-400 overflow-hidden cursor-pointer h-44 flex flex-col justify-end p-4 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_20px_rgba(234,179,8,0.25)] bg-[#0B0418]"
//                   >
//                     <div
//                       className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
//                       style={{ backgroundImage: "url('/media/images/1400x400 banner.jpg')" }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#0A0414] via-[#0A0414]/75 to-transparent" />

//                     <div className="relative z-10 flex items-end justify-between w-full">
//                       <div className="flex flex-col gap-1 pr-2">
//                         <div className="w-7 h-7 rounded-lg bg-yellow-600/40 border border-yellow-400/50 backdrop-blur-md flex items-center justify-center text-yellow-200 mb-0.5">
//                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//                             <path d="M9 18h6" />
//                             <path d="M10 22h4" />
//                             <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.6 2.9 1.5 3.9.76.76 1.23 1.52 1.41 2.5" />
//                           </svg>
//                         </div>
//                         <h3 className="text-sm font-bold text-white">Ideas & Insights</h3>
//                         <p className="text-[10px] text-gray-700 line-clamp-2 leading-tight">
//                           Explore market ideas, insights, and live trading setups.
//                         </p>
//                       </div>
//                       <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-yellow-600 transition-all shadow-md">
//                         <ChevronRight size={14} className="text-white ml-0.5" />
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             </div>

//             {/* 2. MAIN 2-COLUMN LAYOUT (FIGMA MATCH) */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start w-full">

//               {/* LEFT COLUMN: YOUR SOCIAL FEED */}
//               <div className="lg:col-span-7 flex flex-col gap-4 w-full min-w-0">
//                 <div className="flex items-center justify-between w-full pb-1">
//                   <h2 className="text-sm font-bold text-white tracking-wide">
//                     Your Social Feed
//                   </h2>
//                   <button className="text-gray-400 hover:text-white p-1 transition cursor-pointer">
//                     <Filter size={16} />
//                   </button>
//                 </div>

//                 {/* Filter Pills */}
//                 <div className="flex items-center gap-2">
//                   {["ALL", "CORPORATE", "EDUCATION"].map((pill) => (
//                     <button
//                       key={pill}
//                       onClick={() => setSocialType(pill)}
//                       className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${socialType === pill
//                         ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
//                         : "bg-[#130728] text-gray-400 border border-purple-900/30 hover:text-white"
//                         }`}
//                     >
//                       {pill}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Feed Cards List */}
//                 <div className="flex flex-col gap-4 mt-2">
//                   {isPostsLoading ? (
//                     <div className="text-center py-10 text-gray-500">Loading feed...</div>
//                   ) : posts.length > 0 ? (
//                     posts.map((post) => (
//                       <div
//                         key={post._id}
//                         className="rounded-2xl bg-[#0B0418] border border-purple-900/40 border-l-[4px] border-l-[#8B5CF6] p-4 flex flex-col gap-3 shadow-lg hover:border-purple-600/50 transition-all"
//                       >
//                         <div className="flex items-center gap-3">
//                           <img
//                             src={post.author?.image || "/media/avatars/300-1.jpg"}
//                             alt={post.author?.first_name || "User"}
//                             className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
//                           />
//                           <div className="flex flex-col">
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-bold text-white">
//                                 {post.author?.first_name || "IQONIC"} {post.author?.last_name || "TEAM"}
//                               </span>
//                               <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-900/60 text-purple-300 font-medium">
//                                 EDUCATOR
//                               </span>
//                             </div>
//                             <span className="text-[10px] text-gray-400">
//                               {timeAgo(post.createdAt)}
//                             </span>
//                           </div>
//                         </div>

//                         <p className="text-xs text-gray-200 leading-relaxed">
//                           {post.content?.replace(/<[^>]+>/g, "")}
//                         </p>

//                         {post.mediaUrl && (
//                           <div className="rounded-xl overflow-hidden border border-purple-900/30 mt-1 max-h-80">
//                             <img src={post.mediaUrl} alt="Post media" className="w-full object-cover" />
//                           </div>
//                         )}

//                         <div className="flex items-center gap-6 pt-2 border-t border-purple-900/30 text-gray-400 text-xs">
//                           <button className="flex items-center gap-1.5 hover:text-purple-400 transition cursor-pointer">
//                             <Heart size={14} /> <span>{post.likesCount || 0}</span>
//                           </button>
//                           <button className="flex items-center gap-1.5 hover:text-purple-400 transition cursor-pointer">
//                             <MessageCircle size={14} /> <span>{post.commentsCount || 0}</span>
//                           </button>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center py-12 text-gray-500 text-xs bg-[#0B0418] rounded-2xl border border-purple-900/30">
//                       No posts available right now.
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* RIGHT COLUMN: LIVESTREAMS SCHEDULE & QUICK ACCESS */}
//               <div className="lg:col-span-5 flex flex-col gap-6 w-full min-w-0">
//                 <div className="rounded-2xl bg-[#0B0418] border border-purple-900/40 p-4 flex flex-col gap-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-xs font-bold text-white tracking-wide uppercase">
//                       Livestreams Schedule
//                     </h3>
//                     <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800/40">
//                       EST ▾
//                     </span>
//                   </div>

//                   <div className="flex flex-col gap-3">
//                     {liveStreams.length > 0 ? (
//                       liveStreams.map((stream, idx) => (
//                         <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#130728] border border-purple-900/30">
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-300">
//                               {stream.title?.charAt(0) || "L"}
//                             </div>
//                             <div className="flex flex-col">
//                               <span className="text-xs font-bold text-white">{stream.title}</span>
//                               <span className="text-[10px] text-purple-400">{stream.educatorName || "Educator"}</span>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => navigate("/iq-academy")}
//                             className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold cursor-pointer"
//                           >
//                             Join
//                           </button>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-6 text-gray-500 text-xs">
//                         No live sessions scheduled right now.
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Quick Access Apps Download */}
//                 <div className="rounded-2xl bg-[#0B0418] border border-purple-900/40 p-4 flex items-center justify-between shadow-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
//                       Q
//                     </div>
//                     <div>
//                       <h4 className="text-xs font-bold text-white">IQ Social</h4>
//                       <span className="text-[10px] text-purple-400">10K+ Users</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <button
//                       onClick={() => window.open("https://apps.apple.com/in/app/iq-social/id6752330121", "_blank")}
//                       className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#170B2E] border border-[#3B1F69] text-[10px] font-medium text-white hover:bg-[#25124A] transition-all cursor-pointer"
//                     >
//                       <Download size={11} /> iOS
//                     </button>
//                     <button
//                       onClick={() => window.open("https://play.google.com/store/apps/details?id=com.eductionplatform", "_blank")}
//                       className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#170B2E] border border-[#3B1F69] text-[10px] font-medium text-white hover:bg-[#25124A] transition-all cursor-pointer"
//                     >
//                       <Download size={11} /> Android
//                     </button>
//                   </div>
//                 </div>

//               </div>

//             </div>
//           </div>
//         </Container>

//         {/* Video Lightbox */}
//         {fastStartOpen && (
//           <div
//             className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md"
//             onClick={() => setFastStartOpen(false)}
//           >
//             <div
//               className="relative max-w-4xl w-full bg-[#0A0414] border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="p-4 bg-[#130728] border-b border-purple-900/50 flex items-center justify-between">
//                 <h3 className="text-white text-base font-bold flex items-center gap-2">
//                   <Play size={16} className="text-emerald-400 fill-emerald-400" /> Fast Start Training
//                 </h3>
//                 <button
//                   onClick={() => setFastStartOpen(false)}
//                   className="text-gray-400 hover:text-white p-1 rounded-lg"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
//               <div className="p-4">
//                 <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-900/40">
//                   <iframe
//                     src="https://www.youtube.com/embed/dQw4w9WgXcQ"
//                     title="Fast Start Training Video"
//                     className="w-full h-full border-0"
//                     allowFullScreen
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
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

import "intro.js/introjs.css";
import { Container } from "@/components/container";

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

  const { data: liveEducator } = useGetLiveEducatorListQuery();
  const liveStreams = liveEducator?.streams || [];

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

      <div className="relative min-h-screen bg-[#07030E] text-white overflow-x-hidden -mt-16 pt-20 transition-colors duration-200">
        {/* Radial Background Flare */}
        <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.30),rgba(7,3,14,0))] pointer-events-none z-0" />

        <Container className="relative z-10">
          {/* Header Row: Welcome & Top Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 pb-6 w-full">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#ffffff] uppercase tracking-[0.25em]">
                WELCOME BACK
              </span>
              <h1 className="text-2xl md:text-[30px] font-black text-white tracking-tight flex items-center gap-2">
                <span>👋</span> Hello, <span className="text-[#8B5CF6]">{userName}</span>
              </h1>
            </div>

            {/* Exact Figma Buttons */}
            <div className="flex items-center gap-3.5 shrink-0">
              {/* 1. Fast Start Training Button */}
              <button
                onClick={() => navigate('/fast-start-training')}
                className="group relative flex items-center gap-3 px-4.5 py-2.5 rounded-[16px] bg-gradient-to-b from-[#060D0C] via-[#091715] to-[#0E2E25] border border-white/20 hover:border-emerald-400/60 transition-all duration-300 text-white cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_15px_rgba(0,0,0,0.5)]"
              >
                {/* Inner Muted Dark Circle */}
                <div className="w-8 h-8 rounded-full bg-[#102621] flex items-center justify-center shrink-0 border border-white/10">
                  <Play size={11} className="fill-[#71F3BD] text-[#71F3BD] ml-0.5" />
                </div>
                <span className="text-[14px] font-medium tracking-tight text-white/95 pr-1">
                  Fast Start Training
                </span>
              </button>

              {/* 2. Need Help? Button */}
              <button
                onClick={() => navigate('/support')}
                className="group relative flex items-center gap-3 px-4.5 py-2.5 rounded-[16px] bg-gradient-to-b from-[#0B0714] via-[#120B22] to-[#25153F] border border-white/20 hover:border-purple-400/60 transition-all duration-300 text-white cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_15px_rgba(0,0,0,0.5)]"
              >
                {/* Inner Muted Dark Circle */}
                <div className="w-8 h-8 rounded-full bg-[#1D1236] flex items-center justify-center shrink-0 border border-white/10">
                  <Headphones size={15} className="text-[#D2B5FF]" />
                </div>
                <span className="text-[14px] font-medium tracking-tight text-white/95 pr-1">
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
              <h2 className="text-base font-bold text-white tracking-wide">
                Your Learning Journey
              </h2>
              <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[1000px] sm:min-w-0 items-stretch">

                  {/* Card 1: Academy */}
                  <div
                    onClick={() => navigate("/iq-vault")}
                    className="relative rounded-[22px] border border-[#7C3AED]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-[0_0_20px_rgba(124,58,237,0.25)] bg-[#0C051A]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/academy_300x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#250B48] via-[#1A0736]/80 to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Graduation Cap Icon (No Container Box) */}
                        <div className="text-[#C084FC] mb-1">
                          <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Academy</h3>
                        <p className="text-[11px] text-purple-200/70 line-clamp-2 leading-tight font-normal">
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
                    className="relative rounded-[22px] border border-[#2563EB]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-[0_0_20px_rgba(37,99,235,0.25)] bg-[#0A0E23]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/iqcharts_400x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F225A] via-[#0A1740]/80 to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Bar Chart Icon (No Container Box) */}
                        <div className="text-[#60A5FA] mb-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 19h4v-7H4v7zm6 0h4V5h-4v14zm6 0h4v-11h-4v11z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Strategies</h3>
                        <p className="text-[11px] text-blue-200/70 line-clamp-2 leading-tight font-normal">
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
                    className="relative rounded-[22px] border border-[#C026D3]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-[0_0_20px_rgba(192,38,211,0.25)] bg-[#180524]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/livestream_400x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A0864] via-[#310542]/80 to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Rounded Play Box Icon (Exact Figma Live Stream Icon) */}
                        <div className="text-[#E879F9] mb-1">
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 13V8l6 4-6 4z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Live Streams</h3>
                        <p className="text-[11px] text-fuchsia-200/70 line-clamp-2 leading-tight font-normal">
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
                    className="relative rounded-[22px] border border-[#D97706]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-[0_0_20px_rgba(217,119,6,0.25)] bg-[#1F0E04]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/iqsocial_400x300.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#522304] via-[#361702]/80 to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Bell Icon (No Container Box) */}
                        <div className="text-[#FBBF24] mb-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Strategy Alerts</h3>
                        <p className="text-[11px] text-amber-200/70 line-clamp-2 leading-tight font-normal">
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
                    className="relative rounded-[22px] border border-[#CA8A04]/80 overflow-hidden cursor-pointer h-48 flex flex-col justify-end p-4 shadow-[0_0_20px_rgba(202,138,4,0.25)] bg-[#1A1604]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70"
                      style={{ backgroundImage: "url('/media/images/1400x400 banner.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#473B06] via-[#2F2704]/80 to-transparent" />

                    <div className="relative z-10 flex items-end justify-between w-full">
                      <div className="flex flex-col gap-1 pr-2">
                        {/* Flat Lightbulb Icon (No Container Box) */}
                        <div className="text-[#EAB308] mb-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-bold text-white">Ideas & Insights</h3>
                        <p className="text-[11px] text-yellow-200/70 line-clamp-2 leading-tight font-normal">
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
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Your Social Feed
                  </h2>
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="text-white/80 hover:text-white transition cursor-pointer p-1"
                  >
                    <Filter size={18} />
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  {["ALL", "CORPORATE", "EDUCATION"].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setSocialType(pill)}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${socialType === pill
                          ? "bg-[#251842] text-white border border-[#8B5CF6]/50 shadow-sm"
                          : "bg-[#130728]/80 text-gray-400 border border-[#2D1653] hover:text-white"
                        }`}
                    >
                      {pill === "CORPORATE" && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                        </svg>
                      )}
                      {pill === "EDUCATION" && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                        </svg>
                      )}
                      <span>{pill}</span>
                    </button>
                  ))}
                </div>

                {/* Feed Items List */}
                <div className="flex flex-col gap-4 mt-1">
                  {isPostsLoading ? (
                    <div className="text-center py-10 text-gray-500 text-sm">Loading feed...</div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => {
                      const isCorporate = (post.category || "").toUpperCase() === "CORPORATE";

                      return (
                        <div
                          key={post._id}
                          className="relative rounded-3xl bg-[#07020E] border border-white/10 p-5 flex flex-col gap-4 shadow-2xl transition-all overflow-hidden"
                        >
                          {/* Left Edge Ambient Radial Soft Glow */}
                          <div
                            className={`absolute top-0 bottom-0 left-0 w-48 pointer-events-none opacity-40 ${isCorporate
                                ? "bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-600/50 via-blue-900/10 to-transparent"
                                : "bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-purple-600/50 via-purple-900/10 to-transparent"
                              }`}
                          />

                          {/* Left Accent Border Highlight */}
                          <div
                            className={`absolute top-0 bottom-0 left-0 w-[3px] rounded-l-3xl ${isCorporate ? "bg-[#3B82F6]" : "bg-[#A855F7]"
                              }`}
                          />

                          {/* Header: Avatar + User Details + Options */}
                          <div className="relative z-10 flex items-start justify-between w-full">
                            <div className="flex items-center gap-3">
                              <img
                                src={post.author?.image || "/media/avatars/300-1.jpg"}
                                alt={post.author?.first_name || "User"}
                                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/20 shrink-0"
                              />
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white tracking-tight">
                                    {post.author?.first_name || "IQONIC"} {post.author?.last_name || "TEAM"}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    • {timeAgo(post.createdAt)}
                                  </span>
                                </div>

                                {/* Category & Post Type Labels */}
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 border ${isCorporate
                                        ? "bg-[#162B54]/70 text-[#93C5FD] border-[#2563EB]/40"
                                        : "bg-[#3B1F6A]/70 text-[#D8B4FE] border-[#6B3BA7]/50"
                                      }`}
                                  >
                                    {isCorporate ? (
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                                      </svg>
                                    ) : (
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                                      </svg>
                                    )}
                                    {post.category || "EDUCATION"}
                                  </span>

                                  <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#2A154D]/70 text-[#D8B4FE] border border-[#52298A]/50">
                                    POST
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Options Dot */}
                            <button className="text-gray-400 hover:text-white transition cursor-pointer text-base">
                              •••
                            </button>
                          </div>

                          {/* Post Content Text */}
                          <p className="relative z-10 text-xs text-white/90 font-normal leading-relaxed tracking-normal pr-2">
                            {post.content?.replace(/<[^>]+>/g, "")}
                          </p>

                          {/* Media Attachment if available */}
                          {post.mediaUrl && (
                            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 mt-1 max-h-80">
                              <img src={post.mediaUrl} alt="Post media" className="w-full object-cover" />
                            </div>
                          )}

                          {/* Footer Action Bar */}
                          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-gray-300 text-xs mt-1">
                            <div className="flex items-center gap-6">
                              <button className="flex items-center gap-2 hover:text-purple-400 transition cursor-pointer">
                                <Heart size={18} />
                                <span className="text-xs font-medium text-white/80">{post.likesCount || 0}</span>
                              </button>

                              <button className="flex items-center gap-2 hover:text-purple-400 transition cursor-pointer">
                                <MessageCircle size={18} />
                                <span className="text-xs font-medium text-white/80">{post.commentsCount || 0}</span>
                              </button>

                              <button className="flex items-center gap-2 hover:text-purple-400 transition cursor-pointer">
                                <Share2 size={18} />
                                <span className="text-xs font-medium text-white/80">{post.sharesCount || 0}</span>
                              </button>
                            </div>

                            {/* Bookmark Icon */}
                            <button className="text-gray-400 hover:text-white transition cursor-pointer">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                              </svg>
                            </button>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs bg-[#07020E] rounded-3xl border border-white/10">
                      No posts available right now.
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: LIVESTREAMS SCHEDULE */}
              <div className="lg:col-span-5 flex flex-col gap-5 w-full min-w-0">

                {/* Header: Title & View Calendar (Outside Main Card Container) */}
                <div className="flex items-start justify-between w-full px-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.22em]">
                      TODAY'S SCHEDULE
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Livestreams
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate("/iq-academy")}
                    className="text-xs font-medium text-gray-400 hover:text-white transition cursor-pointer pt-2 flex items-center gap-1"
                  >
                    <span>View calendar</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                {/* Main Card Container */}
                <div className="rounded-t-[32px] rounded-b-[24px] bg-[#05020A] border border-white/10 p-5 flex flex-col gap-5 shadow-2xl min-h-[480px]">

                  {/* Timezone Selector Row ("EST v") */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 pl-1 pb-1 cursor-pointer hover:text-white transition">
                    <span>EST</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>

                  {/* Livestreams List with Timeline */}
                  <div className="flex flex-col gap-3 relative">
                    {liveStreams.length > 0 ? (
                      <div className="relative space-y-3">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-[112px] top-6 bottom-6 w-[1px] bg-[#221742]" />

                        {liveStreams.map((stream, idx) => {
                          const isLiveNow = stream.isLive || idx === 0; // First stream or isLive boolean

                          return (
                            <div
                              key={idx}
                              className={`relative flex items-center gap-3 p-3.5 rounded-2xl transition-all ${isLiveNow
                                ? "bg-[#0B0B26] border border-[#23235A] shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                                : "bg-transparent hover:bg-white/[0.02]"
                                }`}
                            >
                              {/* Time Label */}
                              <span className="text-xs font-bold text-white tracking-tight w-16 shrink-0 text-left">
                                {stream.time || "10:00 am"}
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
                                    src={stream.educatorImage || stream.image || "/media/avatars/300-1.jpg"}
                                    alt={stream.educatorName || "Educator"}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-[#38266D] shrink-0"
                                  />
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-[#A5B4FC] uppercase tracking-wider">
                                      {stream.educatorName || "JAY BONHAM"}
                                    </span>
                                    <span className="text-sm font-bold text-white tracking-tight leading-snug">
                                      {stream.title || "NY Open Session"}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-medium">
                                      {stream.category || "Forex Academy"}
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
                  <h3 className="text-xl font-bold text-white tracking-tight px-1">
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