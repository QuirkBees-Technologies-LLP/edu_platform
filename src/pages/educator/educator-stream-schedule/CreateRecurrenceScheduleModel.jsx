import React, { useEffect, useState, forwardRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment from "moment-timezone";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageInput } from "@/components/image-input";
import TagInput from "@/components/ui/tagInput";
import RichTextEditor from "@/components/ui/rich-editor";
import DateTimePicker from "./DateTimePicker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuthContext } from "../../../auth/useAuthContext";
import {
  useGetEducatorAcademyCategoryQuery,
  useGetLanguageListQuery,
} from "../../../store/api/educator/educatorAcademyCategoryApiSlice";
import {
  useCreateRecurrenceScheduleMutation,
  useUpdateRecurrenceScheduleMutation,
} from "../../../store/api/educator/educatorStreamScheduleApiSlice";
const EST_ZONE = "America/New_York";

const CreateRecurrenceScheduleModel = forwardRef(
  (
    { isOpen, handleCloseCreate, refetch, selectedRow, setSelectedRow },
    ref
  ) => {
    const { auth } = useAuthContext();
    const educatorId = auth?.user?._id ?? null;

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

    const { data: categoryList } = useGetEducatorAcademyCategoryQuery();
    const { data: languagesList } = useGetLanguageListQuery();

    const [createRecurrenceSchedule] = useCreateRecurrenceScheduleMutation();
    const [updateRecurrenceSchedule] = useUpdateRecurrenceScheduleMutation();

    const initialValues = {
      title: "",
      description: "",
      datetime: "",
      tags: [],
      category: "",
      language: "",
      recurrenceRule: {
        frequency: "NONE",
        interval: 1,
        byWeekday: [],
        endType: "OCCURRENCES",
        occurrences: 10,
        endDateTime: null,
        hasEndLimit: true,
      },
    };

    const createSchema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      datetime: Yup.date()
        .required("Start date is required")
        .min(new Date(), "Start date must be in the future"),
      category: Yup.string().required("Category is required"),
      language: Yup.string().required("Language is required"),
      tags: Yup.array().min(1, "At least one tag is required"),
      recurrenceRule: Yup.object().shape({
        frequency: Yup.string().required(),
        interval: Yup.number()
          .typeError("Interval must be a number")
          .min(1, "Interval must be >=1")
          .required("Interval is required"),
        hasEndLimit: Yup.boolean(),
        byWeekday: Yup.array().when("frequency", {
          is: "WEEKLY",
          then: (schema) => schema.min(1, "Select at least one day"),
        }),
        endType: Yup.string().oneOf(["OCCURRENCES", "DATE"]),
        occurrences: Yup.number().when("endType", {
          is: "OCCURRENCES",
          then: (schema) => schema.min(1, "Must be at least 1"),
        }),
        endDateTime: Yup.date()
          .nullable()
          .when("endType", {
            is: "DATE",
            then: (schema) =>
              schema
                .required("End date is required")
                .test(
                  "is-after-start",
                  "End date must be after start",
                  function (value) {
                    const { datetime } = this.options.context || {};
                    return (
                      !value ||
                      !datetime ||
                      new Date(value) > new Date(datetime)
                    );
                  }
                ),
            otherwise: (schema) => schema.nullable(),
          }),
      }),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validationSchema: createSchema,
      validateOnMount: true,
      context: {
        datetime: initialValues.datetime,
      },
      onSubmit: async (values) => {
        try {
          const { recurrenceRule } = values;

          let frequency = recurrenceRule.frequency;
          let interval = recurrenceRule.interval || 1;
          let byWeekday = recurrenceRule.byWeekday || [];

          let endType = recurrenceRule.endType;
          let occurrences = recurrenceRule.occurrences || 10;
          let endDateTime = recurrenceRule.endDateTime;

          if (frequency === "NONE") {
            endType = "OCCURRENCES";
            occurrences = 1;
          } else if (recurrenceRule.hasEndLimit) {
            if (endType === "DATE" && !!endDateTime) {
              occurrences = null;
            }
            if (endType === "OCCURRENCES" && !!occurrences) {
              endDateTime = null;
            }
          } else {
            endType = null;
            occurrences = null;
            endDateTime = null;
          }

          const formData = new FormData();

          formData.append("title", values.title);
          formData.append("description", values.description);
          formData.append("datetime", values.datetime);
          formData.append("category", values.category);
          formData.append("language", values.language);
          formData.append("educator", educatorId);

          values.tags.forEach((tag) => {
            formData.append("tags[]", tag);
          });

          formData.append("recurrenceRule[frequency]", frequency);
          formData.append("recurrenceRule[interval]", interval);

          if (frequency === "WEEKLY") {
            byWeekday.forEach((day) =>
              formData.append("recurrenceRule[byWeekday][]", day)
            );
          }

          formData.append(
            "recurrenceRule[hasEndLimit]",
            recurrenceRule.hasEndLimit
          );

          if (endType) {
            formData.append("recurrenceRule[endType]", endType);
          }
          if (occurrences) {
            formData.append("recurrenceRule[occurrences]", occurrences);
          }
          if (endDateTime) {
            formData.append("recurrenceRule[endDateTime]", endDateTime);
          }

          if (selectedRow?._id) {
            formData.append("id", selectedRow._id);
            await updateRecurrenceSchedule({
              id: selectedRow._id,
              data: formData,
            }).unwrap();
            toast.success("Schedule updated successfully!");
          } else {
            await createRecurrenceSchedule(formData).unwrap();
            toast.success("Schedule created successfully!");
          }

          refetch();
          formik.resetForm();
          setSelectedRow(null);
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
      if (selectedRow?._id) {
        const initData = {
          title: selectedRow?.title,
          description: selectedRow?.description,
          datetime: selectedRow?.datetime
            ? new Date(selectedRow?.datetime)
            : null,
          tags: selectedRow?.tags || [],
          category: selectedRow?.category?._id,
          language: selectedRow?.language,
          recurrenceRule: {
            frequency: selectedRow?.recurrenceRuleId?.frequency || "NONE",
            interval: selectedRow?.recurrenceRuleId?.interval || 1,
            byWeekday: selectedRow?.recurrenceRuleId?.byWeekday || [],
            hasEndLimit: !!(
              selectedRow?.recurrenceRuleId?.occurrences ||
              selectedRow?.recurrenceRuleId?.endDateTime
            ),
            endType: selectedRow?.recurrenceRuleId?.endType
              ? "OCCURRENCES"
              : "DATE",
            occurrences: selectedRow?.recurrenceRuleId?.occurrences || 10,
            endDateTime: selectedRow?.recurrenceRuleId?.endDateTime
              ? new Date(selectedRow?.recurrenceRuleId?.endDateTime)
              : null,
          },
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isOpen]);
    useEffect(() => {
      if (!selectedRow) {
        formik.resetForm();
      }
    }, [selectedRow]);
    return (
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          formik.resetForm();
          setSelectedRow({});
          handleCloseCreate();
        }}
      >
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[500px]" ref={ref}>
          <DialogHeader className="pb-5 pt-0 px-0">
            <DialogTitle>
              {selectedRow?._id
                ? "Update Recurring Schedule"
                : "Create Recurring Schedule"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 px-0 py-5 ">
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
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    From this date onwards it will be schedule
                    <span className="text-danger">*</span>
                  </label>
                  <div className="custom_datepicket">
                    <DateTimePicker
                      isPickerOpen={isPickerOpen}
                      setIsPickerOpen={setIsPickerOpen}
                      value={formik.values.datetime}
                      onChange={(date) =>
                        formik.setFieldValue("datetime", date)
                      }
                      className={
                        formik.errors.datetime && formik.touched.datetime
                          ? "border border-danger"
                          : ""
                      }
                    />
                  </div>
                  {formik.touched.datetime && formik.errors.datetime && (
                    <span className="text-danger text-xs">
                      {formik.errors.datetime}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12">
                <div className="flex flex-col w-full gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Language <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={formik.values.language}
                    onValueChange={(value) =>
                      formik.setFieldValue("language", value)
                    }
                    className={`form-control input input-md w-full ${formik.errors.language ? "border border-danger" : ""}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(languagesList?.data) &&
                      languagesList.data.length > 0 ? (
                        languagesList.data.map((item) => (
                          <SelectItem key={item._id} value={item.name}>
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
                  {formik.touched.language && formik.errors.language && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.language}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12">
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Category<span className="text-danger">*</span>
                    </label>
                    <Select
                      value={formik.values.category}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                      className={`form-control input input-md w-full ${
                        formik.errors.category && formik.touched.category
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

                    {formik.touched.category && formik.errors.category && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.category}
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
                    value={formik.values.tags}
                    onChange={(tags) => formik.setFieldValue("tags", tags)}
                    placeholder="Add tags..."
                    className={`form-control input input-md w-full ${
                      formik.errors.tags && formik.touched.tags
                        ? "border border-danger"
                        : ""
                    }`}
                  />
                  {formik.touched.tags && formik.errors.tags && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.tags}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12">
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Recurrence Pattern
                    </label>
                    <Select
                      value={formik.values.recurrenceRule?.frequency}
                      onValueChange={(v) =>
                        formik.setFieldValue("recurrenceRule.frequency", v)
                      }
                      className={`form-control input input-md w-full ${
                        formik.errors.recurrenceRule?.frequency &&
                        formik.touched.recurrenceRule?.frequency
                          ? "border border-danger"
                          : ""
                      }`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">One Time Only</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.touched.recurrenceRule?.frequency &&
                      formik.errors.recurrenceRule?.frequency && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.recurrenceRule.frequency}
                        </span>
                      )}
                  </div>
                </div>
              </div>
              {formik.values.recurrenceRule?.frequency &&
                formik.values.recurrenceRule?.frequency !== "NONE" && (
                  <div className="col-span-12 bg-gray-100 p-4 rounded-md  border border-gray-200 dark:border-gray-200">
                    {formik.values.recurrenceRule?.frequency === "DAILY" && (
                      <div className="col-span-12">
                        <div className="col-span-6">
                          <div className="flex flex-col gap-1">
                            <label className="form-label text-gray-900 gap-1">
                              Repeat Every
                            </label>
                            <Select
                              type="number"
                              minValue={1}
                              value={formik.values.recurrenceRule?.interval}
                              onValueChange={(v) =>
                                formik.setFieldValue(
                                  "recurrenceRule.interval",
                                  Number(v)
                                )
                              }
                              className={`form-control input input-md w-full ${
                                formik.errors.recurrenceRule?.interval &&
                                formik.touched.recurrenceRule?.interval
                                  ? "border border-danger"
                                  : ""
                              }`}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={1}>1 Day</SelectItem>
                                <SelectItem value={2}>2 Days</SelectItem>
                                <SelectItem value={3}>3 Days</SelectItem>
                                <SelectItem value={4}>4 Days</SelectItem>
                                <SelectItem value={5}>5 Days</SelectItem>
                              </SelectContent>
                            </Select>
                            {/* {formik.touched.recurrenceRule?.interval &&
                              formik.errors.recurrenceRule?.interval && (
                                <span
                                  role="alert"
                                  className="text-danger text-xs mt-1"
                                >
                                  {formik.errors.recurrenceRule.interval}
                                </span>
                              )} */}
                          </div>
                        </div>
                      </div>
                    )}

                    {formik.values.recurrenceRule?.frequency === "WEEKLY" && (
                      <div className="col-span-12 ">
                        <div className="col-span-12">
                          <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                              <label className="form-label text-gray-900 gap-1">
                                Repeat Every
                              </label>
                              <Select
                                type="number"
                                minValue={1}
                                value={formik.values.recurrenceRule?.interval}
                                onValueChange={(v) =>
                                  formik.setFieldValue(
                                    "recurrenceRule.interval",
                                    Number(v)
                                  )
                                }
                                className={`form-control input input-md w-full ${
                                  formik.errors.recurrenceRule?.interval &&
                                  formik.touched.recurrenceRule?.interval
                                    ? "border border-danger"
                                    : ""
                                }`}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={1}>1 Week</SelectItem>
                                  <SelectItem value={2}>2 Weeks</SelectItem>
                                  <SelectItem value={3}>3 Weeks</SelectItem>
                                  <SelectItem value={4}>4 Weeks</SelectItem>
                                  <SelectItem value={5}>5 Weeks</SelectItem>
                                </SelectContent>
                              </Select>
                              {/* {formik.touched.recurrenceRule?.interval &&
                                formik.errors.recurrenceRule?.interval && (
                                  <span
                                    role="alert"
                                    className="text-danger text-xs mt-1"
                                  >
                                    {formik.errors.recurrenceRule.interval}
                                  </span>
                                )} */}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-12 mt-4">
                          <div className="flex flex-col gap-3">
                            <label className="form-label text-gray-900">
                              Repeat on
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {[
                                { key: "SU", label: "Sun" },
                                { key: "MO", label: "Mon" },
                                { key: "TU", label: "Tue" },
                                { key: "WE", label: "Wed" },
                                { key: "TH", label: "Thu" },
                                { key: "FR", label: "Fri" },
                                { key: "SA", label: "Sat" },
                              ].map((day) => {
                                const isSelected =
                                  formik.values.recurrenceRule?.byWeekday?.includes(
                                    day.key
                                  );
                                return (
                                  <button
                                    key={day.key}
                                    type="button"
                                    onClick={() => {
                                      const currentDays =
                                        formik.values.recurrenceRule
                                          ?.byWeekday || [];
                                      const newDays = isSelected
                                        ? currentDays.filter(
                                            (d) => d !== day.key
                                          )
                                        : [...currentDays, day.key];
                                      formik.setFieldValue(
                                        "recurrenceRule.byWeekday",
                                        newDays
                                      );
                                    }}
                                    className={`px-2 py-1 rounded text-sm font-medium transition-colors duration-200 min-w-[30px] ${
                                      isSelected
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                    }`}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                            {formik.touched.recurrenceRule?.byWeekday &&
                              formik.errors.recurrenceRule?.byWeekday && (
                                <span
                                  role="alert"
                                  className="text-danger text-xs mt-1"
                                >
                                  {formik.errors.recurrenceRule.byWeekday}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              {["DAILY", "WEEKLY"].includes(
                formik.values.recurrenceRule?.frequency
              ) && (
                <div className="col-span-12 bg-gray-100 p-4 rounded-md border border-gray-200 dark:border-gray-200 mt-1">
                  {/* END LIMIT SECTION */}
                  <div className="col-span-12 mt-1">
                    <label className="flex items-center gap-2 text-gray-900 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={
                          formik.values.recurrenceRule?.hasEndLimit || false
                        }
                        onChange={(e) =>
                          formik.setFieldValue(
                            "recurrenceRule.hasEndLimit",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                      Set end limit (otherwise continues for 2 months)
                    </label>

                    {formik.values.recurrenceRule?.hasEndLimit && (
                      <div className="mt-4 flex flex-col gap-3">
                        <label className="form-label text-gray-900">
                          End After
                        </label>

                        {/* Dropdown */}
                        <Select
                          value={
                            formik.values.recurrenceRule?.endType ||
                            "OCCURRENCES"
                          }
                          onValueChange={(v) =>
                            formik.setFieldValue("recurrenceRule.endType", v)
                          }
                          className="form-control input input-md w-[200px]"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OCCURRENCES">
                              Number of occurrences
                            </SelectItem>
                            <SelectItem value="DATE">End date</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* {formik.touched.recurrenceRule?.endType &&
                          formik.errors.recurrenceRule?.endType && (
                            <span
                              role="alert"
                              className="text-danger text-xs mt-1"
                            >
                              {formik.errors.recurrenceRule.endType}
                            </span>
                          )} */}

                        {/* Input box by default visible when OCCURRENCES is selected */}
                        {(!formik.values.recurrenceRule?.endType ||
                          formik.values.recurrenceRule?.endType ===
                            "OCCURRENCES") && (
                          <input
                            type="number"
                            min={1}
                            placeholder="Occurrence"
                            value={
                              formik.values.recurrenceRule?.occurrences || ""
                            }
                            onChange={(e) =>
                              formik.setFieldValue(
                                "recurrenceRule.occurrences",
                                e.target.value
                              )
                            }
                            className="form-control input input-md w-full"
                          />
                        )}
                        {formik.touched.recurrenceRule?.occurrences &&
                          formik.errors.recurrenceRule?.occurrences && (
                            <span
                              role="alert"
                              className="text-danger text-xs mt-1"
                            >
                              {formik.errors.recurrenceRule.occurrences}
                            </span>
                          )}

                        {/* Date picker only if DATE selected */}
                        {formik.values.recurrenceRule?.endType === "DATE" && (
                          <DateTimePicker
                            isPickerOpen={isEndDatePickerOpen}
                            setIsPickerOpen={setIsEndDatePickerOpen}
                            value={formik.values.recurrenceRule?.endDateTime}
                            onChange={(date) =>
                              formik.setFieldValue(
                                "recurrenceRule.endDateTime",
                                date
                              )
                            }
                            className="form-control input input-md w-full"
                          />
                        )}
                        {formik.touched.recurrenceRule?.endDateTime &&
                          formik.errors.recurrenceRule?.endDateTime && (
                            <span
                              role="alert"
                              className="text-danger text-xs mt-1"
                            >
                              {formik.errors.recurrenceRule.endDateTime}
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex border-gray-200 border-t justify-end pt-5 rounded-b dark:border-gray-200 gap-3">
            <button
              className="btn btn-light"
              onClick={() => {
                formik.resetForm({
                  values: {
                    ...formik.values,
                    recurrenceRule: {
                      ...formik.values.recurrenceRule,
                      hasEndLimit: false,
                    },
                  },
                });
                setSelectedRow(null);
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
    );
  }
);

export default CreateRecurrenceScheduleModel;
