import { forwardRef, useState, useEffect } from "react";
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
  fetchCoursesByEducatorId,
} from "@/store/reducer/courseSlice";
import {
  useCreateEducatorMasterClassMutation,
  useUpdateEducatorMasterClassMutation
} from "@/store/api/educator/educatorMasterClassApiSlice";

// Components
import CourseForm from "./forms/CourseForm";
import StrategyForm from "./forms/StrategyForm";
import { useAuthContext } from "../../../../../../auth/useAuthContext";



const CreateCourseModal = forwardRef(
  ({ isOpen, onClose, onSubmit, initialData, activeTab: parentActiveTab }, ref) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { auth } = useAuthContext();
    const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "super_admin";
    const [createMasterClass] = useCreateEducatorMasterClassMutation();
    const [updateMasterClass] = useUpdateEducatorMasterClassMutation();

    const [activeTab, setActiveTab] = useState(() => {
      if (parentActiveTab === "master-class") return "master-class";
      return "course";
    });

    // Update active tab when parent's activeTab changes
    useEffect(() => {
      if (!initialData) {
        if (parentActiveTab === "master-class") {
          setActiveTab("master-class");
        } else {
          setActiveTab("course");
        }
      }
    }, [parentActiveTab, initialData]);



    // Update active tab when initialData changes (for editing)
    useEffect(() => {
      if (initialData) {
        // If parentActiveTab is master-class, always use master-class form for editing
        if (parentActiveTab === "master-class") {
          setActiveTab("master-class");
        } else if (initialData?.isMasterClass || initialData?.isStrategy || initialData?.section === "Strategy") {
          setActiveTab("master-class");
        } else {
          setActiveTab("course");
        }
      }
    }, [initialData, parentActiveTab]);

    if (!isOpen) return null;

    // Fetch courses on mount and when token changes
    const fetchAllCourses = async () => {
      if (auth?.token) {
        let action;
        let payload = { params: { isDeleted: false }, token: auth?.token };

        if (activeTab === "master-class") {
          // Master Class handled by RTK Query, no need to dispatch thunk
          return;
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

    const labelPrefix = activeTab === "master-class" ? "Master Class" : "Course";

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
          error?.data?.message || error?.message || "Operation failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSubmitStrategy = async (formData) => {
      setIsSubmitting(true);
      try {
        if (initialData) {
          await updateMasterClass({ id: initialData._id, formData }).unwrap();
        } else {
          await createMasterClass(formData).unwrap();
        }

        toast.success(
          initialData
            ? `Master Class updated successfully!`
            : `Master Class created successfully!`
        );
        onClose();
        // Automatic refetching via tags handles the list update
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
              {initialData
                ? (activeTab === "master-class" ? "Edit Master Class" : "Edit IQ Vault")
                : (activeTab === "master-class" ? "Create New Master Class" : "Create New IQ Vault")}
            </DialogTitle>
          </DialogHeader>

          {/* Tab Switcher */}
          {!initialData && (
            <div className="flex border-b mb-6 border-gray-100">
              {/* <button
                onClick={() => setActiveTab("course")}
                className={`pb-3 px-8 text-sm font-semibold transition-all relative ${activeTab === "course"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Course
              </button> */}
              {(isAdmin || auth?.user?.role === "educator") && (
                <button
                  onClick={() => setActiveTab("master-class")}
                  className={`pb-3 px-8 text-sm font-semibold transition-all relative ${activeTab === "master-class"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  Master Class
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
