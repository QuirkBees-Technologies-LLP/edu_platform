import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react'; // For the send iconimport { Link } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { Sparkles, TrendingUpDown } from 'lucide-react';
import { Bitcoin, BarChart3, ArrowRight } from 'lucide-react';


const IqEducators = () => {
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

        const courses = [
        {
            id: 1,
            title: 'Market Outlook',
            address: 'WED, FEB 16, 12:30 CET',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 2,
            title: 'Market Outlook',
            address: 'WED, FEB 16, 12:30 CET',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 3,
            title: 'Market Outlook',
            address: 'WED, FEB 16, 12:30 CET',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 4,
            title: 'Market Outlook',
            address: 'WED, FEB 16, 12:30 CET',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 5,
            title: 'Market Outlook',
            address: 'WED, FEB 16, 12:30 CET',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 6,
            title: 'Market Outlook',
            address: 'WED, FEB 16, 12:30 CET',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        ];

        const [messages, setMessages] = useState([
            {
                id: 1,
                sender: 'Mr. Anderson',
                time: '1 Day ago',
                text: 'Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I\'ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?',
            },
            {
                id: 2,
                sender: 'Mrs. Anderson',
                time: '1 Day ago',
                text: 'Long before you sit dow to put digital pen to paper.',
            },
        ]);

        // State for the new message input
        const [newMessage, setNewMessage] = useState('');

        // Ref for the messages container to enable auto-scrolling
        const messagesEndRef = useRef(null);

        // Function to scroll to the bottom of the messages
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        // Scroll to bottom whenever messages update
        useEffect(() => {
            scrollToBottom();
        }, [messages]);

        // Handle sending a new message
        const handleSendMessage = (e) => {
            e.preventDefault(); // Prevent form submission and page reload
            if (newMessage.trim() === '') return; // Don't send empty messages

            const newId = messages.length > 0 ? Math.max(...messages.map(msg => msg.id)) + 1 : 1;
            const now = new Date();
            const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`; // Basic time

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: newId,
                    sender: 'You', // Assuming the user is "You"
                    time: 'Just now', // Can be improved to actual time or "X minutes ago"
                    text: newMessage.trim(),
                },
            ]);
            setNewMessage(''); // Clear the input field
        };
        const [activeTab, setActiveTab] = useState("feed");
        const data = activeTab === "feed" ? feedData : ideasData;
  return (
    <div className="container-fluid pb-10">
        <div className="bg-gradient-to-r from-[#2B44D3] to-[#0D0D21] rounded-2xl mb-10 p-8 sm:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <img
                src="/media/avatars/2.jpg" 
                alt="Ralph Danquah"
                className="w-20 h-20 object-cover rounded-full border-2 border-white"
                />
                <div>
                <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                    Ralph Danquah
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm">
                    Forex Day Trading, Price Action, Risk Management
                </p>
                </div>
            </div>

            <button className="border border-[#5A4FFF] text-white px-4 py-1 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1 hover:bg-[#5A4FFF] transition">
                <span>✓</span> Follow
            </button>
        </div>

        <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
            {/* Main Content */}
            <div className="col-span-12 xl:col-span-8 space-y-8">
                <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 lg:gap-x-8 md:gap-y-8">
                        <div className="col-span-12 lg:col-span-12">
                            <div className="card rounded-none rounded-b-xl">
                                <img src="/media/images/2600x1600/iq_educators.jpg" alt="" className='w-full h-full rounded-xl object-cover'/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-gray-900 mb-28">
                    <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-medium">Recordings</h2>
                            
                        </div>
                    </div>

                    <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
                        <div className="flex gap-4">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="w-1/3  border rounded-xl shadow-sm flex-shrink-0"
                                >
                                    <div className="rounded-t-xl overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-36 object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-md font-normal mb-2">{course.title}</h3>
                                        <p className="text-xs text-gray-600">{course.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-gray-900 mb-28">
                    <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-medium">Courses</h2>
                            
                        </div>
                    </div>

                    <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
                        <div className="flex gap-4">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="w-1/3  border rounded-xl shadow-sm flex-shrink-0"
                                >
                                    <div className="rounded-t-xl overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-36 object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-md font-normal mb-2">{course.title}</h3>
                                        <p className="text-xs text-gray-600">{course.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Sidebar */}
            <div className="col-span-12 xl:col-span-4">
                <div className="grid grid-cols-12 gap-6">
                    <div className='col-span-12 md:col-span-6 xl:col-span-12 space-y-6'>
                        <div className="flex items-center justify-center bg-gray-100">
                            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
                                {/* Chatbox Header */}
                                <div className="bg-[#1f103f] text-white p-4 rounded-t-xl">
                                    <h2 className="text-white font-semibold text-sm">Chatbox</h2>
                                </div>

                                {/* Messages Area */}
                                <div className="p-4 h-[400px] overflow-y-auto flex flex-col space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id} className="flex flex-col">
                                            <div className="text-sm text-gray-700 font-semibold">
                                                {message.sender} <span className="text-gray-500 font-normal ml-1">{message.time}</span>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 break-words">
                                                {message.text}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Empty div for scrolling to the end */}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            placeholder="your comment.."
                                            className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-roboto text-gray-800"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            aria-label="Send message"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 xl:col-span-12">
                        <div className="card rounded-2xl shadow-md overflow-hidden">
                            {/* Header */}
                            <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
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
                            <div className="p-4 space-y-3 live_updates overflow-auto">
                                {updates.map((update) => (
                                    <div key={update.id} className="bg-[#F5F2FF] dark:bg-gray-100 rounded-xl p-4">
                                        <div className="flex flex-col gap-4 mb-4">
                                            <img
                                                src={update.avatar}
                                                alt={update.name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div>
                                                <h4 className="text-sm font-normal mb-1 text-gray-900">
                                                    {update.name}
                                                </h4>
                                                <p className="text-xs font-normal text-gray-600">{update.time}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-normal text-gray-700">{update.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default IqEducators