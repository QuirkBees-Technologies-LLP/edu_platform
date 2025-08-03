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
import {
  useCreateEducatorTradeIdeasMutation,
  useGetEducatorTradeCategoryQuery,
  useUpdateEducatorTradeIdeaMutation,
} from "../../../store/api/educator/educatorTradeIdeasApiSlice";

const CreateTradeIdeas = forwardRef(
  (
    { setSelectedRow, isCreateOpen, handleCloseCreate, selectedRow, refetch },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createEducatorTradeIdeas] = useCreateEducatorTradeIdeasMutation();
    const [updateEducatorTradeIdea] = useUpdateEducatorTradeIdeaMutation();
    const { data } = useGetEducatorTradeCategoryQuery();

    const educatorId = auth?.user?._id ?? null;

    const initialValues = {
      name: "",
      files: [""],
      type: "",
      timeFrame: "",
      educatorId: "",
      status: "",
      entry: "",
      invalidation: "",
      exits: [""],
      description: "",
      category: "",
    };

    const createSchema = Yup.object().shape({
      name: Yup.string().required("symbol is required"),
      files: Yup.array().min(1, "At least one file is required"),
      type: Yup.string().oneOf(["buy", "sell"]).required("Type is required"),
      status: Yup.string()
        .oneOf(["active", "pending", "win", "partialWin", "loss"])
        .required("Status is required"),
      timeFrame: Yup.string().required("Time frame is required"),
      educatorId: Yup.string().required("Educator ID is required"),
      category: Yup.string().required("Educator ID is required"),
      entry: Yup.string().required("Entry is required"),
      description: Yup.string().required("Entry is required"),
      invalidation: Yup.number()
        .typeError("Invalidation must be a number")
        .required("Invalidation is required"),
      exits: Yup.array()
        .of(
          Yup.number()
            .typeError("Exit must be a number")
            .integer("Exit must be an integer")
            .required("Exit is required")
        )
        .min(1, "At least one exit is required"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        console.log("values", values);
        const exitsValues =
          typeof values.exits === "string"
            ? values.exits.split(",").map(Number)
            : values.exits;

        const formData = new FormData();
        formData.append("name", values.name);
        values.files.forEach((file) =>
          formData.append("files", file?.file?.file)
        );
        formData.append("type", values.type);
        formData.append("timeFrame[]", [values.timeFrame]);
        formData.append("educatorId", values.educatorId);
        formData.append("category", values.category);
        formData.append("status", values.status);
        formData.append("entry", values.entry);
        formData.append("invalidation", values.invalidation);
        formData.append("description", values.description);
        exitsValues.forEach((exit) => formData.append("exits[]", exit));
        if (selectedRow?._id) {
          formData.append("id", selectedRow?._id);
        }

        try {
          if (selectedRow?._id) {
            await updateEducatorTradeIdea(formData).unwrap();
            refetch();
            toast.success("Trade idea updated successfully!");
          } else {
            await createEducatorTradeIdeas(formData).unwrap();
            refetch();
            toast.success("Trade idea created successfully!");
          }
          formik.resetForm();
          handleCloseCreate();
        } catch (err) {
          console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });

    console.log("formik", formik);
    useEffect(() => {
      if (educatorId && formik.values) {
        formik.setFieldValue("educatorId", educatorId);
      }
    }, [educatorId, formik.values]);

    useEffect(() => {
      if (selectedRow?._id) {
        const existingImages =
          selectedRow.image?.map((img) => ({
            file: null,
            dataURL: img,
          })) || [];

        const initData = {
          name: selectedRow?.name,
          files: existingImages,
          type: selectedRow?.type,
          timeFrame: selectedRow?.timeFrame[0],
          status: selectedRow?.status,
          category: selectedRow?.category,
          entry: selectedRow?.entry,
          invalidation: selectedRow?.invalidation,
          description: selectedRow?.description,
          exits: selectedRow?.exits,
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    // Function to add a new exit input
    const addExit = () => {
      formik.setValues({
        ...formik.values,
        exits: [...formik.values.exits, ""],
      });
    };

    // Function to remove an exit input
    const removeExit = (index) => {
      const updatedExits = [...formik.values.exits];
      updatedExits.splice(index, 1); // Remove exit at index
      formik.setValues({
        ...formik.values,
        exits: updatedExits,
      });
    };

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
                {selectedRow?._id ? "Update Trade Idea" : "Create Trade Idea"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 px-0 py-5">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Symbol<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      autoComplete="off"
                      className={`form-control input input-md w-full ${
                        formik.errors.name && formik.touched.name
                          ? "border border-danger"
                          : ""
                      }`}
                      {...formik.getFieldProps("name")}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Direction <span className="text-danger">*</span>
                    </label>

                    <Select
                      name="type"
                      value={formik.values.type}
                      onValueChange={(value) =>
                        formik.setFieldValue("type", value)
                      }
                      onBlur={() => formik.setFieldTouched("type", true)}
                    >
                      <SelectTrigger
                        className={`form-control input input-md w-full ${
                          formik.errors.type && formik.touched.type
                            ? "border border-danger"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>

                    {formik.touched.type && formik.errors.type && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-6">
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

                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Time Frame <span className="text-danger">*</span>
                    </label>

                    <Select
                      name="timeFrame"
                      value={formik.values.timeFrame}
                      onValueChange={(value) =>
                        formik.setFieldValue("timeFrame", value)
                      }
                      onBlur={() => formik.setFieldTouched("timeFrame", true)}
                    >
                      <SelectTrigger
                        className={`form-control input input-md w-full ${
                          formik.errors.timeFrame && formik.touched.timeFrame
                            ? "border border-danger"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scalping">Scalping</SelectItem>
                        <SelectItem value="intraday">Intraday</SelectItem>
                        <SelectItem value="swing">Swing</SelectItem>
                      </SelectContent>
                    </Select>

                    {formik.touched.timeFrame && formik.errors.timeFrame && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.timeFrame}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Category <span className="text-danger">*</span>
                    </label>

                    <Select
                      name="category"
                      value={formik.values.category}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                      onBlur={() => formik.setFieldTouched("category", true)}
                    >
                      <SelectTrigger
                        className={`form-control input input-md w-full ${
                          formik.errors.category && formik.touched.category
                            ? "border border-danger"
                            : ""
                        }`}
                      >
                        {/* 🔽 YAHI PART IMPORTANT HAI */}
                        <SelectValue>
                          {data?.category?.find(
                            (cat) => cat._id === formik.values.category
                          )?.name || "Select Category"}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {data?.data?.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {formik.touched.category && formik.errors.category && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Status <span className="text-danger">*</span>
                    </label>

                    <Select
                      name="status"
                      value={formik.values.status}
                      onValueChange={(value) =>
                        formik.setFieldValue("status", value)
                      }
                      onBlur={() => formik.setFieldTouched("status", true)}
                    >
                      <SelectTrigger
                        className={`form-control input input-md w-full ${
                          formik.errors.status && formik.touched.status
                            ? "border border-danger"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="win">Win</SelectItem>
                        <SelectItem value="partialWin">Partial Win</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                      </SelectContent>
                    </Select>

                    {formik.touched.status && formik.errors.status && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Entry <span className="text-danger">*</span>
                    </label>
                    <input
                      {...formik.getFieldProps("entry")}
                      type="number"
                      placeholder="Enter entry"
                      autoComplete="off"
                      className={`form-control input input-md w-full ${
                        formik.errors.entry && formik.touched.entry
                          ? "border border-danger"
                          : ""
                      }`}
                    />
                    {formik.touched.entry && formik.errors.entry && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.entry}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Invalidation <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter invalidation"
                      autoComplete="off"
                      {...formik.getFieldProps("invalidation")}
                      className={`form-control input input-md w-full ${
                        formik.errors.invalidation &&
                        formik.touched.invalidation
                          ? "border border-danger"
                          : ""
                      }`}
                    />
                    {formik.touched.invalidation &&
                      formik.errors.invalidation && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.invalidation}
                        </span>
                      )}
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="flex flex-col w-full gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Exits <span className="text-danger">*</span>
                      <button type="button" onClick={addExit} className="ml-2">
                        <i className="ki-filled ki-plus-squared"></i>
                      </button>
                    </label>
                    {formik.values.exits.map((exit, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        {/* Input + Close Button in a Row */}
                        <div className="flex items-center gap-2 relative">
                          <input
                            type="number"
                            placeholder="Enter exits"
                            autoComplete="off"
                            value={exit}
                            onChange={(e) => {
                              const newExits = [...formik.values.exits];
                              newExits[index] = e.target.value;
                              formik.setFieldValue("exits", newExits);
                            }}
                            className={`form-control input input-md w-full ${
                              formik.errors.exits?.[index] &&
                              formik.touched.exits?.[index]
                                ? "border border-danger"
                                : ""
                            }`}
                          />

                          {/* Remove Button (if more than 1 exit) */}
                          {formik.values.exits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExit(index)}
                              className="text-gray-600 hover:text-red-500"
                            >
                              <i className="ki-cross-square ki-filled"></i>
                            </button>
                          )}
                        </div>

                        {/* Error Message (Below Input) */}
                        {formik.touched.exits?.[index] &&
                          formik.errors.exits?.[index] && (
                            <div role="alert" className="text-danger text-xs">
                              {formik.errors.exits[index]}
                            </div>
                          )}
                      </div>
                    ))}
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
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Images <span className="text-danger">*</span>
                    </label>
                    {formik.values.files.length > 0 && (
                      <div className="flex flex-wrap gap-5">
                        {/* Upload Box (always show) */}
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
              ${
                formik.touched.files && formik.errors.files
                  ? "border-danger"
                  : "border-gray-200"
              }`}
                              >
                                <i className="ki-filled ki-picture"></i>
                              </div>
                            </div>
                          )}
                        </ImageInput>

                        {/* Only show images with a valid dataURL */}
                        {formik.values.files
                          .filter((file) => !!file?.dataURL) // ✅ Only if there's a valid dataURL
                          .map((file, index) => (
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
                    )}

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

export default CreateTradeIdeas;
