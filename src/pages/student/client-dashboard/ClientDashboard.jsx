import React, { useState } from 'react'
import { Sparkles, TrendingUpDown } from 'lucide-react';
import { Bitcoin, BarChart3, ArrowRight } from 'lucide-react';
import { Calendar, Target, Users, Trophy, Clock } from 'lucide-react';
import { Zap, Lightbulb } from 'lucide-react';
import { MessageCircle, ThumbsUp, Megaphone } from 'lucide-react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
const ClientDashboard = () => {
    const { auth } = useAuthContext();

    console.log(auth)
    const userName = auth?.user?.name;
    const categories = [
        {
            id: 'forex',
            title: 'FOREX',
            icon: <TrendingUpDown className="w-12 h-12" />,
            description: 'Master the world\'s largest financial market with professional strategies',
            gradient: 'from-purple-600 to-indigo-600',
            hoverGradient: 'from-purple-700 to-indigo-700'
        },
        {
            id: 'crypto',
            title: 'CRYPTO',
            icon: <Bitcoin className="w-12 h-12" />,
            description: 'Navigate the digital revolution with confidence and expertise',
            gradient: 'from-orange-500 to-yellow-500',
            hoverGradient: 'from-orange-600 to-yellow-600'
        },
        {
            id: 'stocks',
            title: 'STOCK OPTIONS',
            icon: <BarChart3 className="w-12 h-12" />,
            description: 'Master options trading strategies for consistent returns',
            gradient: 'from-emerald-500 to-teal-500',
            hoverGradient: 'from-emerald-600 to-teal-600'
        }
    ];
    const sessions = [
        {
            id: 0,
            title: 'Bitcoin Market Analysis',
            educator: 'Jane Doe',
            avatar: 'JD',
            viewers: 245,
            gradient: 'from-purple-600 to-indigo-600'
        },
        {
            id: 1,
            title: 'Forex Fundamentals',
            educator: 'Mike Smith',
            avatar: 'MS',
            viewers: 189,
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            id: 2,
            title: 'Options Trading Basics',
            educator: 'Sarah Chen',
            avatar: 'SC',
            viewers: 312,
            gradient: 'from-purple-600 to-indigo-600'
        },
        {
            id: 3,
            title: 'Altcoin Deep Dive',
            educator: 'Alex Wong',
            avatar: 'AW',
            viewers: 156,
            gradient: 'from-orange-500 to-yellow-500'
        },
        {
            id: 4,
            title: 'Technical Analysis Masterclass',
            educator: 'David Kim',
            avatar: 'DK',
            viewers: 278,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 5,
            title: 'Risk Management Strategies',
            educator: 'Emma Wilson',
            avatar: 'EW',
            viewers: 203,
            gradient: 'from-pink-500 to-rose-500'
        }
    ];

    // const [activeTab, setActiveTab] = useState<'news' | 'feed'>('news');
    const newsItems = [
        {
            id: 1,
            type: 'ANNOUNCEMENT',
            title: 'New Forex Trading Course Launch',
            excerpt: 'Master the fundamentals of forex trading with our comprehensive new course...',
            time: '10 mins ago',
            badge: 'bg-purple-600'
        },
        {
            id: 2,
            type: 'UPDATE',
            title: 'Platform Maintenance Complete',
            excerpt: 'All systems are operational. Thank you for your patience...',
            time: '2 hours ago',
            badge: 'bg-blue-600'
        },
        {
            id: 3,
            type: 'EVENT',
            title: 'Weekly Trading Competition',
            excerpt: 'Join our weekly competition with $10,000 in prizes...',
            time: '5 hours ago',
            badge: 'bg-green-600'
        },
        {
            id: 4,
            type: 'ALERT',
            title: 'Market Volatility Warning',
            excerpt: 'High volatility expected in crypto markets due to regulatory news...',
            time: '1 day ago',
            badge: 'bg-orange-600'
        },
        {
            id: 5,
            type: 'FEATURE',
            title: 'New Trading Tools Released',
            excerpt: 'Advanced charting tools and indicators now available in your dashboard...',
            time: '2 days ago',
            badge: 'bg-indigo-600'
        }
    ];

    const feedItems = [
        {
            id: 1,
            author: 'Jane Doe',
            avatar: 'JD',
            message: '🚀 BTC breaking through resistance! This is exactly what we discussed in today\'s session.',
            likes: 42,
            comments: 15,
            time: '2 mins ago',
            gradient: 'from-purple-600 to-indigo-600'
        },
        {
            id: 2,
            author: 'Mike Smith',
            avatar: 'MS',
            message: 'New strategy alert! 🌟 Amazing setup we\'ll cover in tomorrow\'s session.',
            likes: 28,
            comments: 9,
            time: '15 mins ago',
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            id: 3,
            author: 'Sarah Chen',
            avatar: 'SC',
            message: 'Options flow showing unusual activity in tech stocks. Great learning opportunity! 📊',
            likes: 35,
            comments: 12,
            time: '1 hour ago',
            gradient: 'from-purple-600 to-indigo-600'
        },
        {
            id: 4,
            author: 'David Kim',
            avatar: 'DK',
            message: 'Technical analysis update: Key support levels holding strong across major pairs 💪',
            likes: 19,
            comments: 7,
            time: '3 hours ago',
            gradient: 'from-blue-500 to-cyan-500'
        }
    ];

    const updates = [
        {
            id: 1,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-14.png"
        },
        {
            id: 2,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-15.png"
        },
        {
            id: 3,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-16.png"
        }
    ];

    const feedData = [
        {
            id: 1,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-14.png"
        },
        {
            id: 2,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-15.png"
        },
        {
            id: 3,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-16.png"
        }, {
            id: 4,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-16.png"
        }
    ];

    const ideasData = [
        {
            id: 1,
            name: "Jenny Klabber",
            time: "Week ago",
            message: "I just released a new bootcamp covering my trading strategy.",
            avatar: "/media/avatars/300-14.png"
        }
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
    const data = activeTab === "feed" ? feedData : ideasData;
    return (
        <>
            <div className="container-fluid pb-8">
                <div className="relative welcome_banner w-full mb-10 rounded-xl overflow-hidden">
                    <div className="relative z-1 flex items-center justify-center md:justify-end h-full p-4">
                        <div className="xl:hidden absolute inset-0 bg-black/40"></div>
                        <div className="text-center z-1">
                            <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200 md:pr-20">
                                <span className="text-xl text-gray-50 font-medium tracking-widest">RISE ABOVE ORDINARY</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
                    {/* Main Content */}
                    <div className="col-span-12 xl:col-span-8">
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 lg:gap-x-8 md:gap-y-8">
                                <div className="col-span-12 lg:col-span-12">
                                    <div className="card rounded-none rounded-b-xl relative">
                                        <div className="card-body p-0 relative">
                                            <img
                                                src="/media/images/2600x1600/banner_1.jpg"
                                                className="w-full h-72 object-cover rounded-t-xl"
                                                alt=""
                                            />
                                            <div className="xl:hidden rounded-xl absolute inset-0 bg-black/40"></div>
                                            {/* <span className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-11 text-2xl text-gray-50 font-medium tracking-widest">
                                                COURSES
                                            </span> */}
                                        </div>

                                        <div className="p-4 md:p-7">
                                            <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
                                                <h5 className="font-semibold text-gray-900 text-md">IQ Vault</h5>
                                                <Link to="/iq-vault">
                                                    <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                                                        View IQ Vault
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 lg:col-span-12">
                                    <div className="card rounded-none rounded-b-xl relative">
                                        <div className="card-body p-0 relative">
                                            <img
                                                src="/media/images/2600x1600/banner_2.jpg"
                                                className="w-full h-72 object-cover rounded-t-xl"
                                                alt=""
                                            />
                                            <div className="xl:hidden rounded-xl absolute inset-0 bg-black/40"></div>
                                            {/* <span className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-11 text-2xl text-gray-50 font-medium tracking-widest">
                                                MENTORSHIP
                                            </span> */}
                                        </div>

                                        <div className="p-4 md:p-7">
                                            <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
                                                <h5 className="font-semibold text-gray-900 text-md">IQ Academy</h5>
                                                <Link to="/iq-academy">
                                                    <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                                                        View IQ Academy
                                                    </button>
                                                </Link>
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
                                                className="w-full h-72 object-cover rounded-t-xl"
                                                alt=""
                                            />
                                            {/* <span className="absolute inset-0 flex items-center justify-center md:justify-start md:pl-11 text-2xl text-gray-50 font-medium tracking-widest">
                                                GUIDANCE
                                            </span> */}
                                        </div>

                                        <div className="p-4 md:p-7 rounded-b-xl relative z-0">
                                            <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
                                                <h5 className="font-semibold text-gray-900 text-md">IQ Strategies</h5>
                                                <Link to="/iq-strategies">
                                                    <button className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">
                                                        View Strategies
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 xl:col-span-4">
                        <div className="grid grid-cols-12 gap-6">
                            <div className='col-span-12 md:col-span-6 xl:col-span-12 space-y-6'>
                                <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                                    <img
                                        src="/media/images/2600x1600/fast_start.jpg"
                                        alt="Fast Start Training"
                                        className="w-full h-96 object-cover"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-[linear-gradient(178.03deg,rgba(43,76,107,0)_35.61%,rgba(0,0,0,0.8)_91.24%)]
                  transition duration-300"></div>

                                    {/* Default Content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-4 pb-11 z-1">
                                        <h2 className="text-gray-100 dark:text-gray-900 text-2xl font-bold tracking-wide">
                                            FAST START <br /> TRAINING
                                        </h2>
                                        <Link to="/fast-start-training">
                                            <button className="mt-4 px-6 py-2 bg-white/10 backdrop-blur-sm text-gray-100 text-sm 
                       font-normal btn-lg rounded-2xl border border-white/30 
                       hover:bg-white/20 transition dark:text-gray-900">
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
                                        <h3 className="text-white font-semibold text-sm">Live Now</h3>
                                        <div className="flex space-x-2">
                                            <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-500"></span>
                                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                            <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                            <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        </div>
                                    </div>
                                    <Swiper
                                        modules={[Pagination, Autoplay]}
                                        spaceBetween={20}
                                        slidesPerView={1}
                                        pagination={{ clickable: true }}
                                        autoplay={{ delay: 3000 }}
                                        className="w-full border-none"
                                    >
                                        {slides.map((slide, index) => (
                                            <SwiperSlide key={index}>
                                                <div className="card shadow-md rounded-none overflow-hidden">
                                                    <div className="relative h-96 rounded-none overflow-hidden shadow-lg">
                                                        <img
                                                            src={slide.image}
                                                            alt={slide.title}
                                                            className="w-full h-full object-cover"
                                                        />

                                                        <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-4 pb-11">
                                                            <h2 className="text-gray-100 dark:text-gray-900 text-2xl font-bold tracking-wide">
                                                                {slide.title}

                                                            </h2>

                                                            <button className="mt-4 px-6 py-2 bg-white/10 backdrop-blur-sm text-gray-100 dark:text-gray-900 text-sm font-normal btn-lg  rounded-2xl border border-white/30 hover:bg-white/20 transition">
                                                                Watch Live
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                    {/* <div className="relative h-96 rounded-b-2xl overflow-hidden shadow-lg">
                                        <img
                                            src="/media/images/2600x1600/watch_live.jpg"
                                            alt="Fast Start Training"
                                            className="w-full h-full object-cover"
                                        />

                                        <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-4 pb-11">
                                            <h2 className="text-gray-100 dark:text-gray-900 text-2xl font-bold tracking-wide">
                                                RALPH  <br /> DANQUAH
                                            </h2>

                                            <button className="mt-4 px-6 py-2 bg-white/10 backdrop-blur-sm text-gray-100 dark:text-gray-900 text-sm font-normal btn-lg  rounded-2xl border border-white/30 hover:bg-white/20 transition">
                                                Watch Live
                                            </button>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-6 xl:col-span-12">
                                <div className="card rounded-2xl shadow-md overflow-hidden relative group">
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gray-300 dark:bg-gray-100 opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 z-10 flex flex-col items-center justify-center text-center p-4">
                                        <h3 className="">No This feature is under-development</h3>
                                    </div>

                                    {/* Header */}
                                    <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl relative z-20">
                                        <h3 className="text-white font-semibold text-sm">Live Updates</h3>
                                        <div className="flex space-x-2 bg-[#2D265F] rounded-full p-1">
                                            <button
                                                onClick={() => setActiveTab("feed")}
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${activeTab === "feed" ? "bg-white text-[#1A1446]" : "text-white"
                                                    }`}
                                            >
                                                Feed
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("ideas")}
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${activeTab === "ideas" ? "bg-white text-[#1A1446]" : "text-white"
                                                    }`}
                                            >
                                                Ideas
                                            </button>
                                        </div>
                                    </div>

                                    {/* Updates */}
                                    <div className="p-4 space-y-3 live_updates overflow-auto relative">
                                        {updates.map((update) => (
                                            <div key={update.id} className="bg-[#F5F2FF] dark:bg-gray-100 rounded-xl p-4">
                                                <div className="flex flex-col gap-4 mb-4">
                                                    <img
                                                        src={update.avatar}
                                                        alt={update.name}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    <div>
                                                        <h4 className="text-sm font-normal mb-1 text-gray-900">{update.name}</h4>
                                                        <p className="text-xs font-normal text-gray-600">{update.time}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-normal text-gray-700">{update.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                            <div className='col-span-12'>
                                <button className="w-full bg-blue-gradient p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300  group">
                                    <Link to="/ideas">
                                        <div className="flex items-center justify-center space-x-3">
                                            {/* <Lightbulb className="w-6 h-6" /> */}
                                            <span className='text-md font-normal text-gray-100 dark:text-gray-900'>Go to IQ Insight</span>
                                        </div>
                                    </Link>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ClientDashboard