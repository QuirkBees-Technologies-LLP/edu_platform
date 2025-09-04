import React, { forwardRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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

const CreateEducatorRecording = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const [updateEducatorRecording] = useUpdateEducatorRecordingMutation();

    const initialValues = {
      title: "",
      description: "",
      thumbnail: null,
    };

    const createSchema = Yup.object().shape({
      title: Yup.string()
        .required("Title is required")
        .min(2, "Description must be at least 2 characters"),

      description: Yup.string()
        .required("Description is required")
        .min(2, "Description must be at least 2 characters"),

      thumbnail: Yup.mixed()
        .required("Thumbnail is required")
        .test(
          "fileSize",
          "Thumbnail size too large (max 20MB)",
          (value) => !value || (value && value.size <= 20000000)
        )
        .test(
          "fileType",
          "Unsupported file format. Please use JPEG, PNG, JPG, or WebP",
          (value) =>
            !value ||
            (value &&
              ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
                value.type
              ))
        ),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        try {
          const payload = { ...values };

          if (selectedRow?._id) {
            // Update mode
            payload.id = selectedRow._id;
            payload.call_title = values?.title;
            payload.call_description = values?.description;

            // Check if thumbnail is a new file or existing string
            const hasNewThumbnail =
              values.thumbnail && typeof values.thumbnail !== "string";

            if (hasNewThumbnail) {
              // New thumbnail uploaded - use FormData
              const formData = new FormData();
              formData.append("id", payload.id);
              formData.append("call_title", payload.call_title);
              formData.append("call_description", payload.call_description);
              formData.append("thumbnail", values.thumbnail);

             const res =  await updateEducatorRecording({
                formData: formData,
                id: selectedRow._id,
              }).unwrap();
              console.log("Update response: ", res);
            } else {
              // No new thumbnail - send regular payload
              delete payload.thumbnail; // Remove thumbnail field
              await updateEducatorRecording(payload).unwrap();
            }

            setSelectedRow({});
            refetch();
            toast.success("Recording updated successfully!");
          } else {
            // Create mode - always use FormData for new thumbnail
            const formData = new FormData();
            formData.append("title", values?.title);
            formData.append("description", values?.description);
            formData.append("thumbnail", values?.thumbnail);

            // Call create API here if you have one
            // await createEducatorRecording(formData).unwrap();
            toast.success("Recording created successfully!");
          }

          formik.resetForm();
          handleCloseCreate();
        } catch (err) {
          console.error("API Error:", err);

          let errorMessage = "An unexpected error occurred."; // fallback

          // Check if err is an object
          if (err && typeof err === "object") {
            if (err.data && err.data.message) {
              errorMessage = err.data.message;
            } else if (err.error) {
              errorMessage = err.error;
            }
          } else if (typeof err === "string") {
            errorMessage = err; // sometimes err is just a string
          }

          toast.error(errorMessage);
        }
      },
    });

    useEffect(() => {
      if (selectedRow?._id) {
        const initData = {
          title: selectedRow?.call_title,
          description: selectedRow?.call_description,
          id: selectedRow?._id,
          thumbnail: selectedRow?.thumbnail || null,
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    console.log(formik.values, "values");
    console.log(selectedRow, "selectedRow");

    return (
      <Dialog
        open={isCreateOpen}
        onOpenChange={() => {
          formik.resetForm();
          handleCloseCreate();
          setSelectedRow({});
        }}
      >
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[600px]" ref={ref}>
          <DialogHeader>
            <DialogTitle>
              {selectedRow?._id ? "Update Recording" : "Create Educator"}
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
                      formik.errors.title && formik.touched.title
                        ? "border border-danger"
                        : ""
                    }`}
                    {...formik.getFieldProps("title")}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.title}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Upload Section */}
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Thumbnail<span className="text-danger">*</span>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      formik.setFieldValue("thumbnail", file);
                    }}
                    className={`form-control input input-md w-full h-full p-3 ${
                      formik.errors.thumbnail && formik.touched.thumbnail
                        ? "border border-danger"
                        : ""
                    }`}
                  />

                  {/* Preview */}
                  {formik.values.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={
                          typeof formik.values.thumbnail === "string"
                            ? formik.values.thumbnail // Backend URL
                            : URL.createObjectURL(formik.values.thumbnail) // Local file preview
                        }
                        alt="Thumbnail preview"
                        className="w-40 h-40 rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Thumbnail Validation Error */}
                  {formik.touched.thumbnail && formik.errors.thumbnail && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.thumbnail}
                    </span>
                  )}

                  {/* Help Text */}
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPEG, PNG, JPG, WebP. Maximum size: 20MB
                  </p>
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Description<span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    content={formik.values.description}
                    onChange={(value) =>
                      formik.setFieldValue("description", value)
                    }
                    onBlur={() => formik.setFieldTouched("description", false)}
                    theme="snow"
                    touched={formik.touched.description}
                    error={formik.errors.description}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.description}
                    </span>
                  )}
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
                setSelectedRow({});
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
              Submit
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreateEducatorRecording;
