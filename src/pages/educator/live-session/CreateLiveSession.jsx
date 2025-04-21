import React, { forwardRef, useEffect } from 'react'
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageInput } from '@/components/image-input';
import { toast } from 'sonner';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useCreateLiveSessionMutation } from '../../../store/api/admin/adminLiveSessionApiSlice';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from "uuid";
import TagInput from '../../../components/ui/tagInput';
import RichTextEditor from '../../../components/ui/rich-editor';

const CreateLiveSession = forwardRef(({ isCreateOpen, handleCloseCreate, selectedRow, refetch }, ref) => {
    const { auth } = useAuthContext();
    const [createLiveSession] = useCreateLiveSessionMutation();
    const educatorId = auth?.user?._id ?? null;
    const navigate = useNavigate();

    const initialValues = {
        title: "",
        description: "",
        tags: [],
        category: "",
        thumbnail: null,
        userId: ""
    };

    const createSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        description: Yup.string().required("Description is required"),
        category: Yup.string().required("Category is required"),
        tags: Yup.array()
            .min(1, "At least one tag is required")
            .of(Yup.string().required("Tag cannot be empty")),
        thumbnail: Yup.array()
            .required("Thumbnail is required")
            .min(1, "Thumbnail is required")
            .test("fileType", "Unsupported file type", (value) => {
                if (!value || value.length === 0) return false;
                const file = value[0]?.file;
                const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
                return file && allowedTypes.includes(file.type);
            })
            .test("fileSize", "File size too large (max 2MB)", (value) => {
                if (!value || value.length === 0) return false;
                const file = value[0]?.file;
                const maxSize = 2 * 1024 * 1024; // 2MB
                return file && file.size <= maxSize;
            }),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        revalidateOnMount: true,
        validationSchema: createSchema,
        onSubmit: async (values) => {

            const callId = uuidv4();
            const thumbnailFile = values.thumbnail?.[0]?.file; // Get the actual File object

            const formData = new FormData();
            formData.append('callId', callId);
            formData.append('title', values.title);
            formData.append('category', values.category);
            formData.append('description', values.description);
            values.tags.forEach((tag) => {
                formData.append(`tags[]`, tag);
            });

            formData.append('userId', values?.userId);

            if (thumbnailFile) {
                formData.append('files', thumbnailFile); // key must match your backend field
            }

            try {
                const res = await createLiveSession(formData).unwrap();
                navigate(`/live-session/${callId}`, { state: res })
            } catch (err) {
                toast.error(err.data.message);
            }
        },
    });

    useEffect(() => {
        if (educatorId && formik.values) {
            formik.setFieldValue("userId", educatorId);
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

    const handleImageChange = (updatedImages) => {
        formik.setFieldValue('thumbnail', updatedImages);
    };

    return (
        <Dialog open={isCreateOpen} onOpenChange={() => {
            formik.resetForm();
            handleCloseCreate();
        }}>
            {formik.status && <Alert variant="danger">{formik.status}</Alert>}
            <DialogContent className="p-5 max-w-[475px]" ref={ref}>
                <DialogHeader className="pb-5 pt-0 px-0">
                    <DialogTitle>{selectedRow?._id ? "Update Live Session" : "Create Live Session"}</DialogTitle>
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
                                    value={formik.values.description}
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
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Category<span className="text-danger">
                                    *
                                </span></label>
                                <input
                                    type="text"
                                    placeholder="Enter category"
                                    autoComplete="off"
                                    className={`form-control input input-md w-full ${formik.errors.category && formik.touched.category
                                        ? "border border-danger"
                                        : ""
                                        }`}
                                    {...formik.getFieldProps("category")}
                                />
                                {formik.touched.category && formik.errors.category && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.category}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1 tag-input">
                                <label className="form-label text-gray-900 gap-1">Tags<span className="text-danger">
                                    *
                                </span></label>
                                <TagInput
                                    value={formik.values.tags}
                                    onChange={(newTags) => formik.setFieldValue('tags', newTags)}
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
                        <div className="col-span-12">
                            <div className="flex flex-col gap-1">
                                <label className="form-label text-gray-900 gap-1">Thumbnail<span className="text-danger">
                                    *
                                </span></label>
                                <div className='flex-wrap gap-5'>
                                    {/* Image Input */}
                                    <ImageInput
                                        value={formik.values.thumbnail}
                                        onChange={handleImageChange}
                                        acceptType={['jpg', 'jpeg', 'png']}
                                        multiple={false}
                                    >
                                        {({
                                            fileList,
                                            onImageUpload,
                                            onImageRemove,
                                            onImageUpdate,
                                            dragProps,
                                            isDragging
                                        }) => (
                                            <div
                                                {...dragProps}
                                                className={`
        border border-dashed rounded-lg text-center transition-colors 
        p-5 ${isDragging ? 'bg-gray-100' : 'bg-white'} border-gray-300 ${formik.touched.thumbnail && formik.errors.thumbnail
                                                        ? "validation-error-border"
                                                        : ""
                                                    }`}
                                            >
                                                {fileList.length === 0 ? (
                                                    <>
                                                        <p
                                                            onClick={onImageUpload}
                                                            className="text-sm font-medium text-muted-foreground cursor-pointer"
                                                        >
                                                            Drag & drop an image here, or
                                                        </p>
                                                        <button
                                                            onClick={onImageUpload}
                                                            className="mt-2 text-sm font-medium text-muted-foreground underline"
                                                            type="button"
                                                        >
                                                            Upload Image
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={fileList[0].dataURL}
                                                            alt="Uploaded Preview"
                                                            className="w-48 h-48 object-cover rounded-md"
                                                        />
                                                        <div className="mt-3 flex justify-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => onImageUpdate(0)}
                                                                className="btn btn-icon btn-light btn-outline"
                                                            >
                                                                <i className="ki-filled ki-update-file" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onImageRemove(0)}
                                                                className="btn btn-icon btn-danger btn-outline"
                                                            >
                                                                <i className="ki-filled ki-trash" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </ImageInput>
                                </div>
                                {formik.touched.thumbnail && formik.errors.thumbnail && (
                                    <span role="alert" className="text-danger text-xs mt-1">
                                        {formik.errors.thumbnail}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex border-gray-200 border-t justify-end pt-5 rounded-b dark:border-gray-200 gap-3">
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

export default CreateLiveSession