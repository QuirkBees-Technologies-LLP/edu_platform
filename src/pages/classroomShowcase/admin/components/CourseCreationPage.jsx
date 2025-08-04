import React, { useState } from "react";

const CourseCreationPage = ({ onCourseCreate }) => {
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    thumbnail: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCourse.title.trim()) {
      onCourseCreate(newCourse);
      setNewCourse({ title: "", description: "", thumbnail: "" });
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold mb-6">Create New IQ Vault</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <input
            type="text"
            value={newCourse.title}
            onChange={(e) =>
              setNewCourse({ ...newCourse, title: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter course title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={newCourse.description}
            onChange={(e) =>
              setNewCourse({ ...newCourse, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter course description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail URL
          </label>
          <input
            type="text"
            value={newCourse.thumbnail}
            onChange={(e) =>
              setNewCourse({ ...newCourse, thumbnail: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter thumbnail URL"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Course
        </button>
      </form>
    </div>
  );
};

export default CourseCreationPage;
