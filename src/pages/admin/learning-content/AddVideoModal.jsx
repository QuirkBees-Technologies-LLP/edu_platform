/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import FileDropzone from "./FileDropzone";

const INITIAL_STATE = {
  title: "",
  videoSourceType: "URL",
  videoUrl: "",
  videoFile: null,
  thumbnailFile: null,
  thumbnailPreview: "",
  removeThumbnail: false,
};

/**
 * AddVideoModal – Create or Edit a video with thumbnail and video source (URL/upload).
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - video: object | null – existing video for edit mode
 * - onSubmit: (formData: FormData) => Promise<void>
 * - isLoading: boolean
 */
const AddVideoModal = ({ open, onOpenChange, video, onSubmit, isLoading }) => {
  const isEdit = !!video;
  const [form, setForm] = useState(() => video ? {
    title: video.title || "",
    videoSourceType: video.videoSourceType || "URL",
    videoUrl: video.videoUrl || "",
    videoFile: null,
    thumbnailFile: null,
    thumbnailPreview: video.thumbnail || "",
    removeThumbnail: false,
  } : INITIAL_STATE);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (video && open) {
      setForm({
        title: video.title || "",
        videoSourceType: video.videoSourceType || "URL",
        videoUrl: video.videoUrl || "",
        videoFile: null,
        thumbnailFile: null,
        thumbnailPreview: video.thumbnail || "",
        removeThumbnail: false,
      });
      setErrors({});
    } else if (!video && open) {
      setForm(INITIAL_STATE);
      setErrors({});
    }
  }, [video, open]);

  // Field change handlers
  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };



  // Validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Video title is required";

    if (form.videoSourceType === "URL") {
      if (!form.videoUrl.trim()) {
        errs.videoUrl = "Video URL is required";
      }
    } else {
      if (!form.videoFile && !video?.uploadedVideoUrl) {
        errs.videoFile = "Please upload a video file";
      }
    }



    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("videoSourceType", form.videoSourceType);

    if (form.videoSourceType === "URL") {
      formData.append("videoUrl", form.videoUrl.trim());
    }

    if (form.videoFile) {
      formData.append("video", form.videoFile);
    }

    if (form.thumbnailFile) {
      formData.append("thumbnail", form.thumbnailFile);
    }

    if (form.removeThumbnail) {
      formData.append("removeThumbnail", "true");
    }



    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Video" : "Add Video"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update video details, source, and resources"
              : "Add a new video with optional thumbnail and resources"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* ── 1. Video Title ── */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Video Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Getting Started"
                className={`w-full dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all ${errors.title ? "border-rose-500" : ""}`}
              />
              {errors.title && (
                <p className="text-xs text-rose-500">{errors.title}</p>
              )}
            </div>

            {/* ── 2. Video Source ── */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Video Source <span className="text-rose-500">*</span>
              </label>

              {/* Source Type Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField("videoSourceType", "URL")}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${form.videoSourceType === "URL"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white dark:bg-[#1a1c23] text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-primary/50"
                    }`}
                >
                  Video URL
                </button>
                <button
                  type="button"
                  onClick={() => updateField("videoSourceType", "UPLOAD")}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${form.videoSourceType === "UPLOAD"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white dark:bg-[#1a1c23] text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-primary/50"
                    }`}
                >
                  Upload Video
                </button>
              </div>

              {/* URL Input */}
              {form.videoSourceType === "URL" && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={form.videoUrl}
                    onChange={(e) => updateField("videoUrl", e.target.value)}
                    placeholder="https://videos.dyntube.com/iframes/... or any video URL"
                    className={`w-full dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all ${errors.videoUrl ? "border-rose-500" : ""}`}
                  />
                  {errors.videoUrl && (
                    <p className="text-xs text-rose-500">{errors.videoUrl}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-600">
                    Supports Dyntube, Vimeo, YouTube, or any video/iframe URL
                  </p>
                </div>
              )}

              {/* Upload Video */}
              {form.videoSourceType === "UPLOAD" && (
                <FileDropzone
                  accept="video/mp4,video/quicktime,video/webm"
                  maxSize={500 * 1024 * 1024}
                  file={form.videoFile}
                  preview={video?.uploadedVideoUrl || ""}
                  onChange={(f) => updateField("videoFile", f)}
                  onRemove={() => updateField("videoFile", null)}
                  label="Upload Video"
                  hint="MP4, MOV, WEBM – Max 500MB"
                  error={errors.videoFile || ""}
                />
              )}
            </div>

            {/* ── 3. Thumbnail ── */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Thumbnail
              </label>
              <FileDropzone
                accept="image/jpeg,image/jpg,image/png,image/webp"
                maxSize={5 * 1024 * 1024}
                file={form.thumbnailFile}
                preview={form.removeThumbnail ? "" : form.thumbnailPreview}
                onChange={(f) => {
                  updateField("thumbnailFile", f);
                  updateField("removeThumbnail", false);
                }}
                onRemove={() => {
                  updateField("thumbnailFile", null);
                  updateField("thumbnailPreview", "");
                  updateField("removeThumbnail", true);
                }}
                label="Upload Thumbnail"
                hint="JPG, JPEG, PNG, WEBP – Max 5MB"
              />
            </div>




          </div>

          {/* ── Footer ── */}
          <DialogFooter className="gap-2.5 pt-4">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              )}
              {isEdit ? "Update Video" : "Save Video"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVideoModal;
