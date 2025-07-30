import React, { useState } from "react";
import { Link } from "react-router-dom";

const scheduleData = {
  forex: [
    {
      educator: "Ralph Danquah",
      avatar: "/media/avatars/300-14.png",
      schedule: {
        Tue: ["Weekly Market Forecast\n9:00am-10:00am"],
        Thu: ["Weekly Market Forecast\n9:00am-10:00am", "Forex Basics\n9:00am-10:00am"],
        Fri: ["Forex Basics\n9:00am-10:00am"],
        Sat: ["Weekly Market Forecast\n9:00am-10:00am", "Forex Basics\n9:00am-10:00am"],
      },
    },
    {
      educator: "Ricardo Paz",
      avatar: "/media/avatars/300-15.png",
      schedule: {
        Tue: ["Weekly Market Forecast\n9:00am-10:00am"],
        Thu: ["Weekly Market Forecast\n9:00am-10:00am", "Forex Basics\n9:00am-10:00am"],
        Sat: ["Weekly Market Forecast\n9:00am-10:00am", "Forex Basics\n9:00am-10:00am"],
      },
    },
  ],
  crypto: [
    {
      educator: "Sophia Lee",
      avatar: "/media/avatars/300-16.png",
      schedule: {
        Mon: ["Crypto Basics\n8:00am-9:00am"],
        Wed: ["Bitcoin Analysis\n10:00am-11:00am"],
        Fri: ["Altcoin Trends\n2:00pm-3:00pm"],
      },
    },
  ],
  stocks: [
    {
      educator: "John Carter",
      avatar: "/media/avatars/300-17.png",
      schedule: {
        Tue: ["Stock Market Overview\n9:00am-10:00am"],
        Thu: ["Trading Strategies\n11:00am-12:00pm"],
      },
    },
  ],
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const educators = [
  {
    name: "Ralph Danquah",
    image: "/media/avatars/2.jpg", // Replace with real image URL
  },
  {
    name: "Ricardo Paz",
    image: "/media/avatars/1.jpg",
  },
];
export default function IQLive() {
  const [activeTab, setActiveTab] = useState("forex");

  return (
    <div className="container-fluid">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4 gap-5 flex-col sm:flex-row">
        <div className="flex space-x-3 sm:space-x-6 text-sm font-normal">
          {["forex", "crypto", "stocks"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 border-b-2 ${
                activeTab === tab
                  ? "border-black dark:border-white text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab === "forex" ? "Forex" : tab === "crypto" ? "Crypto" : "Stock Options"}
            </button>
          ))}
        </div>
        <div>
          <select className="bg-gray-100 border rounded-lg px-3 py-4 text-sm text-gray-600">
            <option>Scalping</option>
            <option>Day Trading</option>
            <option>Swing Trading</option>
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="card forex_calender rounded-2xl shadow">
        <div className="calender">
            <div className="grid grid-cols-8 text-center table_head">
                <div className="bg-[#1A1446] text-gray-100 dark:text-gray-900 py-5 px-4 font-normal">Educators</div>
                    {days.map((day) => (
                        <div key={day} className="bg-[#1A1446] text-gray-100 dark:text-gray-900 py-5 px-4 font-normal">
                        {day}
                        </div>
                    ))}
                </div>
                {scheduleData[activeTab].map((educator, index) => (
                <div key={index} className="grid grid-cols-8 border-t">
                    {/* Educator Info */}
                    <div className="flex flex-col items-center justify-center p-4 bg-[#F7F6FE] dark:bg-gray-100 border-r">
                    <img src={educator.avatar} alt={educator.educator} className="w-12 h-12 rounded-full mb-2" />
                    <span className="text-xs font-normal text-gray-800 text-center">{educator.educator}</span>
                    </div>

                    {/* Schedule Cells */}
                    {days.map((day) => (
                    <div key={day} className="p-2 min-h-[80px] border-r flex flex-col justify-center gap-2">
                        {educator.schedule[day]?.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-[#E5DEFF] dark:bg-gray-100 text-[#4E34E3] text-xs rounded-lg p-2 text-center whitespace-pre-line"
                        >
                            {item}
                        </div>
                        ))}
                    </div>
                    ))}
                </div>
                ))}
        </div>

      </div>

        <div className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {educators.map((educator, index) => (
                <div
                    key={index}
                    className="card rounded-2xl shadow-md overflow-hidden"
                >
                    {/* Top Image Section */}
                    <div className="relative h-56 flex items-center justify-center">
                    <img
                        src={educator.image}
                        alt={educator.name}
                        className="w-full h-full object-cover"
                    />
                    </div>

                    {/* Bottom Info Section */}
                    <div className="p-5">
                    <h3 className="text-gray-900 font-medium text-md mb-4">
                        {educator.name}
                    </h3>
                    <Link to="/iq-educators" className="btn btn-light btn-lg rounded-2xl bg-gray-200 text-xs text-gray-800 font-medium">

                        View Profile
                    </Link>
                    </div>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
}
