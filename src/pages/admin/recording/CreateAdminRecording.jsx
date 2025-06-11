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
import { useUpdateAdminRecordingMutation } from '../../../store/api/admin/adminRecordingApiSlice';

const CreateAdminRecording = forwardRef(({ isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow }, ref) => {
    const [updateEducatorRecording] = useUpdateAdminRecordingMutation();

    const initialValues = {
        title: "",
        description: "",
    };

    const createSchema = Yup.object().shape({
        title: Yup.string()
            .required("Title is required")
            .min(2, "Description must be at least 2 characters"),

        description: Yup.string()
            .required("Description is required")
            .min(2, "Description must be at least 2 characters"),

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
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        revalidateOnMount: true,
        validationSchema: createSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {

            const payload = {};

            if (selectedRow?._id) {
                payload.id = selectedRow?._id;
                payload.call_title = values?.title;
                payload.call_description = values?.description;
            }

            try {
                if (selectedRow?._id) {
                    await updateEducatorRecording(payload).unwrap();
                    setSelectedRow({});
                    refetch();
                    toast.success("Recording updated successfully!");
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
                title: selectedRow?.call_title,
                description: selectedRow?.call_description,
                id: selectedRow?._id,
            }
            formik.setValues(initData)
        }
    }, [selectedRow?._id, isCreateOpen]);

    console.log(formik.values, "values");
    console.log(selectedRow, "selectedRow");
    

    return (
        <Dialog open={isCreateOpen} onOpenChange={() => {
            formik.resetForm();
            handleCloseCreate();
            setSelectedRow({});
        }}>
            {formik.status && <Alert variant="danger">{formik.status}</Alert>}
            <DialogContent className="p-5 max-w-[600px]" ref={ref}>
                <DialogHeader>
                    <DialogTitle>{selectedRow?._id ? "Update Recording" : "Create Educator"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 px-0 py-5">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Title<span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    type="text"
                                    placeholder="Enter title"
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
                                <label className="form-label text-gray-900 gap-1">Description<span className="text-danger">
                                    *
                                </span></label>
                                <RichTextEditor
                                    content={formik.values.description}
                                    onChange={(value) => formik.setFieldValue('description', value)}
                                    onBlur={() => formik.setFieldTouched('description', false)}
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

export default CreateAdminRecording;