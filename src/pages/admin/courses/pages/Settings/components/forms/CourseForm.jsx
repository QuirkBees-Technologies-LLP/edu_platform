import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import { useGetEducatorAcademyCategoryQuery } from "../../../../../../../store/api/educator/educatorAcademyCategoryApiSlice";

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

  const {
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
          <select
            id="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("category")}
          >
            <option value="">Select a category</option>
            {/* {COURSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))} */}
            {data?.data?.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
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
          <select
            id="tier"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("tier")}
          >
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
          </select>
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
        <input
          id="published"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          {...register("published")}
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
        <input
          id="isFeatured"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          {...register("isFeatured")}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => reset()}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
