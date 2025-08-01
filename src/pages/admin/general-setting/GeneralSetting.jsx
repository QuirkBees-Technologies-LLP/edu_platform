import React, { useState } from 'react';
import Languages from './languages/Languages';

const GeneralSetting = () => {
  const [activeTab, setActiveTab] = useState("Language");

  const tabs = ["Language", "Course Type", "Academy Category"];

  return (
    <div className="container-fluid">
      <div className="items-start">
        {/* Tabs */}
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 border-b-2 ${activeTab === tab
                ? "border-black dark:border-white text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Language" && <Languages />}
        {activeTab === "Course Type" && <Languages />}
        {activeTab === "Academy Category" && <Languages />}
      </div>
    </div>
  );
};

export default GeneralSetting;
