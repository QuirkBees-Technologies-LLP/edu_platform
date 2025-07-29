import React, { useState } from 'react'
import { Sparkles, TrendingUpDown } from 'lucide-react';
import { Bitcoin, BarChart3, ArrowRight } from 'lucide-react';
import { Calendar, Target, Users, Trophy, Clock } from 'lucide-react';
import { Zap, Lightbulb } from 'lucide-react';
import { MessageCircle, ThumbsUp, Megaphone } from 'lucide-react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/auth';

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
    return (
        <>
            <div className="relative welcome_banner w-full h-80 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
                {/* Animated Background Elements */}
                {/* Main Content */}
                <div className="relative z-1 flex items-center justify-center h-full">
                    <div className="text-center">
                        <div>
                            <h1 className="text-xl md:text-4xl font-bold text-white mb-2 animate-fadeInUp">
                                Welcome, {userName}
                            </h1>
                            <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200">
                                <span className="text-xl text-white/90">Empowering</span>
                                <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                    Growth Through Every Lesson
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8 py-12">
                <div className="grid grid-cols-1 2xl:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="2xl:col-span-3">
                        <div className="mb-8">
                            <div className="mb-8">
                                <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3">
                                    🚀 Explore Our Categories
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Empower your financial journey with expert-led education across multiple markets
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className={`relative group h-96 bg-gradient-to-br ${category.gradient} rounded-2xl p-5 text-white cursor-pointer transform transition-all duration-300  hover:shadow-2xl overflow-hidden`}
                                    >
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full border-2 border-white/20 -translate-y-16 translate-x-16"></div>
                                            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full border-2 border-white/20 translate-y-20 -translate-x-20"></div>
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-1 flex flex-col justify-center h-full">
                                            <div className="mb-6 transform transition-transform duration-300">
                                                {category.icon}
                                            </div>
                                            <h3 className="text-xl font-bold mb-4">{category.title}</h3>
                                            <p className="text-md mb-6 opacity-90 leading-relaxed line-clamp-3">
                                                {category.description}
                                            </p>
                                            <button className="inline-flex items-center space-x-2 bg-white text-gray-900 dark:text-gray-100 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg transform ">
                                                <span>Learn Now!</span>
                                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </button>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-8">
                            {/* Schedule Banner */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 lg:gap-x-8 md:gap-y-8">
                                <div className="col-span-12 lg:col-span-6 2xl:col-span-12">
                                    <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-gray-900 dark:to-gray-100 rounded-2xl p-5 sm:p-8 text-white overflow-hidden group cursor-pointer">
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="sm:hidden absolute top-0 right-0 w-64 h-64 border-2 border-white/20 rounded-full -translate-y-32 translate-x-32"></div>
                                            <div className="sm:hidden absolute bottom-0 left-0 w-80 h-80 border-2 border-white/20 rounded-full translate-y-40 -translate-x-40"></div>
                                        </div>

                                        <div className="relative z-1 max-w-2xl">
                                            <div className="mb-6 transform transition-transform ">
                                                <Calendar className="w-12 h-12" />
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-bold mb-4 line-clamp-1">Live Sessions Schedule</h2>
                                            <p className="text-lg mb-8 opacity-90 leading-relaxed line-clamp-3">
                                                Join our expert educators for comprehensive educational sessions across Crypto, Forex, and Stock Options markets.
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                                                <div className="text-center">
                                                    <div className="text-xl font-bold mb-2 flex items-center justify-center space-x-2">
                                                        <Clock className="w-8 h-8" />
                                                        <span>24+</span>
                                                    </div>
                                                    <div className="text-sm opacity-80">Sessions Weekly</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold mb-2 flex items-center justify-center space-x-2">
                                                        <Users className="w-8 h-8" />
                                                        <span>12</span>
                                                    </div>
                                                    <div className="text-sm opacity-80">Expert Educators</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold mb-2 flex items-center justify-center space-x-2">
                                                        <Trophy className="w-8 h-8" />
                                                        <span>5K+</span>
                                                    </div>
                                                    <div className="text-sm opacity-80">Active Students</div>
                                                </div>
                                            </div>

                                            <button className="inline-flex items-center space-x-3 bg-white  text-gray-900 dark:text-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-xl transform  group">
                                                <span className='text-md'>View Full Schedule</span>
                                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-12 lg:col-span-6 2xl:col-span-12">

                                    {/* Strategies Banner */}
                                    <div className="relative bg-gradient-to-r from-emerald-500 via-teal-600 to-gray-900 dark:to-gray-100 rounded-2xl p-5 sm:p-8 text-white overflow-hidden group cursor-pointer">
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="sm:hidden absolute top-10 right-10 w-48 h-48 border-2 border-white/20 rounded-full"></div>
                                            <div className="sm:hidden absolute bottom-10 left-10 w-56 h-56 border-2 border-white/20 rounded-full"></div>
                                        </div>

                                        <div className="relative z-1 max-w-2xl">
                                            <div className="mb-6 transform transition-transform ">
                                                <Target className="w-12 h-12" />
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-bold mb-4 line-clamp-1">MarketView Strategies</h2>
                                            <p className="text-lg mb-8 opacity-90 leading-relaxed line-clamp-3">
                                                Access proven trading strategies and market analysis tools. Learn from successful patterns and optimize your trading approach.
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                                                <div className="text-center">
                                                    <div className="text-xl font-bold mb-2">50+</div>
                                                    <div className="text-sm opacity-80">Strategies</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold mb-2">Real-time</div>
                                                    <div className="text-sm opacity-80">Market Data</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold mb-2">24/7</div>
                                                    <div className="text-sm opacity-80">Access</div>
                                                </div>
                                            </div>

                                            <Link to="/ideas">
                                                <button className="inline-flex items-center space-x-3 bg-white text-gray-900 dark:text-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-xl transform  group">
                                                    <span className='text-md'>Explore Strategies</span>
                                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="2xl:col-span-1">
                        <div className="space-y-6">
                            {/* Fast Start Card */}
                            <Link to="/video-library">
                                <div className="bg-blue-gradient rounded-2xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-shadow group">
                                    <div className="mb-3 transform transition-transform ">
                                        <Zap className="w-8 h-8 mx-auto" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Fast Start</h3>
                                    <p className="text-sm opacity-90">Begin your trading journey in minutes</p>
                                </div>
                            </Link>

                            {/* Live Carousel */}
                            <div className="grid grid-cols-12 gap-6">
                                {/* Live Now Card */}
                                <div className="col-span-12 md:col-span-6 2xl:col-span-12">
                                    <div className="card rounded-2xl shadow-lg p-6 h-80 overflow-hidden">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                                <Play className="w-5 h-5 text-red-500" />
                                                <span>Live Now</span>
                                            </h4>
                                            <div className="flex items-center space-x-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span>LIVE</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex-1 group relative max-h-64 overflow-y-auto hover:overflow-hidden transition-all duration-300">
                                                <div className="space-y-3 group-hover:opacity-0 group-hover:pointer-events-none">
                                                    {sessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="flex items-center space-x-3 p-3 bg-gray-100 transition-all duration-300 cursor-pointer hover:bg-gray-200"
                                                        >
                                                            <div
                                                                className={`w-12 h-12 rounded-full bg-gradient-to-br ${session.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                                                            >
                                                                {session.avatar}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-semibold text-gray-900 mb-1 text-sm truncate">
                                                                    {session.title}
                                                                </h5>
                                                                <p className="text-xs text-gray-600 mb-2 truncate">{session.educator}</p>
                                                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                                    <div className="flex items-center space-x-1">
                                                                        <Users className="w-3 h-3" />
                                                                        <span>{session.viewers}</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <Clock className="w-3 h-3" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center transition-opacity duration-300">
                                                    <p className="text-sm text-red-500 font-semibold text-center">
                                                        This feature is under-development
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Updates Card */}
                                <div className="col-span-12 md:col-span-6 2xl:col-span-12">
                                    <div className="card rounded-2xl shadow-lg p-6 h-80 overflow-hidden">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                                <Megaphone className="w-5 h-5 text-orange-500" />
                                                <span>Live Updates</span>
                                            </h4>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex-1 group relative max-h-64 overflow-y-auto hover:overflow-hidden transition-all duration-300">
                                                <div className="space-y-3 group-hover:opacity-0 group-hover:pointer-events-none">
                                                    {sessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="flex items-center space-x-3 p-3 bg-gray-100 transition-all duration-300 cursor-pointer hover:bg-gray-200"
                                                        >
                                                            <div
                                                                className={`w-12 h-12 rounded-full bg-gradient-to-br ${session.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                                                            >
                                                                {session.avatar}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-semibold text-gray-900 mb-1 text-sm truncate">
                                                                    {session.title}
                                                                </h5>
                                                                <p className="text-xs text-gray-600 mb-2 truncate">{session.educator}</p>
                                                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                                    <div className="flex items-center space-x-1">
                                                                        <Users className="w-3 h-3" />
                                                                        <span>{session.viewers}</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        <Clock className="w-3 h-3" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center transition-opacity duration-300">
                                                    <p className="text-sm text-red-500 font-semibold text-center">
                                                        This feature is under-development
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* IQ Ideas Button */}
                            <button className="w-full bg-blue-gradient text-white p-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300  group">
                                <Link to="/ideas">
                                    <div className="flex items-center justify-center space-x-3">
                                        <Lightbulb className="w-6 h-6" />
                                        <span>Check out IQ Ideas</span>
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ClientDashboard