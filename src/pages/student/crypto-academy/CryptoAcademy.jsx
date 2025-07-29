import { CirclePlay } from 'lucide-react';
import React, { useState } from 'react';

export default function CryptoAcademy() {

    const [activeTab, setActiveTab] = useState('forex');
    const courses = [
        {
            id: 1,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/video-thumbail.jpg',
        },
        {
            id: 2,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/video-thumbail.jpg',
        },
        {
            id: 3,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/video-thumbail.jpg',
        },
        {
            id: 4,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/video-thumbail.jpg',
        },
             {
            id: 5,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/video-thumbail.jpg',
        },
             {
            id: 6,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/video-thumbail.jpg',
        },
    ];

    // Define tab data - 'My Academies' is removed as a tab
    const tabs = [
        {
            id: 'forex', name: 'Forex', content:
                <>
                    <div>
                        <iframe class="w-full aspect-video" src="https://www.youtube.com/..."></iframe>
                        <div className="p-4 rounded-bl-md rounded-br-md bg-white shadow">
                            <h3 className="text-sm font-normal text-gray-600 mb-2 font-roboto">TRADING BASICS</h3>
                            <div className='flex items-center justify-between mb-3'>
                                <h4 className="text-4xl font-semibold text-gray-900 font-roboto">Navigating the Backoffice</h4>
                                <button className="bg-gray-100 font-roboto text-sm flex items-center justify-center gap-2 rotate-0 opacity-100 rounded-2xl border border-gray-300 py-3 px-6">

                                    Mark as Complete
                                </button>
                            </div>
                            <p className="text-base text-gray-600 mt-1 font-roboto">
                                Explore exciting collaboration opportunities with our blog. We're open to partnerships, guest posts, and more. Join us to share your insights and grow your audience.
                            </p>
                        </div>
                    </div>
                </>
        },
        { id: 'crypto', name: 'Crypto', content: 'Explore the world of cryptocurrencies, blockchain technology, and digital asset trading.' },
        { id: 'stock-options', name: 'Stock Options', content: 'Understand stock options, strategies, and how to trade them effectively.' },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className='container mx-auto p-5'>
                <div className="grid grid-cols-3 gap-4">
                    <div className='col-span-3'>
                        <div className="bg-[url(../media/images/forex.jpg)] text-white py-12 rounded-2xl flex justify-center items-center bg-cover bg-center bg-no-repeat h-72 w-full">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold tracking-wider">FAST START</h1>
                                <p className="text-lg tracking-widest">TRAINING</p>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div className="max-h-[600px] overflow-auto">
                            <div className='bg-blue-950 p-5 rounded-tl-xl rounded-tr-xl '>
                                <h6 className='text-base font-roboto text-white font-bold'>Section 1: Backoffice</h6>
                            </div>
                            <div className="w-full max-w-md bg-white rounded-lg overflow-hidden border-indigo-700">
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Navigating the Backoffice</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Understanding Risk Management</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Types of Orders</span>
                                </div>
                                <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Understanding Risk Management</span>
                                </div>
                            </div>
                            <div className='bg-blue-950 p-5 '>
                                <h6 className='text-base font-roboto text-white font-bold'>Section 2: Fast Start</h6>
                            </div>
                            <div className="w-full max-w-md bg-white rounded-lg overflow-hidden border-indigo-700">
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Tradingview Tutorial</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Candles and Time Frames</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Market structure</span>
                                </div>
                            </div>
                            <div className='bg-blue-950 p-5 '>
                                <h6 className='text-base font-roboto text-white font-bold'>Section 3: Fast Start</h6>
                            </div>
                            <div className="w-full max-w-md bg-white rounded-lg overflow-hidden border-indigo-700">
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Tradingview Tutorial</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Candles and Time Frames</span>
                                </div>
                                <div className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Market structure</span>
                                </div>
                                <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                                    <CirclePlay className='mr-2 text-gray-400' />
                                    <span className="text-indigo-900 text-base font-roboto">Market structure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <div className="">
                            <div className="">
                                <div className='flex items-center'>
                                    <h2 className="text-lg font-bold text-gray-900 mb-6 font-roboto">My Academies</h2>

                                    <div className="flex border-b border-gray-200 mb-6">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                className={`py-3 px-6 text-lg font-semibold transition-colors duration-200 ease-in-out font-roboto
                                                    ${activeTab === tab.id
                                                        ? 'text-indigo-700 border-b-2 border-indigo-700'
                                                        : 'text-gray-600 hover:text-indigo-700'
                                                    }`}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                {tab.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className=" rounded-lg">
                                    {tabs.map((tab) => (
                                        <div
                                            key={tab.id}
                                            className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
                                        >
                                            <p className="text-gray-800 text-base leading-relaxed">{tab.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="col-span-3">
                        <div className="w-full bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-lg shadow-xl p-8">
                            <h2 className="text-3xl font-bold mb-4">IQ Academy</h2>
                            <p className="text-gray-300 text-lg mb-8 font-roboto">
                                Join our expert educators for real-time market analysis and educational sessions <br />
                                across Forex, Crypto, and Stock Options.
                            </p>
                            <button className="bg-gradient-to-r from-indigo-400 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 shadow-lg transition-all duration-300 ease-in-out rounded-xl font-roboto">
                                View Academies
                            </button>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="min-h-screen bg-white text-gray-900">
                            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">IQ Vault</h2>
                                    <div className="flex gap-4">
                                        <select className="bg-[#2a165d] text-white p-2 rounded-md">
                                            <option>Experience</option>
                                            <option>Beginner</option>
                                            <option>Advanced</option>
                                        </select>
                                        <select className="bg-[#2a165d] text-white p-2 rounded-md">
                                            <option>Style</option>
                                            <option>Technical</option>
                                            <option>Fundamental</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-b-2xl shadow-md p-6 overflow-x-auto">
                                <div className="flex gap-4">
                                    {courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="w-1/4 bg-white border rounded-xl shadow-sm flex-shrink-0"
                                        >
                                            <div className="rounded-t-xl overflow-hidden">
                                                <img
                                                    src={course.image}
                                                    alt={course.title}
                                                    className="w-full h-36 object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold">{course.title}</h3>
                                                <p className="text-sm text-gray-600">{course.address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
