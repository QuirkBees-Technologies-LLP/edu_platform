import React, { forwardRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import RichTextEditor from "../../../components/ui/rich-editor";
import { useUpdateEducatorRecordingMutation } from "../../../store/api/educator/educatorRecordingApiSlice";
import { Alert } from "../../../components/alert/Alert";

const UpdateEducatorRecording = forwardRef(
  ({ isUpdateOpen, handleCloseUpdate, selectedRow, refetch, setSelectedRow }, ref) => {
    const [updateEducatorRecording] = useUpdateEducatorRecordingMutation();

    const initialValues = {
      title: "",
      description: "",
      thumbnail: null,
    };

    const createSchema = Yup.object().shape({
      title: Yup.string()
        .required("Title is required")
        .min(2, "Title must be at least 2 characters"),
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
      onSubmit: async (values, { setSubmitting }) => {
        setSubmitting(true);
        try {
          if (!selectedRow?._id) {
          // Create
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("thumbnail", values.thumbnail);
            // const res = await createEducatorRecording(formData).unwrap();

            toast.success("Recording created successfully!");
            formik.resetForm();
            handleCloseUpdate();
            setSelectedRow({});
            return;
          }

          // Update
          const hasNewThumbnail =
            values.thumbnail && typeof values.thumbnail !== "string";

          let res;

          if (hasNewThumbnail) {
            const formData = new FormData();
            formData.append("id", selectedRow._id);
            formData.append("call_title", values.title);
            formData.append("call_description", values.description);
            formData.append("thumbnail", values.thumbnail);

            res = await updateEducatorRecording({
              formData,
              id: selectedRow._id,
            }).unwrap();
          } else {
            const payload = {
              id: selectedRow._id,
              call_title: values.title,
              call_description: values.description,
            };
            res = await updateEducatorRecording(payload).unwrap();
          }

         
          if (res.success) {
            toast.success(res.message || "Recording updated successfully!");
            refetch();
            setSelectedRow({});
            formik.resetForm();
            handleCloseUpdate();
          } else {
            toast.error(res.message || "Failed to update recording");
          }
        } catch (err) {
          console.error("Update API error:", err);

          if (err?.status || err?.data) {
            const errorMessage =
              err?.data?.message || err?.error || err?.originalStatus || "Unexpected error occurred";
            toast.error(errorMessage);
          }
        } finally {
          setSubmitting(false);
        }
      },
    });
    useEffect(() => {
      if (selectedRow?._id) {
        formik.setValues({
          title: selectedRow?.call_title || "",
          description: selectedRow?.call_description || "",
          thumbnail: selectedRow?.thumbnail || null,
        });
      }
    }, [selectedRow?._id, isUpdateOpen]);

    return (
      <Dialog
        open={isUpdateOpen}
        onOpenChange={() => {
          formik.resetForm();
          handleCloseUpdate();
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
            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900 gap-1">
                Title<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter title"
                autoComplete="off"
                className={`form-control input input-md w-full ${
                  formik.errors.title && formik.touched.title ? "border border-danger" : ""
                }`}
                {...formik.getFieldProps("title")}
              />
              {formik.touched.title && formik.errors.title && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.title}
                </span>
              )}
            </div>

           
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900 gap-1">
                Thumbnail<span className="text-danger">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => formik.setFieldValue("thumbnail", e.currentTarget.files[0])}
                className={`form-control input input-md w-full h-full p-3 ${
                  formik.errors.thumbnail && formik.touched.thumbnail ? "border border-danger" : ""
                }`}
              />
              {formik.values.thumbnail && (
                <div className="mt-2">
                  <img
                    src={
                      typeof formik.values.thumbnail === "string"
                        ? formik.values.thumbnail
                        : URL.createObjectURL(formik.values.thumbnail)
                    }
                    alt="Thumbnail preview"
                    className="w-40 h-40 rounded-lg border border-gray-200"
                  />
                </div>
              )}
              {formik.touched.thumbnail && formik.errors.thumbnail && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.thumbnail}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, JPG, WebP. Maximum size: 20MB
              </p>
            </div>

         
            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900 gap-1">
                Description<span className="text-danger">*</span>
              </label>
              <RichTextEditor
                content={formik.values.description}
                onChange={(value) => formik.setFieldValue("description", value)}
                onBlur={() => formik.setFieldTouched("description", true)}
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

         
          <div className="flex border-gray-200 border-t justify-end py-5 rounded-b gap-3">
            <button
              className="btn btn-light"
              onClick={() => {
                formik.resetForm();
                handleCloseUpdate();
                setSelectedRow({});
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
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

export default UpdateEducatorRecording;
