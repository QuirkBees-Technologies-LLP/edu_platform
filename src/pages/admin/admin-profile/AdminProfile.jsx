import React, { useEffect } from 'react'
import { Container } from '@/components/container';
import { useGetAdminProfileQuery, useUpdateAdminProfileMutation } from '../../../store/api/admin/adminProfileApiSlice';
import { useFormik } from 'formik';
import { toast } from 'sonner';
import { AvatarUpload } from '../../admin/educators/AvatarUpload';
import * as Yup from 'yup';

const AdminProfile = () => {
    const { data } = useGetAdminProfileQuery();
    const [updateAdminProfile] = useUpdateAdminProfileMutation();

    const formik = useFormik({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            files: null,
        },
        validationSchema: Yup.object({
            first_name: Yup.string().required('First name is required'),
            last_name: Yup.string().required('Last name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            files: Yup.mixed().nullable(),
        }),
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                formData.append('first_name', values.first_name);
                formData.append('last_name', values.last_name);
                formData.append('email', values.email);
                if (values.files) formData.append('files', values.files);
                const res = await updateAdminProfile(formData).unwrap();
                toast.success('Profile updated successfully');
            } catch (error) {
                toast.error(error?.data?.message || 'Failed to update profile');
            }
        },
    });

    useEffect(() => {
        if (data) {
            formik.setValues({
                first_name: data?.data?.first_name || '',
                last_name: data?.data?.last_name || '',
                email: data?.data?.email || '',
                files: data?.data?.image || null,
            });
        }
    }, [data]);

    return (
        <div>
            <Container>
                <form onSubmit={formik.handleSubmit}>
                    <div className="card">
                        <div className="card-body">
                            <div className="grid gap-5 px-0">
                                <div className="grid grid-cols-12 gap-4">
                                    {/* Profile photo*/}
                                    <div className="col-span-12">
                                        <div className="flex flex-col gap-1">
                                            <label className="form-label text-gray-900 gap-1">Profile Photo</label>
                                            <AvatarUpload
                                                value={
                                                    formik.values.files
                                                        ? typeof formik.values.files === "string"
                                                            ? [{ dataURL: formik.values.files }] // URL from backend
                                                            : [{ dataURL: URL.createObjectURL(formik.values.files) }] // Local file
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

                                    {/* First Name */}
                                    <div className="col-span-6">
                                        <div className="flex flex-col gap-1">
                                            <label className="form-label text-gray-900 gap-1">
                                                First name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                placeholder="Enter first name"
                                                autoComplete="off"
                                                className="form-control input input-md w-full"
                                                value={formik.values.first_name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.first_name && formik.errors.first_name && (
                                                <span className="text-danger text-xs">{formik.errors.first_name}</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Last Name */}
                                    <div className="col-span-6">
                                        <div className="flex flex-col gap-1">
                                            <label className="form-label text-gray-900 gap-1">
                                                Last name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                placeholder="Enter last name"
                                                autoComplete="off"
                                                className="form-control input input-md w-full"
                                                value={formik.values.last_name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.last_name && formik.errors.last_name && (
                                                <span className="text-danger text-xs">{formik.errors.last_name}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-6">
                                        <div className="flex flex-col gap-1">
                                            <label className="form-label text-gray-900 gap-1">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email"
                                                autoComplete="off"
                                                className="form-control input input-md w-full"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            {formik.touched.email && formik.errors.email && (
                                                <span className="text-danger text-xs">{formik.errors.email}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit button */}
                            <div className="mt-6">
                                <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary">
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </Container>
        </div>
    );
}

export default AdminProfile
