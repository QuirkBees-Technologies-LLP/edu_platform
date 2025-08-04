import React from 'react'
import { toAbsoluteUrl } from '@/utils/Assets';

const RecordedLive = () => {
    return (
        <div className="mb-5 pt-4">
             <div className="popular pb-5 flex items-center justify-between">
                <div>
                    <a class="text-lg text-gray-800 mb-px" href="/public-profile/profiles/nft">IQ Academy</a>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4 sm:col-span-12">
                       <div className="course-card border-blue-500">
                        <div className="video-library overflow-hidden h-auto relative dark:">
                            <img onClick={() => navigate(`/live-session/1`)}
                                src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                                className="w-full h-48 rounded-xl"
                                alt=""
                            />
                            <div className="video-details absolute bottom-0 p-4">
                                <div class="flex items-center justify-between pt-2">
                                    <a href="#" class=" bg-black text-white p-1 justify-center rounded-sm text-xs">0 Viewers</a>
                                </div>
                            </div>
                            <div className="live absolute top-5 left-5">
                                <a href="#" class=" bg-red-700 text-white pl-1 pr-1 font-semibold bg-red justify-center rounded-sm text-sm">Live</a>
                            </div>
                        </div>
                        <div className="session-details flex items-start gap-3 w-100 mt-3">
                            <div className="session-icon shrink-0">
                                <img
                                    src={toAbsoluteUrl(`/media/avatars/300-2.png`)}
                                    className="size-10 rounded-full object-cover"
                                    alt=""
                                />
                            </div>
                            <div className="session-content">
                                <h5 class="text-black text-md font-semibold" onClick={() => navigate(`/live-session/1`)}>Test</h5>
                                <h6 class="text-black text-sm text-gray-700 hover:text-gray-900">mbAdmin</h6>
                                <div className="flex gap-2 my-3">
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Capa</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Espanol</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                </div>
                            </div>
                        </div>
                       </div>
                </div>
                <div className="col-span-12 md:col-span-4 sm:col-span-12">
                    <a href="">
                        <div className="video-library overflow-hidden h-auto relative dark:">
                            <img onClick={() => navigate(`/live-session/1`)}
                                src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                                className="w-full h-48 rounded-xl"
                                alt=""
                            />
                            <div className="video-details absolute bottom-0 p-4">
                                <div class="flex items-center justify-between pt-2">
                                    <a href="#" class=" bg-black text-white p-1 justify-center rounded-sm text-xs">0 Viewers</a>
                                </div>
                            </div>
                            <div className="live absolute top-5 left-5">
                                <a href="#" class=" bg-red-700 text-white pl-1 pr-1 font-semibold bg-red justify-center rounded-sm text-sm">Live</a>
                            </div>
                        </div>
                        <div className="session-details flex items-start gap-3 w-100 mt-3">
                            <div className="session-icon shrink-0">
                                <img
                                    src={toAbsoluteUrl(`/media/avatars/300-2.png`)}
                                    className="size-10 rounded-full object-cover"
                                    alt=""
                                />
                            </div>
                            <div className="session-content">
                                <h5 class="text-black text-md font-semibold" onClick={() => navigate(`/live-session/1`)}>Test</h5>
                                <h6 class="text-black text-sm text-gray-700 hover:text-gray-900">mbAdmin</h6>
                                <div className="flex gap-2 my-3">
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Capa</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Espanol</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
                <div className="col-span-12 md:col-span-4 sm:col-span-12">
                    <a href="">
                        <div className="video-library overflow-hidden h-auto relative dark:">
                            <img onClick={() => navigate(`/live-session/1`)}
                                src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                                className="w-full h-48 rounded-xl"
                                alt=""
                            />
                            <div className="video-details absolute bottom-0 p-4">
                                <div class="flex items-center justify-between pt-2">
                                    <a href="#" class=" bg-black text-white p-1 justify-center rounded-sm text-xs">0 Viewers</a>
                                </div>
                            </div>
                            <div className="live absolute top-5 left-5">
                                <a href="#" class=" bg-red-700 text-white pl-1 pr-1 font-semibold bg-red justify-center rounded-sm text-sm">Live</a>
                            </div>
                        </div>
                        <div className="session-details flex items-start gap-3 w-100 mt-3">
                            <div className="session-icon shrink-0">
                                <img
                                    src={toAbsoluteUrl(`/media/avatars/300-2.png`)}
                                    className="size-10 rounded-full object-cover"
                                    alt=""
                                />
                            </div>
                            <div className="session-content">
                                <h5 class="text-black text-md font-semibold" onClick={() => navigate(`/live-session/1`)}>Test</h5>
                                <h6 class="text-black text-sm text-gray-700 hover:text-gray-900">mbAdmin</h6>
                                <div className="flex gap-2 my-3">
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Capa</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Espanol</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                    <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default RecordedLive
