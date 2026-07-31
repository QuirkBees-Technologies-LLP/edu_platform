import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import {
  useGetEducatorAcademyCategoryQuery,
  useGetLanguageListQuery,
} from "../../../../../../../store/api/educator/educatorAcademyCategoryApiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Validation Schemas ────────────────────────────────────────────────────
const createAcademySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageFile: z
    .instanceof(File, { message: "Academy thumbnail is required" })
    .refine((file) => file && file.size > 0, {
      message: "Please select a valid academy thumbnail image",
    }),
  category: z.string().min(1, "Please select a category"),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tier: z.enum(["FREE", "PREMIUM"], {
    required_error: "Please select a tier",
  }),
  language: z.string().min(1, "Please select a language"),
});

const editAcademySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageFile: z
    .instanceof(File, { message: "Academy thumbnail is required" })
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        return file.size > 0;
      },
      { message: "Please select a valid academy thumbnail image" }
    ),
  category: z.string().min(1, "Please select a category"),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tier: z.enum(["FREE", "PREMIUM"], {
    required_error: "Please select a tier",
  }),
  language: z.string().min(1, "Please select a language"),
});

// ─── Component ─────────────────────────────────────────────────────────────
const AcademyForm = ({ onSubmit, initialData, isLoading }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData?.strategyBanner || initialData?.imageUrl || null
  );
  const [currentImageFile, setCurrentImageFile] = useState(null);

  // Always use 'IQ Academy' section — not shown in UI
  const ACADEMY_SECTION = "IQ Academy";

  const { data: languagesList } = useGetLanguageListQuery();
  const { data } = useGetEducatorAcademyCategoryQuery(ACADEMY_SECTION);

  // Choose schema based on create vs edit
  const academySchema = initialData ? editAcademySchema : createAcademySchema;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(academySchema),
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          description: initialData.description || "",
          imageFile: undefined,
          category: initialData?.category?._id || initialData?.category || "",
          published: initialData.published ?? false,
          isFeatured: initialData.isFeatured ?? false,
          language: initialData.language || "",
          tier: initialData.tier || "FREE",
        }
      : {
          title: "",
          description: "",
          imageFile: undefined,
          category: "",
          published: false,
          isFeatured: false,
          language: "",
          tier: "FREE",
        },
  });

  // ── Populate form on edit ───────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      if (initialData.strategyBanner) {
        setThumbnailPreview(initialData.strategyBanner);
      } else if (initialData.imageUrl) {
        setThumbnailPreview(initialData.imageUrl);
      }
      setValue("title", initialData.title || "");
      setValue("description", initialData.description || "");
      if (initialData.language && languagesList?.data?.length > 0) {
        setValue("language", initialData.language);
      }
      if (initialData.tier) {
        setValue("tier", initialData.tier);
      }
      setValue("published", initialData.published ?? false);
      setValue("isFeatured", initialData.isFeatured ?? false);
      if (initialData?.category?._id && data?.data?.length > 0) {
        setValue("category", initialData?.category?._id);
      }
    }
  }, [initialData, data, languagesList, setValue]);

  // ── File picker ────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentImageFile(file);
      setValue("imageFile", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const submitHandler = async (values) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("category", values.category);
    formData.append("published", values.published);
    formData.append("isFeatured", values.isFeatured);
    formData.append("tier", values.tier);
    formData.append("section", ACADEMY_SECTION); // always "IQ Academy"
    formData.append("language", values.language);

    // Academy-specific flags
    formData.append("isAcademy", true);
    formData.append("isMasterClass", false);
    formData.append("isStrategies", false);

    if (values.imageFile instanceof File && values.imageFile.size > 0) {
      formData.append("image", values.imageFile);
    } else if (!initialData?.strategyBanner && !initialData?.imageUrl) {
      console.error("No valid image file provided for new academy");
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-6"
      encType="multipart/form-data"
    >
      {/* ── Academy Title ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Academy Title <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          id="title"
          type="text"
          className="form-control input input-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter academy title"
          {...register("title")}
        />
        {errors?.title && (
          <p className="text-sm text-red-600">{errors?.title?.message}</p>
        )}
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500 font-bold">*</span>
        </label>
        <textarea
          id="description"
          className="form-control input input-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm min-h-[100px]"
          placeholder="Enter academy description"
          {...register("description")}
        />
        {errors?.description && (
          <p className="text-sm text-red-600">{errors?.description?.message}</p>
        )}
      </div>

      {/* ── Thumbnail ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Academy Thumbnail <span className="text-red-500 font-bold">*</span>
        </label>

        <div className="flex flex-col space-y-2">
          <div className="relative w-full">
            <input
              type="file"
              id="academy-thumbnail-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="academy-thumbnail-upload"
              className="flex cursor-pointer items-center justify-center w-full h-[40px] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary-light text-primary border border-gray-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              {thumbnailPreview ? "Change Image" : "Upload Image"}
            </label>
          </div>
          <p className="text-sm text-gray-500">
            {currentImageFile
              ? `Selected file: ${currentImageFile.name}`
              : "No file selected"}
          </p>
        </div>

        {thumbnailPreview && (
          <div className="mt-2">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="h-32 w-auto rounded-md object-cover"
            />
          </div>
        )}

        {errors?.imageFile && (
          <p className="text-sm text-red-600 mt-2">
            {errors?.imageFile?.message}
          </p>
        )}
      </div>

      {/* ── Language (full width — Type of Course removed for Academy) ── */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Course Language <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${
                  errors.language ? "border border-danger" : ""
                }`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {languagesList?.data?.length > 0 ? (
                    languagesList?.data?.map((lang) => (
                      <SelectItem key={lang?._id} value={lang?.name}>
                        {lang?.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="null">
                      No languages found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors?.language && (
            <p className="text-sm text-red-600">{errors?.language?.message}</p>
          )}
        </div>
      </div>

      {/* ── Category + Tier ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${
                  errors.category ? "border border-danger" : ""
                }`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {data?.data?.map((item) => (
                    <SelectItem key={item?._id} value={item?._id}>
                      {item?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors?.category && (
            <p className="text-sm text-red-600">{errors?.category?.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="tier" className="block text-sm font-medium text-gray-700">
            Course Tier <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="tier"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${
                  errors.tier && "border border-danger"
                }`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PREMIUM">Pro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors?.tier && (
            <p className="text-sm text-red-600">{errors?.tier?.message}</p>
          )}
        </div>
      </div>

      {/* ── Publish Course ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Publish Course
          </label>
          <p className="text-sm text-gray-500">
            Make this course available to students
          </p>
        </div>
        <Controller
          name="published"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="published"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {/* ── Feature Course ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
            Feature Course
          </label>
          <p className="text-sm text-gray-500">
            Highlight this course on the homepage
          </p>
        </div>
        <Controller
          name="isFeatured"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isFeatured"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => reset()}
          disabled={isLoading}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-light text-gray-700 hover:bg-gray-50 dark:hover:bg-dark"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-3 h-[40px] py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary-light text-primary hover:bg-primary hover:text-white"
        >
          {isLoading && (
            <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
          )}
          {initialData ? "Update Academy" : "Create Academy"}
        </button>
      </div>
    </form>
  );
};

export default AcademyForm;
