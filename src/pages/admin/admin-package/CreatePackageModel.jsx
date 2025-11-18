import React, { forwardRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorLiveStreamApiSlice";
import {
  useCreatePackageMutation,
  useUpdatePackageMutation,
} from "../../../store/api/admin/adminPackageApiSlice";
import CustomSelect from "../../../components/CustomSelect";

const CreatePackageModel = forwardRef(
  (
    { isOpen, handleClose, selectedRow, setSelectedRow = () => {}, refetch },
    ref
  ) => {
    const { data: categoryList } = useGetEducatorAcademyCategoryQuery();
    const [createPackage] = useCreatePackageMutation();
    const [updatePackage] = useUpdatePackageMutation();

    const categoryOptions =
      categoryList?.data?.map((cat) => ({
        label: cat.name,
        value: String(cat._id),
      })) || [];

    const sidebarOptions = [
      { label: "/profile", value: "/profile" },
      { label: "/fast-start-training", value: "/fast-start-training" },
      { label: "/dashboard", value: "/dashboard" },
      { label: "/iq-vault", value: "/iq-vault" },
      { label: "/iq-insight", value: "/iq-insight" },
      { label: "/iq-academy", value: "/iq-academy" },
      { label: "/ideas", value: "/ideas" },
      { label: "/iq-educators/:id", value: "/iq-educators/:id" },
      { label: "/iq-academy-educators", value: "/iq-academy-educators" },
      { label: "/iq-social", value: "/iq-social" },
      {
        label: "https://www.iqcharts.com/",
        value: "https://www.iqcharts.com/",
      },
    ];

    const validationSchema = Yup.object({
      name: Yup.string()
        .required("Package name is required")
        .min(2, "Name must be at least 2 characters"),
      allowedCategories: Yup.array()
        .min(1, "At least one category is required")
        .of(Yup.string()),
      allowedSideBar: Yup.array()
        .min(1, "At least one route is required")
        .of(Yup.string()),
    });

    const formik = useFormik({
      initialValues: {
        name: "",
        allowedCategories: [],
        allowedSideBar: [],
      },
      enableReinitialize: true,
      validationSchema,
      onSubmit: async (values) => {
        try {
          if (selectedRow?._id) {
            await updatePackage({ ...values, id: selectedRow._id }).unwrap();
            toast.success("Package updated successfully!");
          } else {
            await createPackage(values).unwrap();
            toast.success("Package created successfully!");
          }
          formik.resetForm();
          refetch();
          setSelectedRow({});
          handleClose();
        } catch (err) {
          console.error("API Error:", err);
          toast.error(err?.data?.message || "Something went wrong.");
        }
      },
    });

    useEffect(() => {
      if (selectedRow?._id) {
        formik.setValues({
          name: selectedRow.name || "",
          allowedCategories:
            selectedRow.allowedCategories?.map((c) => String(c._id)) || [],
          allowedSideBar: selectedRow.allowedSideBar || [],
        });
      }
    }, [selectedRow]);

    return (
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          formik.resetForm();
          setSelectedRow({});
          handleClose();
        }}
      >
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[600px]" ref={ref}>
          <DialogHeader className="pb-5 pt-0 px-0">
            <DialogTitle>
              {selectedRow?._id ? "Update Package" : "Create Package"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="grid gap-5 px-0 py-5 ">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1 ">
                      Package Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter package name"
                      autoComplete="off"
                      className={`form-control input dark:bg-[#2b2b2b] input-md w-full ${
                        formik.errors.name && formik.touched.name
                          ? "border border-danger"
                          : ""
                      }`}
                      {...formik.getFieldProps("name")}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <span className="text-danger text-xs mt-1">
                        {formik.errors.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1 pb-1">
                      Allowed Categories <span className="text-danger">*</span>
                    </label>
                    <CustomSelect
                      mode="multiple"
                      allowClear
                      maxTagCount="responsive"
                      options={categoryOptions}
                      value={formik.values.allowedCategories}
                      onChange={(val) =>
                        formik.setFieldValue("allowedCategories", val)
                      }
                      placeholder="Select categories"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    />
                    {formik.touched.allowedCategories &&
                      formik.errors.allowedCategories && (
                        <span className="text-danger text-xs mt-1">
                          {formik.errors.allowedCategories}
                        </span>
                      )}
                  </div>
                </div>

                <div className="col-span-12">
                  <div className="flex flex-col ">
                    <label className="form-label text-gray-900 ">
                      Allowed Routes <span className="text-danger">*</span>
                    </label>
                    <CustomSelect
                      className=" z-50"
                      mode="multiple"
                      allowClear
                      maxTagCount="responsive"
                      options={sidebarOptions}
                      value={formik.values.allowedSideBar}
                      onChange={(val) =>
                        formik.setFieldValue("allowedSideBar", val)
                      }
                      placeholder="Select routes"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    />
                    {formik.touched.allowedSideBar &&
                      formik.errors.allowedSideBar && (
                        <span className="text-danger text-xs mt-1">
                          {formik.errors.allowedSideBar}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex border-gray-200 border-t justify-end pt-5 rounded-b dark:border-gray-200 gap-3">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  formik.resetForm();
                  handleClose();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreatePackageModel;
