import React, { forwardRef, useEffect } from 'react'
import { useFormik } from "formik";
import * as Yup from "yup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthContext } from '../../../auth/useAuthContext';
import { ImageInput } from '@/components/image-input';
import { Alert } from '../../../components/alert/Alert';
import { toast } from 'sonner';
import { useCreateTradeIdeasMutation, useUpdateTradeIdeaMutation } from '../../../store/api/admin/adminTradeIdeasApiSlice';
import RichTextEditor from '../../../components/ui/rich-editor';
import { Avatar } from 'stream-chat-react';
import { AvatarUpload } from './AvatarUpload';
import clsx from "clsx";
import { KeenIcon } from "@/components";
import { useCreateAdminAcademyCategoryMutation, useUpdateAdminAcademyCategoryMutation } from '../../../store/api/admin/adminAcademyCategoryApiSlice';

const CreateEducator = forwardRef(({ isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow }, ref) => {
    const { auth } = useAuthContext();
    const [createAdminAcademyCategory] = useCreateAdminAcademyCategoryMutation();
    const [updateAdminAcademyCategory] = useUpdateAdminAcademyCategoryMutation();

    const initialValues = {
        name: "",
        icon: null,
        image: null,
        status: "true",
    };

    const FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

    const createSchema = Yup.object().shape({
        name: Yup.string()
            .required("Name is required")
            .max(100, "Name can't be longer than 100 characters"),

        icon: Yup.mixed()
            .required("Icon image is required")
            .test("fileTypeOrUrl", "Unsupported icon image format", (value) => {
                if (typeof value === "string") return true; // allow URLs
                return value && SUPPORTED_FORMATS.includes(value.type);
            })
            .test("fileSize", "Icon image size is too large", (value) => {
                if (typeof value === "string") return true; // skip size check for URLs
                return value && value.size <= FILE_SIZE;
            }),

        image: Yup.mixed()
            .required("Thumbnail image is required")
            .test("fileTypeOrUrl", "Unsupported image format", (value) => {
                if (typeof value === "string") return true;
                return value && SUPPORTED_FORMATS.includes(value.type);
            })
            .test("fileSize", "Image size is too large", (value) => {
                if (typeof value === "string") return true;
                return value && value.size <= FILE_SIZE;
            }),
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
                delete payload.password
            }

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('status', values.status);
            if (values.icon) formData.append('icon', values.icon);
            if (values.image) formData.append('image', values.image);

            try {
                if (selectedRow?._id) {
                    await updateAdminAcademyCategory({ data: formData, id: selectedRow?._id }).unwrap();
                    refetch();
                    toast.success("Academy category updated successfully!");
                } else {
                    await createAdminAcademyCategory(formData).unwrap();
                    refetch();
                    toast.success("Academy category created successfully!");
                }
                formik.resetForm();
                handleCloseCreate();
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
                name: selectedRow?.name,
                image: selectedRow?.image,
                icon: selectedRow?.icon,
                status: String(selectedRow?.status),
            }
            formik.setValues(initData)
        }
    }, [selectedRow?._id, isCreateOpen]);

    const togglePassword = (event) => {
        event.preventDefault();
        setPasswordVisible(!passwordVisible);
    };

    

    return (
        <Dialog open={isCreateOpen} onOpenChange={() => {
            formik.resetForm();
            handleCloseCreate();
            setSelectedRow({});
        }}>
            {formik.status && <Alert variant="danger">{formik.status}</Alert>}
            <DialogContent className="p-5 max-w-[600px]" ref={ref}>
                <DialogHeader className="pb-5 pt-0 px-0">
                    <DialogTitle>{selectedRow?._id ? "Update Academy Category" : "Create Academy Category"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 px-0 pb-5">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Category Name<span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    type="text"
                                    placeholder="Enter category name"
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
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Icon Image</label>
                                <AvatarUpload
                                    value={
                                        formik.values.icon
                                            ? typeof formik.values.icon === "string"
                                                ? [{ dataURL: formik.values.icon }] // URL from backend
                                                : [{ dataURL: URL.createObjectURL(formik.values.icon) }] // Local file
                                            : []
                                    }
                                    accept="image/*"
                                    onChange={(file) => {
                                        formik.setFieldValue("icon", file[0]?.file);
                                    }}
                                />
                                {formik.touched.icon && formik.errors.icon && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.icon}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Thumbnail Image</label>
                                <AvatarUpload
                                    value={
                                        formik.values.image
                                            ? typeof formik.values.image === "string"
                                                ? [{ dataURL: formik.values.image }] // URL from backend
                                                : [{ dataURL: URL.createObjectURL(formik.values.image) }] // Local file
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
                        </div>
                    </div>
                </div>
                <div className="flex border-gray-200 border-t justify-end py-5 pb-0 rounded-b dark:border-gray-200 gap-3">
                    <button className='btn btn-light' onClick={() => {
                        formik.resetForm();
                        handleCloseCreate();
                        setSelectedRow({});
                    }}>Cancel</button>
                    <button disabled={formik.isSubmitting} type='submit' onClick={formik.handleSubmit} className='btn btn-primary'>Submit</button>
                </div>
            </DialogContent>
        </Dialog>
    )
});

export default CreateEducator;