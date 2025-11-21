import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";

import { Calendar, CirclePlay, Clock3, Timer, Videotape } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSettings } from "@/providers";
import { toAbsoluteUrl } from "@/utils";
import Spinner from "@/components/common/LoadingSpinner"; // Optional loader component
import { it } from "@faker-js/faker";
import VideoPlayerModal from "./VideoPlayerModal";
import { useLazyGetEducatorRecordingQuery } from "../../../store/api/educator/educatorRecordingApiSlice";
import VideoThumbnail from "../live-session/VideoThumbnail";
import RecordingThumbnail from "../../student/iq-educators/RecordingThumbnail";
import {
  KeenIcon,
  MenuIcon,
  MenuLink,
  MenuSub,
  MenuTitle,
  Menu,
  MenuItem,
  MenuToggle,
} from "@/components";
import DeleteEducatorRecording from "./DeleteEducatorRecording";
import CreateEducatorRecording from "./CreateEducatorRecording";
import { reload } from "@firebase/auth";
import UpdateEducatorRecording from "./UpdateEducatorRecording";
import { set } from "date-fns";

const EducatorRecordingSession = () => {
  const [showAllTags, setShowAllTags] = useState({});
  const [recording, setRecording] = useState(null);
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [updateDeleteRecording, setUpdateDeleteRecording] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const { getThemeMode } = useSettings();
  const observer = useRef();

  const [trigger, { data, isFetching, isError, error }] =
    useLazyGetEducatorRecordingQuery();
  const [recordingList, setRecordingList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await trigger({ page, limit }).unwrap();

        const newData = Array.isArray(res?.data?.recordings)
          ? res.data.recordings
          : [];

        setTotalPages(res?.data?.pagination?.totalPages || 1);

        setRecordingList((prev) => {
          if (page === 1) return newData;
          const unique = newData.filter(
            (item) => !prev.some((p) => p._id === item._id)
          );
          return [...prev, ...unique];
        });
      } catch (err) {
        console.error("Error fetching recordings:", err);
      }
    };

    fetchData();
  }, [page, data]);

  useEffect(() => {
    if (!isUpdateOpen && !isDeleteOpen && !isCreateOpen) {
      setPage(1);
      setRecordingList([]);
      trigger({ page: 1, limit }).unwrap().catch(console.error);
    }
  }, [isUpdateOpen, isDeleteOpen, isCreateOpen]);

  const lastRecordingRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first.isIntersecting && page < totalPages && !isFetching) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [isFetching, page, totalPages]
  );
  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  const toggleTags = (index) => {
    setShowAllTags((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleOpen = (url) => {
    setVideoUrl(url);
    setOpen(true);
  };

  const handleActionClick = (item) => {
    setUpdateDeleteRecording(item);
  };

  const handleDeleteOpen = () => setIsDeleteOpen(true);
  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleUpdateOpen = () => setIsUpdateOpen(true);
  const handleCloseUpdate = () => {
    setIsUpdateOpen(false);
    setSelectedRow(null);
  };

  const handleClickOpen = () => setIsCreateOpen(true);
  const handleCloseCreate = () => setIsCreateOpen(false);
  const ActionMenu = (item) => (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      <MenuItem
        onClick={() => {
          handleActionClick(item);
          handleUpdateOpen();
        }}
      >
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="notepad-edit" />
          </MenuIcon>
          <MenuTitle>Update</MenuTitle>
        </MenuLink>
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleActionClick(item);
          handleDeleteOpen();
        }}
      >
        <MenuLink>
          <MenuIcon>
            <KeenIcon icon="trash" />
          </MenuIcon>
          <MenuTitle>Delete</MenuTitle>
        </MenuLink>
      </MenuItem>
    </MenuSub>
  );

  if (isError) {
    return (
      <div className="text-red-500 text-center py-10">
        Error loading recordings: {error?.message || "Something went wrong"}
      </div>
    );
  }

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
                data?.data?.recorder?.image
                  ? data?.data?.recorder?.image
                  : "/media/avatars/300-1.png"
              }
              class="rounded-full border-3 border-success size-[100px] shrink-0 object-cover"
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
          <ToolbarActions>
            <div className="text-end pb-4">
              <button className="btn btn-primary" onClick={handleClickOpen}>
                Upload recorded session
              </button>
            </div>
          </ToolbarActions>
        </Toolbar>
        {/* ✅ CONDITIONAL GRID OR EMPTY STATE */}
        {recordingList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Videotape size={32} className="text-gray-500" />
            <h3 className="text-lg font-medium text-gray-700">
              No recordings available
            </h3>
            {/* <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary mt-4"
          >
            Create Recording
          </button> */}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {recordingList?.map((item, index) => {
              const showTags = showAllTags[index] || false;
              const visibleTags = showTags
                ? item.call_tags
                : item.call_tags.slice(0, 3);
              const remainingCount = item.call_tags.length - 3;

              return (
                <div
                  className="recorded_card col-span-12 sm:col-span-6 xl:col-span-4"
                  key={index}
                  ref={
                    index === recordingList?.length - 1
                      ? lastRecordingRef
                      : null
                  }
                >
                  <div className="card">
                    {/* Image with Play Button */}
                    <div
                      className="relative w-full h-52 rounded-t-2xl overflow-hidden"
                      onClick={() => setRecording(item)}
                    >
                      <RecordingThumbnail
                        videoUrl={item?.url}
                        seekTime={2}
                        image={item?.thumbnail}
                        defaultImage={data?.data?.recorder?.bannerImage}
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
                        <div className="ml-2">
                          <Menu className="items-stretch">
                            <MenuItem
                              toggle="dropdown"
                              trigger="click"
                              placement="bottom-end"
                              className="p-0"
                            >
                              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                                <KeenIcon icon="dots-vertical" />
                              </MenuToggle>
                              {ActionMenu(item)}
                            </MenuItem>
                          </Menu>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="card-footer justify-between pt-4 p-0 mt-4">
                        <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                          <Calendar size={16} />{" "}
                          {new Date(item?.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-900 flex items-center gap-2">
                          <Clock3 size={18} />{" "}
                          {new Date(item?.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {isFetching && page > 1 && (
          <div className="flex justify-center py-8 text-gray-500">
            <Spinner />
          </div>
        )}
      </Container>
      <VideoPlayerModal
        open={open}
        onOpenChange={setOpen}
        videoUrl={videoUrl}
        data={recording}
      />
      {isDeleteOpen && (
        <DeleteEducatorRecording
          refetch={trigger}
          onClose={handleDeleteClose}
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={handleDeleteClose}
          selectedRow={updateDeleteRecording}
        />
      )}
      {isCreateOpen && (
        <CreateEducatorRecording
          // setSelectedRow={setSelectedRow}
          handleCloseCreate={handleCloseCreate}
          isCreateOpen={isCreateOpen}
          setIsCreateOpen={setIsCreateOpen}
          refetch={trigger}
          // selectedRow={updateDeleteRecording}
        />
      )}
      {isUpdateOpen && (
        <UpdateEducatorRecording
          setSelectedRow={setSelectedRow}
          handleCloseUpdate={handleCloseUpdate}
          isUpdateOpen={isUpdateOpen}
          setIsUpdateOpen={setIsUpdateOpen}
          refetch={trigger}
          selectedRow={updateDeleteRecording}
        />
      )}
    </div>
  );
};

export default EducatorRecordingSession;
