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
import { ImageInput } from "@/components/image-input";
import { toast } from "sonner";
import { useAuthContext } from "../../../auth/useAuthContext";
import { useGetCommonCategoryQuery } from "../../../store/api/client/clientEductorApiSlice";
import {
  useCreateAdminLiveTradeIdeaMutation,
  useUpdateAdminLiveTradeIdeaMutation,
} from "../../../store/api/admin/adminLiveTradeIdeasApiSlice";

const CreateLiveTradeIdea = forwardRef(
  (
    {
      isCreateOpen,
      handleCloseCreate,
      callId,
      selectedRow,
      refetch,
      // "Update" (chain) action: the source live idea to link the new one back to via
      // previousLiveIdea, forming a thread — see AdminTradeIdeas.jsx's ActionMenu. Always
      // creates a brand-new document, never an in-place edit.
      chainFrom,
      setChainFrom,
    },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createAdminLiveTradeIdea] = useCreateAdminLiveTradeIdeaMutation();
    const [updateAdminLiveTradeIdea] = useUpdateAdminLiveTradeIdeaMutation();

    const educatorId = auth?.user?._id ?? null;
    const { data } = useGetCommonCategoryQuery();
    const isChainMode = !selectedRow?._id && !!chainFrom?._id;

    const initialValues = {
      name: "",
      files: [],
      type: "",
      educatorId: "",
      category: "",
      status: "",
      pips: 0,
      timeFrame: "",
      description: "",
    };
    const numberField = () =>
      Yup.number()
        .nullable()
        .transform((value, originalValue) => {
          if (originalValue === "" || originalValue === undefined) return null;
          const cleaned = Number(originalValue);
          return isNaN(cleaned) ? 0 : cleaned;
        });

    const createSchema = Yup.object().shape({
      name: Yup.string().required("symbol is required"),
      files: Yup.array().min(1, "At least one file is required"),
      type: Yup.string().oneOf(["buy", "sell"]).required("Type is required"),
      status: Yup.string()
        .oneOf(["active", "pending", "win", "partialWin", "loss", "breakEven"])
        .required("Status is required"),
      educatorId: Yup.string().required("Educator ID is required"),
      category: Yup.string().required("Category is required"),
      pips: numberField(),
      timeFrame: Yup.string().required("Time Frame is required"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        const formData = new FormData();
        formData.append("name", values.name);
        values.files.forEach((file) =>
          formData.append("files", file?.file?.file)
        );
        formData.append("type", values.type);
        formData.append("pips", values.pips ?? 0);
        formData.append("educatorId", educatorId);
        formData.append("status", values.status);
        formData.append("category", values.category);
        formData.append("streamCallId", callId || chainFrom?.streamCallId || "");
        formData.append("timeFrame", values.timeFrame);
        formData.append("isLiveIdea", true);
        formData.append("description", values.description || "");
        if (selectedRow?._id) {
          formData.append("id", selectedRow?._id);
        }
        if (isChainMode) {
          formData.append("previousLiveIdea", chainFrom._id);
          const keptImages = (values.files || [])
            .filter((f) => !f?.file?.file && f?.dataURL)
            .map((f) => f.dataURL);
          formData.append("existingImages", JSON.stringify(keptImages));
        }

        try {
          if (selectedRow?._id) {
            await updateAdminLiveTradeIdea({
              id: selectedRow?._id,
              formData,
            }).unwrap();

            toast.success("Live Trade Idea updated successfully!");
          } else {
            await createAdminLiveTradeIdea(formData).unwrap();

            toast.success(isChainMode ? "Update published successfully!" : "Live Trade Idea created successfully!");
          }
          formik.resetForm();
          setChainFrom?.(null);
          if (refetch) refetch();
          handleCloseCreate();
        } catch (err) {
          console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });

    useEffect(() => {
      if (educatorId && formik.values) {
        formik.setFieldValue("educatorId", educatorId);
      }
    }, [educatorId, formik.values]);

    useEffect(() => {
      if (selectedRow?._id) {
        const existingImages =
          selectedRow?.image?.map((img) => ({
            file: null,
            dataURL: img,
          })) || [];

        const initData = {
          name: selectedRow?.name,
          files: existingImages,
          type: selectedRow?.type,
          status: selectedRow?.status,
          category: selectedRow?.category?._id,
          pips: selectedRow?.pips,
          educatorId: selectedRow?.educatorId,
          streamCallId: selectedRow?.streamCallId,
          isLiveIdea: selectedRow?.isLiveIdea,
          timeFrame: selectedRow?.timeFrame,
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    // "Update" (chain) action: reference fields (symbol/direction/type/category) are
    // copied from the source live idea — rendered read-only below, not editable, since
    // this is reporting an outcome on the same live idea, not a new one. Images ARE
    // pre-loaded (unlike Insights' chain form) so the educator can keep "before" images
    // alongside new "after" ones, per Task 11. Status/pips/description start fresh.
    useEffect(() => {
      if (!selectedRow?._id && chainFrom?._id) {
        const seedImages = (chainFrom?.image || []).map((img) => ({
          file: null,
          dataURL: img,
        }));

        formik.setValues({
          name: chainFrom?.name || "",
          files: seedImages,
          type: chainFrom?.type || "",
          status: "active",
          category: chainFrom?.category?._id || "",
          pips: 0,
          educatorId: chainFrom?.educatorDetails?._id || educatorId,
          streamCallId: chainFrom?.streamCallId,
          isLiveIdea: chainFrom?.isLiveIdea,
          timeFrame: Array.isArray(chainFrom?.timeFrame)
            ? chainFrom.timeFrame[0]
            : chainFrom?.timeFrame || "",
          description: "",
        });
      }
    }, [chainFrom?._id, selectedRow?._id, isCreateOpen]);

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

    useEffect(() => {
      if (!selectedRow) {
        formik.resetForm();
      }
    }, [selectedRow]);

    return (
      <>
        <Dialog
          open={isCreateOpen}
          onOpenChange={() => {
            formik.resetForm();
            setChainFrom?.(null);
            handleCloseCreate();
          }}
        >
          {formik.status && <Alert variant="danger">{formik.status}</Alert>}
          <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
            <DialogHeader>
              <DialogTitle>
                {selectedRow?._id
                  ? "Edit Live Trade Idea"
                  : isChainMode
                    ? "Update Live Trade Idea"
                    : "Create Live Trade Idea"}
              </DialogTitle>
              {isChainMode && (
                <p className="text-xs text-gray-500 mt-1">
                  This publishes a follow-up live idea chained to "{chainFrom?.name}".
                </p>
              )}
            </DialogHeader>
            <div className="grid gap-5 px-0 py-5">
              <div className="grid grid-cols-12 gap-4">
                {isChainMode && (
                  <div className="col-span-12">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-3 flex flex-wrap gap-x-6 gap-y-2">
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Symbol</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{chainFrom?.name || "—"}</span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Direction</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100 capitalize">{chainFrom?.type || "—"}</span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Type</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100 capitalize">{Array.isArray(chainFrom?.timeFrame) ? chainFrom.timeFrame.join("/") : chainFrom?.timeFrame || "—"}</span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Category</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{chainFrom?.category?.name || "—"}</span>
                      </span>
                    </div>
                  </div>
                )}
                {!isChainMode && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Symbol<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter symbol"
                      autoComplete="off"
                      className={`form-control input input-md w-full ${formik.errors.name && formik.touched.name
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
                )}
                {!isChainMode && (
                <div className="col-span-12 md:col-span-6">
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
                        className={`form-control input input-md w-full ${formik.errors.type && formik.touched.type
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
                )}

                {!isChainMode && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Type <span className="text-danger">*</span>
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
                        className={`form-control input input-md w-full ${formik.errors.timeFrame && formik.touched.timeFrame
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
                )}
                <div className="col-span-12 md:col-span-6">
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
                        className={`form-control input input-md w-full ${formik.errors.status && formik.touched.status
                          ? "border border-danger"
                          : ""
                          }`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {!isChainMode && <SelectItem value="pending">Pending</SelectItem>}
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="win">Win</SelectItem>
                        <SelectItem value="partialWin">Partial Win</SelectItem>
                        <SelectItem value="breakEven">Break Even</SelectItem>
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
                {!isChainMode && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col w-full gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Category <span className="text-danger">*</span>
                    </label>
                    <Select
                      value={formik.values.category}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                      className={`form-control input input-md w-full ${formik.errors.category ? "border border-danger" : ""}`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(data?.data) && data.data.length > 0 ? (
                          data.data.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No options available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.category}
                      </span>
                    )}
                  </div>
                </div>
                )}

                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter a description — this becomes the copy shown on the resulting social post"
                      className={`form-control input input-md w-full ${formik.errors.description && formik.touched.description
                        ? "border border-danger"
                        : ""
                        }`}
                      {...formik.getFieldProps("description")}
                    />
                    {formik.touched.description && formik.errors.description && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.description}
                      </span>
                    )}
                  </div>
                </div>

                {(isChainMode
                  ? ["win", "loss", "partialWin", "breakEven"]
                  : ["win", "loss", "partialWin"]
                ).includes(formik.values.status) && (
                    <div className="col-span-12 md:col-span-6">
                      <div className="flex flex-col gap-1">
                        <label className="form-label text-gray-900 gap-1">
                          Pips <span className="text-danger"></span>
                        </label>

                        <input
                          type="number"
                          placeholder="Enter Pips"
                          autoComplete="off"
                          className={`form-control input input-md w-full ${formik.errors.pips && formik.touched.pips
                            ? "border border-danger"
                            : ""
                            }`}
                          {...formik.getFieldProps("pips")}
                        />

                        {formik.touched.pips && formik.errors.pips && (
                          <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.pips}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div className="col-span-12">
                  <div className="flex flex-wrap gap-5">
                    {/* Upload Box - always shown */}
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
                              ${formik.touched.files && formik.errors.files
                                ? "border-danger"
                                : "border-gray-200"
                              }`}
                          >
                            <i className="ki-filled ki-picture"></i>
                          </div>
                        </div>
                      )}
                    </ImageInput>

                    {/* Show preview only if there are images */}
                    {formik.values.files
                      .filter((file) => !!file?.dataURL)
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
                  {formik.touched.files && formik.errors.files && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.files}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3 md:py-5">
              <button
                className="btn btn-light"
                onClick={() => {
                  formik.resetForm();
                  setChainFrom?.(null);
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

export default CreateLiveTradeIdea;
