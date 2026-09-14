import React, { forwardRef, useEffect, useState, useCallback, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableImageList from "@/components/ui/DraggableImageList";
import DraggableLinkList from "@/components/ui/DraggableLinkList";
import DraggableMediaOrder from "@/components/ui/DraggableMediaOrder";
import { ImageIcon, Link2 } from "lucide-react";
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
import RichTextEditor from "../../../components/ui/rich-editor";
import {
  useCreateEducatorTradeIdeasMutation,
  useUpdateEducatorTradeIdeaMutation,
} from "../../../store/api/educator/educatorTradeIdeasApiSlice";
import { useGetCommonCategoryQuery } from "../../../store/api/client/clientEductorApiSlice";

const CreateTradeIdeas = forwardRef(
  (
    {
      setSelectedRow,
      isCreateOpen,
      handleCloseCreate,
      selectedRow,
      refetch,
      onSubmitSuccess,
      // "Update" (chain) action: the source idea to link the new one back to via
      // previousIdea, forming a thread — see EducatorTradeIdeas.jsx's ActionMenu. Always
      // creates a brand-new document, never an in-place edit.
      chainFrom,
      setChainFrom,
    },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createEducatorTradeIdeas] = useCreateEducatorTradeIdeasMutation();
    const [updateEducatorTradeIdea] = useUpdateEducatorTradeIdeaMutation();

    const educatorId = auth?.user?._id ?? null;
    const { data } = useGetCommonCategoryQuery();
    // Pure chain-create: no existing record yet, a brand-new document is POSTed with
    // previousIdea pointing at chainFrom. Never true while editing an existing record.
    const isChainMode = !selectedRow?._id && !!chainFrom?._id;
    // Editing an EXISTING follow-up in place (opened from the thread modal's pencil
    // icon on a non-root item): both an id to PUT to AND a predecessor to show as the
    // read-only reference strip. Distinct from plain Edit (selectedRow set, chainFrom
    // null — used only for the original/root record).
    const isFollowUpEdit = !!selectedRow?._id && !!chainFrom?._id;
    // Drives every UI/validation gate that should behave the same whether we're
    // creating a new follow-up or editing an existing one — only actual submission
    // (create vs update, and whether previousIdea is sent) still branches on the two
    // flags separately below.
    const isFollowUpForm = isChainMode || isFollowUpEdit;

    const initialValues = {
      name: "",
      files: [],
      type: "",
      timeFrame: "",
      educatorId: "",
      status: "",
      entry: "",
      invalidation: "",
      exits: [""],
      description: "",
      category: "",
      pips: 0,
      tradingViewLinks: [""],
      // Educator-chosen display order between images and TradingView charts (Task 14) —
      // whichever group is first here is what students see first. Ideas have no video
      // field, so only these two groups apply.
      mediaOrder: ["image", "tradingview"],
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
      files: Yup.array().test(
        'files-or-links',
        'At least one screenshot or TradingView link is required',
        function (files) {
          const tvLinks = this.parent.tradingViewLinks;
          const hasLinks = tvLinks && tvLinks.filter(l => l && l.trim()).length > 0;
          const hasFiles = files && files.length > 0;
          return hasLinks || hasFiles;
        }
      ),
      type: Yup.string().oneOf(["buy", "sell"]).required("Type is required"),
      status: Yup.string()
        .oneOf(["active", "pending", "win", "partialWin", "loss", "breakEven"])
        .required("Status is required"),
      timeFrame: Yup.string().required("Type is required"),
      educatorId: Yup.string().required("Educator ID is required"),
      // Entry is only ever shown/editable outside a follow-up form (create-chain or
      // edit-follow-up) — there it's seeded from the reference record and never
      // touched again, so it's not required there.
      entry: !isFollowUpForm
        ? Yup.number().required("Entry is required").positive("Entry must be a positive number")
        : Yup.number().notRequired(),
      // Required outside a follow-up form (unchanged); optional there — the educator
      // may have nothing to add beyond the reference fields/status being reported.
      description: !isFollowUpForm
        ? Yup.string().required("Description is required")
        : Yup.string().notRequired(),
      // Outside a follow-up form both are always shown (unchanged behavior). In a
      // follow-up form, only the field matching the outcome being reported is
      // shown/required — Invalidation for a Loss/Break Even, Exits for a Win/Partial Win.
      invalidation: Yup.number()
        .typeError("Invalidation must be a number")
        .when("status", {
          is: (status) => !isFollowUpForm || ["loss", "breakEven"].includes(status),
          then: (schema) => schema.required("Invalidation is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      exits: Yup.array()
        .of(
          Yup.number()
            .typeError("Exit must be a number")
            .required("Exit is required")
            .positive("Exit must be a positive number")
        )
        .when("status", {
          is: (status) => !isFollowUpForm || ["win", "partialWin"].includes(status),
          then: (schema) => schema.min(1, "At least one exit is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      category: Yup.string().required("Category is required"),
      pips: Yup.number()
        .typeError("Pips must be a number")
        .when("status", {
          is: (status) =>
            (isFollowUpForm
              ? ["win", "loss", "partialWin", "breakEven"]
              : ["win", "loss", "partialWin"]
            ).includes(status),
          then: (schema) =>
            schema
              .required("Pips is required")
              .notOneOf([0], "Pips cannot be zero"),
          otherwise: (schema) => schema.notRequired().default(0),
        }),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
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
        formData.append("pips", values.pips ?? 0);
        formData.append("timeFrame[]", [values.timeFrame]);
        formData.append("educatorId", values.educatorId);
        formData.append("status", values.status);
        formData.append("entry", values.entry);
        formData.append("invalidation", values.invalidation);
        formData.append("description", values.description);
        formData.append("category", values.category);
        exitsValues.forEach((exit) => formData.append("exits[]", exit));

        // Append TradingView links (always send, even empty, so backend can clear old links)
        const tvLinks = (values.tradingViewLinks || []).filter(l => l && l.trim());
        formData.append("tradingViewLinks", JSON.stringify(tvLinks));

        // Educator-chosen display order between the media groups (Task 14).
        formData.append("mediaOrder", JSON.stringify(values.mediaOrder || ["image", "tradingview"]));

        // Send existing image URLs the user kept (so backend knows which to preserve) —
        // both for editing in place, and for a chain-create where images were pre-loaded
        // from the source idea and the educator may have pruned some.
        if (selectedRow?._id || isChainMode) {
          const keptImages = (values.files || [])
            .filter((f) => !f?.file?.file && f?.dataURL)
            .map((f) => f.dataURL);
          formData.append("existingImages", JSON.stringify(keptImages));
        }

        if (selectedRow?._id) {
          formData.append("id", selectedRow?._id);
        }

        if (isChainMode) {
          formData.append("previousIdea", chainFrom._id);
        }

        try {
          if (selectedRow?._id) {
            await updateEducatorTradeIdea(formData).unwrap();

            toast.success(isFollowUpEdit ? "Follow-up updated successfully!" : "Idea updated successfully!");
          } else {
            await createEducatorTradeIdeas(formData).unwrap();

            toast.success(isChainMode ? "Update published successfully!" : "Idea created successfully!");
          }
          const wasUpdate = !!selectedRow?._id;
          formik.resetForm();
          setSelectedRow(null);
          setChainFrom?.(null);
          refetch();
          handleCloseCreate();
          // Share-to-social prompt only makes sense when updating an existing idea, not
          // when creating a brand new one (chained or plain).
          // Never for a chain-create or a follow-up edit — sharing only makes sense for
          // the original idea itself, not a follow-up in its thread.
          if (wasUpdate && !isFollowUpEdit && onSubmitSuccess) onSubmitSuccess();
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

    // Which kind of session last filled the form. Closing the dialog keeps its values
    // (so a half-written new idea survives), but anything loaded by Edit / Follow-Up
    // must never leak into a plain Create — wipe back to blank when opened for Create.
    const filledByRef = useRef("create");
    useEffect(() => {
      if (!isCreateOpen) return;
      if (selectedRow?._id || chainFrom?._id) {
        filledByRef.current = "existing";
      } else if (filledByRef.current !== "create") {
        formik.resetForm({ values: { ...initialValues, educatorId: educatorId || "" } });
        filledByRef.current = "create";
      }
    }, [isCreateOpen, selectedRow?._id, chainFrom?._id]);

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
          timeFrame: selectedRow?.timeFrame[0],
          status: selectedRow?.status,
          category: selectedRow?.category?._id,
          entry: selectedRow?.entry,
          invalidation: selectedRow?.invalidation,
          description: selectedRow?.description,
          exits: selectedRow?.exits,
          pips: selectedRow?.pips,
          tradingViewLinks: selectedRow?.tradingViewLinks?.length > 0 ? selectedRow.tradingViewLinks : [""],
          mediaOrder: selectedRow?.mediaOrder?.length > 0 ? selectedRow.mediaOrder : ["image", "tradingview"],
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    // "Update" (chain) action: reference fields (symbol/direction/type/entry/invalidation/
    // exits/category) are copied from the source idea — they're rendered read-only below,
    // not editable, since this is reporting an outcome on the same trade setup, not a new
    // one. Images ARE pre-loaded (unlike Insights' chain form, which starts blank) so the
    // educator can keep "before" images alongside new "after" ones, per Task 11. Status/
    // pips/description start fresh — this is a new outcome being reported.
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
          timeFrame: Array.isArray(chainFrom?.timeFrame)
            ? chainFrom.timeFrame[0]
            : chainFrom?.timeFrame || "",
          status: chainFrom?.status || "active",
          category: chainFrom?.category?._id || "",
          entry: chainFrom?.entry || "",
          invalidation: chainFrom?.invalidation || "",
          description: "",
          exits: chainFrom?.exits?.length > 0 ? chainFrom.exits : [""],
          pips: 0,
          educatorId: chainFrom?.educatorDetails?._id || educatorId,
          tradingViewLinks:
            chainFrom?.tradingViewLinks?.length > 0 ? chainFrom.tradingViewLinks : [""],
          mediaOrder: chainFrom?.mediaOrder?.length > 0 ? chainFrom.mediaOrder : ["image", "tradingview"],
        });
      }
    }, [chainFrom?._id, selectedRow?._id, isCreateOpen]);

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
      const [removed] = newFiles.splice(index, 1);
      formik.setFieldValue("files", newFiles);

      // Removing an auto-generated TradingView chart image (tv-chart-images container)
      // should also drop its source link — otherwise the next save regenerates the
      // very image the user just removed. Snapshot images are appended in the same
      // order as their (non-empty) source links, so the Nth TV image maps to the
      // Nth non-empty link.
      if (removed?.dataURL?.includes("tv-chart-images")) {
        const tvImageIndex = newFiles
          .slice(0, index)
          .filter((f) => f?.dataURL?.includes("tv-chart-images")).length;
        const links = [...(formik.values.tradingViewLinks || [])];
        const nonEmptyLinkIndexes = links
          .map((link, i) => (link && link.trim() ? i : -1))
          .filter((i) => i !== -1);
        const linkIndexToRemove = nonEmptyLinkIndexes[tvImageIndex];
        if (linkIndexToRemove !== undefined) {
          links.splice(linkIndexToRemove, 1);
          formik.setFieldValue("tradingViewLinks", links.length > 0 ? links : [""]);
        }
      }
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

    return (
      <DndProvider backend={HTML5Backend}>
        <Dialog
          open={isCreateOpen}
          // Closing the dialog (outside click, Escape, the X button) must NOT clear the
          // form — only the explicit Cancel button does that. selectedRow is still reset
          // here since it tracks edit-vs-create mode, not the form's field values.
          onOpenChange={() => {
            setSelectedRow({});
            setChainFrom?.(null);
            handleCloseCreate();
          }}
        >
          {formik.status && <Alert variant="danger">{formik.status}</Alert>}
          <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
            <DialogHeader>
              <DialogTitle>
                {isFollowUpEdit
                  ? "Edit Follow-Up"
                  : selectedRow?._id
                    ? "Edit IQ Idea"
                    : isChainMode
                      ? "Update IQ Idea"
                      : "Create IQ Idea"}
              </DialogTitle>
              {isChainMode && (
                <p className="text-xs text-gray-500 mt-1">
                  This publishes a follow-up idea chained to "{chainFrom?.name}".
                </p>
              )}
              {isFollowUpEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Editing this follow-up in the thread for "{chainFrom?.name}".
                </p>
              )}
            </DialogHeader>
            <div className="grid gap-5 px-0 py-5">
              <div className="grid grid-cols-12 gap-4">
                {isFollowUpForm && (
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
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Entry</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{chainFrom?.entry ?? "—"}</span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Invalidation</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{chainFrom?.invalidation ?? "—"}</span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Exits</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{chainFrom?.exits?.join(", ") || "—"}</span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Category</span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{chainFrom?.category?.name || "—"}</span>
                      </span>
                      {!!chainFrom?.pips && (
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Pips</span>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{chainFrom.pips}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {!isFollowUpForm && (
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
                {!isFollowUpForm && (
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

                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Description{!isFollowUpForm && <span className="text-danger">*</span>}
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

                {!isFollowUpForm && (
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
                        {!isFollowUpForm && <SelectItem value="pending">Pending</SelectItem>}
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

                {!isFollowUpForm && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Entry <span className="text-danger">*</span>
                    </label>
                    <input
                      {...formik.getFieldProps("entry")}
                      type="number"
                      placeholder="Enter entry"
                      autoComplete="off"
                      className={`form-control input input-md w-full ${formik.errors.entry && formik.touched.entry
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
                )}
                {(!isFollowUpForm || ["loss", "breakEven"].includes(formik.values.status)) && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Invalidation <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter invalidation"
                      autoComplete="off"
                      {...formik.getFieldProps("invalidation")}
                      className={`form-control input input-md w-full ${formik.errors.invalidation &&
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
                )}
                {(!isFollowUpForm || ["win", "partialWin"].includes(formik.values.status)) && (
                <div className="col-span-12 md:col-span-6">
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
                            className={`form-control input input-md w-full ${formik.errors.exits?.[index] &&
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
                )}
                {!isFollowUpForm && (
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

                {(isFollowUpForm
                  ? ["win", "loss", "partialWin", "breakEven"]
                  : ["win", "loss", "partialWin"]
                ).includes(formik.values.status) && (
                    <div className="col-span-12 md:col-span-6">
                      <div className="flex flex-col gap-1">
                        <label className="form-label text-gray-900 gap-1">
                          Pips <span className="text-danger">*</span>
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

                {/* Display order (Task 14): which media type students see first */}
                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-slate-800 dark:text-slate-100 gap-1">
                      Display Order
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Drag to choose which media students see first.
                    </p>
                    <DraggableMediaOrder
                      order={formik.values.mediaOrder || ["image", "tradingview"]}
                      onChange={(next) => formik.setFieldValue("mediaOrder", next)}
                      labels={{
                        image: { label: "Image", icon: <ImageIcon size={14} className="text-gray-400" /> },
                        tradingview: { label: "TradingView Chart", icon: <Link2 size={14} className="text-gray-400" /> },
                      }}
                    />
                  </div>
                </div>

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

export default CreateTradeIdeas;
