import { forwardRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Store
import {
  createNewCourse,
  updateExistingCourse,
  fetchCourses,
} from "@/store/reducer/courseSlice";

// Components
import CourseForm from "./forms/CourseForm";
import { useAuthContext } from "../../../../../../auth/useAuthContext";
import { languages } from "eslint-plugin-prettier";

const CreateCourseModal = forwardRef(
  ({ isOpen, onClose, onSubmit, initialData }, ref) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { auth } = useAuthContext();

    if (!isOpen) return null;

    // Fetch courses on mount and when token changes
    const fetchAllCourses = async () => {
      if (auth?.token) {
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
    };

    const handleSubmit = async (formData) => {
      setIsSubmitting(true);

      try {
        const imageFile = formData.get("imageUrl");
        const isImageAFile = imageFile instanceof File;

        // 1. Build payload for common fields
        const payload = {
          title: formData.get("title"),
          description: formData.get("description"),
          category: formData.get("category"),
          published: formData.get("published") === "true",
          isFeatured: formData.get("isFeatured") === "true",
          tier: formData.get("tier"),
          language: formData.get("language"),
          section: formData.get("section"),
          instructor: auth?.user?._id,
        };

        let requestData;

        // 2. If a new file is uploaded, use FormData
        if (isImageAFile) {
          const uploadFormData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            uploadFormData.append(key, value);
          });
          uploadFormData.append("image", imageFile); // append file with correct key

          requestData = uploadFormData;
        } else {
          // 3. If no file, send as regular JSON object
          payload.imageUrl = formData.get("imageUrl");
          requestData = payload;
        }

        // 4. Dispatch action
        if (initialData) {
          await dispatch(
            updateExistingCourse({
              id: initialData._id,
              courseData: requestData,
              token: localStorage.getItem("token"),
            })
          ).unwrap();
        } else {
          await dispatch(
            createNewCourse({
              courseData: requestData,
              token: localStorage.getItem("token"),
            })
          ).unwrap();
        }

        toast.success(
          initialData
            ? "Course updated successfully!"
            : "Course created successfully!"
        );
        // ✅ Only close if the above succeeded
        onClose();

        // ✅ Refresh list
        await fetchAllCourses();
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(
          error ? error : error.essage || "Operation failed. Please try again."
        );
        setIsSubmitting(true);
      } finally {
        setIsSubmitting(false);
      }
    };
    return (
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          onClose();
        }}
      >
        <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit IQ Vault" : "Create New IQ Vault"}
            </DialogTitle>
          </DialogHeader>
          <CourseForm
            onSubmit={handleSubmit}
            initialData={initialData}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreateCourseModal;
