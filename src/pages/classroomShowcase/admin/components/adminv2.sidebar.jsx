import React, { useState } from "react";
import { PlusCircle, Book, Layout } from "lucide-react";
import { useCourseStore } from "../store/courseStore";

export const Sidebar = () => {
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const { courses, addCourse, selectCourse, selectedCourse } = useCourseStore();

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (newCourseTitle.trim()) {
      addCourse(newCourseTitle);
      setNewCourseTitle("");
    }
  };

  return (
    <div className="w-80 bg-slate-900 min-h-screen p-6 text-white flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Layout className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold">LMS Admin</h1>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-slate-300">Courses</h2>

      <form onSubmit={handleAddCourse} className="mb-6">
        <div className="flex gap-2 bg-slate-800 p-2 rounded-lg">
          <input
            type="text"
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
            placeholder="New Course Title"
            className="flex-1 px-3 py-2 bg-slate-700 text-white placeholder-slate-400 rounded-md border border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded-md transition-colors"
          >
            <PlusCircle size={24} />
          </button>
        </div>
      </form>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => selectCourse(course.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              selectedCourse?.id === course.id
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Book size={20} />
            <span className="truncate font-medium">{course.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
