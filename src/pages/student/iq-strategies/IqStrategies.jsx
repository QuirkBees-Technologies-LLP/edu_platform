import { CheckCircle, EllipsisVertical, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Plus, Minus } from "lucide-react";
import { Link } from 'react-router-dom';
import { Download } from "lucide-react";

const faqData = [
    { id: 1, question: "How is pricing determined for each plan?", answer: "Pricing is determined based on the features and usage limits included in each plan." },
    { id: 2, question: "What payment methods are accepted for subscriptions?", answer: "We accept credit cards, PayPal, and other secure payment methods." },
    { id: 3, question: "Are there any hidden fees in the pricing?", answer: "No, there are no hidden fees. All costs are displayed upfront." },
    { id: 4, question: "Is there a discount for annual subscriptions?", answer: "Yes, we offer discounts for users who choose annual billing." },
    { id: 5, question: "Do you offer refunds on subscription cancellations?", answer: "Refunds are available based on our cancellation policy." },
    { id: 6, question: "Can I add extra features to my current plan?", answer: "Yes, you can add extra features or upgrade your plan anytime." },
];
const downloads = [
    { id: 1, name: "file_name.pdf" },
    { id: 2, name: "file_name.pdf" },
    { id: 3, name: "file_name.pdf" },
    { id: 4, name: "192.168.1.2" },
];
const cardData = [
    { title: "GOLDMINE", initials: "GM" },
    { title: "KILLSHOT", initials: "KS" },
    { title: "SMARTMONICS", initials: "SM" },
];
const educators = [
    {
        id: 1,
        name: "Tyler Hero",
        contributors: "6 contributors",
        avatar: "public/media/images/avatar.jpg",
    },
    {
        id: 2,
        name: "John Doe",
        contributors: "4 contributors",
        avatar: "public/media/images/avatar.jpg",
    },
    {
        id: 3,
        name: "Emma Watson",
        contributors: "8 contributors",
        avatar: "public/media/images/avatar.jpg",
    },
    {
        id: 4,
        name: "Michael Lee",
        contributors: "5 contributors",
        avatar: "public/media/images/avatar.jpg",
    },
    {
        id: 5,
        name: "Sophia Taylor",
        contributors: "7 contributors",
        avatar: "public/media/images/avatar.jpg",
    },
];

export default function IqStrategies() {

    const [following, setFollowing] = useState({});

    const toggleFollow = (id) => {
        setFollowing((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const courses = [
        {
            id: 1,
            title: 'Forex Academy - English',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/tutorials.png',
        },
        {
            id: 2,
            title: 'Forex Academy - English',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/tutorials.png',
        },
        {
            id: 3,
            title: 'Forex Academy - English',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/tutorials.png',
        },
        {
            id: 4,
            title: 'Forex Academy - English',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/tutorials.png',
        },
        {
            id: 5,
            title: 'Forex Academy - English',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/tutorials.png',
        },
        {
            id: 6,
            title: 'Forex Academy - English',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/tutorials.png',
        },
    ];
    const [openId, setOpenId] = useState(null);

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <>
            <div className="container-fluid">
                <div className="relative welcome_image w-full mb-10 rounded-xl overflow-hidden">
                    <div className="relative z-1 flex items-center justify-center h-full p-4">
                        <div className="xl:hidden absolute inset-0 bg-black/40"></div>
                        <div className="text-center z-1">
                            <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200">
                                <span className="text-2xl text-gray-50 font-medium tracking-widest">IQ STRATEGIES</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="mb-6">
                    <img
                        src="public/media/images/IQ-Strategies.jpg"
                        alt="Course Banner"
                        className="w-full h-72 object-cover rounded-xl"
                    />
                </div> */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                    {cardData.map((item, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-200 px-5 p-5 xl:px-7 xl:py-7 rounded-xl shadow-sm hover:shadow-md transition"
                        >
                            <button className="flex items-center gap-3 w-full">
                                {/* Initials Box */}
                                <div className="w-16 h-16 bg-[#13122F] flex items-center justify-center rounded-2xl overflow-hidden shrink-0">
                                    <span className="text-lg font-bold text-[#C5C6FF]">{item.initials}</span>
                                </div>

                                {/* Title */}
                                <h5 className="text-sm font-medium text-gray-800 line-clamp-1 truncate">
                                    {item.title}
                                </h5>
                            </button>
                        </div>
                    ))}
                </div>



                <div className="grid md:grid-cols-3 gap-4 mb-10">
                    <div className="md:col-span-2">
                        <div class="card">
                            <div className="bg-[#1f103f] text-white p-4 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium">Description</h2>
                                </div>
                            </div>
                            <div class="card-content px-8 py-6">
                                <div className='min-h-64 mb-5'>
                                    <p className='text-gray-700 text-sm '>Now that I’m done thoroughly mangling that vague metaphor, let’s get down to business. You know you need to start blogging to grow your business, but you don’t know how. In this post, I’ll show you how to write a great blog post in five simple steps that people will actually want to read. </p>
                                </div>
                                <div>
                                    <h4 class="mb-3 font-semibold text-foreground ">Products</h4>
                                </div>
                                <div class="flex flex-wrap gap-2.5 ">
                                    <span class="badge badge-stroke">Lingo Kids</span>
                                    <span class="badge badge-stroke">Lingo Express</span>
                                    <span class="badge badge-stroke">Fun Learning</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="card">
                        {/* Card Header */}
                        <div className="bg-[#1f103f] text-white p-4 rounded-t-2xl">
                            <h2 className="text-lg font-medium">Goldmine Educators</h2>
                        </div>

                        {/* Card Content */}
                        <div className="card-content py-1">
                            {educators.map((educator) => (
                                <div
                                    key={educator.id}
                                    className="flex items-center justify-between gap-2 py-3 px-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-9 h-9 rounded-full overflow-hidden shrink-0">
                                            <img src={educator.avatar} alt={educator.name} />
                                        </div>
                                        <div>
                                            <a href="#" className="text-sm font-medium font-
                                             text-gray-800 hover:text-primary mb-1 line-clamp-1">
                                                {educator.name}
                                            </a>
                                            {/* <div className="text-xs font-normal text-muted-foreground">{educator.contributors}</div> */}
                                        </div>
                                    </div>

                                    {/* Follow Button */}
                                    <button
                                        onClick={() => toggleFollow(educator.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition 
                                        ${following[educator.id]
                                                ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                                                : "border-[#C5C6FF] dark:border-[#4F46E5] text-[#4F46E5]"
                                            }`}
                                    >
                                        <CheckCircle size={14} />
                                        {following[educator.id] ? "Following" : "Follow"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* <div className="text-gray-900 mb-2">
                    <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold ">Tutorials</h2>
                        </div>
                    </div>

                    <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
                        <div className="flex gap-4">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 card rounded-xl shadow-sm flex-shrink-0"
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
                </div> */}
                <div className='grid grid-cols-1'>
                    <div>
                        <div className="text-gray-900 mb-10">
                            <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-medium">Tutorials</h2>
                                </div>
                            </div>

                            <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
                                <div className="flex gap-4">
                                    {courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0"
                                        >
                                            <div className="rounded-t-xl overflow-hidden">
                                                <img
                                                    src={course.image}
                                                    alt={course.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-md text-gray-800 font-medium">{course.title}</h3>
                                                {/* <p className="text-xs text-gray-600">{course.address}</p> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1'>
                    <div className="card rounded-2xl overflow-hidden mb-10">
                        <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-medium">Downloads</h2>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="w-full">
                            <div className="grid grid-cols-[1fr_auto] px-6 py-3 border-b text-sm font-normal text-gray-500">
                                <span>File Name</span>
                            </div>

                            {downloads.map((file) => (
                                <div
                                    key={file.id}
                                    className="grid grid-cols-[1fr_auto] items-center px-6 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-100 transition"
                                >
                                    <span className="text-sm text-gray-800">{file.name}</span>
                                    <button className="p-2 rounded-full hover:bg-gray-100 transition">
                                        <Download size={18} className="text-gray-700" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="text-center py-5">
                            <Link className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary">
                                View All
                            </Link>
                        </div>
                    </div>
                    {/* <div className="mb-10">
                        <div className='card'>
                            <div className='card-header'>
                                <h3 className="text-xl font-semibold mb-0">Replays</h3>
                            </div>
                            <div className="card-content p-8">
                                <div className="flex gap-4 overflow-x-auto">
                                    {Array(3).fill().map((_, idx) => (
                                        <div key={idx} className="w-full sm:w-1/2 md:w-1/3 border rounded-xl shadow-sm flex-shrink-0">
                                            <img src="public/media/images/dummy-image-card.jpg" alt="Replay" className="rounded-t-xl w-full h-36 object-cover" />
                                            <div className="p-4 text-xs text-gray-600">
                                                <p className="font-semibold text-sm mb-1">CyberStorm Cup</p>
                                                <p>Wed, Feb 18, 12:00 CDT</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>

                <div className="mb-10">
                    <div className='card'>
                        <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-medium">FAQ</h2>
                            </div>
                        </div>
                        {/* <div className='card-header'>
                            <h3 className="text-xl font-semibold mb-0">FAQ</h3>
                        </div> */}
                        <div className="card-content px-5 xl:px-8">
                            <div className="divide-y">
                                {faqData.map((faq) => (
                                    <div key={faq.id}>
                                        <button
                                            className="w-full flex justify-between items-center py-4 text-left text-gray-700 hover:text-indigo-600"
                                            onClick={() => toggleFAQ(faq.id)}
                                        >
                                            <span className="text-sm text-gray-800 font-medium line-clamp-2">{faq.question}</span>
                                            {openId === faq.id ? (
                                                <Minus size={16} className="text-gray-500 shrink-0" />
                                            ) : (
                                                <Plus size={16} className="text-gray-500 shrink-0" />
                                            )}
                                        </button>

                                        {/* Smooth Transition */}
                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden`}
                                            style={{
                                                maxHeight: openId === faq.id ? "200px" : "0",
                                                opacity: openId === faq.id ? 1 : 0,
                                            }}
                                        >
                                            <p className="text-sm text-gray-600 pb-4">{faq.answer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                </div>

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
            </div>
        </>
    );
}
