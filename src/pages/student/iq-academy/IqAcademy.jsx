import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import {
  useGetAcademyCategoryQuery,
  useGetAcademySingleCategoryQuery,
} from "../../../store/api/client/clientAcademyCategoryApiSlice";
import Loader from "../../../components/ui/loader";
import { addDays, startOfWeek, isSameDay } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Calendar, CalendarDays, Clock, List } from "lucide-react";

function toEST(date) {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
}

export default function IqAcademy() {
  const selectedLanguage = useSelector(selectSelectedLanguage);
  const navigate = useNavigate();

  const [weekOffset, setWeekOffset] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeEducatorId, setActiveEducatorId] = useState(null);
  const [viewType, setViewType] = useState("list");

  const startOfCurrentWeek = startOfWeek(toEST(new Date()), {
    weekStartsOn: 0,
  });
  const displayedWeekStart = addDays(startOfCurrentWeek, weekOffset * 7);
  const displayedWeekEnd = addDays(displayedWeekStart, 6);

  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(displayedWeekStart, i)
  );

  const { data: categoryData, isLoading: isCategoryLoading } =
    useGetAcademyCategoryQuery();

  useEffect(() => {
    if (!isCategoryLoading && categoryData?.data?.length > 0) {
      setActiveCategoryId(categoryData.data[0]._id);
    }
  }, [isCategoryLoading, categoryData]);

  const { data: singleCategoryData, isLoading: isDetailLoading } =
    useGetAcademySingleCategoryQuery(
      {
        id: activeCategoryId,
        language: selectedLanguage,
        startDate: displayedWeekStart.toISOString(),
        endDate: displayedWeekEnd.toISOString(),
      },
      { skip: !activeCategoryId }
    );

  const educators = singleCategoryData?.data?.category?.educators || [];

  useEffect(() => {
    if (educators.length > 0 && !activeEducatorId) {
      setActiveEducatorId(educators[0]._id);
    }
  }, [educators]);

  const activeEducator = educators.find((e) => e._id === activeEducatorId);

  const isToday = (datetime) => isSameDay(new Date(), new Date(datetime));

  const isInitialLoading =
    isCategoryLoading || isDetailLoading || !activeCategoryId;
  console.log(educators.length, "educators.length");

  return (
    <div className="container-fluid">
      {isInitialLoading && (
        <div className="py-10 flex justify-center">
          <Loader />
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {categoryData?.data?.map((cat) => (
          <button
            key={cat._id}
            onClick={() => {
              setActiveCategoryId(cat._id);
              setActiveEducatorId(null);
            }}
            className={`pb-2 border-b-2 text-sm ${activeCategoryId === cat._id
              ? "border-gray-500 text-black dark:text-gray-500"
              : "border-transparent text-gray-500"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* WEEK TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* Left: Week Tabs */}
        <div className="flex gap-6">
          <button
            onClick={() => setWeekOffset(0)}
            className={`pb-3 ${weekOffset === 0
              ? "border-b-2 border-primary text-primary font-semibold"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Current Week
          </button>

          <button
            onClick={() => setWeekOffset(1)}
            className={`pb-3 ${weekOffset === 1
              ? "border-b-2 border-primary text-primary font-semibold"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Next Week
          </button>
        </div>

        {/* Right: View Tabs */}
        <div className="hidden md:flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewType("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${viewType === "list"
              ? "bg-primary text-white shadow font-semibold"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <List size={20} />
          </button>

          <button
            onClick={() => setViewType("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${viewType === "grid"
              ? "bg-primary text-white shadow font-semibold"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <CalendarDays size={20} />
          </button>
        </div>
      </div>
      <div className="hidden md:block">
        {viewType === "grid" ? (
          <div className="hidden md:block">
            {!isInitialLoading && activeCategoryId && singleCategoryData && (
              <>
                {educators.length === 0 ? (
                  <div className="bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full">
                    <div className="text-center">
                      <p className="text-lg sm:text-xl tracking-widest text-gray-500">
                        No Schedule Found
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="card forex_calender rounded-2xl shadow">
                    <div className="calender">
                      <div className="grid grid-cols-8 text-center table_head">
                        <div className="bg-[#1A1446] text-gray-100 dark:text-gray-800 py-5 px-4 font-normal rounded-tl-2xl">
                          Educators
                        </div>
                        {days.map((day) => (
                          <div
                            key={day.toISOString()}
                            className="bg-[#1A1446] text-gray-100 dark:text-gray-800 py-5 px-4 font-normal last:rounded-tr-2xl"
                          >
                            {day.toLocaleDateString("en-US", {
                              weekday: "short",
                              day: "numeric",
                            })}
                          </div>
                        ))}
                      </div>

                      {educators.map((educator, index) => (
                        <div key={index} className="grid grid-cols-8 border-t">
                          <div className="flex flex-col items-center justify-center p-4 bg-gray-200 border-r">
                            <img
                              src={educator.image}
                              alt={educator.first_name}
                              onClick={() =>
                                navigate(`/iq-educators/${educator._id}`)
                              }
                              className="cursor-pointer w-12 h-12 rounded-full mb-2 object-cover object-top"
                            />
                            <span className="text-xs font-normal text-gray-800 text-center">
                              {educator.first_name} {educator.last_name}
                            </span>
                          </div>

                          {days.map((day) => {
                            const filtered =
                              educator.schedules?.filter((s) =>
                                isSameDay(new Date(s.datetime), day)
                              ) || [];

                            return (
                              <div
                                key={day.toISOString()}
                                className="p-2 min-h-[80px] border-r flex flex-col justify-center gap-2"
                              >
                                {filtered.length > 0 ? (
                                  filtered.map((s, i) => (
                                    <div
                                      key={i}
                                      onClick={() =>
                                        navigate(`/iq-educators/${educator._id}`)
                                      }
                                      className={`text-xs rounded-lg p-2 text-center cursor-pointer ${isToday(s.datetime)
                                        ? "bg-[#4E34E3] text-white font-medium shadow-lg"
                                        : "bg-[#E5DEFF] text-[#4E34E3]"
                                        }`}
                                    >
                                      {s.title}
                                      <br />
                                      {new Date(s.datetime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-gray-700 text-center">
                                    –
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!isInitialLoading &&
              activeCategoryId &&
              singleCategoryData &&
              educators.length > 0 && (
                <div className="py-8">
                  <div className="grid grid-cols-3 max-sm:grid-cols-1 max-md:grid-cols-3 max-lg:grid-cols-3 max-xl:grid-cols-4 max-2xl:grid-cols-5 gap-6">
                    {educators.map((educator, index) => (
                      <div
                        key={index}
                        className="card rounded-2xl shadow-md overflow-hidden"
                      >
                        <div className="relative flex items-center justify-center">
                          <img
                            src={educator.image}
                            alt={educator.first_name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="text-gray-900 font-medium text-md mb-4">
                            {educator.first_name} {educator.last_name}
                          </h3>
                          <Link
                            to={`/iq-educators/${educator._id}`}
                            className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="block list_view">
            {/* 🔥 EDUCATOR SLIDER */}
            {educators.length > 0 && (
              <div className="mb-6 relative">
                {/* Left Arrow */}
                <button
                  className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 
                 w-9 h-9 flex items-center justify-center rounded-full 
                 bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
                >
                  ❮
                </button>

                {/* Right Arrow */}
                <button
                  className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 
                 w-9 h-9 flex items-center justify-center rounded-full 
                 bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
                >
                  ❯
                </button>
                <div className="w-full overflow-hidden">

                  <Swiper
                    slidesPerView={3}
                    spaceBetween={10}
                    navigation={{
                      prevEl: ".swiper-button-prev-custom",
                      nextEl: ".swiper-button-next-custom",
                    }}
                    modules={[Navigation]}
                    className="mySwiper w-full px-10"
                    breakpoints={{
                      0: { slidesPerView: 2 },
                      550: { slidesPerView: 3 },
                      640: { slidesPerView: 5 },
                      1199: { slidesPerView: 6 },
                    }}
                  >
                    {educators.map((educator) => (
                      <SwiperSlide key={educator._id}>
                        <div
                          onClick={() => setActiveEducatorId(educator._id)}
                          className="flex flex-col items-center cursor-pointer select-none"
                        >
                          <div
                            className={`w-20 h-20 rounded-full p-[4px] transition-all ${activeEducatorId === educator._id
                              ? "bg-[#4E34E3]"
                              : "bg-gray-300"
                              }`}
                          >
                            <img
                              src={educator.image}
                              alt={educator.first_name}
                              className="w-full h-full rounded-full object-cover bg-white pointer-events-none"
                            />
                          </div>

                          <p className="mt-2 text-xs font-medium text-gray-800 text-center truncate w-20">
                            {educator.first_name}
                          </p>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}

            {/* 🔥 EDUCATOR DETAILS (UNDER TABS) */}
            {activeEducator && (
              <div className="card rounded-2xl shadow p-5 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={activeEducator.image}
                    className="w-12 h-12 rounded-full object-cover"
                    alt=""
                  />
                  <h3 className="font-semibold text-gray-900">
                    {activeEducator.first_name} {activeEducator.last_name}
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  {activeEducator.schedules?.length > 0 ? (
                    activeEducator.schedules.map((s, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          navigate(`/iq-educators/${activeEducator._id}`)
                        }
                        className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${isToday(s.datetime)
                          ? "bg-[#4E34E3] text-white"
                          : "bg-[#E5DEFF] text-[#4E34E3]"
                          }`}
                      >
                        <span className="text-sm font-medium">{s.title}</span>
                        <div className="flex items-center gap-5">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Clock size={18} />
                            <span className="text-xs">
                              {new Date(s.datetime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Calendar size={18} />
                            <span className="text-xs">
                              {new Date(s.datetime)
                                .toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  weekday: "short",
                                })
                                .replace(",", "-")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No sessions scheduled.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="block md:hidden">
        <div className="block list_view">
          {/* 🔥 EDUCATOR SLIDER */}
          {educators.length > 0 && (
            <div className="mb-6 relative">
              {/* Left Arrow */}
              <button
                className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 
                 w-9 h-9 flex items-center justify-center rounded-full 
                 bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
              >
                ❮
              </button>

              {/* Right Arrow */}
              <button
                className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 
                 w-9 h-9 flex items-center justify-center rounded-full 
                 bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
              >
                ❯
              </button>
              <div className="w-full overflow-hidden">

                <Swiper
                  slidesPerView={3}
                  spaceBetween={10}
                  navigation={{
                    prevEl: ".swiper-button-prev-custom",
                    nextEl: ".swiper-button-next-custom",
                  }}
                  modules={[Navigation]}
                  className="mySwiper w-full px-10"
                  breakpoints={{
                    0: { slidesPerView: 2 },
                    550: { slidesPerView: 3 },
                    640: { slidesPerView: 5 },
                    1199: { slidesPerView: 6 },
                  }}
                >
                  {educators.map((educator) => (
                    <SwiperSlide key={educator._id}>
                      <div
                        onClick={() => setActiveEducatorId(educator._id)}
                        className="flex flex-col items-center cursor-pointer select-none"
                      >
                        <div
                          className={`w-20 h-20 rounded-full p-[4px] transition-all ${activeEducatorId === educator._id
                            ? "bg-[#4E34E3]"
                            : "bg-gray-300"
                            }`}
                        >
                          <img
                            src={educator.image}
                            alt={educator.first_name}
                            className="w-full h-full rounded-full object-cover bg-white pointer-events-none"
                          />
                        </div>

                        <p className="mt-2 text-xs font-medium text-gray-800 text-center truncate w-20">
                          {educator.first_name}
                        </p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}

          {/* 🔥 EDUCATOR DETAILS (UNDER TABS) */}
          {activeEducator && (
            <div className="card rounded-2xl shadow p-5 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={activeEducator.image}
                  className="w-12 h-12 rounded-full object-cover"
                  alt=""
                />
                <h3 className="font-semibold text-gray-900">
                  {activeEducator.first_name} {activeEducator.last_name}
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {activeEducator.schedules?.length > 0 ? (
                  activeEducator.schedules.map((s, i) => (
                    <div
                      key={i}
                      onClick={() =>
                        navigate(`/iq-educators/${activeEducator._id}`)
                      }
                      className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${isToday(s.datetime)
                        ? "bg-[#4E34E3] text-white"
                        : "bg-[#E5DEFF] text-[#4E34E3]"
                        }`}
                    >
                      <span className="text-sm font-medium">{s.title}</span>
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Clock size={18} />
                          <span className="text-xs">
                            {new Date(s.datetime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Calendar size={18} />
                          <span className="text-xs">
                            {new Date(s.datetime)
                              .toLocaleDateString("en-GB", {
                                day: "2-digit",
                                weekday: "short",
                              })
                              .replace(",", "-")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No sessions scheduled.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
