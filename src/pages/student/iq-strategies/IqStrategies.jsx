import { EllipsisVertical } from 'lucide-react';
import React, { useState } from 'react';
import { Plus, Minus } from "lucide-react";
import { Link } from 'react-router-dom';

const faqData = [
    { id: 1, question: "How is pricing determined for each plan?", answer: "Pricing is determined based on the features and usage limits included in each plan." },
    { id: 2, question: "What payment methods are accepted for subscriptions?", answer: "We accept credit cards, PayPal, and other secure payment methods." },
    { id: 3, question: "Are there any hidden fees in the pricing?", answer: "No, there are no hidden fees. All costs are displayed upfront." },
    { id: 4, question: "Is there a discount for annual subscriptions?", answer: "Yes, we offer discounts for users who choose annual billing." },
    { id: 5, question: "Do you offer refunds on subscription cancellations?", answer: "Refunds are available based on our cancellation policy." },
    { id: 6, question: "Can I add extra features to my current plan?", answer: "Yes, you can add extra features or upgrade your plan anytime." },
];
export default function IqStrategies() {

    const courses = [
        {
            id: 1,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 2,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 3,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 4,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 5,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
        {
            id: 6,
            title: 'Course Title',
            address: '456 Innovation Street, Floor 6, Techland, New York 54321',
            image: 'public/media/images/2600x1600/recordings.jpg',
        },
    ];
    const [openId, setOpenId] = useState(null);

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id);
    };


    return (
        <>
            <div className="container-fluid">
                <div className=" welcome_image w-full mb-10 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-center md:justify-end h-full p-4">
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
                    {['GOLDMINE', 'KILLSHOT', 'SMARTMONICS'].map((tag, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-200 px-7 py-7 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition"
                        >
                            <button className="flex items-center gap-2">
                                <img src="/media/images/item.png" alt="" />
                                {tag}
                            </button>
                        </div>
                    ))}
                </div>


                <div className="grid md:grid-cols-3 gap-4 mb-10">
                    {/* Description */}
                    <div className="md:col-span-2">
                        <div class="card">
                            <div class="card-header">
                                <div class="card-heading">
                                    <h2 class="card-title">Description</h2>
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

                    {/* Educators */}
                    <div class="card">
                        <div class="card-header">
                            <div class="card-heading">
                                <h2 class="card-title">Goldmind Educators</h2>
                            </div>
                            <div class="card-toolbar">
                                <button type="button" class="btn btn-xs btn-outline btn-icon">
                                    <EllipsisVertical size={15} strokeWidth={1.75} />
                                </button>
                            </div>
                        </div>
                        <div class="card-content py-1">
                            <div class="flex items-center justify-between gap-2 py-2 px-9 border-b border-border border-dashed last:border-none">
                                <div class="flex items-center gap-3">
                                    <div class="avatar size-8 rounded-full overflow-hidden">
                                        <div class="avatar-image">
                                            <img src="public/media/images/avatar.jpg" alt="Kathryn Campbell" />
                                        </div>
                                    </div>
                                    <div>
                                        <a
                                            href="#"
                                            class="text-sm  font-medium text-foreground hover:text-primary"
                                        >Kathryn Campbell</a
                                        >
                                        <div class="text-sm  font-normal text-muted-foreground">
                                            6 сontributors
                                        </div>
                                    </div>
                                </div>
                                <EllipsisVertical size={15} strokeWidth={1.75} />
                            </div>
                            <div class="flex items-center justify-between gap-2 py-2 px-9 border-b border-border border-dashed last:border-none">
                                <div class="flex items-center gap-3">
                                    <div class="avatar size-8 rounded-full overflow-hidden">
                                        <div class="avatar-image">
                                            <img src="public/media/images/avatar.jpg" alt="Kathryn Campbell" />
                                        </div>
                                    </div>
                                    <div>
                                        <a
                                            href="#"
                                            class="text-sm  font-medium text-foreground hover:text-primary"
                                        >Kathryn Campbell</a
                                        >
                                        <div class="text-sm  font-normal text-muted-foreground">
                                            6 сontributors
                                        </div>
                                    </div>
                                </div>
                                <EllipsisVertical size={15} strokeWidth={1.75} />
                            </div>
                            <div class="flex items-center justify-between gap-2 py-2 px-9 border-b border-border border-dashed last:border-none">
                                <div class="flex items-center gap-3">
                                    <div class="avatar size-8 rounded-full overflow-hidden">
                                        <div class="avatar-image">
                                            <img src="public/media/images/avatar.jpg" alt="Kathryn Campbell" />
                                        </div>
                                    </div>
                                    <div>
                                        <a
                                            href="#"
                                            class="text-sm  font-medium text-foreground hover:text-primary"
                                        >Kathryn Campbell</a
                                        >
                                        <div class="text-sm  font-normal text-muted-foreground">
                                            6 сontributors
                                        </div>
                                    </div>
                                </div>
                                <EllipsisVertical size={15} strokeWidth={1.75} />
                            </div>
                            <div class="flex items-center justify-between gap-2 py-2 px-9 border-b border-border border-dashed last:border-none">
                                <div class="flex items-center gap-3">
                                    <div class="avatar size-8 rounded-full overflow-hidden">
                                        <div class="avatar-image">
                                            <img src="public/media/images/avatar.jpg" alt="Kathryn Campbell" />
                                        </div>
                                    </div>
                                    <div>
                                        <a
                                            href="#"
                                            class="text-sm  font-medium text-foreground hover:text-primary"
                                        >Kathryn Campbell</a
                                        >
                                        <div class="text-sm  font-normal text-muted-foreground">
                                            6 сontributors
                                        </div>
                                    </div>
                                </div>
                                <EllipsisVertical size={15} strokeWidth={1.75} />
                            </div>
                            <div class="flex items-center justify-between gap-2 py-2 px-9 border-b border-border border-dashed last:border-none">
                                <div class="flex items-center gap-3">
                                    <div class="avatar size-8 rounded-full overflow-hidden">
                                        <div class="avatar-image">
                                            <img src="public/media/images/avatar.jpg" alt="Kathryn Campbell" />
                                        </div>
                                    </div>
                                    <div>
                                        <a
                                            href="#"
                                            class="text-sm  font-medium text-foreground hover:text-primary"
                                        >Kathryn Campbell</a
                                        >
                                        <div class="text-sm  font-normal text-muted-foreground">
                                            6 сontributors
                                        </div>
                                    </div>
                                </div>
                                <EllipsisVertical size={15} strokeWidth={1.75} />
                            </div>
                            <div class="flex items-center justify-between gap-2 py-2 px-9 border-b border-border border-dashed last:border-none">
                                <div class="flex items-center gap-3">
                                    <div class="avatar size-8 rounded-full overflow-hidden">
                                        <div class="avatar-image">
                                            <img src="public/media/images/avatar.jpg" alt="Kathryn Campbell" />
                                        </div>
                                    </div>
                                    <div>
                                        <a
                                            href="#"
                                            class="text-sm  font-medium text-foreground hover:text-primary"
                                        >Kathryn Campbell</a
                                        >
                                        <div class="text-sm  font-normal text-muted-foreground">
                                            6 сontributors
                                        </div>
                                    </div>
                                </div>
                                <EllipsisVertical size={15} strokeWidth={1.75} />
                            </div>

                        </div>

                    </div>
                </div>

                {/* <div className="text-gray-900 mb-28">
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
                                    <h2 className="text-xl font-medium">Courses</h2>
                                    <Link className="text-xs text-primary font-normal border-dashed border-b-2 pb-2 border-primary">View All</Link>
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
                </div>
                
                <div className='grid grid-cols-1'>

                    <div className="mb-10">
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
                    </div>
                </div>

                <div className="mb-10">
                    <div className='card'>
                        <div className='card-header'>
                            <h3 className="text-xl font-semibold mb-0">FAQ</h3>
                        </div>
                        <div className="card-content px-8">
                            <div className="divide-y">
                                {faqData.map((faq) => (
                                    <div key={faq.id}>
                                        <button
                                            className="w-full flex justify-between items-center py-4 text-left text-gray-700 hover:text-indigo-600"
                                            onClick={() => toggleFAQ(faq.id)}
                                        >
                                            <span className="text-sm text-gray-800 font-medium">{faq.question}</span>
                                            {openId === faq.id ? (
                                                <Minus size={16} className="text-gray-500 shrink-0"  />
                                            ) : (
                                                <Plus size={16} className="text-gray-500 shrink-0"  />
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

                <div className="mb-6">
                    <img
                        src="public/media/images/IQ-Strategies.jpg"
                        alt="Course Banner"
                        className="w-full h-72 object-cover rounded-xl"
                    />
                </div>
            </div>
        </>
    );
}
