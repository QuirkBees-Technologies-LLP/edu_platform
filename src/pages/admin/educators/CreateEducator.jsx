import React, { forwardRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandEmpty, CommandGroup } from "@/components/ui/command";
import { useAuthContext } from "../../../auth/useAuthContext";
import { ImageInput } from "@/components/image-input";
import { Alert } from "../../../components/alert/Alert";
import { toast } from "sonner";
import {
  useCreateTradeIdeasMutation,
  useUpdateTradeIdeaMutation,
} from "../../../store/api/admin/adminTradeIdeasApiSlice";
import RichTextEditor from "../../../components/ui/rich-editor";
import { Avatar } from "stream-chat-react";
import { AvatarUpload } from "./AvatarUpload";
import {
  useCreateEducatorMutation,
  useUpdateEducatorMutation,
} from "../../../store/api/admin/adminEducatorsApiSlice";
import clsx from "clsx";
import { KeenIcon } from "@/components";
import { icon } from "leaflet";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";

const CreateEducator = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const [changePassword, setChangePassword] = React.useState(false);
    const [isTradingTypeOpen, setIsTradingTypeOpen] = React.useState(false);
    const [isTradingMethodOpen, setIsTradingMethodOpen] = React.useState(false);
    const [isTimeZoneOpen, setIsTimeZoneOpen] = React.useState(false);
    const [createEducator] = useCreateEducatorMutation();
    const [updateEducator] = useUpdateEducatorMutation();

    const tradingTypeOptions = [
      { value: "scalper", label: "Scalper" },
      { value: "day_trader", label: "Day Trader" },
      { value: "swing_trader", label: "Swing Trader" },
      { value: "news_trading", label: "News Trading" },
    ];

    const tradingMethodOptions = [
      { value: "price_action", label: "Price Action" },
      { value: "institutional", label: "Institutional" },
      // { value: "wyckoff", label: "Wyckoff" },
      // { value: "elliot", label: "Elliot" },
      { value: "harmonics", label: "Harmonics" },
    ];

    const timeZoneOptions = [
      { value: "new_york", label: "New York" },
      { value: "london", label: "London" },
      { value: "asian", label: "Asian" },
    ];


    const { data: categoryList } = useGetEducatorAcademyCategoryQuery();


    const initialValues = {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      categories: [],
      role: "educator",
      status: "",
      is_create_stream: false,
      is_access_trade_ideas: true,
      is_access_trade_analysis: true,
      image: null,
      icon: null,
      projectId: "",
      educatorRole: "",
      bio: "",
      description: "",
      tradingStyle: [],
      tradingMethod: [],
      timeZone: [],
    };

    const createSchema = Yup.object().shape({
      first_name: Yup.string()
        .required("First name is required")
        .min(2, "First name must be at least 2 characters"),
      projectId: Yup.string().nullable(),
      last_name: Yup.string()
        .required("Last name is required")
        .min(2, "Last name must be at least 2 characters"),

      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      categories: Yup.array()
        .min(1, "At least one category is required")
        .of(Yup.string().required())
        .required("Category is required"),

      password: Yup.string()
        .min(6, "Minimum 6 characters are required")
        .max(20, "Maximum 20 characters are required")
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&*()_+=\-]{6,20}$/,
          "Password must contain at least one letter, one number, and may include special characters"
        )
        .when([], {
          is: () => !selectedRow?._id,
          then: (schema) => schema.required("Password is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      is_create_stream: Yup.boolean()
        .required("This field is required")
        .typeError("Please select a valid option"),

      is_access_trade_ideas: Yup.boolean(),
      is_access_trade_analysis: Yup.boolean(),

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

      role: Yup.string().required("Role is required"),
      educatorRole: Yup.string().required("Educator Speciality is required"),
      bio: Yup.string()
        .required("Educator bio is required")
        .min(30, "Bio must be at least 30 characters")
        .max(120, "Bio cannot exceed 120 characters"),
      description: Yup.string()
        .required("Educator long bio is required")
        .min(10, "Bio must be at least 30 characters")
        .max(500, "Bio cannot exceed 500 characters"),
      status: Yup.boolean().required("Status is required"),
      image: Yup.mixed().nullable(),
      icon: Yup.mixed().nullable(),
      // Trading fields - only required when NOT Digital Marketing
      // tradingStyle: Yup.array().nullable(),
      // tradingMethod: Yup.array().nullable(),
      // timeZone: Yup.array().nullable(),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      // onSubmit: async (values, { setStatus, setSubmitting }) => {
      //   const payload = {
      //     ...values,
      //   };

      //   if (selectedRow?._id) {
      //     payload.id = selectedRow?._id;
      //     delete payload.password;
      //   }

      //   try {
      //     if (selectedRow?._id) {
      //       await updateEducator(payload).unwrap();
      //       setSelectedRow({});

      //       refetch();
      //       toast.success("Educator updated successfully!");
      //     } else {
      //       await createEducator(payload).unwrap();
      //       refetch();
      //       toast.success("Educator created successfully!");
      //     }
      //     formik.resetForm();
      //     handleCloseCreate();
      //   } catch (err) {
      //     console.error("API Error:", err);
      //     const errorMessage =
      //       err?.data?.message || "An unexpected error occurred.";
      //     toast.error(errorMessage);
      //   }
      // },
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        try {
          const payload = { ...values };

          if (selectedRow?._id) {
            payload.id = selectedRow._id;
            // Only include password if admin explicitly chose to change it
            if (!changePassword || !payload.password) {
              delete payload.password;
            }
          }
          if (typeof payload.icon === "string") {
            delete payload.icon;
          }
          if (typeof payload.image === "string") {
            delete payload.image;
          }

          // Convert payload to FormData
          const formData = new FormData();

          for (const key in payload) {
            const value = payload[key];

            // If value is an array, append each item
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                // Handle files specifically
                if (item instanceof File || item?.file instanceof File) {
                  formData.append(`${key}[${index}]`, item.file || item);
                } else {
                  formData.append(`${key}[${index}]`, item);
                }
              });
            } else if (value instanceof File || value?.file instanceof File) {
              formData.append(key, value.file || value);
            } else {
              formData.append(key, value);
            }
          }
          console.log("FormData entries:", formData);

          // API call using FormData
          if (selectedRow?._id) {
            await updateEducator({
              formData: formData,
              id: selectedRow?._id,
            }).unwrap();
            toast.success("Educator updated successfully!");
          } else {
            await createEducator(formData).unwrap();
            toast.success("Educator created successfully!");
          }

          formik.resetForm();
          setChangePassword(false);

          handleCloseCreate();
          setSelectedRow({});
          refetch();
        } catch (err) {
          console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });

    // Check if any selected category is "Digital Marketing" or "E-commerce"
    const isDigitalMarketing = formik?.values?.categories?.some((catId) => {
      const cat = categoryList?.data?.find((c) => c._id === catId);
      const catName = cat?.name?.toLowerCase();
      return catName === "digital marketing" || catName === "digitalmarketing" || catName === "e-commerce" || catName === "ecommerce" || catName === "e commerce";
    });

    useEffect(() => {
      if (selectedRow?._id) {
        const initData = {
          first_name: selectedRow?.first_name,
          last_name: selectedRow?.last_name,
          email: selectedRow?.email,
          password: selectedRow?.password,
          role: "educator",
          status: selectedRow?.status,
          is_create_stream: selectedRow?.is_create_stream,
          is_access_trade_analysis: selectedRow?.is_access_trade_analysis,
          is_access_trade_ideas: selectedRow?.is_access_trade_ideas,
          image: selectedRow?.image || null,
          icon: selectedRow?.bannerImage || null,
          projectId: selectedRow?.projectId || null,
          categories: selectedRow?.categories?.map((cat) => cat._id) || [],
          educatorRole: selectedRow?.educatorRole || "",
          bio: selectedRow?.bio || "",
          description: selectedRow?.description || "",
          tradingStyle: selectedRow?.tradingStyle || [],
          tradingMethod: selectedRow?.tradingMethod || [],
          timeZone: selectedRow?.timeZone || [],
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    const togglePassword = (event) => {
      event.preventDefault();
      setPasswordVisible(!passwordVisible);
    };

    return (
      <Dialog
        open={isCreateOpen}
        onOpenChange={() => {
          formik.resetForm();
          setChangePassword(false);
          handleCloseCreate();
          setSelectedRow({});
        }}
      >
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[1200px]" ref={ref}>
          <DialogHeader className="pb-5 pt-0 px-0">
            <DialogTitle>
              {selectedRow?._id ? "Update Educator" : "Create Educator"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0 pb-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Profile Photo
                  </label>
                  <AvatarUpload
                    value={
                      formik.values.image
                        ? typeof formik.values.image === "string"
                          ? [{ dataURL: formik.values.image }] // URL from backend
                          : [
                            {
                              dataURL: URL.createObjectURL(
                                formik.values.image
                              ),
                            },
                          ] // Local file
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
              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Banner Photo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      formik.setFieldValue("icon", file);
                    }}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  />

                  {/* Preview */}
                  {formik.values.icon && (
                    <div className="mt-2">
                      <img
                        src={
                          typeof formik.values.icon === "string"
                            ? formik.values.icon // Backend se URL
                            : URL.createObjectURL(formik.values.icon) // Local file preview
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
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    First Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${formik.errors.first_name && formik.touched.first_name
                      ? "border border-danger"
                      : ""
                      }`}
                    {...formik.getFieldProps("first_name")}
                  />
                  {formik.touched.first_name && formik.errors.first_name && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.first_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Last Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${formik.errors.last_name && formik.touched.last_name
                      ? "border border-danger"
                      : ""
                      }`}
                    {...formik.getFieldProps("last_name")}
                  />
                  {formik.touched.last_name && formik.errors.last_name && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.last_name}
                    </span>
                  )}
                </div>
              </div>







              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Educator Speciality <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    // readOnly={selectedRow?._id}
                    placeholder="Enter Educator Speciality"
                    autoComplete="off"
                    {...formik.getFieldProps("educatorRole")}
                    className={`form-control input input-md w-full ${formik.errors.educatorRole && formik.touched.educatorRole
                      ? "border border-danger"
                      : ""
                      }`}
                  />
                  {formik.touched.educatorRole &&
                    formik.errors.educatorRole && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.educatorRole}
                      </span>
                    )}
                </div>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    readOnly={selectedRow?._id}
                    placeholder="Enter email"
                    autoComplete="off"
                    {...formik.getFieldProps("email")}
                    className={`form-control input input-md w-full ${formik.errors.email && formik.touched.email
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
              </div>
              {/* Password field - required on create, optional on edit */}
              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between min-h-[1.5rem]">
                    <label className="form-label text-gray-900 mb-0 leading-none">
                      Password
                      {!selectedRow?._id && <span className="text-danger ms-1">*</span>}
                    </label>
                    {selectedRow?._id && (
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer select-none whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={changePassword}
                          onChange={(e) => {
                            setChangePassword(e.target.checked);
                            if (!e.target.checked) {
                              formik.setFieldValue("password", "");
                            }
                          }}
                          className="form-checkbox h-3.5 w-3.5 rounded accent-primary"
                        />
                        Change Password
                      </label>
                    )}
                  </div>

                  {/* Show password input: always on create, only when toggled on edit */}
                  {(!selectedRow?._id || changePassword) && (
                    <>
                      <label className="input">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          autoComplete="off"
                          placeholder="Enter new password"
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
                    </>
                  )}

                  {selectedRow?._id && !changePassword && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                      Tick "Change Password" above to reset the educator's password.
                    </p>
                  )}
                </div>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Status <span className="text-danger">*</span>
                  </label>
                  <Select
                    defaultValue={formik.values.status}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value)
                    }
                    className={`form-control input input-md w-full ${formik.errors.status && formik.touched.status
                      ? "border border-danger"
                      : ""
                      }`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={"true"}>Active</SelectItem>
                      <SelectItem value={"false"}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Can create a stream ?<span className="text-danger">*</span>
                  </label>
                  <Select
                    defaultValue={formik.values.is_create_stream}
                    onValueChange={(value) =>
                      formik.setFieldValue("is_create_stream", value)
                    }
                    className={`form-control input input-md w-full 
                                ${formik.errors.is_create_stream &&
                        formik.touched.is_create_stream
                        ? "border border-danger"
                        : ""
                      }`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={true}>Yes</SelectItem>
                      <SelectItem value={false}>No</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.is_create_stream &&
                    formik.errors.is_create_stream && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.is_create_stream}
                      </span>
                    )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="form-label text-gray-900">Can access </label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="checkbox"
                      name="is_access_trade_ideas"
                      checked={formik.values.is_access_trade_ideas}
                      onChange={formik.handleChange}
                      className="form-checkbox h-5 w-5 text-primary"
                    />
                    IQ Ideas
                  </label>

                  <label className="flex items-center gap-2 text-gray-800">
                    <input
                      type="checkbox"
                      name="is_access_trade_analysis"
                      checked={formik.values.is_access_trade_analysis}
                      onChange={formik.handleChange}
                      className="form-checkbox h-5 w-5 text-primary"
                    />
                    IQ Insight
                  </label>
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    projectId <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    // readOnly={selectedRow?._id}
                    placeholder="Enter projectId of dyntube"
                    autoComplete="off"
                    {...formik.getFieldProps("projectId")}
                    className={`form-control input input-md w-full ${formik.errors.projectId && formik.touched.projectId
                      ? "border border-danger"
                      : ""
                      }`}
                  />
                  {formik.touched.projectId && formik.errors.projectId && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.projectId}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Category<span className="text-danger">*</span>
                  </label>

                  <Select
                    value={formik.values?.categories || []}
                    onValueChange={(value) => {
                      const prev = Array.isArray(formik.values?.categories)
                        ? formik.values.categories
                        : [];
                      if (prev.includes(value)) {
                        formik.setFieldValue(
                          "categories",
                          prev.filter((v) => v !== value)
                        );
                      } else {
                        formik.setFieldValue("categories", [...prev, value]);
                      }
                    }}
                    multiple
                  >
                    <SelectTrigger className="flex flex-wrap gap-1 min-h-[2.5rem] items-center">
                      {formik.values?.categories?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {formik.values.categories.map((id) => {
                            const cat = categoryList?.data?.find(
                              (c) => c._id === id
                            );
                            return (
                              <span
                                key={id}
                                className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs"
                              >
                                {cat?.name}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Select Category
                        </span>
                      )}
                    </SelectTrigger>

                    <SelectContent>
                      {categoryList?.data?.map((item) => (
                        <SelectItem
                          key={item?._id}
                          value={item?._id}
                          className={
                            formik.values?.categories?.includes(item._id)
                              ? "bg-blue-100 text-blue-700"
                              : ""
                          }
                        >
                          {item?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formik.touched?.categories && formik.errors?.categories && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors?.categories}
                    </span>
                  )}
                </div>
              </div>

              {/* Trading Type - Hidden for Digital Marketing */}
              {!isDigitalMarketing && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Trading Type<span className="text-danger">*</span>
                    </label>
                    <Popover open={isTradingTypeOpen} onOpenChange={setIsTradingTypeOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="min-w-56 w-full h-11 flex justify-between items-center border rounded-md px-3 py-2 "
                        >
                          <span className="truncate text-sm text-gray-700">
                            {(formik?.values?.tradingStyle || [])?.length > 0
                              ? `${(formik?.values?.tradingStyle || [])?.length} Trading Type(s) Selected`
                              : "Select Trading Type"}
                          </span>
                          <ChevronDown size={16} className="text-gray-500" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[495px] p-0" align="start" side="bottom">
                        <Command className="bg-white dark:bg-[#1c1f26]" shouldFilter={true}>
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No trading types found.</CommandEmpty>
                            <CommandGroup>
                              {tradingTypeOptions?.map((item) => {
                                const currentSelected = formik?.values?.tradingStyle || [];
                                const selected = currentSelected?.includes(item?.value);
                                return (
                                  <CommandItem
                                    key={item?.value}
                                    value={item?.label}
                                    onPointerDown={(e) => {
                                      e?.preventDefault();
                                      e?.stopPropagation();

                                      const updated = selected
                                        ? currentSelected?.filter((v) => v !== item?.value)
                                        : [...currentSelected, item?.value];

                                      formik.setFieldValue("tradingStyle", updated);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/5 pointer-events-auto"
                                  >
                                    <div
                                      className={cn(
                                        "h-4 w-4 border rounded flex items-center justify-center transition-all",
                                        selected
                                          ? "bg-indigo-600 border-indigo-600 text-white"
                                          : "bg-transparent border-gray-300 dark:border-gray-600"
                                      )}
                                    >
                                      {selected && <Check size={14} className="stroke-[3]" />}
                                    </div>
                                    <span className={cn(
                                      "capitalize transition-colors",
                                      selected ? "text-indigo-600 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-700"
                                    )}>
                                      {item?.label}
                                    </span>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {formik.touched?.tradingStyle && formik.errors?.tradingStyle && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors?.tradingStyle}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Trading Methods - Hidden for Digital Marketing */}
              {!isDigitalMarketing && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Trading Methods<span className="text-danger">*</span>
                    </label>
                    <Popover open={isTradingMethodOpen} onOpenChange={setIsTradingMethodOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="min-w-56 w-full h-11 flex justify-between items-center border rounded-md px-3 py-2 "
                        >
                          <span className="truncate text-sm text-gray-700">
                            {(formik?.values?.tradingMethod || [])?.length > 0
                              ? `${(formik?.values?.tradingMethod || [])?.length} Trading Method(s) Selected`
                              : "Select Trading Methods"}
                          </span>
                          <ChevronDown size={16} className="text-gray-500" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[495px] p-0" align="start" side="bottom">
                        <Command className="bg-white dark:bg-[#1c1f26]" shouldFilter={true}>
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No trading methods found.</CommandEmpty>
                            <CommandGroup>
                              {tradingMethodOptions?.map((item) => {
                                const currentSelected = formik?.values?.tradingMethod || [];
                                const selected = currentSelected?.includes(item?.value);
                                return (
                                  <CommandItem
                                    key={item?.value}
                                    value={item?.label}
                                    onPointerDown={(e) => {
                                      e?.preventDefault();
                                      e?.stopPropagation();

                                      const updated = selected
                                        ? currentSelected?.filter((v) => v !== item?.value)
                                        : [...currentSelected, item?.value];

                                      formik.setFieldValue("tradingMethod", updated);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/5 pointer-events-auto"
                                  >
                                    <div
                                      className={cn(
                                        "h-4 w-4 border rounded flex items-center justify-center transition-all",
                                        selected
                                          ? "bg-indigo-600 border-indigo-600 text-white"
                                          : "bg-transparent border-gray-300 dark:border-gray-600"
                                      )}
                                    >
                                      {selected && <Check size={14} className="stroke-[3]" />}
                                    </div>
                                    <span className={cn(
                                      "capitalize transition-colors",
                                      selected ? "text-indigo-600 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-700"
                                    )}>
                                      {item?.label}
                                    </span>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {formik.touched?.tradingMethod && formik.errors?.tradingMethod && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors?.tradingMethod}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* TimeZone - Hidden for Digital Marketing */}
              {!isDigitalMarketing && (
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      TimeZone<span className="text-danger">*</span>
                    </label>
                    <Popover open={isTimeZoneOpen} onOpenChange={setIsTimeZoneOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="min-w-56 w-full h-11 flex justify-between items-center border rounded-md px-3 py-2 "
                        >
                          <span className="truncate text-sm text-gray-700">
                            {(formik?.values?.timeZone || [])?.length > 0
                              ? `${(formik?.values?.timeZone || [])?.length} TimeZone(s) Selected`
                              : "Select TimeZone"}
                          </span>
                          <ChevronDown size={16} className="text-gray-500" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[495px] p-0" align="start" side="bottom">
                        <Command className="bg-white dark:bg-[#1c1f26]" shouldFilter={true}>
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No timezones found.</CommandEmpty>
                            <CommandGroup>
                              {timeZoneOptions?.map((item) => {
                                const currentSelected = formik?.values?.timeZone || [];
                                const selected = currentSelected?.includes(item?.value);
                                return (
                                  <CommandItem
                                    key={item?.value}
                                    value={item?.label}
                                    onPointerDown={(e) => {
                                      e?.preventDefault();
                                      e?.stopPropagation();

                                      const updated = selected
                                        ? currentSelected?.filter((v) => v !== item?.value)
                                        : [...currentSelected, item?.value];

                                      formik.setFieldValue("timeZone", updated);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-white/5 pointer-events-auto"
                                  >
                                    <div
                                      className={cn(
                                        "h-4 w-4 border rounded flex items-center justify-center transition-all",
                                        selected
                                          ? "bg-indigo-600 border-indigo-600 text-white"
                                          : "bg-transparent border-gray-300 dark:border-gray-600"
                                      )}
                                    >
                                      {selected && <Check size={14} className="stroke-[3]" />}
                                    </div>
                                    <span className={cn(
                                      "capitalize transition-colors",
                                      selected ? "text-indigo-600 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-700"
                                    )}>
                                      {item?.label}
                                    </span>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {formik.touched?.timeZone && formik.errors?.timeZone && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors?.timeZone}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="col-span-12 md:col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Profile Bio<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter profile bio"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${formik.errors.bio && formik.touched.bio
                      ? "border border-danger"
                      : ""
                      }`}
                    {...formik.getFieldProps("bio")}
                  />
                  {formik.touched.bio && formik.errors.bio && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.bio}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Trading Card Bio<span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    content={formik.values.description}
                    onChange={(value) =>
                      formik.setFieldValue("description", value)
                    }
                    onBlur={() => formik.setFieldTouched("description", false)}
                    theme="snow"
                    touched={formik.touched.description}
                    error={formik.errors.description}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <span className="text-danger text-xs mt-1">
                      {formik.errors.description}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-gray-200 border-t justify-end pt-5 rounded-b dark:border-gray-200 gap-3">
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

export default CreateEducator;
