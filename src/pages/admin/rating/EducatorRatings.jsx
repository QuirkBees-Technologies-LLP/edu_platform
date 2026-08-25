



import React from "react";
import { ArrowLeft, Star } from "lucide-react";

const EducatorRatings = () => {
  const educator = {
    name: "John Smith",
    category: "Forex",
    email: "john.smith@example.com",
    initials: "JS",
    initialsColor: "bg-blue-600",
    rating: 4.8,
    totalReviews: 45,
  };

  const feedback = [
    {
      id: 1,
      rating: 5.0,
      text: "Excellent teacher! Makes calculus easy to understand.",
      student: "Student A",
      date: "2024-11-15",
    },
    {
      id: 2,
      rating: 5.0,
      text: "Amazing explanations! Very helpful classes.",
      student: "Student B",
      date: "2024-11-14",
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">

      {/* Back Button */}
      <button className="flex items-center gap-2 text-purple-600 font-medium hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to all educators
      </button>

      {/* Main Educator Card */}
      <div className="bg-white dark:bg-gray-200 shadow-md rounded-xl p-6 mb-8">
        <div className="flex items-center gap-5">

          <div
            className={`${educator.initialsColor} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold`}
          >
            {educator.initials}
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-gray-900">{educator.name}</h2>
            <p className="text-gray-600">
              {educator.category} • {educator.email}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">{renderStars(educator.rating)}</div>
              <span className="text-lg font-semibold text-gray-900">
                {educator.rating}
              </span>
              <span className="text-gray-500 text-sm">
                ({educator.totalReviews} total reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Written Feedback Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Written Feedback
      </h3>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.map((fb) => (
          <div
            key={fb.id}
            className="bg-white dark:bg-gray-200 shadow-md rounded-xl p-5 flex justify-between items-start"
          >
            <div>
              {/* Stars */}
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(fb.rating)}</div>
                <span className="font-semibold text-gray-900">{fb.rating}</span>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mt-2">{fb.text}</p>

              {/* Student Name */}
              <p className="text-sm text-gray-500 mt-1">— {fb.student}</p>
            </div>

            {/* Date */}
            <span className="text-gray-600 text-sm">{fb.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducatorRatings;
