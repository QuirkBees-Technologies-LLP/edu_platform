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

const CreateTradeIdeas = forwardRef(({ isCreateOpen, handleCloseCreate, selectedRow, refetch }, ref) => {
    const { auth } = useAuthContext();
    const [createTradeIdeas] = useCreateTradeIdeasMutation();
    const [updateTradeIdea] = useUpdateTradeIdeaMutation();
    const educatorId = auth?.user?._id ?? null;

    const initialValues = {
        name: "",
        files: [],
        type: "",
        price: "",
        message: "",
        educatorId: "",
        status: "active",
        entry: "",
        invalidation: "",
        exits: [""],
    };

    const createSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        files: Yup.array()
            .min(1, "At least one file is required"),
        type: Yup.string().required("Type is required"),
        price: Yup.number()
            .typeError("Price must be a number")
            .required("Price is required"),
        message: Yup.string().required("Message is required"),
        educatorId: Yup.string().required("Educator ID is required"),
        entry: Yup.string().required("Entry is required"),
        invalidation: Yup.number()
            .typeError("Invalidation must be a number")
            .required("Invalidation is required"),
        exits: Yup.array()
            .of(
                Yup.number()
                    .typeError("Exit must be a number")
                    .integer("Exit must be an integer")
                    .required("Exit is required")
            )
            .min(1, "At least one exit is required"),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        revalidateOnMount: true,
        validationSchema: createSchema,
        onSubmit: async (values, { setStatus, setSubmitting }) => {
            const exitsValues = typeof values.exits === "string"
                ? values.exits.split(",").map(Number)
                : values.exits;

            const formData = new FormData();
            formData.append("name", values.name);
            values.files.forEach((file) => formData.append("files", file?.file?.file));
            formData.append("type", values.type);
            formData.append("price", values.price);
            formData.append("message", values.message);
            formData.append("educatorId", values.educatorId);
            formData.append("status", values.status);
            formData.append("entry", values.entry);
            formData.append("invalidation", values.invalidation);
            exitsValues.forEach((exit) => formData.append("exits[]", exit));
            if (selectedRow?._id) {
                formData.append("id", selectedRow?._id);
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
                    <DialogTitle>{selectedRow?._id ? "Update Trade Idea" : "Create Trade Idea"}</DialogTitle>
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
                                <textarea
                                    type="text"
                                    placeholder="Enter a message"
                                    autoComplete="off"
                                    rows="2"
                                    {...formik.getFieldProps("message")}
                                    className={`textarea ${formik.errors.message && formik.touched.message
                                        ? "border border-danger"
                                        : ""
                                        }`}
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
                        <div className="col-span-6">
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
                                                className={`form-control input input-md w-full ${formik.errors.exits?.[index] && formik.touched.exits?.[index]
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
                                        {formik.touched.exits?.[index] && formik.errors.exits?.[index] && (
                                            <div role="alert" className="text-danger text-xs">
                                                {formik.errors.exits[index]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Images <span className="text-danger">
                                    *
                                </span></label>
                                <div className='flex flex-wrap gap-5'>
                                    {/* Image Input */}
                                    <ImageInput multiple={true} value={formik.values.files} onChange={handleImageChange}

                                    >
                                        {({ onImageUpload }) => (
                                            <div className="cursor-pointer image-input size-24" onClick={onImageUpload}>
                                                <div className={`flex border justify-center rounded-lg image-input-placeholder items-center 
                                                ${formik.touched.files && formik.errors.files ? "border-danger" : "border-gray-200"}`}>
                                                    <i className="ki-filled ki-picture"></i>
                                                </div>
                                            </div>
                                        )}
                                    </ImageInput>
                                    {formik.values.files.map((file, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={file.dataURL}
                                                alt="uploaded"
                                                className="rounded-lg border-2 border-success size-24 object-cover"
                                            />
                                            <div className='absolute -right-4 -top-4'>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-icon rounded-full btn-danger"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <i className="ki-outline ki-cross"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {formik.touched.files && formik.errors.files && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.files}
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

export default CreateTradeIdeas;