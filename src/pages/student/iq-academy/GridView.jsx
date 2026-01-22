import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isSameDay } from "date-fns";

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

    const isToday = (datetime) => isSameDay(new Date(), new Date(datetime));
    const isTodayColumn = (day) => isSameDay(new Date(), day);

    if (isLoading || !activeCategoryId || !singleCategoryData) {
        return null;
    }

    return (
        <div className="hidden md:block">
            {educators.length === 0 ? (
                <div className="bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full">
                    <div className="text-center">
                        <p className="text-lg sm:text-xl tracking-widest text-gray-500">
                            No Schedule Found
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card forex_calender rounded-t-2xl shadow">
                    <div className="calender">
                        <div className="grid grid-cols-8 text-center table_head">
                            <div className="bg-[#1A1446] text-gray-100 dark:text-gray-800 py-5 px-4 font-normal rounded-tl-2xl">
                                Educators
                            </div>
                            {days.map((day, dayIndex) => (
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
                                            className={`p-2 min-h-[80px] border-r flex flex-col justify-center gap-2 ${isTodayColumn(day) ? "bg-gray-300" : ""
                                                }`}
                                        >
                                            {filtered.length > 0 ? (
                                                filtered.map((s, i) => {
                                                    const tzKey = getTimeZoneKey(s);
                                                    const todayClass = `${timeZoneColors[tzKey]} text-white font-medium shadow-lg`;
                                                    const defaultClass = `${timeZoneLightBgColors[tzKey]} ${timeZoneTextColors[tzKey]}`;

                                                    return (
                                                        <div
                                                            key={i}
                                                            onClick={() =>
                                                                navigate(`/iq-educators/${educator._id}`)
                                                            }
                                                            className={`text-xs rounded-lg p-2 text-center cursor-pointer ${isToday(s.datetime)
                                                                ? todayClass
                                                                : defaultClass
                                                                }`}
                                                        >
                                                            {s.title}
                                                            <br />
                                                            {new Date(s.datetime).toLocaleTimeString([], {
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
            )}

            {/* Timezone Legend Footer */}
            {educators.length > 0 && (
                <div className="flex items-center justify-center gap-8 py-4 dark:bg-[#1a1446] rounded-b-xl shadow">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#E3A534] border border-[#FFF5E5]"></div>
                        <span className="text-sm text-gray-700">Asian Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#14B8A6] border border-[#CCFBF1]"></div>
                        <span className="text-sm text-gray-700">London Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-[#b2a3e9] border border-[#E5DEFF]"></div>
                        <span className="text-sm text-gray-700">New York Session</span>
                    </div>
                </div>
            )
            }
            {/* Educator Cards */}
            {educators.length > 0 && (
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
    );
}
