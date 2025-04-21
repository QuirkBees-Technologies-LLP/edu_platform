import React from 'react'
import { toAbsoluteUrl } from "@/utils/Assets";
import { Row } from 'react-day-picker';
import "./VideoLibrary.css";
import { Play } from 'lucide-react';
const VideoLibrary = () => {
  return (
    <div className='container-fluid'>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <div className="video-library overflow-hidden h-full relative dark:">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-full rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3xl font-semibold text-gray-100 dark:text-gray-900'>Code a responsive landing page using Tailwind CSS</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900" href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
        <div className="col-span-6">
          <div className='grid grid-cols-12 gap-4'>
            <div className="col-span-6">
              <div className="video-library overflow-hidden  relative">
                <img
                  src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                  className="w-full h-auto rounded-xl"
                  alt=""
                />
                <div className="video-details absolute bottom-0 p-4">
                  <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>Designing a consistent UI framework for your app</h2>
                  <div class="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                      <div>
                        <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                        <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
                  </div>
                </div>
                <div className="play-btn playing absolute top-5 left-5">
                  <Play />
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="video-library overflow-hidden  relative">
                <img
                  src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                  className="w-full h-auto rounded-xl"
                  alt=""
                />
                <div className="video-details absolute bottom-0 p-4">
                  <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>Designing a set of chart widgets for my next dashboard</h2>
                  <div class="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                      <div>
                        <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                        <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
                  </div>
                </div>
                <div className="play-btn playing absolute top-5 left-5">
                  <Play />
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="video-library overflow-hidden  relative">
                <img
                  src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                  className="w-full h-auto rounded-xl"
                  alt=""
                />
                <div className="video-details absolute bottom-0 p-4">
                  <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>Integrating minimalism and negative space in your designs</h2>
                  <div class="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                      <div>
                        <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                        <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
                  </div>
                </div>
                <div className="play-btn playing absolute top-5 left-5">
                  <Play />
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="video-library overflow-hidden  relative">
                <img
                  src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                  className="w-full h-auto rounded-xl"
                  alt=""
                />
                <div className="video-details absolute bottom-0 p-4">
                  <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>Creating reusable sections using Tailwind CSS</h2>
                  <div class="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                      <div>
                        <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                        <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
                  </div>
                </div>
                <div className="play-btn playing absolute top-5 left-5">
                  <Play />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="popular py-5 flex items-center justify-between">
        <div>
          <a class="text-lg text-gray-800 mb-px" href="/public-profile/profiles/nft">Popular Videos</a>
          <div class="text-2sm text-gray-600 mb-px">Videos that were recently viewed by many people</div>
        </div>
        <a class="btn btn-sm rounded-full text-sm btn-light justify-center px-5">Upload</a>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="video-library overflow-hidden  relative">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
              className="w-full h-auto rounded-xl"
              alt=""
            />
            <div className="video-details absolute bottom-0 p-4">
              <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>How to think a mobile app landing page design</h2>
              <div class="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <img src={toAbsoluteUrl(`/media/avatars/300-6.png`)} class="rounded-full size-10 me-2" alt=""/>
                  <div>
                    <a class="text-2sm text-gray-100 mb-px dark:text-gray-900 " href="/public-profile/profiles/nft">Cody Fisher</a>
                    <div class="text-2xs text-gray-300 mb-px dark:text-gray-700 ">2 hours ago</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary rounded-full justify-center">Watch</button>
              </div>
            </div>
            <div className="play-btn playing absolute top-5 left-5">
              <Play />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoLibrary

