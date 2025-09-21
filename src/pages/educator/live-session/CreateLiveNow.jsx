import React, { useEffect, useState, forwardRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

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


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuthContext } from "../../../auth/useAuthContext";

import {useCreateLiveStreamMutation} from "../../../store/api/educator/educatorStreamScheduleApiSlice";
import { useGetLanguageListQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";
const EST_ZONE = "America/New_York";

const CreateLiveStream = forwardRef(
  (
    { isOpen, handleCloseCreate, refetch, selectedRow, setSelectedRow },
    ref
  ) => {
    const { auth } = useAuthContext();
    const educatorId = auth?.user?._id ?? null;
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

    // const [time, setTime] = useState({
    //   date: moment().tz(EST_ZONE).format("dddd, MMMM D, YYYY"),
    //   clock: moment().tz(EST_ZONE).format("hh:mm:ss A"),
    // });

    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     setTime({
    //       date: moment().tz(EST_ZONE).format("dddd, MMMM D, YYYY"),
    //       clock: moment().tz(EST_ZONE).format("hh:mm:ss A"),
    //     });
    //   }, 1000);
    //   return () => clearInterval(interval);
    // }, []);

    const { data } = useGetEducatorAcademyCategoryQuery();
    const { data: languagesList } = useGetLanguageListQuery();
    const [createLiveStream , { isLoading }] = useCreateLiveStreamMutation();

    // const handleImageChange = (updatedImages) => {
    //   formik.setFieldValue("files", updatedImages);
    // };

    const initialValues = {
      title: "",
      description: "",
      tags: [],
      category: "",
    //   datetime: "",
    //   files: null,
    //   userId: "",
    //   streamType: "",
      language: "",
    //   recurrenceRule: {
    //     frequency: "",
    //     endDateTime: "",
    //     byDay: [],
    //   },

      // files: ""
    };

    const createSchema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      category: Yup.string().required("Category is required"),
      //   streamType: Yup.string().required("Stream Type is required"),
      tags: Yup.array()
      .min(1, "At least one tag is required")
      .of(Yup.string().required("Tag cannot be empty")),
    //   recurrenceRule: Yup.object().shape({
    //       frequency: Yup.string().required("Frequency is required"),
    //       endDateTime: Yup.date()
    //       .required("End date & time is required")
    //       .typeError("Invalid end date & time format")
    //       .min(
    //           Yup.ref("$datetime"),
    //           "End date & time must be after start date & time"
    //         ),
    //         byDay: Yup.array()
    //         .min(1, "At least one day is required")
    //         .of(Yup.string().required("Day cannot be empty")),
    //     }),
    //     datetime: Yup.date()
    //       .required("Date & time is required")
    //       .typeError("Invalid date & time format")
    //       .min(new Date(), "Start date & time can't be in the past"),
    //     files: Yup.array()
    //     .required("Thumbnail is required")
    //     .min(1, "Thumbnail is required")
    //     .test("fileOrUrl", "Thumbnail is required", (value) => {
    //       if (!value || value.length === 0) return false;
    //       const file = value[0]?.file;
    //       const dataURL = value[0]?.dataURL;
    //       return !!file || !!dataURL; // allow either new file or existing URL
    //     })
    //     .test("fileType", "Unsupported file type", (value) => {
    //       const file = value?.[0]?.file;
    //       if (!file) return true; // skip type check if no new file
    //       const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    //       return allowedTypes.includes(file.type);
    //     })
    //     .test("fileSize", "File size too large (max 2MB)", (value) => {
    //       const file = value?.[0]?.file;
    //       if (!file) return true; // skip size check if no new file
    //       const maxSize = 2 * 1024 * 1024;
    //       return file.size <= maxSize;
    //     }),
       language: Yup.string().required("Language is required"),
    });
 

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
       context: { datetime: initialValues.datetime },
      onSubmit: async (values) => {
        try {
        //   if (!values.datetime) {
        //     toast.error("Please select a valid start date & time");
        //     return;
        //   }

          const payload = {
            title: values.title,
            description: values.description,
            category: values.category, // category _id
            tags: values.tags,
             language: values.language,
            // educator: educatorId, // logged-in educator _id
            // time: moment(values.datetime).format("HH:mm"), // time only
            // datetime: moment(values.datetime).toISOString(),
            // endDate: values.recurrenceRule.endDateTime
            //   ? moment(values.recurrenceRule.endDateTime).toISOString()
            //   : null,
            // freq: values.recurrenceRule.frequency || "WEEKLY",
            // byDay: values.recurrenceRule.byDay || [], 
            
            // files: values.files,
            // streamType: values.streamType,
          };
        //    const formData = new FormData();
        // // formData.append('callId', callId);
        // formData.append("title", values.title);
        // // formData.append("streamType", values.streamType);
        // formData.append("category", values.category);
        // formData.append("description", values.description);
        // formData.append("datetime", values.datetime);
        // formData.append('language', values.language);
        // values.tags.forEach((tag) => {
        //   formData.append(`tags[]`, tag);
        // });


          const res = await createLiveStream(payload).unwrap();
          if (res) {
            toast.success("Live stream created successfully");
            refetch();
            formik.resetForm();
            setSelectedRow({});
            handleCloseCreate();
          }
        } catch (error) {
          toast.error(error?.data?.message || "Something went wrong");
        }
      },
    });
//        useEffect(() => {
//   formik.setFormikState((prev) => ({
//     ...prev,
//     context: { datetime: formik.values.datetime },
//   }));
// }, [formik.values.datetime]);
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
                ? "Update Live Schedule"
                : "Create Live Schedule"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 px-0 py-0 pt-0 pb-0 ">
            <h2>It won't appear in the schedule</h2>
          </div>

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
                      defaultValue={formik.values.category}
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
                        {data?.data?.map((item) => (
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
                <div className="flex flex-col gap-1 tag-input">
                  <label className="form-label text-gray-900 gap-1">
                    Tags<span className="text-danger">*</span>
                  </label>
                  <TagInput
                    value={formik.values.tags}
                    onChange={(newTags) =>
                      formik.setFieldValue("tags", newTags)
                    }
                    touched={formik.touched.tags}
                    error={formik.errors.tags}
                  />
                  {formik.touched.tags && formik.errors.tags && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.tags}
                    </span>
                  )}
                </div>
              </div>
             
            </div>  
          </div>
          <div className="flex border-gray-200 border-t justify-end pt-5 rounded-b dark:border-gray-200 gap-3">
            <button
              className="btn btn-light"
              onClick={() => {
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
    );
  }
);

export default CreateLiveStream;


