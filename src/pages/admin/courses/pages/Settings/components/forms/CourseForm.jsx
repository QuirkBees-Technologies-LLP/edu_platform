import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import {
  useGetCoursesTypesQuery,
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
import { languages } from "eslint-plugin-prettier";

// Categories for the course
const COURSE_CATEGORIES = [
  "Programming",
  "Finance",
  "Development",
  "Design",
  "Business",
  "Marketing",
  "Language",
  "Science",
  "Art",
  "Music",
];

// Schema for course validation
const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageFile: z
    .instanceof(File, { message: "Course thumbnail is required" })
    .refine((file) => file && file.size > 0, {
      message: "Please select a valid course thumbnail image",
    }),
  category: z.string().min(1, "Please select a category"),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tier: z.enum(["FREE", "PREMIUM"], {
    required_error: "Please select a tier",
  }),
  section: z.string().min(1, "Please select a course type"),
  language: z.string().min(1, "Please select a course language"),
});

const editCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageFile: z
    .instanceof(File, { message: "Course thumbnail is required" })
    .optional()
    .refine(
      (file) => {
        // If no file is provided, it's valid (for edit mode with existing image)
        if (!file) return true;
        // If file is provided, it must have content
        return file.size > 0;
      },
      {
        message: "Please select a valid course thumbnail image",
      }
    ),
  category: z.string().min(1, "Please select a category"),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tier: z.enum(["FREE", "PREMIUM"], {
    required_error: "Please select a tier",
  }),
  section: z.string().min(1, "Please select a course type"),
  language: z.string().min(1, "Please select a course language"),
});

const CourseForm = ({ onSubmit, initialData, isLoading }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData?.imageUrl || null
  );
  const [currentImageFile, setCurrentImageFile] = useState(null);
  const { data } = useGetEducatorAcademyCategoryQuery();
  const { data: languagesList } = useGetLanguageListQuery();
  const { data: courseTypesList } = useGetCoursesTypesQuery();

  // Choose schema based on whether we're editing or creating
  const courseSchema = initialData ? editCourseSchema : createCourseSchema;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      imageFile: undefined,
      category: "",
      published: false,
      isFeatured: false,
      section: "",
      language: "",
      tier: "FREE",
    },
  });

  useEffect(() => {
    if (initialData) {
      if (initialData.imageUrl) {
        setThumbnailPreview(initialData.imageUrl);
        // setValue("imageFile", initialData.imageUrl);
      }
      if (initialData.category?._id) {
        setValue("category", initialData.category._id);
      }
    }
  }, [initialData, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentImageFile(file);
      setValue("imageFile", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedTier = watch("tier");
  const selectedSection = watch("section");
  const selectedLanguage = watch("language");
  const submitHandler = async (data) => {
    const formData = new FormData();

    // Append all regular fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("published", data.published);
    formData.append("isFeatured", data.isFeatured);
    formData.append("tier", data.tier);
    formData.append("section", data.section);
    formData.append("language", data.language);

    // Handle image file - required for new courses, optional for edits with existing image
    if (data.imageFile instanceof File && data.imageFile.size > 0) {
      formData.append("imageUrl", data.imageFile);
    } else if (!initialData?.imageUrl) {
      // Only require image for new courses
      console.error("No valid image file provided for new course");
      return;
    }
    // If editing and no new image selected, keep existing image

    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="space-y-6"
      encType="multipart/form-data"
    >
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Course Title <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          id="title"
          type="text"
          className="form-control input input-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter course title"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description <span className="text-red-500 font-bold">*</span>
        </label>
        <textarea
          id="description"
          className="form-control input input-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm min-h-[100px]"
          placeholder="Enter course description"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Course Thumbnail <span className="text-red-500 font-bold">*</span>
        </label>

        <div className="flex flex-col space-y-2">
          <div className="relative w-full">
            <input
              type="file"
              id="thumbnail-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="thumbnail-upload"
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

        {/* Error message for thumbnail */}
        {errors.imageFile && (
          <p className="text-sm text-red-600 mt-2">
            {errors.imageFile.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="section"
            className="block text-sm font-medium text-gray-700"
          >
            Type of Course <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="section"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${errors.section ? "border border-danger" : ""}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypesList?.data?.length > 0 ? (
                    courseTypesList.data.map((type) => (
                      <SelectItem key={type._id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="null">
                      No types found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.section && (
            <p className="text-sm text-red-600">{errors.section.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700"
          >
            Course Language <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${errors.language ? "border border-danger" : ""}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {languagesList?.data?.length > 0 ? (
                    languagesList.data.map((lang) => (
                      <SelectItem key={lang._id} value={lang.name}>
                        {lang.name}
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
          {errors.language && (
            <p className="text-sm text-red-600">{errors.language.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${errors.category ? "border border-danger" : ""}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {data?.data?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tier"
            className="block text-sm font-medium text-gray-700"
          >
            Course Tier <span className="text-red-500 font-bold">*</span>
          </label>
          <Select
            defaultValue={selectedTier}
            onValueChange={(value) => setValue("tier", value)}
            className={`form-control input input-md w-full ${errors.tier && "border border-danger"}`}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="PREMIUM">Pro</SelectItem>
            </SelectContent>
          </Select>
          {errors.tier && (
            <p className="text-sm text-red-600">{errors.tier.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <label
            htmlFor="published"
            className="text-sm font-medium text-gray-700"
          >
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

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <label
            htmlFor="isFeatured"
            className="text-sm font-medium text-gray-700"
          >
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
          {initialData ? "Update Course" : "Create Course"}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
