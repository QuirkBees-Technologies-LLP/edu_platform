import { CirclePlay } from 'lucide-react';
import React, { useState } from 'react';

export default function FastStartTraining() {
    const [activeTab, setActiveTab] = useState('Backoffice');
    
    const tabs = [
        {
            id: 'Backoffice', name: 'Backoffice', content:
                <>
                    <div className="md:col-span-2">
                        <div className="card">
                            <iframe className="w-full aspect-video" src="https://www.youtube.com/..." title="Training Video"></iframe>
                            <div className="px-6 py-8 rounded-bl-md rounded-br-md">
                                <h3 className="text-sm tracking-widest font-normal text-gray-600 mb-2">TRADING BASICS</h3>
                                <div className='flex flex-col sm:flex-row items-start sm:items-center flex-wrap justify-between mb-3 gap-2'>
                                    <h4 className="sm:text-2xl font-medium text-gray-900 ">Navigating the Backoffice</h4>
                                    <button className="bg-gray-100  text-sm flex items-center justify-center gap-2 rotate-0 opacity-100 rounded-2xl border border-gray-300 py-3 px-6 whitespace-nowrap">
                                        Mark as Complete
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 ">
                                    Explore exciting collaboration opportunities with our blog. We're open to partnerships, guest posts, and more. Join us to share your insights and grow your audience.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
        },
        { id: 'LMS', name: 'LMS', content: 'Explore the world of cryptocurrencies, blockchain technology, and digital asset trading.' },
        { id: 'Compliance', name: 'Compliance', content: 'Understand stock options, strategies, and how to trade them effectively.' },
        { id: 'Affiliates', name: 'Affiliates', content: 'Understand stock options, strategies, and how to trade them effectively.' },
    ];
    return (
        <div className='container-fluid pb-10'>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Banner */}
                <div className='md:col-span-3'>
                    <div className="bg-[url(../media/images/fast-start-training.jpg)] text-white py-12 rounded-2xl flex justify-center items-center bg-cover bg-center bg-no-repeat h-72 w-full">
                        <div className="text-center">
                            <h1 className="text-3xl font-medium tracking-wider mb-2">FAST START</h1>
                            <p className="text-lg sm:text-xl font-light tracking-widest">TRAINING</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1">
                    <div className="max-h-[690px] overflow-y-auto rounded-xl shadow-md"> {/* Added rounded and shadow */}
                        <div className='bg-blue-950 p-5 rounded-t-xl '>
                            <h6 className='text-sm  text-white font-medium'>Section 1: Backoffice</h6>
                        </div>
                        <div className="w-full   overflow-hidden "> {/* Removed max-w-md, adjusted rounded-lg */}
                            {/* These items will behave as blocks, stacking naturally */}
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Navigating the Backoffice</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Understanding Risk Management</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Types of Orders</span>
                            </div>
                            <div className="flex items-center p-4 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Understanding Risk Management</span>
                            </div>
                        </div>
                        <div className='bg-blue-950 p-5 '>
                            <h6 className='text-sm  text-white font-medium'>Section 2: Fast Start</h6>
                        </div>
                        <div className="w-full  overflow-hidden">
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Tradingview Tutorial</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Candles and Time Frames</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Market structure</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Market structure</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Market structure</span>
                            </div>
                        </div>
                        <div className='bg-blue-950 p-5 '>
                            <h6 className='text-sm text-white font-medium'>Section 3: Fast Start</h6>
                        </div>
                        <div className="w-full rounded-b-xl overflow-hidden">
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Tradingview Tutorial</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Candles and Time Frames</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Market structure</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Market structure</span>
                            </div>
                            <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                <CirclePlay className='mr-2 text-gray-400' />
                                <span className="text-gray-800 font-medium text-xs">Market structure</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="">
                        <div className="mb-6"> {/* Adjusted margin for better spacing */}
                            <div className='flex flex-col sm:flex-row items-start sm:items-center'> {/* Stack on small screens */}
                                {/* <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0 mr-4 ">My Academies</h2> */}

                                <div className="flex gap-3 sm:gap-6 flex-wrap"> {/* Added overflow for tabs on small screens */}
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            className={`pb-4 border-b-2
                                                ${activeTab === tab.id
                                                    ? 'border-black dark:border-white text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                                }`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            {tab.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="rounded-lg mt-6"> {/* Added margin top */}
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
                                    >
                                        {/* If content is string, wrap in p tag */}
                                        {typeof tab.content === 'string' ? (
                                            <p className="text-gray-800 text-base leading-relaxed">{tab.content}</p>
                                        ) : (
                                            tab.content
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* IQ Academy Banner */}
                {/* <div className="md:col-span-3">
                    <div className="w-full bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-lg shadow-xl p-8">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">IQ Academy</h2>
                        <p className="text-gray-300 text-base sm:text-lg mb-6  dark:text-white">
                            Join our expert educators for real-time market analysis and educational sessions <br />
                            across Forex, Crypto, and Stock Options.
                        </p>
                        <button className="bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 shadow-lg transition-all duration-300 ease-in-out rounded-xl ">
                            View Academies
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
