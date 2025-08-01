import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

import { useGetClientAllCoursesQuery } from '../../../store/api/client/clientCoursesApiSlice';

import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import Loader from '../../../components/ui/loader';
import ThumbnailImage from './ThumbnailImage';
import EducatorImage from './EducatorImage';

import "./VideoLibrary.css";

const VideoLibrary = () => {
  const { data, isLoading, isFetching } = useGetClientAllCoursesQuery();
  const loading = isLoading || isFetching;

  const courses = data?.data ?? [];

  const featuredVideo = courses.length > 0 ? courses[0] : null;
  const otherVideos = courses.length > 1 ? courses.slice(1, 5) : [];
  const remainingVideos = courses.length > 5 ? courses.slice(5) : [];

  // 🔐 Don't even render unless data is ready
  if (loading || !Array.isArray(courses) || courses.length === 0) {
  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Video Library" />
          <ToolbarDescription>
            Explore a collection of educational videos to enhance your trading knowledge and skills.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>
      <Loader />
    </div>
  );
}

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Video Library" />
          <ToolbarDescription>
            Explore a collection of educational videos to enhance your trading knowledge and skills.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      {/* Featured Video */}
      {featuredVideo && (
        <div className="grid grid-cols-12 gap-4">
          <div className="xl:col-span-4 sm:col-span-6 col-span-12">
            <Link to={`/academy/course/detail/${featuredVideo._id}`}>
              <div className="video-library">
                <ThumbnailImage
                  image={featuredVideo?.imageUrl}
                  defaultImage="/media/images/600x400/1.jpg"
                />
                <div className="video-details p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <EducatorImage
                        educator={featuredVideo?.instructor}
                        defaultImage="/media/avatars/300-6.png"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-900">
                          {featuredVideo?.title}
                        </h2>
                        {featuredVideo?.instructor && (
                          <Link
                            className="text-2sm text-gray-900 mb-px dark:text-gray-900"
                            to={`/academy/course/${featuredVideo?.instructor?._id}`}
                          >
                            {featuredVideo?.instructor?.first_name}{" "}
                            {featuredVideo?.instructor?.last_name}
                          </Link>
                        )}
                        {featuredVideo?.createdAt && (
                          <div className="text-2xs text-gray-900 mb-px dark:text-gray-700">
                            {format(new Date(featuredVideo.createdAt), "MMM dd, yyyy")}
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      className="btn btn-sm btn-primary rounded-full justify-center"
                      to={`/academy/course/detail/${featuredVideo?._id}`}
                    >
                      Watch
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Other Videos */}
          {otherVideos.map((video, index) =>
            video ? (
              <div key={video._id || index} className="xl:col-span-4 sm:col-span-6 col-span-12">
                <Link to={`/academy/course/detail/${video._id}`}>
                  <div className="video-library">
                    <ThumbnailImage
                      image={video?.imageUrl}
                      defaultImage="/media/images/600x400/1.jpg"
                    />
                    <div className="video-details p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <EducatorImage
                            educator={video?.instructor}
                            defaultImage="/media/avatars/300-6.png"
                          />
                          <div>
                            <h2 className="text-3sm font-semibold text-gray-900 dark:text-gray-900">
                              {video?.title}
                            </h2>
                            {video?.instructor && (
                              <Link
                                className="text-2sm text-gray-900 mb-px dark:text-gray-900"
                                to={`/academy/course/${video?.instructor?._id}`}
                              >
                                {video?.instructor?.first_name}{" "}
                                {video?.instructor?.last_name}
                              </Link>
                            )}
                            {video?.createdAt && (
                              <div className="text-2xs text-gray-900 mb-px dark:text-gray-700">
                                {format(new Date(video.createdAt), "MMM dd, yyyy")}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          className="btn btn-sm btn-primary rounded-full justify-center"
                          to={`/academy/course/detail/${video._id}`}
                        >
                          Watch
                        </Link>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Remaining Videos */}
      {remainingVideos.length > 0 && (
        <>
          <div className="popular py-5 flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-800 mb-px">Popular Videos</p>
              <div className="text-2sm text-gray-600 mb-px">
                Videos that were recently viewed by many people
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {remainingVideos.map((video, index) =>
              video ? (
                <div key={video._id || index} className="col-span-4">
                  <div className="video-library overflow-hidden relative">
                    <ThumbnailImage
                      image={video?.imageUrl}
                      defaultImage="/media/images/600x400/1.jpg"
                    />
                    <div className="video-details p-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-900">
                        {video?.title}
                      </h2>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <EducatorImage
                            educator={video?.instructor}
                            defaultImage="/media/avatars/300-6.png"
                          />
                          <div>
                            {video?.instructor && (
                              <Link
                                className="text-2sm text-gray-900 mb-px dark:text-gray-900"
                                to={`/academy/course/${video?.instructor?._id}`}
                              >
                                {video?.instructor?.first_name}{" "}
                                {video?.instructor?.last_name}
                              </Link>
                            )}
                            {video?.createdAt && (
                              <div className="text-2xs text-gray-900 mb-px dark:text-gray-700">
                                {format(new Date(video.createdAt), "MMM dd, yyyy")}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link
                          className="btn btn-sm btn-primary rounded-full justify-center"
                          to={`/academy/course/detail/${video._id}`}
                        >
                          Watch
                        </Link>
                      </div>
                    </div>
                    <Link className="btn btn-sm" to={`/academy/course/detail/${video._id}`}>
                      <div className="play-btn playing absolute top-5 left-5">
                        <Play />
                      </div>
                    </Link>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoLibrary;
