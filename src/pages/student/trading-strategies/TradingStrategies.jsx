import React, { useState } from 'react';
import { Container } from '@/components/container';

const TradingStrategies = () => {
    const strategies = [
        {
            id: 'killshot',
            name: 'Killshot Strategy',
            icon: 'https://via.placeholder.com/80/8a2be2/ffffff?text=K',
            markets: 'Crypto • Forex',
            students: '2.4K',
            videos: '15',
            description: 'Advanced momentum-based strategy for high-volatility markets. Combines RSI, MACD, and volume analysis.',
            about: 'The Killshot Strategy is a comprehensive momentum-based trading approach specifically designed for traders who thrive in high-volatility environments. This advanced strategy has been refined over years of real-world testing in both cryptocurrency and forex markets. At its core, Killshot combines multiple technical indicators including RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), and custom volume analysis to identify explosive momentum opportunities with high probability entries.',
            details: ['Forex', 'Crypto', 'Scalping', 'Day Trading', 'High Volatility', 'Momentum Trading'],
            educators: [
                { name: 'Filipe Forner', photo: 'https://via.placeholder.com/80/8a2be2/ffffff?text=FF' },
                { name: 'Manny Quinones', photo: 'https://via.placeholder.com/80/ff8c00/ffffff?text=MQ' },
                { name: 'Jay Bonham', photo: 'https://via.placeholder.com/80/00cec9/ffffff?text=JB' },
                { name: 'Calvin Becerra', photo: 'https://via.placeholder.com/80/667eea/ffffff?text=CB' }
            ],
            lessons: [
                { title: 'Killshot Introduction & Setup', duration: '12:45', views: '15K' },
                { title: 'Understanding Market Structure', duration: '18:30', views: '12K' },
                { title: 'Advanced Entry Techniques', duration: '22:15', views: '9.8K' },
                { title: 'Risk Management Guide', duration: '16:20', views: '11K' },
                { title: 'Exit Strategies & Take Profits', duration: '19:45', views: '8.5K' }
            ]
        },
        {
            id: 'smartshot',
            name: 'SmartShot Strategy',
            icon: 'https://via.placeholder.com/80/ff8c00/ffffff?text=S',
            markets: 'Forex • Stocks',
            students: '3.1K',
            videos: '12',
            description: 'Swing trading strategy focusing on medium-term trends using smart money concepts and order flow.',
            about: 'SmartShot revolutionizes swing trading by incorporating institutional-level smart money concepts with retail trader accessibility. This sophisticated strategy teaches you to read market manipulation, identify where big money is positioned, and ride medium-term trends with confidence and precision.',
            details: ['Forex', 'Stocks', 'Swing Trading', 'Smart Money', 'Order Flow', 'Position Trading'],
            educators: [
                { name: 'Filipe Forner', photo: 'https://via.placeholder.com/80/8a2be2/ffffff?text=FF' },
                { name: 'Manny Quinones', photo: 'https://via.placeholder.com/80/ff8c00/ffffff?text=MQ' },
                { name: 'Jay Bonham', photo: 'https://via.placeholder.com/80/00cec9/ffffff?text=JB' },
                { name: 'Calvin Becerra', photo: 'https://via.placeholder.com/80/667eea/ffffff?text=CB' }
            ],
            lessons: [
                { title: 'SmartShot Fundamentals', duration: '14:20', views: '11K' },
                { title: 'Order Flow Analysis', duration: '19:45', views: '8.5K' },
                { title: 'Smart Money Concepts', duration: '22:30', views: '10K' },
                { title: 'Swing Trading Setups', duration: '16:30', views: '13K' }
            ]
        },
        {
            id: 'supernova',
            name: 'SuperNova Strategy',
            icon: 'https://via.placeholder.com/80/00cec9/ffffff?text=SN',
            markets: 'All Markets',
            students: '5.2K',
            videos: '18',
            description: 'Beginner-friendly trend-following strategy with clear rules. Works across all timeframes and markets.',
            about: 'SuperNova is designed as the perfect entry point for aspiring traders who want to build a solid foundation in technical analysis and systematic trading. This beginner-friendly strategy removes complexity and focuses on proven trend-following principles with crystal-clear entry and exit rules.',
            details: ['All Markets', 'Forex', 'Crypto', 'Stocks', 'Trend Following', 'Beginner Friendly'],
            educators: [
                { name: 'Filipe Forner', photo: 'https://via.placeholder.com/80/8a2be2/ffffff?text=FF' },
                { name: 'Manny Quinones', photo: 'https://via.placeholder.com/80/ff8c00/ffffff?text=MQ' },
                { name: 'Jay Bonham', photo: 'https://via.placeholder.com/80/00cec9/ffffff?text=JB' },
                { name: 'Calvin Becerra', photo: 'https://via.placeholder.com/80/667eea/ffffff?text=CB' }
            ],
            lessons: [
                { title: 'SuperNova Basics', duration: '10:15', views: '22K' },
                { title: 'Trend Identification', duration: '13:40', views: '19K' },
                { title: 'Entry & Exit Rules', duration: '15:50', views: '16K' },
                { title: 'Indicator Setup Guide', duration: '12:20', views: '18K' }
            ]
        }
    ];

    const [currentStrategy, setCurrentStrategy] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(0);

    const selectStrategy = (strategyId) => {
        const strategy = strategies.find(s => s.id === strategyId);
        setCurrentStrategy(strategy);
        setSelectedLesson(0);
    };

    return (
        <div className="min-h-screen">
            <Container width="fluid" className="mx-auto px-5">
                {/* Banner */}
                <div className="card rounded-2xl px-6 md:px-12 py-10 md:py-20 border border-gray-300 md:min-h-[400px] flex items-center justify-center">
                    <div>
                        <h1 className="text-2xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-500 via-orange-500 to-cyan-400 bg-clip-text text-transparent leading-[1.5]">
                            Trading Strategies
                        </h1>
                        <p className="text-xl text-gray-900">
                            Master proven strategies from industry experts • Elevation is a Lifestyle
                        </p>
                    </div>
                </div>

                {/* Language Filter */}
                <div className="flex justify-end items-center gap-3 my-5">
                    <span className="text-sm font-medium text-gray-800">Language:</span>
                    <select className="px-5 py-3 bg-gray-200 border border-gray-300 rounded-full text-sm cursor-pointer min-w-[180px] !outline-none">
                        <option>Us English</option>
                        <option>🇪🇸 Español</option>
                        <option>🇧🇷 Português</option>
                        <option>🇫🇷 Français</option>
                    </select>
                </div>

                {/* Video and Lessons Container */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Lessons Panel */}
                    {currentStrategy && (
                        <div className="md:w-[350px] card rounded-2xl border border-gray-300 h-[600px] flex flex-col">
                            <div className="p-6 border-b border-gray-300">
                                <h3 className="text-lg font-semibold">{currentStrategy.name}</h3>
                                <p className="text-sm text-gray-900 mt-2">{currentStrategy.lessons.length} Lessons</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3">
                                {currentStrategy.lessons.map((lesson, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedLesson(i)}
                                        className={`p-4 rounded-xl mb-2 cursor-pointer ${selectedLesson === i
                                                ? 'bg-blue-500/20 border border-blue-500'
                                                : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                    >
                                        <div className="text-xs text-gray-800 mb-1">Lesson {i + 1}</div>
                                        <div className="text-sm mb-1">{lesson.title}</div>
                                        <div className="text-xs text-gray-800">⏱️ {lesson.duration}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Video Player */}
                    <div className="flex-1">
                        <div className="card rounded-2xl border border-gray-300 overflow-hidden">
                            <div className="w-full h-[500px] flex items-center justify-center rounded-t-2xl">
                                {currentStrategy ? (
                                    <div className="text-center">
                                        <div className="text-8xl mb-5 opacity-30">▶</div>
                                        <h3 className="text-xl">Playing: {currentStrategy.lessons[selectedLesson].title}</h3>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <div className="text-8xl mb-5 opacity-30">▶</div>
                                        <h3 className="text-xl text-gray-800">Select a strategy to start learning</h3>
                                    </div>
                                )}
                            </div>
                            {currentStrategy && (
                                <div className="p-6 bg-gray-200 rounded-b-2xl">
                                    <h2 className="text-2xl mb-2">{currentStrategy.lessons[selectedLesson].title}</h2>
                                    <div className="text-sm text-gray-900">
                                        {currentStrategy.name} • {currentStrategy.lessons[selectedLesson].duration}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* About Strategy */}
                {currentStrategy && (
                    <div className="card rounded-2xl border border-gray-300 p-8 mb-8">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-300">
                            <img src={currentStrategy.icon} alt={currentStrategy.name} className="w-16 h-16 rounded-xl" />
                            <div>
                                <h3 className="text-2xl font-semibold">{currentStrategy.name}</h3>
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                            <div className="lg:col-span-2">
                                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                    About This Strategy
                                </div>
                                <p className="text-[15px] leading-relaxed text-gray-900">
                                    {currentStrategy.about}
                                </p>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                    Strategy Details
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentStrategy.details.map((detail, i) => (
                                        <span
                                            key={i}
                                            className={`px-4 py-2 rounded-full text-xs font-medium ${i < 2
                                                    ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
                                                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                                                }`}
                                        >
                                            {detail}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Educators Section */}
                        <div className="pt-8 border-t border-white/10">
                            <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">
                                Strategy Educators
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {currentStrategy.educators.map((educator, i) => (
                                    <div key={i} className="flex flex-col items-center text-center">
                                        <img
                                            src={educator.photo}
                                            alt={educator.name}
                                            className="w-20 h-20 rounded-full mb-3 border-2 border-white/10 object-cover"
                                        />
                                        <div className="text-sm font-medium text-gray-900">{educator.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Strategy Cards */}
                <div className="mt-10 pb-12">
                    <h2 className="text-2xl font-semibold mb-6">Available Strategies</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {strategies.map((strategy) => (
                            <div
                                key={strategy.id}
                                onClick={() => selectStrategy(strategy.id)}
                                className={`card rounded-2xl p-6 border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${currentStrategy?.id === strategy.id
                                        ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row gap-4 mb-4">
                                    <img src={strategy.icon} alt={strategy.name} className="w-20 h-20 rounded-xl" />
                                    <div>
                                        <div className="text-xl font-semibold mb-2">{strategy.name}</div>
                                        <div className="text-sm text-gray-900">{strategy.markets}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-900 leading-relaxed mb-4 line-clamp-2">
                                    {strategy.description}
                                </p>
                                <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                                    Start Learning
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default TradingStrategies