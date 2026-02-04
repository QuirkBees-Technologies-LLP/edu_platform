import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isSameDay } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Calendar, Clock } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

// Timezone color mapping
const timeZoneColors = {
    new_york: "bg-[#4E34E3]",
    london: "bg-[#14B8A6]",
    asian: "bg-[#E3A534]",
};

// Timezone light background colors for schedule list
const timeZoneLightBgColors = {
    new_york: "bg-[#b2a3e9]",
    london: "bg-[#CCFBF1]",
    asian: "bg-[#FFF5E5]",
};

// Timezone text colors
const timeZoneTextColors = {
    new_york: "text-[#4E34E3]",
    london: "text-[#14B8A6]",
    asian: "text-[#E3A534]",
};

// Digital Marketing category colors (Sky Blue theme)
const digitalMarketingColors = {
    solid: "bg-[#2196F3]",
    light: "bg-[#E3F2FD]",
    text: "text-[#2196F3]",
};

// Helper function to check if schedule belongs to Digital Marketing category
const isDigitalMarketingCategory = (schedule) => {
    const categoryName = schedule?.category?.name?.toLowerCase() || "";
    const categorySlug = schedule?.category?.slug?.toLowerCase() || "";
    return (
        categoryName === "digital marketing" ||
        categoryName === "digitalmarketing" ||
        categorySlug === "digital-marketing" ||
        categorySlug === "digitalmarketing"
    );
};

// Helper function to get timezone key from schedule
const getTimeZoneKey = (schedule) => {
    const tz = schedule?.timeZone?.toLowerCase() || "";
    if (tz.includes("new_york") || tz.includes("new york") || tz.includes("america")) return "new_york";
    if (tz.includes("london") || tz.includes("europe")) return "london";
    if (tz.includes("asian") || tz.includes("asia") || tz.includes("tokyo") || tz.includes("sydney")) return "asian";
    return "new_york"; // default
};

export default function GridView({ educators, days, isLoading, activeCategoryId, singleCategoryData }) {
    const navigate = useNavigate();

    // Internal state for mobile educator selection - does NOT affect parent state
    const [selectedEducatorIdInternal, setSelectedEducatorIdInternal] = useState(null);

    const isToday = (datetime) => isSameDay(new Date(), new Date(datetime));
    const isTodayColumn = (day) => isSameDay(new Date(), day);

    // Set first educator as default for mobile slider when educators load
    useEffect(() => {
        if (educators?.length > 0 && !selectedEducatorIdInternal) {
            setSelectedEducatorIdInternal(educators[0]?._id);
        }
    }, [educators, selectedEducatorIdInternal]);

    // Get the selected educator for mobile view
    const selectedEducator = educators?.find(e => e?._id === selectedEducatorIdInternal) || educators?.[0];

    if (isLoading || !activeCategoryId || !singleCategoryData) {
        return null;
    }

    return (
        <div className="block">
            {educators?.length === 0 ? (
                <div className="bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full">
                    <div className="text-center">
                        <p className="text-lg sm:text-xl tracking-widest text-gray-500">
                            No Schedule Found
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* 🔥 DESKTOP CALENDAR VIEW (md and above) */}
                    <div className="hidden md:block card forex_calender rounded-2xl shadow overflow-hidden">
                        {/* Timezone/Category Legend Header */}
                        <div className="flex items-center justify-center gap-8 py-4 bg-[#07041f] flex-wrap">
                            {(singleCategoryData?.data?.category?.name?.toLowerCase() === "digital marketing" ||
                                singleCategoryData?.data?.category?.name?.toLowerCase() === "digitalmarketing" ||
                                singleCategoryData?.data?.category?.slug?.toLowerCase() === "digital-marketing" ||
                                singleCategoryData?.data?.category?.slug?.toLowerCase() === "digitalmarketing") ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#2196F3] border border-[#E3F2FD]"></div>
                                    <span className="text-sm text-gray-100 dark:text-gray-800">Digital Marketing</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#E3A534] border border-[#FFF5E5]"></div>
                                        <span className="text-sm text-gray-100 dark:text-gray-800">Asian Session</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#14B8A6] border border-[#CCFBF1]"></div>
                                        <span className="text-sm text-gray-100 dark:text-gray-800">London Session</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#b2a3e9] border border-[#E5DEFF]"></div>
                                        <span className="text-sm text-gray-100 dark:text-gray-800">New York Session</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="calender">
                            <div className="grid grid-cols-8 text-center table_head">
                                <div className="bg-[#1A1446] text-gray-100 dark:text-gray-800 py-5 px-4 font-normal ">
                                    Educators
                                </div>
                                {days.map((day, dayIndex) => (
                                    <div
                                        key={day.toISOString()}
                                        className="bg-[#1A1446] text-gray-100 dark:text-gray-800 py-5 px-4 font-normal"
                                    >
                                        {day.toLocaleDateString("en-US", {
                                            weekday: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                ))}
                            </div>

                            {educators?.map((educator, index) => (
                                <div key={index} className="grid grid-cols-8 border-t">
                                    <div className="flex flex-col items-center justify-center p-4 bg-gray-200 border-r">
                                        <img
                                            src={educator?.image}
                                            alt={educator?.first_name}
                                            onClick={() =>
                                                navigate(`/iq-educators/${educator?._id}`)
                                            }
                                            className="cursor-pointer w-12 h-12 rounded-full mb-2 object-cover object-top"
                                        />
                                        <span className="text-xs font-normal text-gray-800 text-center">
                                            {educator?.first_name} {educator?.last_name}
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
                                                className={`p-2 min-h-[80px] border-r flex flex-col justify-center gap-2 ${isTodayColumn(day) ? "bg-gray-300" : ""
                                                    }`}
                                            >
                                                {filtered.length > 0 ? (
                                                    filtered.map((s, i) => {
                                                        const isDigitalMkt = isDigitalMarketingCategory(s);
                                                        let todayClass, defaultClass;
                                                        if (isDigitalMkt) {
                                                            todayClass = `${digitalMarketingColors.solid} text-white font-medium shadow-lg`;
                                                            defaultClass = `${digitalMarketingColors.light} ${digitalMarketingColors.text}`;
                                                        } else {
                                                            const tzKey = getTimeZoneKey(s);
                                                            todayClass = `${timeZoneColors[tzKey]} text-white font-medium shadow-lg`;
                                                            defaultClass = `${timeZoneLightBgColors[tzKey]} ${timeZoneTextColors[tzKey]}`;
                                                        }
                                                        return (
                                                            <div
                                                                key={i}
                                                                onClick={() =>
                                                                    navigate(`/iq-educators/${educator?._id}`)
                                                                }
                                                                className={`text-xs rounded-lg p-2 text-center cursor-pointer ${isToday(s?.datetime)
                                                                    ? todayClass
                                                                    : defaultClass
                                                                    }`}
                                                            >
                                                                {s?.title}
                                                                <br />
                                                                {new Date(s?.datetime).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </div>
                                                        );
                                                    })
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

                    {/* 🔥 MOBILE CALENDAR VIEW (below md) */}
                    <div className="md:hidden mt-6">
                        {/* 🔥 EDUCATOR SLIDER */}
                        <div className="mb-6 relative">
                            {/* Left Arrow */}
                            <button
                                className="swiper-button-prev-grid absolute left-0 top-1/2 -translate-y-1/2 z-10 
                                 w-9 h-9 flex items-center justify-center rounded-full 
                                 bg-white dark:bg-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-100"
                            >
                                ❮
                            </button>

                            {/* Right Arrow */}
                            <button
                                className="swiper-button-next-grid absolute right-0 top-1/2 -translate-y-1/2 z-10 
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
                                        prevEl: ".swiper-button-prev-grid",
                                        nextEl: ".swiper-button-next-grid",
                                    }}
                                    modules={[Navigation]}
                                    className="mySwiper w-full px-10"
                                    breakpoints={{
                                        0: { slidesPerView: 3 },
                                        400: { slidesPerView: 4 },
                                        550: { slidesPerView: 5 },
                                    }}
                                >
                                    {educators?.map((educator) => (
                                        <SwiperSlide key={educator?._id}>
                                            <div
                                                onClick={() => setSelectedEducatorIdInternal(educator?._id)}
                                                className="flex flex-col 
                                                mt-3
                                                items-center cursor-pointer select-none"
                                            >
                                                <div
                                                    className={`w-16 h-16 rounded-full p-[3px] transition-all ${selectedEducatorIdInternal === educator?._id
                                                        ? "bg-[#4E34E3] ring-2 ring-offset-2 ring-[#4E34E3] shadow-lg"
                                                        : "bg-gray-300 dark:bg-gray-600"
                                                        }`}
                                                >
                                                    <img
                                                        src={educator?.image}
                                                        alt={educator?.first_name}
                                                        className="w-full h-full rounded-full object-cover bg-white pointer-events-none"
                                                    />
                                                </div>
                                                <p className={`mt-2 text-xs font-medium text-center truncate w-16 ${selectedEducatorIdInternal === educator?._id
                                                    ? "text-[#4E34E3] font-semibold"
                                                    : "text-gray-800 dark:text-gray-200"
                                                    }`}>
                                                    {educator?.first_name}
                                                </p>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>

                        {/* Timezone/Category Legend Header */}
                        <div className="card rounded-2xl shadow mb-4 p-4">
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                {(singleCategoryData?.data?.category?.name?.toLowerCase() === "digital marketing" ||
                                    singleCategoryData?.data?.category?.name?.toLowerCase() === "digitalmarketing" ||
                                    singleCategoryData?.data?.category?.slug?.toLowerCase() === "digital-marketing" ||
                                    singleCategoryData?.data?.category?.slug?.toLowerCase() === "digitalmarketing") ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#2196F3] border border-[#E3F2FD]"></div>
                                        <span className="text-xs text-gray-700 dark:text-gray-300">Digital Marketing</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-[#E3A534] border border-[#FFF5E5]"></div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300">Asian</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-[#14B8A6] border border-[#CCFBF1]"></div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300">London</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-[#b2a3e9] border border-[#E5DEFF]"></div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300">New York</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile - Selected Educator Card with All Schedules */}
                        {selectedEducator && (
                            <div className="card rounded-2xl shadow p-5 mb-8">
                                {/* Educator Name Header */}
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={selectedEducator?.image}
                                        alt={selectedEducator?.first_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {selectedEducator?.first_name} {selectedEducator?.last_name}
                                    </h3>
                                </div>

                                {/* All Schedules List */}
                                <div className="flex flex-col gap-3">
                                    {selectedEducator?.schedules?.length > 0 ? (
                                        selectedEducator.schedules.map((schedule, i) => {
                                            const scheduleDate = new Date(schedule.datetime);
                                            const isTodaySchedule = isSameDay(scheduleDate, new Date());

                                            // Get timezone-based colors same as desktop
                                            const isDigitalMkt = isDigitalMarketingCategory(schedule);
                                            let bgColor, textColor;

                                            if (isDigitalMkt) {
                                                bgColor = isTodaySchedule ? digitalMarketingColors.solid : digitalMarketingColors.light;
                                                textColor = isTodaySchedule ? "text-white" : digitalMarketingColors.text;
                                            } else {
                                                const tzKey = getTimeZoneKey(schedule);
                                                bgColor = isTodaySchedule ? timeZoneColors[tzKey] : timeZoneLightBgColors[tzKey];
                                                textColor = isTodaySchedule ? "text-white" : timeZoneTextColors[tzKey];
                                            }

                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => navigate(`/iq-educators/${selectedEducator?._id}`)}
                                                    className={`p-3 rounded-xl flex justify-between items-center flex-wrap gap-4 cursor-pointer ${bgColor} ${textColor}`}
                                                >
                                                    {/* Schedule Title */}
                                                    <span className="text-sm font-medium">
                                                        {schedule.title}
                                                    </span>

                                                    {/* Time and Date */}
                                                    <div className="flex items-center gap-5">
                                                        <div className="flex items-center gap-2 text-xs font-medium">
                                                            <Clock size={18} />
                                                            <span className="text-xs">
                                                                {scheduleDate.toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-medium">
                                                            <Calendar size={18} />
                                                            <span className="text-xs">
                                                                {scheduleDate.toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    weekday: "short",
                                                                }).replace(",", "-")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-gray-500">No sessions scheduled.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Educator Cards */}
            {educators?.length > 0 && (
                <div className="py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {educators?.map((educator, index) => (
                            <div
                                key={index}
                                className="card rounded-2xl shadow-md overflow-hidden"
                            >
                                <div className="relative flex items-center justify-center">
                                    <img
                                        src={educator?.image}
                                        alt={educator?.first_name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-gray-900 font-medium text-md mb-4">
                                        {educator?.first_name} {educator?.last_name}
                                    </h3>
                                    <Link
                                        to={`/iq-educators/${educator?._id}`}
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
    );
}
