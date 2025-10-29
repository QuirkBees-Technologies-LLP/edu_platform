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
import { useCreateEducatorMutation } from "../../../store/api/admin/adminEducatorsApiSlice";
import clsx from "clsx";
import { KeenIcon } from "@/components";

const CreateEducator = forwardRef(
  ({ isCreateOpen, handleCloseCreate, selectedRow, refetch }, ref) => {
    const { auth } = useAuthContext();
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const [createEducator] = useCreateEducatorMutation();
    const [updateTradeIdea] = useUpdateTradeIdeaMutation();

    const initialValues = {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "educator",
      bio: "",
      status: true,
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
        .required("Password is required"),

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

      bio: Yup.string()
        .max(500, "Bio cannot exceed 500 characters")
        .required("Bio is required"),
      status: Yup.boolean().required("Status is required"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        const payload = {
          ...values,
        };

        if (selectedRow?._id) {
          payload.id = selectedRow?._id;
          delete payload.password;
        }

        try {
          if (selectedRow?._id) {
            await updateTradeIdea(payload).unwrap();
            refetch();
            toast.success("Trade idea updated successfully!");
          } else {
            await createEducator(payload).unwrap();
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

    useEffect(() => {
      if (selectedRow?._id) {
        const initData = {
          first_name: selectedRow?.first_name,
          last_name: selectedRow?.last_name,
          email: selectedRow?.email,
          password: selectedRow?.password,
          role: "educator",
          bio: selectedRow?.bio,
          status: selectedRow?.status,
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    const togglePassword = (event) => {
      event.preventDefault();
      setPasswordVisible(!passwordVisible);
    };

    return (
      <Dialog
        open={isCreateOpen}
        onOpenChange={() => {
          formik.resetForm();
          handleCloseCreate();
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
              <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    First Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${
                      formik.errors.first_name && formik.touched.first_name
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
                    className={`form-control input input-md w-full ${
                      formik.errors.last_name && formik.touched.last_name
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
                    className={`form-control input input-md w-full ${
                      formik.errors.email && formik.touched.email
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
                    defaultValue={true}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value)
                    }
                    className={`form-control input input-md w-full ${
                      formik.errors.status && formik.touched.status
                        ? "border border-danger"
                        : ""
                    }`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={true}>Active</SelectItem>
                      <SelectItem value={false}>Inactive</SelectItem>
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
                    Bio <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    value={formik.values.bio}
                    onChange={(value) => formik.setFieldValue("bio", value)}
                    onBlur={() => formik.setFieldTouched("bio", true)}
                    theme="snow"
                    touched={formik.touched.bio}
                    error={formik.errors.bio}
                  />
                  {formik.touched.bio && formik.errors.bio && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.bio}
                    </span>
                  )}
                </div>
              </div>
              {/* <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Profile Image<span className="text-danger">
                                    *
                                </span></label>
                                <AvatarUpload
                                    value={formik.values.image ? [{ dataURL: URL.createObjectURL(formik.values.image) }] : []}
                                    accept="image/*"
                                    onChange={(file) => {
                                        // file[0].file will be actual image file
                                        formik.setFieldValue("image", file[0]?.file);
                                    }}
                                />
                                {formik.touched.bio && formik.errors.bio && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.bio}
                                    </span>
                                )}
                            </div>
                        </div> */}
            </div>
          </div>
          <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3 md:py-5">
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

export default CreateEducator;
