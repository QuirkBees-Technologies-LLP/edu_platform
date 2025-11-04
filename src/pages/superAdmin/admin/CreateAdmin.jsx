import React, { forwardRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { AvatarUpload } from "./AvatarUpload";
import clsx from "clsx";
import { KeenIcon } from "@/components";
import { Alert } from "../../../components/alert/Alert";
import {
  useCreateAdminMutation,
  useUpdateAdminMutation,
} from "../../../store/api/admin/superAdminApiSlice";

const CreateAdmin = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [createAdmin] = useCreateAdminMutation();
    const [updateAdmin] = useUpdateAdminMutation();

    const initialValues = {
      name: "",
      email: "",
      password: "",
      role: "",
      status: "",
      image: null,
      icon: null,
    };

    const validationSchema = Yup.object().shape({
      name: Yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Minimum 6 characters required")
        .max(20, "Maximum 20 characters allowed")
        .when([], {
          is: () => !selectedRow?._id,
          then: (schema) => schema.required("Password is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      role: Yup.string().required("Role is required"),
      status: Yup.string().required("Status is required"),
      image: Yup.mixed().nullable(),
      icon: Yup.mixed().nullable(),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      validationSchema,
      onSubmit: async (values) => {
        try {
          const payload = { ...values };

          if (typeof payload.image === "string") delete payload.image;
          if (typeof payload.icon === "string") delete payload.icon;

          const formData = new FormData();
          for (const key in payload) {
            const value = payload[key];
            if (value instanceof File || value?.file instanceof File) {
              formData.append(key, value.file || value);
            } else {
              formData.append(key, value);
            }
          }

          if (selectedRow?._id) {
            console.log("create admin", formData);
            await updateAdmin({
              id: selectedRow._id,
              formData: formData,
            }).unwrap();
            toast.success("Admin updated successfully!");
          } else {
            console.log("create admin", formData);
            await createAdmin(formData).unwrap();
            toast.success("Admin created successfully!");
          }

          formik.resetForm();
          handleCloseCreate();
          setSelectedRow({});
          refetch?.();
        } catch (err) {
          console.error("Admin API Error:", err);
          const msg = err?.data?.message || "An unexpected error occurred.";
          toast.error(msg);
        }
      },
    });

    useEffect(() => {
      if (selectedRow?._id) {
        formik.setValues({
          name: selectedRow?.name || "",
          email: selectedRow?.email || "",
          password: "",
          role: selectedRow?.role || "",
          status:
            selectedRow?.status !== undefined ? String(selectedRow.status) : "",
          image: selectedRow?.image || null,
          icon: selectedRow?.bannerImage || null,
        });
      } else {
        formik.setValues(initialValues);
      }
    }, [selectedRow?._id, isCreateOpen]);

    const togglePassword = (e) => {
      e.preventDefault();
      setPasswordVisible(!passwordVisible);
    };

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
        <DialogContent className="p-5 max-w-[800px]" ref={ref}>
          <DialogHeader className="pb-5 pt-0 px-0">
            <DialogTitle>
              {selectedRow?._id ? "Update Admin" : "Create Admin"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-12 gap-4 pb-5">
            <div className="col-span-6">
              <label className="form-label text-gray-900 gap-1">
                Profile Photo
              </label>
              <AvatarUpload
                value={
                  formik.values.image
                    ? typeof formik.values.image === "string"
                      ? [{ dataURL: formik.values.image }]
                      : [{ dataURL: URL.createObjectURL(formik.values.image) }]
                    : []
                }
                accept="image/*"
                onChange={(file) => {
                  formik.setFieldValue("image", file[0]?.file);
                }}
              />
              {formik.touched.image && formik.errors.image && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.image}
                </span>
              )}
            </div>

            <div className="col-span-6">
              <label className="form-label text-gray-900 gap-1">
                Banner Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.currentTarget.files[0];
                  formik.setFieldValue("icon", file);
                }}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {formik.values.icon && (
                <div className="mt-2">
                  <img
                    src={
                      typeof formik.values.icon === "string"
                        ? formik.values.icon
                        : URL.createObjectURL(formik.values.icon)
                    }
                    alt="Preview"
                    className="w-full max-w-xs rounded border"
                  />
                </div>
              )}
              {formik.touched.icon && formik.errors.icon && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.icon}
                </span>
              )}
            </div>

            <div className="col-span-6">
              <label className="form-label text-gray-900 gap-1">
                Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter name"
                autoComplete="off"
                {...formik.getFieldProps("name")}
                className={`form-control input input-md w-full ${
                  formik.errors.name && formik.touched.name
                    ? "border border-danger"
                    : ""
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.name}
                </span>
              )}
            </div>

            <div className="col-span-6">
              <label className="form-label text-gray-900 gap-1">
                Email<span className="text-danger">*</span>
              </label>
              <input
                type="email"
                readOnly={selectedRow?._id}
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

            {!selectedRow?._id && (
              <div className="col-span-6">
                <label className="form-label text-gray-900 gap-1">
                  Password<span className="text-danger">*</span>
                </label>
                <label className="input">
                  <input
                    type={passwordVisible ? "text" : "password"}
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
                {formik.touched.password && formik.errors.password && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {formik.errors.password}
                  </span>
                )}
              </div>
            )}

            <div className="col-span-6">
              <label className="form-label text-gray-900 gap-1">
                Role<span className="text-danger">*</span>
              </label>
              <Select
                value={formik.values.role}
                onValueChange={(value) => formik.setFieldValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="marketer">Marketer</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.role && formik.errors.role && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.role}
                </span>
              )}
            </div>

            <div className="col-span-6">
              <label className="form-label text-gray-900 gap-1">
                Status<span className="text-danger">*</span>
              </label>
              <Select
                value={formik.values.status}
                onValueChange={(value) => formik.setFieldValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.status && formik.errors.status && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.status}
                </span>
              )}
            </div>
          </div>

          <div className="flex border-t border-gray-200 justify-end pt-5 gap-3">
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
              j
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

CreateAdmin.displayName = "CreateAdmin";
export default CreateAdmin;
