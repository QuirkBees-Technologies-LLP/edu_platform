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
import { useCreateEducatorTradeAnalysisMutation, useUpdateEducatorTradeAnalysisMutation } from "../../../store/api/educator/educatorTradeAnalysisApiSlice";


const CreateTradeAnalysis = forwardRef(
  (
    { setSelectedRow, isCreateOpen, handleCloseCreate, selectedRow, refetch },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createEducatorTradeAnalysis] = useCreateEducatorTradeAnalysisMutation();
    const [updateEducatorTradeAnalysis] = useUpdateEducatorTradeAnalysisMutation();
    const createdBy = auth?.user?._id ?? null;

    const initialValues = {
      title: "",
      files: [""],
      createdBy: "",
      description: "",
    };

    const createSchema = Yup.object().shape({
      title: Yup.string().required("title is required"),
      files: Yup.array().min(1, "At least one file is required"),
      createdBy: Yup.string().required("Educator ID is required"),
      description: Yup.string().required("Entry is required"),
      
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        console.log("values", values);
    
        const formData = new FormData();
        formData.append("title", values.title);
        values.files.forEach((file) =>
          formData.append("files", file?.file?.file)
        );
        formData.append("createdBy", values.createdBy);
        formData.append("description", values.description);
        if (selectedRow?._id) {
          formData.append("id", selectedRow?._id);
        }

  
        try {
          if (selectedRow?._id) {
            let a = await updateEducatorTradeAnalysis(formData).unwrap();
            console.log("==============================>",a)
            refetch();
            toast.success("IQ Insight updated successfully!");
          } else {
            await createEducatorTradeAnalysis(formData).unwrap();
            refetch();
            toast.success("IQ Insight created successfully!");
          }
          formik.resetForm();
          handleCloseCreate();
        } catch (err) {
          console.log(err)
          console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });
    useEffect(() => {
      if (createdBy && formik.values) {
        formik.setFieldValue("createdBy", createdBy);
      }
    }, [createdBy, formik.values]);

    useEffect(() => {
      if (selectedRow?._id) {
        const existingImages =
          selectedRow.image?.map((img) => ({
            file: null,
            dataURL: img,
          })) || [];

        const initData = {
          title: selectedRow?.title,
          files: existingImages,
          description: selectedRow?.description,
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    // Function to add a new exit input
    

    // Function to remove an exit input
   

    // Handle multiple image selection
    const handleImageChange = (selectedFiles) => {
      if (selectedFiles.length > 0) {
        // Convert FileList to an array and map to store dataURLs
        const newFiles = Array.from(selectedFiles).map((file) => ({
          file,
          dataURL: file.dataURL,
        }));

        // Append new files to Formik state
        formik.setFieldValue("files", newFiles);
      }
    };

    const handleRemoveImage = (index) => {
      const newFiles = [...formik.values.files];
      newFiles.splice(index, 1);
      formik.setFieldValue("files", newFiles);
    };

    return (
      <>
        <Dialog
          open={isCreateOpen}
          onOpenChange={() => {
            setSelectedRow({});
            formik.resetForm();
            handleCloseCreate();
          }}
        >
          {formik.status && <Alert variant="danger">{formik.status}</Alert>}
          <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
            <DialogHeader>
              <DialogTitle>
                {selectedRow?._id ? "Create IQ Idea" : "Create IQ Idea"}
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
                      placeholder="Enter Title"
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
                      onBlur={() =>
                        formik.setFieldTouched("description", false)
                      }
                      theme="snow"
                      touched={formik.touched.description}
                      error={formik.errors.description}
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.description}
                        </span>
                      )}
                  </div>
                </div>
                {/* <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Message <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    content={formik.values.message}
                    onChange={(value) => formik.setFieldValue("message", value)}
                    onBlur={() => formik.setFieldTouched("message", true)}
                    theme="snow"
                    touched={formik.touched.message}
                    error={formik.errors.message}
                  />
                  {formik.touched.message && formik.errors.message && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.message}
                    </span>
                  )}
                </div>
              </div> */}
                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Images <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-wrap gap-5">
                      {/* Image Input */}
                      <ImageInput
                        multiple={true}
                        value={formik.values.files}
                        onChange={handleImageChange}
                      >
                        {({ onImageUpload }) => (
                          <div
                            className="cursor-pointer image-input size-24"
                            onClick={onImageUpload}
                          >
                            <div
                              className={`flex border justify-center rounded-lg image-input-placeholder items-center 
                                                ${formik.touched.files && formik.errors.files ? "border-danger" : "border-gray-200"}`}
                            >
                              <i className="ki-filled ki-picture"></i>
                            </div>
                          </div>
                        )}
                      </ImageInput>
                      {formik.values.files.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={file.dataURL}
                            alt="uploaded"
                            className="rounded-lg border-2 border-success size-24 object-cover"
                          />
                          <div className="absolute -right-4 -top-4">
                            <button
                              type="button"
                              className="btn btn-xs btn-icon rounded-full btn-danger"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <i className="ki-outline ki-cross"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {formik.touched.files && formik.errors.files && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.files}
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
                  setSelectedRow({});
                  formik.resetForm();
                  handleCloseCreate();
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
      </>
    );
  }
);

export default CreateTradeAnalysis;
