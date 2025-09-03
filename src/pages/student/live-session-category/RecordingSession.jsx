import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { Calendar, CirclePlay, Timer, Videotape } from 'lucide-react';
import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useSettings } from '@/providers';
import { toAbsoluteUrl } from '@/utils';

const RecordingSession = () => {
    const badges = ["Trading", "Crypto", "Forex", "Stocks", "Options"]; // dynamic list
    const [showAllBadges, setShowAllBadges] = useState(false);

    const visibleBadges = showAllBadges ? badges : badges.slice(0, 2);
    const remainingCount = badges.length - 2;
    const {
        getThemeMode
    } = useSettings();
    return (
        <div>
            <Container className="pb-10">
                <div className="bg-center bg-cover bg-no-repeat hero-bg" style={{
                    backgroundImage: getThemeMode() === 'dark' ? `url('${toAbsoluteUrl('/media/images/2600x1200/bg-1-dark.png')}')` : `url('${toAbsoluteUrl('/media/images/2600x1200/bg-1.png')}')`
                }}>
                    <div class="flex flex-col items-center gap-2 lg:gap-3.5 py-4 lg:pt-5 lg:pb-10">
                        <img src="/media/avatars/300-1.png" class="rounded-full border-3 border-success size-[100px] shrink-0 object-cover" />
                        <div class="flex items-center gap-1.5">
                            <div class="text-lg leading-5 font-semibold text-gray-900">
                            </div>
                            <h6 class="text-lg font-medium text-gray-900">Filipe Forner</h6>
                        </div>
                        <div class="flex flex-wrap justify-center gap-1 lg:gap-4.5 text-sm">
                            <div class="flex gap-1.25 items-center">
                                <i class="ki-filled ki-abstract-41 text-gray-500 text-sm"></i>
                                <span class="text-gray-600 font-medium">undefined</span>
                            </div>
                            <div class="flex gap-1.25 items-center">
                                <i class="ki-filled ki-geolocation text-gray-500 text-sm"></i>
                                <span class="text-gray-600 font-medium">admin</span>
                            </div>
                            <div class="flex gap-1.25 items-center">
                                <i class="ki-filled ki-sms text-gray-500 text-sm"></i>
                                <a href="mailto:admin1@yopmail.com" class="text-gray-600 font-medium hover:text-primary" rel="noreferrer">admin1@yopmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>
                <Toolbar>
                    <ToolbarHeading>
                        <ToolbarPageTitle text="Recorded Live Trade " />
                    </ToolbarHeading>
                </Toolbar>
                <div className="grid grid-cols-12 gap-4">
                    <div className="recorded_card col-span-12 sm:col-span-6 xl:col-span-4">
                        <div className="card">
                            {/* Image with Play Button */}
                            <div className="relative w-full h-52 rounded-2xl overflow-hidden">
                                <img className="w-full h-full object-cover" src="/media/images/600x400/1.jpg" alt="" />
                                <div className="absolute inset-0 bg-black/50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Link>
                                        <CirclePlay size={60} className="text-white" />
                                    </Link>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body p-4 rounded-2xl">
                                <div className="flex justify-between">
                                    <div className="recorded_details">
                                        <h6 className="text-xl font-medium text-gray-900 mb-1">
                                            live trader commentary
                                        </h6>
                                        <p className="text-2sm text-gray-900 dark:text-gray-900 mb-3">
                                            Explore a collection of educational
                                        </p>

                                        {/* Badge List */}
                                        <div className="flex gap-2 flex-wrap">
                                            {visibleBadges.map((badge, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium badge-primary badge-outline"
                                                >
                                                    {badge}
                                                </span>
                                            ))}

                                            {/* Show More / Show Less Toggle */}
                                            {badges.length > 2 && (
                                                <button
                                                    onClick={() => setShowAllBadges(!showAllBadges)}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700"
                                                >
                                                    {showAllBadges ? "Show Less" : `+${remainingCount} more`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="card-footer justify-between pt-4 p-0 mt-4">
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Calendar size={16} /> 25/07/2025
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Timer size={18} /> 11:09
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="recorded_card col-span-12 sm:col-span-6 xl:col-span-4">
                        <div className="card">
                            {/* Image with Play Button */}
                            <div className="relative w-full h-52 rounded-2xl overflow-hidden">
                                <img className="w-full h-full object-cover" src="/media/images/600x400/1.jpg" alt="" />
                                <div className="absolute inset-0 bg-black/50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Link>
                                        <CirclePlay size={60} className="text-white" />
                                    </Link>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body p-4 rounded-2xl">
                                <div className="flex justify-between">
                                    <div className="recorded_details">
                                        <h6 className="text-xl font-medium text-gray-900 mb-1">
                                            live trader commentary
                                        </h6>
                                        <p className="text-2sm text-gray-900 dark:text-gray-900 mb-3">
                                            Explore a collection of educational
                                        </p>

                                        {/* Badge List */}
                                        <div className="flex gap-2 flex-wrap">
                                            {visibleBadges.map((badge, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium badge-primary badge-outline"
                                                >
                                                    {badge}
                                                </span>
                                            ))}

                                            {/* Show More / Show Less Toggle */}
                                            {badges.length > 2 && (
                                                <button
                                                    onClick={() => setShowAllBadges(!showAllBadges)}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700"
                                                >
                                                    {showAllBadges ? "Show Less" : `+${remainingCount} more`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="card-footer justify-between pt-4 p-0 mt-4">
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Calendar size={16} /> 25/07/2025
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Timer size={18} /> 11:09
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="recorded_card col-span-12 sm:col-span-6 xl:col-span-4">
                        <div className="card">
                            {/* Image with Play Button */}
                            <div className="relative w-full h-52 rounded-2xl overflow-hidden">
                                <img className="w-full h-full object-cover" src="/media/images/600x400/1.jpg" alt="" />
                                <div className="absolute inset-0 bg-black/50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Link>
                                        <CirclePlay size={60} className="text-white" />
                                    </Link>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body p-4 rounded-2xl">
                                <div className="flex justify-between">
                                    <div className="recorded_details">
                                        <h6 className="text-xl font-medium text-gray-900 mb-1">
                                            live trader commentary
                                        </h6>
                                        <p className="text-2sm text-gray-900 dark:text-gray-900 mb-3">
                                            Explore a collection of educational
                                        </p>

                                        {/* Badge List */}
                                        <div className="flex gap-2 flex-wrap">
                                            {visibleBadges.map((badge, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium badge-primary badge-outline"
                                                >
                                                    {badge}
                                                </span>
                                            ))}

                                            {/* Show More / Show Less Toggle */}
                                            {badges.length > 2 && (
                                                <button
                                                    onClick={() => setShowAllBadges(!showAllBadges)}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700"
                                                >
                                                    {showAllBadges ? "Show Less" : `+${remainingCount} more`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="card-footer justify-between pt-4 p-0 mt-4">
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Calendar size={16} /> 25/07/2025
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Timer size={18} /> 11:09
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="recorded_card col-span-12 sm:col-span-6 xl:col-span-4">
                        <div className="card">
                            {/* Image with Play Button */}
                            <div className="relative w-full h-52 rounded-2xl overflow-hidden">
                                <img className="w-full h-full object-cover" src="/media/images/600x400/1.jpg" alt="" />
                                <div className="absolute inset-0 bg-black/50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Link>
                                        <CirclePlay size={60} className="text-white" />
                                    </Link>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="card-body p-4 rounded-2xl">
                                <div className="flex justify-between">
                                    <div className="recorded_details">
                                        <h6 className="text-xl font-medium text-gray-900 mb-1">
                                            live trader commentary
                                        </h6>
                                        <p className="text-2sm text-gray-900 dark:text-gray-900 mb-3">
                                            Explore a collection of educational
                                        </p>

                                        {/* Badge List */}
                                        <div className="flex gap-2 flex-wrap">
                                            {visibleBadges.map((badge, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium badge-primary badge-outline"
                                                >
                                                    {badge}
                                                </span>
                                            ))}

                                            {/* Show More / Show Less Toggle */}
                                            {badges.length > 2 && (
                                                <button
                                                    onClick={() => setShowAllBadges(!showAllBadges)}
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700"
                                                >
                                                    {showAllBadges ? "Show Less" : `+${remainingCount} more`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="card-footer justify-between pt-4 p-0 mt-4">
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Calendar size={16} /> 25/07/2025
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                                        <Timer size={18} /> 11:09
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* no data found  */}
                <div className="card w-full h-100 items-center justify-center hidden">
                    <div className="text-center flex items-center gap-3 flex-col py-24">
                        <Videotape size={30}/>
                        <h3 className="text-xl font-medium text-gray-700">
                            No Recording available
                        </h3>
                    </div>
                </div>

            </Container>
        </div>
    )
}

export default RecordingSession