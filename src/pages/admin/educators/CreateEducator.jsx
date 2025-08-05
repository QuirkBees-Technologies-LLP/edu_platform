import React, { forwardRef, useEffect } from "react";
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
import {
  useCreateEducatorMutation,
  useUpdateEducatorMutation,
} from "../../../store/api/admin/adminEducatorsApiSlice";
import clsx from "clsx";
import { KeenIcon } from "@/components";

const CreateEducator = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const [createEducator] = useCreateEducatorMutation();
    const [updateEducator] = useUpdateEducatorMutation();

    const initialValues = {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "educator",
      status: "",
      is_create_stream: false,
      is_access_trade_ideas: true,
      is_access_trade_analysis: true,
      files: null,
    };

    const createSchema = Yup.object().shape({
      first_name: Yup.string()
        .required("First name is required")
        .min(2, "First name must be at least 2 characters"),

      last_name: Yup.string()
        .required("Last name is required")
        .min(2, "Last name must be at least 2 characters"),

      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),

      password: Yup.string()
        .min(3, "Minimum 3 symbols")
        .max(50, "Maximum 50 symbols")
        .when([], {
          is: () => !selectedRow?._id,
          then: (schema) => schema.required("Password is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      is_create_stream: Yup.boolean()
        .required("This field is required")
        .typeError("Please select a valid option"),

      is_access_trade_ideas: Yup.boolean(),
      is_access_trade_analysis: Yup.boolean(),

      // image: Yup.mixed()
      //     .required("Image is required")
      //     .test(
      //         "fileSize",
      //         "Image size too large (max 2MB)",
      //         (value) => !value || (value && value.size <= 2000000)
      //     )
      //     .test(
      //         "fileType",
      //         "Unsupported file format",
      //         (value) =>
      //             !value ||
      //             (value &&
      //                 ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
      //                     value.type
      //                 ))
      //     ),

      role: Yup.string().required("Role is required"),
      status: Yup.boolean().required("Status is required"),
      files: Yup.mixed().nullable(),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      // onSubmit: async (values, { setStatus, setSubmitting }) => {
      //   const payload = {
      //     ...values,
      //   };

      //   if (selectedRow?._id) {
      //     payload.id = selectedRow?._id;
      //     delete payload.password;
      //   }

      //   try {
      //     if (selectedRow?._id) {
      //       await updateEducator(payload).unwrap();
      //       setSelectedRow({});

      //       refetch();
      //       toast.success("Educator updated successfully!");
      //     } else {
      //       await createEducator(payload).unwrap();
      //       refetch();
      //       toast.success("Educator created successfully!");
      //     }
      //     formik.resetForm();
      //     handleCloseCreate();
      //   } catch (err) {
      //     console.error("API Error:", err);
      //     const errorMessage =
      //       err?.data?.message || "An unexpected error occurred.";
      //     toast.error(errorMessage);
      //   }
      // },
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        try {
          const payload = { ...values };

          if (selectedRow?._id) {
            payload.id = selectedRow._id;
            delete payload.password;
          }

          // Convert payload to FormData
          const formData = new FormData();

          for (const key in payload) {
            const value = payload[key];

            // If value is an array, append each item
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                // Handle files specifically
                if (item instanceof File || item?.file instanceof File) {
                  formData.append(`${key}[${index}]`, item.file || item);
                } else {
                  formData.append(`${key}[${index}]`, item);
                }
              });
            } else if (value instanceof File || value?.file instanceof File) {
              formData.append(key, value.file || value);
            } else {
              formData.append(key, value);
            }
          }

          // API call using FormData
          if (selectedRow?._id) {
            await updateEducator(formData).unwrap();
            toast.success("Educator updated successfully!");
          } else {
            await createEducator(formData).unwrap();
            toast.success("Educator created successfully!");
          }

          formik.resetForm();
          handleCloseCreate();
          setSelectedRow({});
          refetch();
        } catch (err) {
          console.error("API Error:", err);
          const errorMessage = err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });

    useEffect(() => {
      if (selectedRow?._id) {
        const initData = {
          first_name: selectedRow?.first_name,
          last_name: selectedRow?.last_name,
          email: selectedRow?.email,
          password: selectedRow?.password,
          role: "educator",
          status: selectedRow?.status,
          is_create_stream: selectedRow?.is_create_stream,
          is_access_trade_analysis: selectedRow?.is_access_trade_analysis,
          is_access_trade_ideas: selectedRow?.is_access_trade_ideas,
          files: selectedRow?.image || null,
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    const togglePassword = (event) => {
      event.preventDefault();
      setPasswordVisible(!passwordVisible);
    };

    console.log(formik.values, "values");

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
        <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
          <DialogHeader>
            <DialogTitle>
              {selectedRow?._id ? "Update Educator" : "Create Educator"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0 py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Profile Photo
                  </label>
                  <AvatarUpload
                    value={
                      formik.values.files
                        ? typeof formik.values.files === "string"
                          ? [{ dataURL: formik.values.files }] // URL from backend
                          : [
                            {
                              dataURL: URL.createObjectURL(
                                formik.values.files
                              ),
                            },
                          ] // Local file
                        : []
                    }
                    accept="image/*"
                    onChange={(file) => {
                      formik.setFieldValue("files", file[0]?.file);
                    }}
                  />
                  {formik.touched.files && formik.errors.files && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.files}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    First Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${formik.errors.first_name && formik.touched.first_name
                      ? "border border-danger"
                      : ""
                      }`}
                    {...formik.getFieldProps("first_name")}
                  />
                  {formik.touched.first_name && formik.errors.first_name && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.first_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Last Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${formik.errors.last_name && formik.touched.last_name
                      ? "border border-danger"
                      : ""
                      }`}
                    {...formik.getFieldProps("last_name")}
                  />
                  {formik.touched.last_name && formik.errors.last_name && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.last_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    autoComplete="off"
                    {...formik.getFieldProps("email")}
                    className={`form-control input input-md w-full ${formik.errors.email && formik.touched.email
                      ? "border border-danger"
                      : ""
                      }`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.email}
                    </span>
                  )}
                </div>
              </div>
              {!selectedRow?._id && (
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Password <span className="text-danger">*</span>
                    </label>
                    <label className="input">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        autoComplete="off"
                        {...formik.getFieldProps("password")}
                        className={clsx("form-control", {
                          "is-invalid":
                            formik.touched.password && formik.errors.password,
                        })}
                      />
                      <button className="btn btn-icon" onClick={togglePassword}>
                        <KeenIcon
                          icon="eye"
                          className={clsx("text-gray-500", {
                            hidden: passwordVisible,
                          })}
                        />
                        <KeenIcon
                          icon="eye-slash"
                          className={clsx("text-gray-500", {
                            hidden: !passwordVisible,
                          })}
                        />
                      </button>
                    </label>
                    {formik.touched.email && formik.errors.email && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.email}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Status <span className="text-danger">*</span>
                  </label>
                  <Select
                    defaultValue={formik.values.status}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value)
                    }
                    className={`form-control input input-md w-full ${formik.errors.status && formik.touched.status
                      ? "border border-danger"
                      : ""
                      }`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"true"}>Active</SelectItem>
                      <SelectItem value={"false"}>Inactive</SelectItem>
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
                    Can create a stream ?<span className="text-danger">*</span>
                  </label>
                  <Select
                    defaultValue={formik.values.is_create_stream}
                    onValueChange={(value) =>
                      formik.setFieldValue("is_create_stream", value)
                    }
                    className={`form-control input input-md w-full 
                                ${formik.errors.is_create_stream &&
                        formik.touched.is_create_stream
                        ? "border border-danger"
                        : ""
                      }`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={true}>Yes</SelectItem>
                      <SelectItem value={false}>No</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.is_create_stream &&
                    formik.errors.is_create_stream && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.is_create_stream}
                      </span>
                    )}
                </div>
              </div>

              <div className="col-span-6">
                <label className="form-label text-gray-900">Can access  </label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="checkbox"
                      name="is_access_trade_ideas"
                      checked={formik.values.is_access_trade_ideas}
                      onChange={formik.handleChange}
                      className="form-checkbox h-5 w-5 text-primary"
                    />
                    IQ Ideas
                  </label>

                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="checkbox"
                      name="is_access_trade_analysis"
                      checked={formik.values.is_access_trade_analysis}
                      onChange={formik.handleChange}
                      className="form-checkbox h-5 w-5 text-primary"
                    />
                    IQ Insight
                  </label>
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

export default CreateEducator;
