// import { format, isSameDay, parseISO, startOfWeek, addDays } from 'date-fns';

// const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// const WeeklyCalendar = ({ educators }) => {
//   const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday

//   return (
//     <div className="overflow-x-auto border rounded-xl shadow p-4">
//       {/* Tabs */}
//       <div className="flex border-b mb-4">
//         <button className="text-blue-600 font-semibold border-b-2 border-blue-600 px-4 py-2">Current Week</button>
//         <button className="text-gray-600 px-4 py-2">Next Week</button>
//       </div>

//       {/* Calendar Header */}
//       <div className="grid grid-cols-8 gap-2 items-center font-semibold text-center bg-gray-100 py-2">
//         <div>Educator</div>
//         {daysOfWeek.map((day, idx) => (
//           <div key={idx}>{day}</div>
//         ))}
//       </div>

//       {/* Calendar Rows */}
//       {educators.map(edu => (
//         <div key={edu.id} className="grid grid-cols-8 gap-2 border-t py-4 items-start">
//           {/* Educator Info */}
//           <div className="flex items-center space-x-2 pl-2">
//             <img src={edu.image} alt={edu.name} className="w-10 h-10 rounded-full" />
//             <span className="font-medium">{edu.first_name + ' ' + edu.last_name}</span>
//           </div>

//           {/* 7 Day Cells */}
//           {Array.from({ length: 7 }).map((_, dayIndex) => {
//             const dayDate = addDays(startOfCurrentWeek, dayIndex);
//             const events = edu.schedules.filter(sch => isSameDay(parseISO(sch.datetime), dayDate));

//             return (
//               <div key={dayIndex} className="space-y-1">
//                 {events.map(event => (
//                   <div key={event.id} className="bg-blue-700 text-white rounded-md text-xs p-1 text-center">
//                     {event.title} - {format(parseISO(event.datetime), 'hh:mm a')}
//                   </div>
//                 ))}
//               </div>
//             );
//           })}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default WeeklyCalendar;


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
                                        src={edu.image.includes("undefined") ? toAbsoluteUrl('/media/avatars/blank.png') : edu.image}
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
