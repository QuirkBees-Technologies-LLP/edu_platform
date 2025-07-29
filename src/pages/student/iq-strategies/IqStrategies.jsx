import React from 'react';

export default function IqStrategies() {

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


    return (
        <div className="min-h-screen p-6">
            {/* Top Section - Course Banner */}
            <div className="mb-6">
                <img
                    src="public/media/images/IQ-Strategies.jpg"
                    alt="Course Banner"
                    className="w-full h-72 object-cover rounded-xl"
                />
            </div>

            {/* Course Tags */}
            <div className="flex flex-wrap gap-4 mb-6">
                {['GOLDMINE', 'KILLSHOT', 'SMARTMONICS'].map((tag, idx) => (
                    <div className=''>
                        <button
                            key={idx}
                            className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition"
                        >
                            {tag}
                        </button>
                    </div>
                ))}
            </div>

            {/* Description & Educators */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
                {/* Description */}

                <div className="md:col-span-2">
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-sm text-gray-600">
                            Now that I’m done thoroughly mangling that vague metaphor, let’s get down to business. You know you
                            need to start blogging to grow your business, but you don’t know how. In this post, I’ll show you
                            how to write a great blog post in five simple steps that people will actually want to read.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {['Lingo Kids', 'Lingo Express', 'Fun Learning'].map((product, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                                    {product}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Educators */}
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Goldmind Educators</h3>
                    <ul className="space-y-3">
                        {[
                            { name: 'Tyler Hero', contributions: '6 contributors' },
                            { name: 'Esther Howard', contributions: '29 contributors' },
                            { name: 'Cody Fisher', contributions: '34 contributors' },
                            { name: 'Arlene McCoy', contributions: '1 contributors' },
                            { name: 'Arlene McCoy', contributions: '1 contributors' },
                            { name: 'Arlene McCoy', contributions: '1 contributors' },
                        ].map((edu, idx) => (
                            <li key={idx} className="flex justify-between text-sm">
                                <span>{edu.name}</span>
                                <span className="text-gray-500">{edu.contributions}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Tutorials */}
            <div className="text-gray-900 mb-28">
                <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold font-roboto">Tutorials</h2>
                        
                    </div>
                </div>

                <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
                    <div className="flex gap-4">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="w-1/4  border rounded-xl shadow-sm flex-shrink-0"
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

            {/* Replays */}
            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Replays</h3>
                <div className="flex flex-wrap gap-4">
                    {Array(3).fill().map((_, idx) => (
                        <div key={idx} className="w-64 bg-white border rounded-xl shadow-sm">
                            <img src="/replay-thumb.jpg" alt="Replay" className="rounded-t-xl w-full h-36 object-cover" />
                            <div className="p-4 text-xs text-gray-600">
                                <p className="font-semibold text-sm mb-1">CyberStorm Cup</p>
                                <p>Wed, Feb 18, 12:00 CDT</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">FAQ</h3>
                <div className="space-y-3">
                    {[
                        'How is pricing determined for each plan?',
                        'What payment methods are accepted for subscriptions?',
                        'Are there any hidden fees in the pricing?',
                        'Is there a discount for annual subscriptions?',
                        'Do you offer refunds on subscription cancellations?',
                        'Can I add extra features to my current plan?'
                    ].map((faq, idx) => (
                        <div key={idx} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-700 font-medium">{faq}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Image */}
            <div>
                <img src="/your-banner-image.jpg" alt="Footer Banner" className="w-full h-72 object-cover rounded-xl" />
            </div>
        </div>
    );
}
