import React from "react";

const CourseProgressBar = ({ progress = 0 }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm">
      <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-end pr-2">
          <span
            className={`text-xs font-medium transition-colors duration-300 ${
              progress > 90 ? "text-white" : "text-gray-800"
            }`}
          >
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseProgressBar;
