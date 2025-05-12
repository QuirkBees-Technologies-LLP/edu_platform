import { forwardRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Store
import {
  createNewCourse,
  updateExistingCourse,
  fetchCourses
} from "@/store/reducer/courseSlice";

// Components
import CourseForm from "./forms/CourseForm";
import { useAuthContext } from "../../../../../../auth/useAuthContext";

const CreateCourseModal = forwardRef(({ isOpen, onClose, onSubmit, initialData }, ref) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth } = useAuthContext();

  if (!isOpen) return null;

  // Fetch courses on mount and when token changes
  const fetchAllCourses = async () => {
    if (auth?.token) {
      console.log("Fetching courses with token:", auth.token);
      dispatch(
        fetchCourses({
          params: {
            isDeleted: false,
          },
          token: auth.token,
        })
      )
        .unwrap()
        .then((response) => {
          console.log("Courses fetched successfully:", response);
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
        });
    } else {
      console.log("No auth token available");
    }
  }

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
        await fetchAllCourses();
      } else {
        // Creation mode
        await dispatch(
          createNewCourse({
            courseData: {
              ...data, instructor: auth?.user?._id
            },
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
    <Dialog open={isOpen} onOpenChange={() => {
      onClose();
    }}>
      <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Course" : "Create New Course"}</DialogTitle>
        </DialogHeader>
        <CourseForm
          onSubmit={handleSubmit}
          initialData={initialData}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog >
  );
});

export default CreateCourseModal;
