import React, { forwardRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import TagInput from "@/components/ui/tagInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthContext } from "../../../auth/useAuthContext";
import { ImageInput } from "@/components/image-input";
import { Alert } from "../../../components/alert/Alert";
import { toast } from "sonner";
import {
  useCreateTradeIdeasMutation,
  useUpdateTradeIdeaMutation,
} from "../../../store/api/admin/adminTradeIdeasApiSlice";
import RichTextEditor from "../../../components/ui/rich-editor";
import { Avatar } from "stream-chat-react";
import { AvatarUpload } from "./AvatarUpload";
import clsx from "clsx";
import { KeenIcon } from "@/components";
import { useUpdateEducatorRecordingMutation } from "../../../store/api/educator/educatorRecordingApiSlice";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { useCreateEducatorRecordingMutation } from "../../../store/api/educator/educatorRecordingApiSlice";
import { Input } from "postcss";
import DateTimePicker from "../educator-stream-schedule/DateTimePicker";

const CreateEducatorRecording = forwardRef(
  ({ isCreateOpen, handleCloseCreate, refetch }, ref) => {
    const [updateEducatorRecording] = useUpdateEducatorRecordingMutation();
    const [createEducatorRecording] = useCreateEducatorRecordingMutation();

    const { auth } = useAuthContext();
    const educatorId = auth?.user?._id ?? null;

    const { data: categoryList } = useGetEducatorAcademyCategoryQuery();
    const [showPreviewVideo, setShowPreviewVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoInputType, setVideoInputType] = useState("");
    const [lectureContent, setLectureContent] = useState(null);
    const [isStartPickerOpen, setStartIsPickerOpen] = useState(false);
    const [isEndPickerOpen, setEndIsPickerOpen] = useState(false);

    const initialValues = {
      educator_id: auth?.user?._id || "", // auto-fill from auth
      videoUrl: "",
      start_time: "", // Use datetime-local input
      end_time: "",
      call_title: "",
      call_description: "",
      call_category: "",
      call_tags: [], // array of strings
      videoInputType: "", // "url" or "upload"
      videoFile: null, // if uploaded
      videoPreview: null,
      // thumbnail: null,
    };

    const createSchema = Yup.object().shape({
      call_title: Yup.string()
        .required("Title is required")
        .min(2, "Description must be at least 2 characters"),

      call_description: Yup.string()
        .required("Description is required")
        .min(2, "Description must be at least 2 characters"),

      call_tags: Yup.array().min(1, "At least one tag is required"),
      call_category: Yup.string().required("Category is required"),
      // videoFile: Yup.mixed()
      //   .required("videoFile is required")
      //   // .test(
      //   //   "fileSize",
      //   //   // "Thumbnail size too large (max 20MB)",
      //   //   (value) => !value || (value && value.size <= 20000000)
      //   // )
      //   .test(
      //     "fileType",
      //     "Unsupported file format. Please use JPEG, PNG, JPG, or WebP",
      //     (value) =>
      //       !value ||
      //       (value &&
      //         ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
      //           value.type
      //         ))
      //   ),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validationSchema: createSchema,
      onSubmit: async (values) => {
        try {
          const payload = {
            educator_id: values.educator_id,
            videoUrl: values.videoInputType === "url" ? values.videoUrl : "",
            start_time: values.start_time,
            end_time: Date.now(),
            call_title: values.call_title,
            call_description: values.call_description,
            call_category: values.call_category,
            call_tags: values.call_tags,
          };

          // If video is uploaded, use FormData
          let dataToSend;
          if (values.videoInputType === "upload" && values.videoFile) {
            dataToSend = new FormData();
            Object.entries(payload).forEach(([key, val]) => {
              if (Array.isArray(val))
                dataToSend.append(key, JSON.stringify(val));
              else dataToSend.append(key, val);
            });
            dataToSend.append("video", values.videoFile);
            // if (values.thumbnail instanceof File)
            //   dataToSend.append("thumbnail", values.thumbnail);
          } else {
            dataToSend = payload;
          }
          await createEducatorRecording(dataToSend).unwrap();
          refetch();
          toast.success("Recording created successfully!");

          // if (selectedRow?._id) {
          //   await updateEducatorRecording({
          //     formData: dataToSend,
          //     id: selectedRow._id,
          //   }).unwrap();
          //   toast.success("Recording updated successfully!");
          // } else {
          //   await createEducatorRecording(dataToSend).unwrap();
          //   toast.success("Recording created successfully!");
          // }

          formik.resetForm();
          handleCloseCreate();
          // setSelectedRow({});
        } catch (err) {
          toast.error(err?.data?.message || "Something went wrong!");
        }
      },
    });

    // useEffect(() => {
    //   if (selectedRow?._id) {
    //     const initData = {
    //       title: selectedRow?.call_title,
    //       description: selectedRow?.call_description,
    //       id: selectedRow?._id,
    //       thumbnail: selectedRow?.thumbnail || null,
    //     };
    //     formik.setValues(initData);
    //   }
    // }, [selectedRow?._id, isCreateOpen]);

    // console.log(formik.values, "values");
    // console.log(selectedRow, "selectedRow");

    const getEmbedUrl = (url) => {
      if (!url) return "";

      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // if (url.includes("vimeo.com/")) {
      //   const videoId = url.split("vimeo.com/")[1].split("?")[0];
      //   return `https://player.vimeo.com/video/${videoId}`;
      // }

      if (url.includes("vimeo.com/")) {
        const parts = url.split("vimeo.com/")[1].split("/");
        const videoId = parts[0].split("?")[0];
        const hash = parts[1] ? parts[1].split("?")[0] : null;
        return hash
          ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
          : `https://player.vimeo.com/video/${videoId}`;
      }

      if (url.includes("dailymotion.com/video/")) {
        const videoId = url.split("dailymotion.com/video/")[1].split("?")[0];
        return `https://www.dailymotion.com/embed/video/${videoId}`;
      }

      // Loom
      if (url.includes("loom.com/share/")) {
        const videoId = url.split("loom.com/share/")[1].split("?")[0];
        return `https://www.loom.com/embed/${videoId}`;
      }

      // // Dyntube
      // if (url.includes("dyntube.com/video/")) {
      //   let videoId = url.split("dyntube.com/video/")[1].split("?")[0];
      //   videoId = videoId.replace(/\/$/, "");
      //   return `https://player.dyntube.com/video/${videoId}`;
      // }
      // CASE 1: https://app.dyntube.com/#/video/<id>/options
      if (url.includes("app.dyntube.com/#/video/")) {
        const match = url.match(/video\/([^/]+)/);
        if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
      }

      // CASE 2: https://videos.dyntube.com/iframes/<id>
      if (url.includes("videos.dyntube.com/iframes/")) {
        const match = url.match(/iframes\/([^/?#]+)/);
        if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
      }

      // CASE 3: https://player.dyntube.com/video/<id>
      if (url.includes("player.dyntube.com/video/")) {
        const match = url.match(/video\/([^/?#]+)/);
        if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
      }

      // CASE 4: fallback generic
      if (url.includes("dyntube.com/")) return url;
      return url;
    };

    const handleVideoUrlChange = (e) => {
      const url = e.target.value;
      setFormData((prev) => ({
        ...prev,
        content: url,
      }));

      if (isValidVideoUrl(url)) {
        setShowPreview(true);
      } else {
        setShowPreview(false);
      }
    };

    // useEffect(() => {
    //   if (videoFile instanceof File) {
    //     const url = URL.createObjectURL(videoFile);
    //     setShowPreviewVideo(url);
    //     return () => URL.revokeObjectURL(url);
    //   }
    // }, [videoFile]);

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("video/")) {
        setVideoFile(file);
      } else {
        setVideoFile(null);
        setShowPreviewVideo(null);
      }
    };
    const renderVideoInput = (formik) => {
      return (
        <div className="space-y-4">
          {/* Video Input Type Selector */}
          <label className="form-label text-gray-900 gap-1">
            Select Video Input Type <span className="text-danger">*</span>
          </label>
          <Select
            value={formik.values.videoInputType}
            onValueChange={(value) => {
              formik.setFieldValue("videoInputType", value);
              // Reset video fields when switching
              formik.setFieldValue("videoUrl", "");
              formik.setFieldValue("videoFile", null);
              formik.setFieldValue("videoPreview", null);
            }}
          >
            <SelectTrigger className="border-primary focus:border-primary focus:ring-primary">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="url">Video URL</SelectItem>
              <SelectItem value="upload">Upload File</SelectItem>
            </SelectContent>
          </Select>

          {/* Video URL Input */}
          {formik.values.videoInputType === "url" && (
            <div className="space-y-3 mt-2">
              <label className="font-medium text-primary">Video URL</label>
              <input
                type="text"
                name="videoUrl"
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                value={formik.values.videoUrl}
                onChange={(e) =>
                  formik.setFieldValue("videoUrl", e.target.value)
                }
                className="form-control input input-md w-full"
              />
              {formik.values.videoUrl && (
                <div className="mt-2">
                  <iframe
                    src={getEmbedUrl(formik.values.videoUrl)}
                    className="w-full aspect-video border rounded-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {/* Video Upload Input */}
          {formik.values.videoInputType === "upload" && (
            <div className="space-y-3 mt-2">
              <label className="font-medium text-primary">Upload Video</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    formik.setFieldValue("videoFile", file);
                    formik.setFieldValue("videoPreview", url);
                  }
                }}
                className="hidden"
                id="videoUpload"
              />
              <label
                htmlFor="videoUpload"
                className="cursor-pointer border px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
              >
                Choose Video File
              </label>
              {formik.values.videoFile && (
                <div className="mt-2">
                  <video
                    src={formik.values.videoPreview}
                    controls
                    className="w-full aspect-video border rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <Dialog
        open={isCreateOpen}
        onOpenChange={() => {
          formik.resetForm();
          handleCloseCreate();
          // setSelectedRow({});
        }}
      >
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[600px]" ref={ref}>
          <DialogHeader>
            <DialogTitle>
              {/* {selectedRow?._id ? "Update Recording" : "Create Educator"} */}
              Upload recorded session
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0 py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Title<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${
                      formik.errors.call_title && formik.touched.call_title
                        ? "border border-danger"
                        : ""
                    }`}
                    {...formik.getFieldProps("call_title")}
                  />
                  {formik.touched.call_title && formik.errors.call_title && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.call_title}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Description<span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    content={formik.values.call_description}
                    onChange={(value) =>
                      formik.setFieldValue("call_description", value)
                    }
                    onBlur={() =>
                      formik.setFieldTouched("call_description", false)
                    }
                    theme="snow"
                    touched={formik.touched.call_description}
                    error={formik.errors.call_description}
                  />
                  {formik.touched.call_description &&
                    formik.errors.call_description && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.call_description}
                      </span>
                    )}
                </div>
              </div>
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Date of the session<span className="text-danger">*</span>
                  </label>
                  <div className="custom_datepicket">
                    <DateTimePicker
                      isPickerOpen={isStartPickerOpen}
                      setIsPickerOpen={setStartIsPickerOpen}
                      value={formik.values.start_time}
                      onChange={(date) =>
                        formik.setFieldValue("start_time", date)
                      }
                      className={
                        formik.errors.start_time && formik.touched.start_time
                          ? "border border-danger"
                          : ""
                      }
                    />
                  </div>
                  {formik.touched.start_time && formik.errors.start_time && (
                    <span className="text-danger text-xs">
                      {formik.errors.start_time}
                    </span>
                  )}
                </div>
              </div>

              {/* <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    End Date<span className="text-danger">*</span>
                  </label>
                  <div className="custom_datepicket">
                    <DateTimePicker
                      isPickerOpen={isEndPickerOpen}
                      setIsPickerOpen={setEndIsPickerOpen}
                      value={formik.values.end_time}
                      onChange={(date) =>
                        formik.setFieldValue("end_time", date)
                      }
                      className={
                        formik.errors.end_time && formik.touched.end_time
                          ? "border border-danger"
                          : ""
                      }
                    />
                  </div>
                  {formik.touched.end_time && formik.errors.end_time && (
                    <span className="text-danger text-xs">
                      {formik.errors.end_time}
                    </span>
                  )}
                </div>
              </div> */}

              <div className="col-span-12">
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Category<span className="text-danger">*</span>
                    </label>
                    <Select
                      value={formik.values.call_category}
                      onValueChange={(value) =>
                        formik.setFieldValue("call_category", value)
                      }
                      className={`form-control input input-md w-full ${
                        formik.errors.call_category &&
                        formik.touched.call_category
                          ? "border border-danger"
                          : ""
                      }`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList?.data?.map((item) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {formik.touched.call_category &&
                      formik.errors.call_category && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.call_category}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Tags<span className="text-danger">*</span>
                  </label>
                  <TagInput
                    value={formik.values.call_tags}
                    onChange={(tags) => formik.setFieldValue("call_tags", tags)}
                    placeholder="Add tags..."
                    className={`form-control input input-md w-full ${
                      formik.errors.call_tags && formik.touched.call_tags
                        ? "border border-danger"
                        : ""
                    }`}
                  />
                  {formik.touched.call_tags && formik.errors.call_tags && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.call_tags}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12">
                <div className="border-t border-gray-100 pt-4">
                  {renderVideoInput(formik)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3 md:py-5">
            <button
              className="btn btn-light"
              onClick={() => {
                formik.resetForm();
                handleCloseCreate();
                // setSelectedRow({});
              }}
            >
              Cancel
            </button>
            <button
              disabled={formik.isSubmitting}
              type="submit"
              onClick={formik.handleSubmit}
              className="btn btn-primary"
            >
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreateEducatorRecording;
