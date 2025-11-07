import React, { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Image, Video, Flag } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../../store/api/admin/adminTaskManagementApiSlice";

const CreateTask = ({ isOpen, onClose, editingTask = null, refetch }) => {
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      priority: "medium",
      images: [],
      videos: [],
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be under 100 characters")
        .required("Title is required"),
      description: Yup.string()
        .trim()
        .max(500, "Description must be under 500 characters")
        .required("Description is required"),
      priority: Yup.string().oneOf(["low", "medium", "high"]).required(),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("priority", values.priority);

        values.images?.forEach((file) => {
          formData.append("images", file);
        });
        values.videos?.forEach((file) => {
          formData.append("videos", file);
        });

        if (editingTask) {
          await updateTask({
            id: editingTask._id || editingTask.id,
            formData,
          }).unwrap();
          toast.success("Task updated successfully!");
        } else {
          await createTask(formData).unwrap();
          toast.success("Task created successfully!");
        }

        resetForm();
        refetch?.();
        onClose();
      } catch (err) {
        console.error("Task save failed:", err);
        toast.error(err?.data?.message || "Failed to save task");
      }
    },
  });
  console.log("editingTask", editingTask);
  useEffect(() => {
    if (editingTask && isOpen) {
      formik.setValues({
        title: editingTask?.title || "",
        description: editingTask?.description || "",
        priority: editingTask?.priority || "medium",
        images: editingTask?.images.map((u) => u.url) || [],
        videos: editingTask?.videos.map((u) => u.url) || [],
      });
    } else if (!editingTask && isOpen) {
      formik.resetForm();
    }
  }, [editingTask, isOpen]);

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (type === "image" && !file.type.startsWith("image/")) {
        toast.error(`Invalid image: ${file.name}`);
        return false;
      }
      if (type === "video" && !file.type.startsWith("video/")) {
        toast.error(`Invalid video: ${file.name}`);
        return false;
      }
      return true;
    });

    formik.setFieldValue(type === "image" ? "images" : "videos", [
      ...(formik.values[type === "image" ? "images" : "videos"] || []),
      ...validFiles,
    ]);
  };

  const removeFile = (file, type) => {
    formik.setFieldValue(
      type,
      formik.values[type].filter((f) => f !== file)
    );
  };

  const getFilePreview = (file) => {
    if (file instanceof File) return URL.createObjectURL(file);
    if (typeof file === "string") return file;
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Edit Ticket" : "Create Ticket"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Ticket title"
              className="input w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-600 mt-1">{formik.errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows="4"
              placeholder="Describe your Ticket"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1  items-center gap-2">
              {/* <Flag size={16} /> Priority */}Priority   
            </label>
            <select
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <Image size={18} /> Add Images
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={imageInputRef}
              className="hidden"
              onChange={(e) => handleFileChange(e, "image")}
            />

            {formik.values.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {formik.values.images.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={getFilePreview(file)}
                      alt={`image-${idx}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(file, "images")}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Videos
            </label>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <Video size={18} /> Add Videos
            </button>
            <input
              type="file"
              accept="video/*"
              multiple
              ref={videoInputRef}
              className="hidden"
              onChange={(e) => handleFileChange(e, "video")}
            />

            {formik.values.videos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {formik.values.videos.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <video
                      src={getFilePreview(file)}
                      className="w-full h-24 object-cover rounded-md"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(file, "videos")}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-light border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="btn btn-primary disabled:opacity-60"
            >
              {isCreating || isUpdating
                ? "Saving..."
                : editingTask
                  ? "Update Ticket"
                  : "Create Ticket"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTask;
