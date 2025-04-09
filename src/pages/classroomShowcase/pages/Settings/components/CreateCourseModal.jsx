import { useState } from "react";
import {
  Plus,
  Book,
  Video,
  Users,
  Star,
  Lock,
  Globe,
  Edit2,
  GripVertical,
} from "lucide-react";
import CourseForm from "./forms/CourseForm";
import { toast } from "react-hot-toast";

import { useCourseStore } from "../../../../../store/courseStore";
import { useAuthContext } from "../../../../../auth/useAuthContext";

const CreateCourseModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { createNewCourse, updateExistingCourse, setError, error } =
    useCourseStore();
  const { auth } = useAuthContext();
  if (!isOpen) return null;

  const handleSubmit = async (data) => {
    try {
      if (initialData) {
        // Editing mode
        await updateExistingCourse(initialData.id, data, auth.token);
        toast.success("Course updated successfully!");
      } else {
        // Creation mode
        await createNewCourse(data, auth.token);
        toast.success("Course created successfully!");
      }
      onClose();
    } catch (error) {
      setError(error.message);
      toast.error(error.message || "Operation failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Course" : "Create New Course"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        <CourseForm
          onSubmit={handleSubmit}
          initialData={initialData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CreateCourseModal;
