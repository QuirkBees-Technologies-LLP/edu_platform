import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isSameDay, format } from "date-fns";
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

    // Flatten all schedules for Desktop Grid View
    // Flatten all schedules for Desktop Grid View
    const allSchedules = useMemo(() => {
        if (!educators) return [];
        return educators.flatMap(educator =>
            (educator.schedules || []).map(schedule => ({
                ...schedule,
                educator
            }))
        );
    }, [educators]);

    // Calculate active hours based on schedules within the current days view
    const activeHours = useMemo(() => {
        const hoursSet = new Set();
        allSchedules.forEach(schedule => {
            const sDate = new Date(schedule.datetime);
            // Check if this schedule falls on any of the currently displayed days
            const isRelevantDay = days.some(day => isSameDay(day, sDate));
            if (isRelevantDay) {
                hoursSet.add(sDate.getHours());
            }
        });
        return Array.from(hoursSet).sort((a, b) => a - b);
    }, [allSchedules, days]);

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
                            {/* --- HEADER: Time + Days --- */}
                            <div className="grid grid-cols-8 text-center table_head sticky top-0 z-10">
                                <div className="bg-[#1A1446] text-white py-5 px-4 font-normal flex items-center justify-center border-r border-[#2d2d3f]">
                                    Time
                                </div>
                                {days.map((day) => (
                                    <div
                                        key={day.toISOString()}
                                        className={`bg-[#1A1446] text-white py-5 px-4 font-normal border-r border-[#2d2d3f] last:border-r-0 ${isSameDay(day, new Date()) ? "bg-[#252538]" : ""}`}
                                    >
                                        {day.toLocaleDateString("en-US", {
                                            weekday: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* --- BODY: Hours Rows --- */}
                            <div className="bg-[#0f0f15]">
                                {activeHours.length === 0 ? (
                                    <div className="text-gray-500 text-center py-10">No sessions scheduled for this week.</div>
                                ) : (
                                    activeHours.map((hour) => {
                                        return (
                                            <div key={hour} className="grid grid-cols-8 min-h-[100px] border-b border-[#2d2d3f]">
                                                {/* Time Column */}
                                                <div className="flex items-center justify-center bg-[#151520] border-r border-[#2d2d3f] text-gray-400 font-semibold text-sm">
                                                    {format(new Date().setHours(hour, 0), "h a")}
                                                </div>

                                                {/* Day Columns */}
                                                {days.map((day) => {
                                                    // Find schedules for this Day + Hour
                                                    // We need to flatten props.educators to search efficiently? 
                                                    // Or just iterate educators here (might be slow if many educators).
                                                    // Let's flatten once above return or inside useMemo.
                                                    // Since we are inside the map, we can't useMemo efficiently here. 
                                                    // WE SHOULD MOVE FLATTENING UP.
                                                    // See 'Insertion 2' below.

                                                    const cellSchedules = allSchedules.filter(s =>
                                                        isSameDay(new Date(s.datetime), day) &&
                                                        new Date(s.datetime).getHours() === hour
                                                    );

                                                    const isDayToday = isSameDay(day, new Date());

                                                    return (
                                                        <div key={day.toISOString()} className={`p-2 border-r border-[#2d2d3f] last:border-r-0 relative group ${isDayToday ? "bg-[#181824]" : ""}`}>
                                                            <div className="flex flex-col gap-2 h-full">
                                                                {cellSchedules.map((schedule, idx) => {
                                                                    const isDigi = isDigitalMarketingCategory(schedule);
                                                                    const tzKey = getTimeZoneKey(schedule);
                                                                    const isScheduleToday = isSameDay(new Date(schedule.datetime), new Date());

                                                                    let cardClasses;

                                                                    if (isDigi) {
                                                                        if (isScheduleToday) {
                                                                            cardClasses = `${digitalMarketingColors.solid} text-white shadow-md`;
                                                                        } else {
                                                                            cardClasses = `${digitalMarketingColors.light} ${digitalMarketingColors.text}`;
                                                                        }
                                                                    } else {
                                                                        if (isScheduleToday) {
                                                                            cardClasses = `${timeZoneColors[tzKey]} text-white shadow-md`;
                                                                        } else {
                                                                            cardClasses = `${timeZoneLightBgColors[tzKey]} ${timeZoneTextColors[tzKey]}`;
                                                                        }
                                                                    }

                                                                    const nameColor = isScheduleToday ? "text-white" : "text-gray-800";

                                                                    return (
                                                                        <div
                                                                            key={schedule._id || idx}
                                                                            onClick={() => navigate(`/iq-educators/${schedule.educator?._id}`)}
                                                                            className={`
                                                                            relative p-2 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]
                                                                            ${cardClasses} border border-transparent
                                                                        `}
                                                                        >
                                                                            {/* Header: Img + Name */}
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <img
                                                                                    src={schedule.educator?.image}
                                                                                    alt={schedule.educator?.first_name}
                                                                                    className="w-6 h-6 rounded-full object-cover border border-white shadow-sm"
                                                                                />
                                                                                <div className="min-w-0">
                                                                                    <p className={`text-[11px] font-bold truncate leading-tight ${nameColor}`}>
                                                                                        {schedule.educator?.first_name}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Title */}
                                                                            <p className={`text-[10px] truncate opacity-90 mb-1 ${isScheduleToday ? "text-white/90" : "text-gray-600"}`}>
                                                                                {schedule.title}
                                                                            </p>

                                                                            {/* Time Badge */}
                                                                            <div className={`flex items-center gap-1 ${isScheduleToday ? "bg-white/20" : "bg-white/60"} px-1.5 py-0.5 rounded w-fit`}>
                                                                                <Clock size={10} className={isScheduleToday ? "text-white" : "text-gray-600"} />
                                                                                <span className={`text-[10px] font-semibold ${isScheduleToday ? "text-white" : "text-gray-700"}`}>
                                                                                    {format(new Date(schedule.datetime), "h:mm a")}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
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
