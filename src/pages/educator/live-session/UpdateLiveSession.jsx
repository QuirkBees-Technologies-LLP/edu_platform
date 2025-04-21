import React, { useEffect } from 'react';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useCreateLiveSessionMutation } from '../../../store/api/admin/adminLiveSessionApiSlice';
import { useUpdateTradeIdeaMutation } from '../../../store/api/admin/adminTradeIdeasApiSlice';
import { useNavigate } from 'react-router';
import { useFormik } from 'formik';
import { v4 as uuidv4 } from "uuid";
import TagInput from '../../../components/ui/tagInput';
import * as Yup from "yup";
import { useCall } from '@stream-io/video-react-sdk';
import RichTextEditor from '../../../components/ui/rich-editor';

const UpdateLiveSession = ({ selectedRow }) => {
    const { auth } = useAuthContext();
    const educatorId = auth?.user?._id ?? null;
    const call = useCall();

    const initialValues = {
        title: "",
        description: "",
        tags: [],
        category: "",
        userId: ""
    };

    const updateSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        description: Yup.string()
            .required('Description is required')
            .test(
                'is-not-empty',
                'Description cannot be empty',
                (value) => value && value.replace(/<(.|\n)*?>/g, '').trim().length > 0
            ),
        category: Yup.string()
            .required("Category is required"),
        tags: Yup.array()
            .min(1, "At least one tag is required")
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        revalidateOnMount: true,
        validationSchema: updateSchema,
        onSubmit: async (values) => {
            try {
                if (call) {
                    await call.update({
                        custom: {
                            ...call.state?.custom,
                            title: values.title,
                            description: values.description,
                            tags: values.tags,
                            category: values.category,
                        }
                    });
                }
                console.log('Custom data updated:', call?.state?.custom);
            } catch (err) {
                console.error('Failed to update call custom data:', err);
            }
        },
    });

    useEffect(() => {
        if (call?.state?.custom) {
            const custom = call.state.custom;

            formik.setValues({
                title: custom.title || '',
                description: custom.description || '',
                tags: custom.tags || [],
                category: custom.category || '',
                userId: educatorId || '',
            });
        }
    }, [call?.state?.custom, educatorId]);
    console.log(formik, "formik");

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-6">
                    <div className="flex flex-col gap-1">
                        <label className="form-label text-gray-900 gap-1">Title<span className="text-danger">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter title"
                            autoComplete="off"
                            className={`form-control input input-md w-full ${formik.errors.title && formik.touched.title ? "border border-danger" : ""}`}
                            {...formik.getFieldProps("title")}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <span role="alert" className="text-danger text-xs mt-1">{formik.errors.title}</span>
                        )}
                    </div>
                </div>

                <div className="col-span-6">
                    <div className="flex flex-col gap-1">
                        <label className="form-label text-gray-900 gap-1">Description<span className="text-danger">*</span></label>
                        <RichTextEditor
                            value={formik.values.description}
                            onChange={(value) => formik.setFieldValue('description', value)}
                            onBlur={() => formik.setFieldTouched('description', false)}
                            touched={formik.touched.description}
                            error={formik.errors.description}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <span role="alert" className="text-danger text-xs mt-1">{formik.errors.description}</span>
                        )}
                    </div>
                </div>

                <div className="col-span-6">
                    <div className="flex flex-col gap-1">
                        <label className="form-label text-gray-900 gap-1">Category<span className="text-danger">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter category"
                            autoComplete="off"
                            className={`form-control input input-md w-full ${formik.errors.category && formik.touched.category ? "border border-danger" : ""}`}
                            {...formik.getFieldProps("category")}
                        />
                        {formik.touched.category && formik.errors.category && (
                            <span role="alert" className="text-danger text-xs mt-1">{formik.errors.category}</span>
                        )}
                    </div>
                </div>

                <div className="col-span-6">
                    <div className="flex flex-col gap-1 tag-input">
                        <label className="form-label text-gray-900 gap-1">Tags<span className="text-danger">*</span></label>
                        <TagInput
                            value={formik.values.tags}
                            onChange={(newTags) => formik.setFieldValue('tags', newTags)}
                            touched={formik.touched.tags}
                            error={formik.errors.tags}
                        />
                        {formik.touched.tags && formik.errors.tags && (
                            <span role="alert" className="text-danger text-xs mt-1">{formik.errors.tags}</span>
                        )}
                    </div>
                </div>
                <div className="col-span-6">
                    <button disabled={formik?.isSubmitting} type="submit" className="btn btn-md btn-primary" onClick={formik.handleSubmit}>Update</button>
                </div>
            </div>
        </form>
    );
};

export default UpdateLiveSession;
