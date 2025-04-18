import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

// Store
import {
  createNewCourse,
  updateExistingCourse,
} from "@/store/reducer/courseSlice";

// Components
import CourseForm from "./forms/CourseForm";

const CreateCourseModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        // Editing mode
        await dispatch(
          updateExistingCourse({
            id: initialData._id,
            courseData: data,
            token: localStorage.getItem("token"),
          })
        ).unwrap();
        toast.success("Course updated successfully!");
      } else {
        // Creation mode
        await dispatch(
          createNewCourse({
            courseData: data,
            token: localStorage.getItem("token"),
          })
        ).unwrap();
        toast.success("Course created successfully!");
      }
      onClose();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Course" : "Create New Course"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <CourseForm
          onSubmit={handleSubmit}
          initialData={initialData}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CreateCourseModal;
