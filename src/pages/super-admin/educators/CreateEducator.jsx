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

const CreateEducator = forwardRef(({ isCreateOpen, handleCloseCreate, selectedRow, refetch }, ref) => {
    const { auth } = useAuthContext();
    const [createTradeIdeas] = useCreateTradeIdeasMutation();
    const [updateTradeIdea] = useUpdateTradeIdeaMutation();
    const educatorId = auth?.user?._id ?? null;

    const initialValues = {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        bio: "",
        status: "active",
    };

    const createSchema = Yup.object().shape({
        first_name: Yup.string()
            .required("First name is required")
            .max(50, "First name must be at most 50 characters"),
        last_name: Yup.string()
            .required("Last name is required")
            .max(50, "Last name must be at most 50 characters"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        phone: Yup.string()
            .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
            .required("Phone number is required"),
        bio: Yup.string()
            .max(500, "Bio must be at most 500 characters"),
        status: Yup.string()
            .oneOf(["active", "inactive"], "Invalid status")
            .required("Status is required"),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        revalidateOnMount: true,
        validationSchema: createSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {
            const payload = {
                ...values,
            }
           
            if (selectedRow?._id) {
                payload.id = selectedRow?._id
            }

            try {
                if (selectedRow?._id) {
                    await updateTradeIdea(formData).unwrap();
                    refetch();
                    toast.success("Trade idea updated successfully!");
                } else {
                    await createTradeIdeas(formData).unwrap();
                    refetch();
                    toast.success("Trade idea created successfully!");
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
        if (educatorId && formik.values) {
            formik.setFieldValue("educatorId", educatorId);
        }
    }, [educatorId, formik.values]);

    useEffect(() => {
        if (selectedRow?._id) {
            const existingImages = selectedRow.image?.map((img) => ({
                file: null,
                dataURL: img,
            })) || [];

            const initData = {
                name: selectedRow?.name,
                files: existingImages,
                type: selectedRow?.type,
                price: selectedRow?.price,
                message: selectedRow?.message,
                status: selectedRow?.status,
                entry: selectedRow?.entry,
                invalidation: selectedRow?.invalidation,
                exits: selectedRow?.exits,
            }
            formik.setValues(initData)
        }
    }, [selectedRow?._id, isCreateOpen]);

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
        newFiles.splice(index, 1);
        formik.setFieldValue("files", newFiles);
    };

    return (
        <Dialog open={isCreateOpen} onOpenChange={() => {
            formik.resetForm();
            handleCloseCreate();
        }}>
            {formik.status && <Alert variant="danger">{formik.status}</Alert>}
            <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
                <DialogHeader>
                    <DialogTitle>{selectedRow?._id ? "Update Educator" : "Create Educator"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 px-0 py-5">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Name<span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    type="text"
                                    placeholder="Enter name"
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
                        <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Type <span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    type="text"
                                    placeholder="Enter type"
                                    autoComplete="off"
                                    className={`form-control input input-md w-full ${formik.errors.type && formik.touched.type
                                        ? "border border-danger"
                                        : ""
                                        }`}
                                    {...formik.getFieldProps("type")}
                                />
                                {formik.touched.type && formik.errors.type && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.type}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Price <span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    type="number"
                                    placeholder="Enter price"
                                    autoComplete="off"
                                    {...formik.getFieldProps("price")}
                                    className={`form-control input input-md w-full ${formik.errors.price && formik.touched.price
                                        ? "border border-danger"
                                        : ""
                                        }`}
                                />
                                {formik.touched.price && formik.errors.price && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.price}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Message <span className="text-danger">
                                    *
                                </span></label>
                                <RichTextEditor
                                    value={formik.values.message}
                                    onChange={(value) => formik.setFieldValue('message', value)}
                                    onBlur={() => formik.setFieldTouched('message', true)}
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
                        </div>
                        <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Status <span className="text-danger">
                                    *
                                </span></label>
                                <Select defaultValue="active" className={`form-control input input-md w-full ${formik.errors.status && formik.touched.status
                                    ? "border border-danger"
                                    : ""
                                    }`}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
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
                                <label className="form-label text-gray-900 gap-1">Entry <span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    {...formik.getFieldProps("entry")}
                                    type="text"
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
                        <div className="col-span-6">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Invalidation <span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    type="number"
                                    placeholder="Enter invalidation"
                                    autoComplete="off"
                                    {...formik.getFieldProps("invalidation")}
                                    className={`form-control input input-md w-full ${formik.errors.invalidation && formik.touched.invalidation
                                        ? "border border-danger"
                                        : ""
                                        }`}
                                />
                                {formik.touched.invalidation && formik.errors.invalidation && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.invalidation}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3 md:py-5">
                    <button className='btn btn-light' onClick={() => {
                        formik.resetForm();
                        handleCloseCreate();
                    }}>Cancel</button>
                    <button disabled={formik.isSubmitting} type='submit' onClick={formik.handleSubmit} className='btn btn-primary'>Submit</button>
                </div>
            </DialogContent>
        </Dialog>
    )
});

export default CreateEducator;