import React, { useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { X, Image, Video, Flag } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import RichTextEditor from "../../../components/ui/rich-editor";
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
        // .max(100, "Title must be under 100 characters")
        .required("Title is required"),
      description: Yup.string().trim().required("Description is required"),
      priority: Yup.string()
        .oneOf(["low", "medium", "high"], "Invalid priority")
        .required("Priority is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("priority", values.priority);

        values.images.forEach((file) => formData.append("images", file));
        values.videos.forEach((file) => formData.append("videos", file));

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

  useEffect(() => {
    if (editingTask && isOpen) {
      formik.setValues({
        title: editingTask?.title || "",
        description: editingTask?.description || "",
        priority: editingTask?.priority || "medium",
        images: editingTask?.images?.map((u) => u.url) || [],
        videos: editingTask?.videos?.map((u) => u.url) || [],
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
      <DialogContent className="p-5 max-w-[600px]">
        <DialogHeader className="pb-5 pt-0 px-0">
          <DialogTitle>
            {editingTask ? "Edit Ticket" : "Create Ticket"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="grid gap-5">
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900 gap-1">
              Title<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter title"
              className={`form-control input input-md w-full ${
                formik.errors.title && formik.touched.title
                  ? "border border-danger"
                  : ""
              }`}
              {...formik.getFieldProps("title")}
            />
            {formik.touched.title && formik.errors.title && (
              <span className="text-danger text-xs mt-1">
                {formik.errors.title}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900 gap-1">
              Description<span className="text-danger">*</span>
            </label>
            <RichTextEditor
              content={formik.values.description}
              onChange={(value) => formik.setFieldValue("description", value)}
              onBlur={() => formik.setFieldTouched("description", false)}
              theme="snow"
              touched={formik.touched.description}
              error={formik.errors.description}
            />
            {formik.touched.description && formik.errors.description && (
              <span className="text-danger text-xs mt-1">
                {formik.errors.description}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900 gap-1">
              {/* <Flag size={14} className="inline mr-1" /> */}
              Priority<span className="text-danger">*</span>
            </label>
            <select
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              className={`form-control input input-md w-full ${
                formik.errors.priority && formik.touched.priority
                  ? "border border-danger"
                  : ""
              }`}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            {formik.touched.priority && formik.errors.priority && (
              <span className="text-danger text-xs mt-1">
                {formik.errors.priority}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900 gap-1">
              Upload Images
            </label>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-fit"
            >
              <Image size={16} /> Add Images
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
                      alt={`img-${idx}`}
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

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900 gap-1">
              Upload Videos
            </label>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 w-fit"
            >
              <Video size={16} /> Add Videos
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

          <div className="flex border-gray-200 border-t justify-end pt-5 gap-3">
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
