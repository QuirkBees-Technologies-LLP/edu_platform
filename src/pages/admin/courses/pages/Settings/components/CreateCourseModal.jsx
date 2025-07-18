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

const CreateCourseModal = forwardRef(
  ({ isOpen, onClose, onSubmit, initialData }, ref) => {
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
    };

    // const handleSubmit = async (formData) => {
    //   setIsSubmitting(true);
    //   try {
    //     // Convert FormData to regular object if your API expects JSON
    //     // Or keep as FormData if your API handles multipart
    //     const payload = {
    //       title: formData.get("title"),
    //       description: formData.get("description"),
    //       category: formData.get("category"),
    //       published: formData.get("published") === "true", // Convert back to boolean
    //       isFeatured: formData.get("isFeatured") === "true",
    //       tier: formData.get("tier"),
    //       instructor: auth?.user?._id,
    //     };

    //     // For file uploads
    //     const imageFile = formData.get("imageUrl");
    //     console.log("-------------->",imageFile)
    //       payload.image = imageFile;
    //     if (imageFile instanceof File) {
    //       payload.image = imageFile;
    //     }

    //     if (initialData) {
    //       await dispatch(
    //         updateExistingCourse({
    //           id: initialData._id,
    //           courseData: payload,
    //           token: localStorage.getItem("token"),
    //         })
    //       ).unwrap();
    //       toast.success("Course updated successfully!");
    //     } else {
    //       await dispatch(
    //         createNewCourse({
    //           courseData: payload,
    //           token: localStorage.getItem("token"),
    //         })
    //       ).unwrap();
    //       toast.success("Course created successfully!");
    //     }
    //     onClose();
    //   } catch (error) {
    //     toast.error(error.message || "Operation failed");
    //   } finally {
    //     setIsSubmitting(false);
    //   }
    // };


    const handleSubmit = async (formData) => {
  setIsSubmitting(true);
  try {
    // 1. Create the base payload
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      published: formData.get('published') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      tier: formData.get('tier'),
      instructor: auth?.user?._id,
    };

    // 2. Handle the image file properly
    const imageFile = formData.get('imageUrl'); // Note: use 'image' not 'imageUrl'
    console.log("Image file:", imageFile); // Debug what we're getting
    
    if (imageFile instanceof File) {
      // For file uploads, we need to send as FormData
      const uploadFormData = new FormData();
      
      // Append all regular fields
      Object.entries(payload).forEach(([key, value]) => {
        uploadFormData.append(key, value);
      });
      
      // Append the file
      uploadFormData.append('image', imageFile);
      
      console.log("FormData entries:");
      for (let [key, value] of uploadFormData.entries()) {
        console.log(key, value);
      }

      console.log("initialData====================>",initialData)

      if (initialData) {
        await dispatch(
          updateExistingCourse({
            id: initialData._id,
            courseData: uploadFormData, // Send as FormData
            token: localStorage.getItem("token"),
          })
        ).unwrap();
      } else {
        await dispatch(
          createNewCourse({
            courseData: uploadFormData, // Send as FormData
            token: localStorage.getItem("token"),
          })
        ).unwrap();
      }
    } else {
      // For non-file updates (using imageUrl)
      payload.imageUrl = formData.get('imageUrl');
      
      if (initialData) {
        await dispatch(
          updateExistingCourse({
            id: initialData._id,
            courseData: payload, // Send as regular object
            token: localStorage.getItem("token"),
          })
        ).unwrap();
      } else {
        await dispatch(
          createNewCourse({
            courseData: uploadFormData, // Send as regular object
            token: localStorage.getItem("token"),
          })
        ).unwrap();
      }
    }

    toast.success(initialData ? "Course updated successfully!" : "Course created successfully!");
    onClose();
  } catch (error) {
    console.error("Submission error:", error);
    toast.error(error.message || "Operation failed");
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
              {initialData ? "Edit Course" : "Create New Course"}
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
