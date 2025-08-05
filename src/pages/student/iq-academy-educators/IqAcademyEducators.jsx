import React, { useState } from "react";
import { CheckCircle, UserPlus } from "lucide-react";

const educatorsData = [
  {
    id: 1,
    name: "Ralph Danquah",
    skills: "Forex Day Trading, Price Action, Risk Management",
    avatar: "/media/avatars/300-1.png",
    category: "Forex",
    isFollowing: true,
  },
  {
    id: 2,
    name: "John Smith",
    skills: "Crypto Trading, Risk Management",
    avatar: "/media/avatars/300-2.png",
    category: "Crypto",
    isFollowing: false,
  },
  {
    id: 3,
    name: "Alex Brown",
    skills: "Stock Options, Technical Analysis",
    avatar: "/media/avatars/300-3.png",
    category: "Stock Options",
    isFollowing: false,
  },
];

const IqAcademyEducators = () => {
   const [educators, setEducators] = useState(educatorsData);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("All");

  const toggleFollow = (id) => {
    setEducators((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isFollowing: !e.isFollowing } : e
      )
    );
  };

  // Filter educators based on tab, search, and language
  const filteredEducators = educators.filter((e) => {
    const matchTab = activeTab === "All" || e.category === activeTab;
    const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLanguage = language === "All" || e.language === language;
    return matchTab && matchSearch && matchLanguage;
  });
   return (
    <div className="container-fluid pb-10">
      <h2 className="text-lg font-medium text-gray-800 mb-10">36 Educators</h2>

      {/* Tabs + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Tabs */}
        <div className="flex gap-3 sm:gap-6 pb-2 flex-wrap">
          {["All", "Forex", "Crypto", "Stock Options"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 border-b-2 ${
                activeTab === tab
                  ? "border-black dark:border-white text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters: Language + Search */}
        <div className="flex flex-wrap gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-100 border rounded-lg px-3 py-4 text-sm text-gray-600 focus:outline-none"
          >
            <option value="All">Language</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
          </select>

          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none dark:bg-gray-100"
          />
        </div>
      </div>

      {/* Educators List */}
      <div className="flex flex-col gap-4">
        {filteredEducators.length > 0 ? (
          filteredEducators.map((educator) => (
            <div className="card">
                <div
                key={educator.id}
                className="flex items-center justify-between p-8 rounded-xl border flex-col sm:flex-row gap-4"
                >
                {/* Left Section */}
                <div className="flex items-center gap-4 flex-col sm:flex-row">
                    <img
                    src={educator.avatar}
                    alt={educator.name}
                    className="w-20 h-w-20 rounded-full"
                    />
                    <div className="text-center sm:text-start">
                        <h4 className="text-gray-800 font-medium mb-1">{educator.name}</h4>
                        <p className="text-xs text-gray-500">{educator.skills}</p>
                    </div>
                </div>

                {/* Follow Button */}
                <button
                    onClick={() => toggleFollow(educator.id)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium ${
                    educator.isFollowing
                        ? "bg-primary text-gray-100 dark:text-gray-900"
                        : "bg-[#1B84FF] text-gray-100 dark:text-gray-900"
                    }`}
                >
                    {educator.isFollowing ? (
                    <>
                        <CheckCircle size={16} /> Following
                    </>
                    ) : (
                    <>
                        <UserPlus size={16} /> Follow
                    </>
                    )}
                </button>
                </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            No educators found.
          </p>
        )}
      </div>

      {/* Show More */}
      <div className="text-center mt-4">
        <button className="text-primary pb-3 text-sm border-b-2 border-dashed border-primary">
          Show more Connections
        </button>
      </div>
    </div>
  );
}

export default IqAcademyEducators