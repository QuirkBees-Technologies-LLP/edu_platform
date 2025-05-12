import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import { useGetEducatorAcademyCategoryQuery } from "../../../../../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { da } from "@faker-js/faker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Adjust import path


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
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  category: z.string().min(1, "Please select a category"),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tier: z.enum(["FREE", "PRO"], {
    required_error: "Please select a tier",
  }),
});

const CourseForm = ({ onSubmit, initialData, isLoading }) => {
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const { data } = useGetEducatorAcademyCategoryQuery();
  console.log(initialData, "initialData");

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
      imageUrl: "",
      category: "",
      published: false,
      isFeatured: false,
      tier: "FREE",
    },
  });

  useEffect(() => {
    if (initialData && data?.data) {
      setValue("category", initialData.category?._id);
    }
  }, [initialData, data, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setValue("imageUrl", URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (e) => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const selectedTier = watch('tier');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Course Title
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
          Description
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
          Course Thumbnail
        </label>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="url"
              className="form-control input input-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="https://example.com/image.jpg"
              {...register("imageUrl", { onChange: handleUrlChange })}
            />
          </div>
          <div className="relative">
            <input
              type="file"
              id="thumbnail-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="thumbnail-upload"
              className="flex cursor-pointer items-center px-3 h-[40px] py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary-light text-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </label>
          </div>
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

        {errors.imageUrl && (
          <p className="text-sm text-red-600">{errors.imageUrl.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <Select defaultValue={initialData?.category?._id} onValueChange={(value) => setValue("category", value)} className={`form-control input input-md w-full ${errors.category && "border border-danger"}`}>
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
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tier"
            className="block text-sm font-medium text-gray-700"
          >
            Course Tier
          </label>
          <Select defaultValue={selectedTier} onValueChange={(value) => setValue("tier", value)} className={`form-control input input-md w-full ${errors.tier && "border border-danger"}`}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
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
