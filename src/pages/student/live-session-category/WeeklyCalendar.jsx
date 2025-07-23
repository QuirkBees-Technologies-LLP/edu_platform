import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { toAbsoluteUrl } from "@/utils";
import { useNavigate } from 'react-router';

const WeeklyCalendar = ({ educators }) => {
    const [weekOffset, setWeekOffset] = useState(0);
    const navigate = useNavigate();
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 0 });
    const displayedWeekStart = addDays(startOfCurrentWeek, weekOffset * 7);

    const days = Array.from({ length: 7 }).map((_, i) => addDays(displayedWeekStart, i));

    console.log(educators, "educators");

    const handleEventClick = (event) => {
        navigate(`/live-session/${event?.callId}`, { state: { event } });
    };

    return (
        <div className="card mb-4 full-calendar">
        <div className="card-body">
                <div className="">
                    <div className="flex border-b mb-4 space-x-4">
                        <button
                            className={`px-4 py-2 ${weekOffset === 0 ? 'text-primary font-semibold border-b-2 border-primary' : 'text-gray-600'}`}
                            onClick={() => setWeekOffset(0)}
                        >
                            Current Week
                        </button>
                        <button
                            className={`px-4 py-2 ${weekOffset === 1 ? 'text-primary font-semibold border-b-2 border-primary' : 'text-gray-600'}`}
                            onClick={() => setWeekOffset(1)}
                        >
                            Next Week
                        </button>
                    </div>
                    <div className="grid grid-cols-8 gap-y-2">
                        <div className="text-center font-semibold bg-dark-light p-3 flex items-center justify-center border-r-2">Educator</div>
                        {days.map((day, i) => (
                            <div key={i} className="text-center font-semibold bg-dark-light p-3 border-r-2">
                                {format(day, 'EEE')}<br />{format(day, 'dd/MM')}
                            </div>
                        ))}

                        {educators.map((edu, i) => (
                            <React.Fragment key={edu._id}>
                                <div className="flex flex-col justify-center items-center text-center space-x-2 bg-dark-light p-3 border-r-2">
                                    <img
                                        src={edu.image ? edu.image :  toAbsoluteUrl('/media/avatars/blank.png')}
                                        alt={edu.first_name}
                                        className="w-12 h-12 mb-2 rounded-full object-cover"
                                    />
                                    <span className="text-sm font-medium m-0">{edu.first_name} {edu.last_name}</span>
                                </div>
                                {days.map((day, dayIndex) => {
                                    const events = edu.schedules.filter(sch =>
                                        isSameDay(parseISO(sch.datetime), day)
                                    );
                                    return (
                                        <div key={dayIndex} className="space-y-1 bg-dark-light p-3 border-r-2">
                                            {events.map(event => (
                                                <button
                                                    onClick={() => handleEventClick(event)}
                                                    key={event._id}
                                                    className="bg-primary text-white rounded-md text-xs p-1 text-center"
                                                >
                                                    {event.title} - {format(parseISO(event.datetime), 'hh:mm a')}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
