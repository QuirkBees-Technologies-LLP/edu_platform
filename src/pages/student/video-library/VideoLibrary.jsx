import React from 'react'
import { toAbsoluteUrl } from "@/utils/Assets";
import { Row } from 'react-day-picker';
import "./VideoLibrary.css";
import { Play } from 'lucide-react';
import { useGetClientAllCoursesQuery } from '../../../store/api/client/clientCoursesApiSlice';
import { format } from 'date-fns';
import EducatorImage from './EducatorImage';
import { Link } from 'react-router-dom';
import ThumbnailImage from './ThumbnailImage';
import Loader from '../../../components/ui/loader';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/breadcrumb';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
 
const VideoLibrary = () => {
  const { data, isLoading } = useGetClientAllCoursesQuery();
  const courses = data?.data;
  const featuredVideo = courses?.[0]; // The first video is "featured"
  const otherVideos = courses?.slice(1, 5); // Get the next 4 videos for the second 
  const remainingVideos = courses?.slice(5); // You can lazy-load these

  return (
    <div className='container-fluid'>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Video Library" />
          <ToolbarDescription>
            Explore a collection of educational videos to enhance your trading knowledge and skills.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>
      {(isLoading || !data) ? <Loader /> : null}
      <div className="grid grid-cols-12 gap-4">
        <div className="xl:col-span-4 sm:col-span-6 col-span-12">
          <Link to={`/academy/course/detail/${featuredVideo?._id}`}>
              <div className="video-library">
              <ThumbnailImage
                image={featuredVideo?.imageUrl}
                defaultImage="/media/images/600x400/1.jpg"
              />
              <div className="video-details p-4">
                {/* <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>{featuredVideo?.title}</h2> */}
                <div class="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <EducatorImage
                      educator={featuredVideo?.instructor}  // The course object containing the imageUrl and title
                      defaultImage="/media/avatars/300-6.png"  // Your fallback default image
                    />
                    <div>
                      <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-900'>{featuredVideo?.title}</h2>
                      <Link class="text-2sm text-gray-900 mb-px dark:text-gray-900" to={`/academy/course/${featuredVideo?.instructor?._id}`}>{featuredVideo?.instructor?.first_name + " " + featuredVideo?.instructor?.last_name}</Link>
                      {featuredVideo?.createdAt && <div class="text-2xs text-gray-900 mb-px dark:text-gray-700">{format(featuredVideo?.createdAt, "MMM dd, yyyy")}</div>}
                    </div>
                  </div>
                  <Link class="btn btn-sm btn-primary rounded-full justify-center" to={`/academy/course/detail/${featuredVideo?._id}`}>Watch</Link>
                </div>
              </div>
              {/* <Link className='btn btn-sm' to={`/academy/course/detail/${featuredVideo?._id}`}>
                <div className="play-btn absolute top-5 left-5">
                  <Play />
                </div>
              </Link> */}
            </div>
          </Link>
        </div>
          {otherVideos?.length > 0 && otherVideos.map((video, index) => {
            return (
                <div className="xl:col-span-4 sm:col-span-6 col-span-12">
                  <Link to={`/academy/course/detail/${featuredVideo?._id}`}>
                    <div className="video-library">
                    <ThumbnailImage
                      image={video?.imageUrl}
                      defaultImage="/media/images/600x400/1.jpg"
                    />
                    <div className="video-details p-4">
                      {/* <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>{video?.title}</h2> */}
                      <div class="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <EducatorImage
                            educator={video?.instructor}
                            defaultImage="/media/avatars/300-6.png"
                          />
                          <div>
                            <h2 className='text-3sm font-semibold text-gray-900 dark:text-gray-900 '>{video?.title}</h2>
                            <Link class="text-2sm text-gray-900 mb-px dark:text-gray-900 " to={`/academy/course/${video?.instructor?._id}`}>{video?.instructor?.first_name + " " + video?.instructor?.last_name}</Link>
                            {video?.createdAt && <div class="text-2xs text-gray-900 mb-px dark:text-gray-700">{format(video?.createdAt, "MMM dd, yyyy")}</div>}
                          </div>
                        </div>
                        <Link class="btn btn-sm btn-primary rounded-full justify-center" to={`/academy/course/detail/${video?._id}`}>Watch</Link>
                      </div>
                    </div>
                    {/* <Link className='btn btn-sm' to={`/academy/course/detail/${video?._id}`}>
                      <div className="play-btn playing absolute top-5 left-5">
                        <Play />
                      </div>
                    </Link> */}
                  </div>
                  </Link>
          </div>
              )
            })}
        
      </div>
      {
        remainingVideos?.length > 0 && (
          <>
            <div className="popular py-5 flex items-center justify-between">
              <div>
                <p class="text-lg text-gray-800 mb-px" href="/public-profile/profiles/nft">Popular Videos</p>
                <div class="text-2sm text-gray-600 mb-px">Videos that were recently viewed by many people</div>
              </div>
              {/* <a class="btn btn-sm rounded-full text-sm btn-light justify-center px-5">Upload</a> */}
            </div>
            <div className="grid grid-cols-12 gap-4">
              {remainingVideos?.map((video, index) => {
                return (
                  <div className="col-span-4">
                    <div className="video-library overflow-hidden  relative">
                      <ThumbnailImage
                        image={video?.imageUrl}
                        defaultImage="/media/images/600x400/1.jpg"
                      />
                      <div className="video-details absolute bottom-0 p-4">
                        <h2 className='text-3sm font-semibold text-gray-100 dark:text-gray-900 '>{video?.title}</h2>
                        <div class="flex items-center justify-between pt-2">
                          <div className="flex items-center">
                            <EducatorImage
                              educator={video?.instructor}  // The course object containing the imageUrl and title
                              defaultImage="/media/avatars/300-6.png"  // Your fallback default image
                            />
                            <div>
                              <Link class="text-2sm text-gray-100 mb-px dark:text-gray-900 " to={`/academy/course/${video?.instructor?._id}`}>{video?.instructor?.first_name + " " + video?.instructor?.last_name}</Link>
                              {video?.createdAt && <div class="text-2xs text-gray-300 mb-px dark:text-gray-700">{format(video?.createdAt, "MMM dd, yyyy")}</div>}
                            </div>
                          </div>
                          <Link class="btn btn-sm btn-primary rounded-full justify-center" to={`/academy/course/detail/${video?._id}`}>Watch</Link>
                        </div>
                      </div>
                      <Link className='btn btn-sm' to={`/academy/course/detail/${video?._id}`}>
                        <div className="play-btn playing absolute top-5 left-5">
                          <Play />
                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )
      }
    </div>
  )
}

export default VideoLibrary

