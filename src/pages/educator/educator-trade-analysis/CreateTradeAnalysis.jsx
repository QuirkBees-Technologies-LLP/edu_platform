import React, { forwardRef, useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Play, X } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableImageList from "@/components/ui/DraggableImageList";
import DraggableLinkList from "@/components/ui/DraggableLinkList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  useCreateEducatorTradeAnalysisMutation,
  useUpdateEducatorTradeAnalysisMutation,
} from "../../../store/api/educator/educatorTradeAnalysisApiSlice";
import { useGetCommonCategoryQuery } from "../../../store/api/client/clientEductorApiSlice";
import { isDyntubeUrl, getEmbedUrl } from "@/utils/videoUtils";

const CreateTradeAnalysis = forwardRef(
  (
    {
      setSelectedRow,
      isCreateOpen,
      handleCloseCreate,
      selectedRow,
      refetch,
      // The insight this new one should chain from (Task 4.2's "Update" action, distinct
      // from Edit). Only meaningful when selectedRow is empty — a chained insight is always
      // a brand-new document, never an in-place edit.
      chainFrom,
      setChainFrom,
    },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createEducatorTradeAnalysis] =
      useCreateEducatorTradeAnalysisMutation();
    const [updateEducatorTradeAnalysis] =
      useUpdateEducatorTradeAnalysisMutation();
    const createdBy = auth?.user?._id ?? null;
    const { data } = useGetCommonCategoryQuery();

    const initialValues = {
      title: "",
      files: [],
      createdBy: "",
      description: "",
      category: "",
      checkTime: false,
      tradingViewLinks: [""],
      dyntubeUrl: "",
    };

    const createSchema = Yup.object().shape({
      title: Yup.string().required("title is required"),
      files: Yup.array().test(
        'files-or-links',
        'At least one screenshot, TradingView link, or DynTube URL is required',
        function (files) {
          const tvLinks = this.parent.tradingViewLinks;
          const dyntubeUrl = this.parent.dyntubeUrl;
          const hasLinks = tvLinks && tvLinks.filter(l => l && l.trim()).length > 0;
          const hasFiles = files && files.length > 0;
          const hasDyntube = dyntubeUrl && dyntubeUrl.trim() && isDyntubeUrl(dyntubeUrl.trim());
          return hasLinks || hasFiles || hasDyntube;
        }
      ),
      createdBy: Yup.string().required("Educator ID is required"),
      description: Yup.string().required("Entry is required"),
      category: Yup.string().required("Category is required"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        const formData = new FormData();
        formData.append("title", values.title);
        values.files.forEach((file) =>
          formData.append("files", file?.file?.file)
        );
        formData.append("createdBy", values.createdBy);
        formData.append("description", values.description);
        formData.append("category", values.category);
        formData.append("checkTime", values.checkTime);

        // Append TradingView links (always send, even empty, so backend can clear old links)
        const tvLinks = (values.tradingViewLinks || []).filter(l => l && l.trim());
        formData.append("tradingViewLinks", JSON.stringify(tvLinks));

        // Chained create (Task 4.2's "Update" action): link this brand-new insight back to
        // the one it follows up on. Only applies when actually creating (not editing).
        if (!selectedRow?._id && chainFrom?._id) {
          formData.append("previousAnalysis", chainFrom._id);
        }

        // Append DynTube URL
        if (values.dyntubeUrl && values.dyntubeUrl.trim()) {
          formData.append("dyntubeUrl", values.dyntubeUrl.trim());
        } else if (selectedRow?._id && selectedRow?.dyntubeUrl) {
          // Editing and URL was removed
          formData.append("removeDyntubeUrl", "true");
        }

        // Send existing image URLs the user kept (so backend knows which to preserve)
        if (selectedRow?._id) {
          // User-managed images from the form
          const keptImages = (values.files || [])
            .filter((f) => !f?.file?.file && f?.dataURL)
            .map((f) => f.dataURL);
          // Also preserve TV chart images (auto-generated, not shown in form but must not be deleted)
          const tvChartImages = (selectedRow?.image || []).filter((img) => img.includes('tv-chart-images') || img.includes('tv-snapshot'));
          const allKeptImages = [...keptImages, ...tvChartImages];
          formData.append("existingImages", JSON.stringify(allKeptImages));
        }

        if (selectedRow?._id) {
          formData.append("id", selectedRow?._id);
        }

        try {
          if (selectedRow?._id) {
            let a = await updateEducatorTradeAnalysis(formData).unwrap();

            toast.success("IQ Insight updated successfully!");
          } else {
            await createEducatorTradeAnalysis(formData).unwrap();

            toast.success("IQ Insight created successfully!");
          }
          formik.resetForm();
          setSelectedRow({});
          setChainFrom?.(null);
          refetch();
          handleCloseCreate();
        } catch (err) {
          console.log(err);
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
          selectedRow?.image
            ?.filter((img) => !img.includes('tv-chart-images') && !img.includes('tv-snapshot'))
            .map((img) => ({
              file: null,
              dataURL: img,
            })) || [];

        // Backward compat: if old record has url but no tradingViewLinks, convert (only if it's actually a TradingView URL)
        let tvLinks = [""];
        if (selectedRow?.tradingViewLinks?.length > 0) {
          tvLinks = selectedRow.tradingViewLinks;
        } else if (selectedRow?.url && selectedRow.url.includes('tradingview.com')) {
          tvLinks = [selectedRow.url];
        }

        const initData = {
          title: selectedRow?.title,
          files: existingImages,
          description: selectedRow?.description,
          category: selectedRow?.category?._id,
          checkTime: selectedRow?.isUpdatedAnalysis || false,
          tradingViewLinks: tvLinks,
          dyntubeUrl: selectedRow?.dyntubeUrl || "",
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    // "Update" (chain) action: this is a brand-new, standalone follow-up insight, not an
    // edit of the source one — every field starts blank, same as a plain Create. Only the
    // chain link itself (previousAnalysis, set on submit) ties it back to the source.
    useEffect(() => {
      if (!selectedRow?._id && chainFrom?._id) {
        formik.setValues({
          title: "",
          files: [],
          description: "",
          category: "",
          checkTime: false,
          tradingViewLinks: [""],
          dyntubeUrl: "",
        });
      }
    }, [chainFrom?._id, selectedRow?._id, isCreateOpen]);

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

    // Drag-and-drop reorder handlers
    const handleReorderImages = useCallback((dragIndex, hoverIndex) => {
      const items = [...formik.values.files];
      const [removed] = items.splice(dragIndex, 1);
      items.splice(hoverIndex, 0, removed);
      formik.setFieldValue("files", items);
    }, [formik.values.files]);

    const handleReorderLinks = useCallback((dragIndex, hoverIndex) => {
      const items = [...formik.values.tradingViewLinks];
      const [removed] = items.splice(dragIndex, 1);
      items.splice(hoverIndex, 0, removed);
      formik.setFieldValue("tradingViewLinks", items);
    }, [formik.values.tradingViewLinks]);

    const handleLinkChange = useCallback((index, value) => {
      const updated = [...formik.values.tradingViewLinks];
      updated[index] = value;
      formik.setFieldValue("tradingViewLinks", updated);
    }, [formik.values.tradingViewLinks]);

    const handleRemoveLink = useCallback((index) => {
      const updated = formik.values.tradingViewLinks.filter((_, i) => i !== index);
      formik.setFieldValue("tradingViewLinks", updated);
    }, [formik.values.tradingViewLinks]);

    const handleAddLink = useCallback(() => {
      formik.setFieldValue("tradingViewLinks", [...(formik.values.tradingViewLinks || []), ""]);
    }, [formik.values.tradingViewLinks]);

    useEffect(() => {
      if (!selectedRow) {
        formik.resetForm();
      }
    }, [selectedRow]);

    const existingImages =
      selectedRow?.image?.map((img) => ({
        file: null,
        dataURL: img,
      })) || [];

    return (
      <DndProvider backend={HTML5Backend}>
        <Dialog
          open={isCreateOpen}
          onOpenChange={() => {
            formik.resetForm();
            setSelectedRow({});
            setChainFrom?.(null);

            handleCloseCreate();
          }}
        >
          {formik.status && <Alert variant="danger">{formik.status}</Alert>}
          <DialogContent className="p-5 max-w-[600px]" ref={ref}>
            <DialogHeader>
              <DialogTitle>
                {selectedRow?._id
                  ? "Edit IQ Insight"
                  : chainFrom?._id
                    ? "Update IQ Insight"
                    : "Create IQ Insight"}
              </DialogTitle>
              {chainFrom?._id && !selectedRow?._id && (
                <p className="text-xs text-gray-500 mt-1">
                  This creates a new insight chained to “{chainFrom.title}”.
                </p>
              )}
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
                      className={`form-control input input-md w-full ${formik.errors.title && formik.touched.title
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

                <div className="col-span-12">
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


                {/* TradingView Links */}
                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      TradingView Links
                    </label>
                    <DraggableLinkList
                      links={formik.values.tradingViewLinks || [""]}
                      onReorder={handleReorderLinks}
                      onChange={handleLinkChange}
                      onRemove={handleRemoveLink}
                      onAdd={handleAddLink}
                    />
                  </div>
                </div>

                {/* DynTube Video URL */}
                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      DynTube Video URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://videos.dyntube.com/iframes/..."
                        className="form-control input input-md w-full"
                        value={formik.values.dyntubeUrl}
                        onChange={(e) => formik.setFieldValue('dyntubeUrl', e.target.value)}
                      />
                      {formik.values.dyntubeUrl && (
                        <button
                          type="button"
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                          onClick={() => formik.setFieldValue('dyntubeUrl', '')}
                          title="Remove DynTube URL"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {formik.values.dyntubeUrl && !isDyntubeUrl(formik.values.dyntubeUrl.trim()) && formik.values.dyntubeUrl.trim() && (
                      <span className="text-danger text-xs mt-1">
                        Please enter a valid DynTube URL (e.g. https://videos.dyntube.com/iframes/...)
                      </span>
                    )}
                    {/* DynTube Preview */}
                    {formik.values.dyntubeUrl && isDyntubeUrl(formik.values.dyntubeUrl.trim()) && (
                      <div className="relative w-full rounded-lg overflow-hidden bg-black mt-2" style={{ aspectRatio: '16/9' }}>
                        <iframe
                          src={getEmbedUrl(formik.values.dyntubeUrl.trim())}
                          className="w-full h-full"
                          loading="lazy"
                          tabIndex={-1}
                          scrolling="no"
                          style={{ pointerEvents: 'none', border: 'none', overflow: 'hidden' }}
                          title="DynTube Video Preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRow?._id && (
                  <div className="col-span-12">
                    <div className="flex items-center gap-2 h-full ">
                      <Checkbox
                        id="checkTime"
                        checked={formik.values.checkTime}
                        onCheckedChange={(checked) =>
                          formik.setFieldValue("checkTime", checked)
                        }
                      />
                      <label
                        htmlFor="checkTime"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Do Not Update TimeStamp
                      </label>
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

                    {/* Show preview with drag-and-drop reorder */}
                    <DraggableImageList
                      files={formik.values.files}
                      onReorder={handleReorderImages}
                      onRemove={handleRemoveImage}
                    />
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
                  setSelectedRow(null);
                  setChainFrom?.(null);
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
      </DndProvider>
    );
  }
);

export default CreateTradeAnalysis;
