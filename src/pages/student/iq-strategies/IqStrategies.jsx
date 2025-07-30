import { EllipsisVertical } from 'lucide-react';
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


    return (<>
        <div className="min-h-screen p-10">
            <div className="mb-6">
                <img
                    src="public/media/images/IQ-Strategies.jpg"
                    alt="Course Banner"
                    className="w-full h-72 object-cover rounded-xl"
                />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-7">
                {['GOLDMINE', 'KILLSHOT', 'SMARTMONICS'].map((tag, idx) => (
                    <div className=' border border-gray-200 px-7 py-7 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition'>
                        <button
                            key={idx}
                            className="flex items-center gap-2"
                        >
                            <img src="public/media/images/item.png" alt="" />
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
                            <div className='min-h-64'>
                                <p className='text-gray-700 text-sm font-roboto'>Now that I’m done thoroughly mangling that vague metaphor, let’s get down to business. You know you need to start blogging to grow your business, but you don’t know how. In this post, I’ll show you how to write a great blog post in five simple steps that people will actually want to read. </p>
                            </div>
                            <div>
                                <h4 class="mb-3 font-semibold text-foreground font-roboto">Products</h4>
                            </div>
                            <div class="flex flex-wrap gap-2.5 font-roboto">
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
                                        class="text-sm font-roboto font-medium text-foreground hover:text-primary"
                                    >Kathryn Campbell</a
                                    >
                                    <div class="text-sm font-roboto font-normal text-muted-foreground">
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
                                        class="text-sm font-roboto font-medium text-foreground hover:text-primary"
                                    >Kathryn Campbell</a
                                    >
                                    <div class="text-sm font-roboto font-normal text-muted-foreground">
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
                                        class="text-sm font-roboto font-medium text-foreground hover:text-primary"
                                    >Kathryn Campbell</a
                                    >
                                    <div class="text-sm font-roboto font-normal text-muted-foreground">
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
                                        class="text-sm font-roboto font-medium text-foreground hover:text-primary"
                                    >Kathryn Campbell</a
                                    >
                                    <div class="text-sm font-roboto font-normal text-muted-foreground">
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
                                        class="text-sm font-roboto font-medium text-foreground hover:text-primary"
                                    >Kathryn Campbell</a
                                    >
                                    <div class="text-sm font-roboto font-normal text-muted-foreground">
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
                                        class="text-sm font-roboto font-medium text-foreground hover:text-primary"
                                    >Kathryn Campbell</a
                                    >
                                    <div class="text-sm font-roboto font-normal text-muted-foreground">
                                        6 сontributors
                                    </div>
                                </div>
                            </div>
                            <EllipsisVertical size={15} strokeWidth={1.75} />
                        </div>

                    </div>

                </div>
            </div>

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
                                className="w-1/4 card rounded-xl shadow-sm flex-shrink-0"
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

            <div className="mb-10">
                <div className='card'>
                    <div className='card-header'>
                        <h3 className="text-xl font-semibold mb-0">Replays</h3>
                    </div>
                    <div className="card-content p-8">
                        <div className="flex flex-wrap gap-4">
                            {Array(3).fill().map((_, idx) => (
                                <div key={idx} className="w-64 card">
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

            <div className="mb-10">
                <div className='card'>
                    <div className='card-header'>
                        <h3 className="text-xl font-semibold mb-0">FAQ</h3>
                    </div>
                    <div className="card-content p-8">

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
