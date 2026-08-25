import { forwardRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
  fetchStrategies,
  fetchCoursesByEducatorId,
} from "@/store/reducer/courseSlice";

// Components
import CourseForm from "./forms/CourseForm";
import StrategyForm from "./forms/StrategyForm";
import { useAuthContext } from "../../../../../../auth/useAuthContext";

import {
  useCreateAdminStrategyMutation,
  useUpdateAdminStrategyMutation
} from "@/store/api/admin/adminStrategyApiSlice";
import { selectSelectedLanguagesAdmin } from "@/store/reducer/studentLanagugeSlice";

const CreateCourseModal = forwardRef(
  ({ isOpen, onClose, onSubmit, initialData, activeTab: parentActiveTab }, ref) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { auth } = useAuthContext();
    const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "super_admin";
    const [activeTab, setActiveTab] = useState(() => {
      if (parentActiveTab === "strategies" && isAdmin) return "strategies";
      return "course";
    });

    // Update active tab when parent's activeTab changes
    useEffect(() => {
      if (!initialData) {
        if (parentActiveTab === "strategies" && isAdmin) {
          setActiveTab("strategies");
        } else {
          setActiveTab("course");
        }
      }
    }, [parentActiveTab, initialData]);

    const [createStrategyMutation] = useCreateAdminStrategyMutation();
    const [updateStrategyMutation] = useUpdateAdminStrategyMutation();

    // Update active tab when initialData changes (for editing)
    useEffect(() => {
      if (initialData) {
        // If we have a way to distinguish strategy from course in initialData, set it here
        // For now defaulting to course or checking section if available
        if (initialData?.isStrategy || initialData?.section === "Strategy") {
          setActiveTab("strategies");
        } else {
          setActiveTab("course");
        }
      }
    }, [initialData]);

    const selectedLanguage = useSelector(selectSelectedLanguagesAdmin);

    if (!isOpen) return null;

    // Fetch courses on mount and when token changes
    const fetchAllCourses = async () => {
      if (auth?.token) {
        let action;
        let payload = { params: { isDeleted: false, ...(selectedLanguage?.length > 0 ? { language: selectedLanguage.join(',') } : {}) }, token: auth?.token };

        if (activeTab === "strategies") {
          action = fetchStrategies;
        } else {
          if (auth?.user?.role === "educator") {
            action = fetchCoursesByEducatorId;
            payload = { id: auth?.user?._id, token: auth?.token };
          } else {
            action = fetchCourses;
          }
        }

        dispatch(action(payload))
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

    const labelPrefix = activeTab === "strategies" ? "Strategy" : "Course";

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
          instructor: initialData?.instructor?._id || initialData?.instructor || initialData?.createdBy || auth?.user?._id,
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
              id: initialData?._id,
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
            ? `${labelPrefix} updated successfully!`
            : `${labelPrefix} created successfully!`
        );
        // ✅ Only close if the above succeeded
        onClose();

        // ✅ Refresh list
        await fetchAllCourses();
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(
          typeof error === "string"
            ? error
            : error?.data?.message || error?.message || "Operation failed. Please try again."
        );
        // Re-fetch courses so list still loads after error
        await fetchAllCourses();
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSubmitStrategy = async (formData) => {
      setIsSubmitting(true);
      try {
        if (initialData) {
          await updateStrategyMutation({
            id: initialData?._id,
            formData: formData,
          }).unwrap();
        } else {
          await createStrategyMutation(formData).unwrap();
        }

        toast.success(
          initialData
            ? `Strategy updated successfully!`
            : `Strategy created successfully!`
        );
        onClose();
        await fetchAllCourses();
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(
          error?.data?.message || (typeof error === "string" ? error : error?.message) || "Operation failed. Please try again."
        );
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
              {initialData ? "Edit Academy" : "Create New Academy"}
            </DialogTitle>
          </DialogHeader>

          {/* Tab Switcher */}
          {!initialData && (
            <div className="flex border-b mb-6 border-gray-100">
              <button
                onClick={() => setActiveTab("course")}
                className={`pb-3 px-8 text-sm font-semibold transition-all relative ${activeTab === "course"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Course
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("strategies")}
                  className={`pb-3 px-8 text-sm font-semibold transition-all relative ${activeTab === "strategies"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Strategies
                </button>
              )}
            </div>
          )}

          {activeTab === "course" ? (
            <CourseForm
              key="course-form"
              onSubmit={handleSubmit}
              initialData={initialData}
              isSubmitting={isSubmitting}
            />
          ) : (
            <StrategyForm
              key="strategy-form"
              onSubmit={handleSubmitStrategy}
              initialData={initialData}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreateCourseModal;
