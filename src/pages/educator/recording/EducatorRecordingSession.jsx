import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { Calendar, CirclePlay, Timer, Videotape } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSettings } from "@/providers";
import { toAbsoluteUrl } from "@/utils";
import Spinner from "@/components/common/LoadingSpinner"; // Optional loader component
import { it } from "@faker-js/faker";
import VideoPlayerModal from "./VideoPlayerModal";
import { useGetEducatorRecordingDataQuery } from "../../../store/api/educator/educatorRecordingApiSlice";
import VideoThumbnail from "../live-session/VideoThumbnail";
import RecordingThumbnail from "../../student/iq-educators/RecordingThumbnail";

const EducatorRecordingSession = () => {
  const { data, isFetching, isError, error } =
    useGetEducatorRecordingDataQuery();
  const [showAllTags, setShowAllTags] = useState({});
  const [recording, setRecording] = useState(null);
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const { getThemeMode } = useSettings();

  if (isFetching) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-10">
        Error loading recordings: {error?.message || "Something went wrong"}
      </div>
    );
  }

  if (data?.data?.recordings?.length === 0) {
    return (
      <Container className="pb-10">
        <div className="card w-full h-100 items-center justify-center">
          <div className="text-center flex items-center gap-3 flex-col py-24">
            <Videotape size={30} />
            <h3 className="text-xl font-medium text-gray-700">
              No Recording available
            </h3>
          </div>
        </div>
      </Container>
    );
  }

  const toggleTags = (index) => {
    setShowAllTags((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleOpen = (url) => {
    console.log(url, "urls");

    setVideoUrl(url);
    setOpen(true);
  };

  return (
    <div>
      <Container className="pb-10">
        <div
          className="bg-center bg-cover bg-no-repeat hero-bg"
          style={{
            backgroundImage:
              getThemeMode() === "dark"
                ? `url('${toAbsoluteUrl("/media/images/2600x1200/bg-1-dark.png")}')`
                : `url('${toAbsoluteUrl("/media/images/2600x1200/bg-1.png")}')`,
          }}
        >
          <div class="flex flex-col items-center gap-2 lg:gap-3.5 py-4 lg:pt-5 lg:pb-10">
            <img
              src={
                data?.data?.recorder?.thumbnail
                  ? data?.data?.recorder?.thumbnail
                  : "/media/avatars/300-1.png"
              }
              class="rounded-full border-3 border-success size-[100px] shrink-0"
            />
            <div class="flex items-center gap-1.5">
              <div class="text-lg leading-5 font-semibold text-gray-900"></div>
              <h6 class="text-lg font-medium text-gray-900">
                {data?.data?.recorder?.full_name}
              </h6>
            </div>
            <div class="flex flex-wrap justify-center gap-1 lg:gap-4.5 text-sm">
              <div class="flex gap-1.25 items-center">
                <i class="ki-filled ki-user text-gray-500 text-sm"></i>
                <span class="text-gray-600 font-medium">
                  {data?.data?.recorder?.role}
                </span>
              </div>
              <div class="flex gap-1.25 items-center">
                <i class="ki-filled ki-sms text-gray-500 text-sm"></i>
                <a
                  href={`mailto:${data?.data?.recorder?.email}`}
                  class="text-gray-600 font-medium hover:text-primary"
                  rel="noreferrer"
                >
                  {data?.data?.recorder?.email}
                </a>
              </div>
            </div>
          </div>
        </div>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Recorded Academy" />
          </ToolbarHeading>
        </Toolbar>
        <div className="grid grid-cols-12 gap-4">
          {data?.data?.recordings.map((item, index) => {
            const showTags = showAllTags[index] || false;
            const visibleTags = showTags
              ? item.call_tags
              : item.call_tags.slice(0, 3);
            const remainingCount = item.call_tags.length - 3;

            return (
              <div
                className="recorded_card col-span-12 sm:col-span-6 xl:col-span-4"
                key={index}
              >
                <div className="card">
                  {/* Image with Play Button */}
                  <div className="relative w-full h-52 rounded-2xl overflow-hidden"  onClick={() => setRecording(item)}>
                    <RecordingThumbnail
                      videoUrl={item?.url}
                      seekTime={2}
                      recordingThumbnail={item?.thumbnail}
                      onRecordingClick={() => handleOpen(item?.url)}
                      data={recording}
                    />
                    {/* <img
                      className="w-full h-full object-cover"
                      src="/media/images/600x400/1.jpg"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        className="btn btn-icon btn-circle btn-lg"
                        onClick={() => handleOpen(item?.url)}
                      >
                        <CirclePlay size={60} className="text-white" />
                      </button>
                    </div> */}
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4 rounded-2xl">
                    <div className="flex justify-between">
                      <div className="recorded_details">
                        <h6 className="text-xl font-medium text-gray-900 mb-1">
                          {item?.call_title}
                        </h6>
                        <p
                          className="text-2sm text-gray-900 dark:text-gray-900 mb-3"
                          dangerouslySetInnerHTML={{
                            __html: item?.call_description || "",
                          }}
                        ></p>

                        {/* Badge List */}
                        <div className="flex gap-2 flex-wrap">
                          {item?.call_tags.map((badge, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium badge-primary badge-outline"
                            >
                              {badge}
                            </span>
                          ))}

                          {/* Show More / Show Less Toggle */}
                          {item?.call_tags.length > 2 && (
                            <button
                              onClick={() => toggleTags(index)}
                              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700"
                            >
                              {showTags
                                ? "Show Less"
                                : `+${remainingCount} more`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="card-footer justify-between pt-4 p-0 mt-4">
                      <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                        <Calendar size={16} />{" "}
                        {new Date(item?.start_time).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                        <Timer size={18} />{" "}
                        {new Date(item?.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
      <VideoPlayerModal
        open={open}
        onOpenChange={setOpen}
        videoUrl={videoUrl}
        data={recording}
      />
    </div>
  );
};

export default EducatorRecordingSession;
