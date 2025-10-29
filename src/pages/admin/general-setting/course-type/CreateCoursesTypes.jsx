import { forwardRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "../../../../components/alert/Alert";
import { toast } from "sonner";
import {
  useCreateAdminCoursesTypesMutation,
  useUpdateAdminCoursesTypesMutation,
} from "../../../../store/api/admin/adminCoursesTypesApiSlice";

const CreateCoursesTypes = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const [createAdminCoursesTypes] = useCreateAdminCoursesTypesMutation();
    const [updateAdminCoursesTypes] = useUpdateAdminCoursesTypesMutation();

    const initialValues = {
      name: "",
    };

    const createSchema = Yup.object().shape({
      name: Yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values) => {
        const payload = {
          ...values,
        };

        if (selectedRow?._id) {
          payload.id = selectedRow?._id;
          delete payload.password;
        }

        try {
          if (selectedRow?._id) {
            await updateAdminCoursesTypes({
              ...payload,
              status: String(selectedRow?.status),
            }).unwrap();
            setSelectedRow({});

            refetch();
            toast.success("Course type updated successfully!");
          } else {
            await createAdminCoursesTypes(payload).unwrap();
            refetch();
            toast.success("Course type created successfully!");
          }
          formik.resetForm();
          setSelectedRow({});
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
          name: selectedRow?.name,
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

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
        <DialogContent className="p-5 max-w-[678px]" ref={ref}>
          <DialogHeader>
            <DialogTitle>
              {selectedRow?._id ? "Update Course Type" : "Create Course Type"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0 py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${
                      formik.errors.name && formik.touched.name
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
            </div>
          </div>
          <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3 md:py-5">
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

export default CreateCoursesTypes;
