import { CirclePlay } from 'lucide-react';
import React from 'react';

export default function FastStartTraining() {
    return (
        <div className="min-h-screen text-gray-900">
            <div className='container mx-auto p-10'>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Banner */}
                    <div className='md:col-span-3'>
                        <div className="bg-[url(../media/images/fast-start-training.jpg)] text-white py-12 rounded-2xl flex justify-center items-center bg-cover bg-center bg-no-repeat h-72 w-full">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold tracking-wider">FAST START</h1>
                                <p className="text-lg sm:text-xl tracking-widest">TRAINING</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="max-h-[750px] overflow-y-auto rounded-xl shadow-md"> {/* Added rounded and shadow */}
                            <div className='bg-blue-950 p-5 rounded-t-xl '>
                                <h6 className='text-base font-roboto text-white font-bold'>Section 1: Backoffice</h6>
                            </div>
                            <div className="w-full   overflow-hidden "> {/* Removed max-w-md, adjusted rounded-lg */}
                                {/* These items will behave as blocks, stacking naturally */}
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Navigating the Backoffice</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Understanding Risk Management</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Types of Orders</span>
                                </div>
                                <div className="flex items-center p-4 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Understanding Risk Management</span>
                                </div>
                            </div>
                            <div className='bg-blue-950 p-5 '>
                                <h6 className='text-base font-roboto text-white font-bold'>Section 2: Fast Start</h6>
                            </div>
                            <div className="w-full  overflow-hidden">
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Tradingview Tutorial</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Candles and Time Frames</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Market structure</span>
                                </div>
                            </div>
                            <div className='bg-blue-950 p-5 '>
                                <h6 className='text-base font-roboto text-white font-bold'>Section 3: Fast Start</h6>
                            </div>
                            <div className="w-full rounded-b-xl overflow-hidden">
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Tradingview Tutorial</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Candles and Time Frames</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 dark:text-white text-base font-roboto">Market structure</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video and Info */}
                    <div className="md:col-span-2">
                        <iframe className="w-full aspect-video" src="https://www.youtube.com/..." title="Training Video"></iframe>
                        <div className="p-4 rounded-bl-md rounded-br-md shadow">
                            <h3 className="text-sm font-normal text-gray-600 mb-2 font-roboto">TRADING BASICS</h3>
                            <div className='flex flex-col sm:flex-row items-start sm:items-center flex-wrap justify-between mb-3 gap-2'>
                                <h4 className="text-2xl sm:text-4xl font-semibold text-gray-900 font-roboto">Navigating the Backoffice</h4>
                                <button className="bg-gray-100 font-roboto text-sm flex items-center justify-center gap-2 rotate-0 opacity-100 rounded-2xl border border-gray-300 py-3 px-6 whitespace-nowrap">
                                    Mark as Complete
                                </button>
                            </div>
                            <p className="text-base text-gray-600 mt-1 font-roboto">
                                Explore exciting collaboration opportunities with our blog. We're open to partnerships, guest posts, and more. Join us to share your insights and grow your audience.
                            </p>
                        </div>
                    </div>

                    {/* IQ Academy Banner */}
                    <div className="md:col-span-3">
                        <div className="w-full bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-lg shadow-xl p-8">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">IQ Academy</h2>
                            <p className="text-gray-300 text-base sm:text-lg mb-6 font-roboto dark:text-white">
                                Join our expert educators for real-time market analysis and educational sessions <br />
                                across Forex, Crypto, and Stock Options.
                            </p>
                            <button className="bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 shadow-lg transition-all duration-300 ease-in-out rounded-xl font-roboto">
                                View Academies
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
