import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X as CloseIcon, Check, ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useGetAdminStrategiesQuery } from "../../../../store/api/admin/adminStrategyApiSlice";
import { useGetEducatorsQuery } from "../../../../store/api/admin/adminEducatorsApiSlice";
import {
    useGetEducatorAcademyCategoryQuery,
} from "../../../../store/api/educator/educatorAcademyCategoryApiSlice";
import TagInput from "@/components/ui/tagInput";

// Schema for strategy validation — matches new backend model
const strategySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    courses: z.array(z.string()).optional(),
    selectedEducators: z.array(z.string()).optional(),
    category: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    image: z
        .any()
        .refine(
            (file) => (file instanceof File && file?.size > 0) || (typeof file === 'string' && file?.length > 0),
            {
                message: "Strategy image is required",
            }
        ),
});

const StrategyForm = ({ onSubmit, initialData, isLoading }) => {
    console.log("initialData", initialData);
    const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isCourseOpen, setIsCourseOpen] = useState(false);
    const [isEducatorOpen, setIsEducatorOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    // Fetch strategies from RTK Query
    const { data: strategiesData, isLoading: strategiesLoading } = useGetAdminStrategiesQuery();
    const { data: educatorsData, isLoading: isEducatorsLoading, isFetching: isEducatorsFetching } = useGetEducatorsQuery({ limit: 100 });
    const { data: categories } = useGetEducatorAcademyCategoryQuery();

    const allCourses = strategiesData?.data || [];
    const coursesLoading = strategiesLoading;

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(strategySchema),
        defaultValues: initialData
            ? {
                title: initialData?.title || "",
                description: initialData?.description || "",
                courses: initialData?.courses?.map(c => typeof c === 'object' ? c?._id : c) || [],
                selectedEducators: initialData?.educators?.map(e => typeof e === 'object' ? e?._id : e) || [],
                category: initialData?.category?.map(c => typeof c === 'object' ? c?._id : c) || [],
                tags: initialData?.tags || [],
                image: initialData?.imageUrl || undefined,
            }
            : {
                title: "",
                description: "",
                selectedEducators: [],
                category: [],
                tags: [],
                courses: [],
                image: undefined,
            },
    });

    useEffect(() => {
        if (initialData) {
            if (initialData?.imageUrl) {
                setImagePreview(initialData?.imageUrl);
                setValue("image", initialData?.imageUrl);
            }

            // Set courses
            const backendCourses = initialData?.courses;
            if (backendCourses?.length > 0) {
                const courseIds = backendCourses?.map(c => typeof c === 'object' ? c?._id : c);
                setValue("courses", courseIds);
            }

            // Set educators
            const backendEducators = initialData?.educators || initialData?.selectedEducators;
            if (backendEducators?.length > 0) {
                const educatorIds = backendEducators?.map(e => typeof e === 'object' ? e?._id : e);
                setValue("selectedEducators", educatorIds);
            }

            // Set category
            const backendCategory = initialData?.category;
            if (backendCategory?.length > 0) {
                const categoryIds = backendCategory?.map(c => typeof c === 'object' ? c?._id : c);
                setValue("category", categoryIds);
            }

            // Set tags
            if (initialData?.tags) {
                let tagsArray = [];
                if (Array.isArray(initialData?.tags)) {
                    if (initialData?.tags?.length === 1 && typeof initialData?.tags?.[0] === 'string' && initialData?.tags?.[0]?.startsWith('[')) {
                        try {
                            tagsArray = JSON.parse(initialData?.tags?.[0]);
                        } catch (e) {
                            tagsArray = initialData?.tags;
                        }
                    } else {
                        tagsArray = initialData?.tags;
                    }
                } else if (typeof initialData?.tags === 'string') {
                    try {
                        const parsed = JSON.parse(initialData?.tags);
                        tagsArray = Array.isArray(parsed) ? parsed : [initialData?.tags];
                    } catch (e) {
                        tagsArray = initialData?.tags?.split(',')?.map(tag => tag?.trim());
                    }
                }
                setValue("tags", tagsArray);
            }
        }
    }, [initialData, categories, setValue]);

    const handleFileChange = (e) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setValue("image", file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFile = () => {
        setValue("image", undefined, { shouldValidate: true });
        setImagePreview(null);
    };

    const submitHandler = async (values) => {
        setIsSubmitting(true);
        setUploadProgress(0);

        // Start fake progress animation
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    return prev; // Stop at 90% until actual completion
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            const formData = new FormData();

            formData.append("title", values?.title);
            formData.append("description", values?.description);

            // Append courses array
            values?.courses?.forEach((courseId) => {
                formData.append("courses", courseId);
            });

            // Append educators
            values?.selectedEducators?.forEach((educatorId) => {
                formData.append("educators", educatorId);
            });

            // Append category
            values?.category?.forEach((categoryId) => {
                formData.append("category", categoryId);
            });

            // Append tags
            formData.append("tags", JSON.stringify(values?.tags || []));

            // Append image file
            if (values?.image instanceof File) {
                formData.append("image", values?.image);
            }

            await onSubmit?.(formData);
            setUploadProgress(100); // Complete on success
        } finally {
            clearInterval(progressInterval);
            setTimeout(() => {
                setIsSubmitting(false);
                setUploadProgress(0);
            }, 500); // Brief delay to show 100%
        }
    };



    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6 py-6 rounded-2xl" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Strategy Title <span className="text-rose-500">*</span></label>
                        <input
                            {...register("title")}
                            className="w-full dark:bg-[#1a1c23] border rounded-lg px-4 py-2.5 text-gray-700 placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder="Enter Strategy Title"
                        />
                        {errors?.title && <p className="text-xs text-rose-500 mt-1">{errors?.title?.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Description <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register("description")}
                            className="w-full dark:bg-[#1a1c23] border rounded-lg px-4 py-2.5 text-gray-700 placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all min-h-[120px]"
                            placeholder="Enter strategy description..."
                        />
                        {errors?.description && <p className="text-xs text-rose-500 mt-1">{errors?.description?.message}</p>}
                    </div>

                    {/* Educators Multi-Select */}
                    <div className="space-y-2 relative">
                        <label className="block text-sm font-medium text-gray-700">Select Educators</label>
                        <Popover open={isEducatorOpen} onOpenChange={setIsEducatorOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="min-w-56 w-full h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]"
                                >
                                    <span className="truncate text-sm text-gray-700 ">
                                        {(watch("selectedEducators") || [])?.length > 0
                                            ? `${(watch("selectedEducators") || [])?.length} Educators Selected`
                                            : "Select Educators"}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-500" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[524px] p-0 pointer-events-auto" align="start" side="bottom">
                                <Command className="bg-white dark:bg-[#1c1f26]" shouldFilter={true}>
                                    <CommandList
                                        className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                                        style={{ maxHeight: '300px', overflowY: 'auto', pointerEvents: 'auto' }}
                                    >
                                        <CommandGroup>
                                            {(isEducatorsLoading || isEducatorsFetching) ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                    <span className="ml-2 text-sm text-gray-500">Loading educators...</span>
                                                </div>
                                            ) : educatorsData?.data?.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-gray-500">
                                                    No educators found.
                                                </div>
                                            ) : (
                                                educatorsData?.data?.map((item) => {
                                                    const currentSelected = watch("selectedEducators") || [];
                                                    const selected = currentSelected?.includes(item?._id);
                                                    return (
                                                        <CommandItem
                                                            key={item?._id}
                                                            value={`${item?.first_name} ${item?.last_name}`}
                                                            onPointerDown={(e) => {
                                                                e?.preventDefault();
                                                                e?.stopPropagation();

                                                                const updated = selected
                                                                    ? currentSelected?.filter((id) => id !== item?._id)
                                                                    : [...currentSelected, item?._id];

                                                                setValue("selectedEducators", updated, { shouldValidate: true });
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
                                                                "text-sm capitalize transition-colors",
                                                                selected ? "text-indigo-600 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-700"
                                                            )}>
                                                                {item?.first_name} {item?.last_name}
                                                            </span>
                                                        </CommandItem>
                                                    );
                                                })
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Selected Educators Chips */}
                        {
                            (watch("selectedEducators") || [])?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(watch("selectedEducators") || [])?.map((educatorId) => {
                                        const educator = educatorsData?.data?.find((e) => e?._id === educatorId);
                                        if (!educator) return null;
                                        return (
                                            <span
                                                key={educatorId}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                                            >
                                                {educator?.first_name} {educator?.last_name}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = (watch("selectedEducators") || [])?.filter((id) => id !== educatorId);
                                                        setValue("selectedEducators", updated, { shouldValidate: true });
                                                    }}
                                                    className="hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-full p-0.5 transition-colors"
                                                >
                                                    <CloseIcon className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )
                        }

                        {errors?.selectedEducators && <p className="text-xs text-rose-500 mt-1">{errors?.selectedEducators?.message}</p>}
                    </div>

                    {/* Courses Dropdown (Multi-select) */}
                    <div className="space-y-2 relative">
                        <label className="block text-sm font-medium text-gray-700">Select Strategy</label>
                        <Popover open={isCourseOpen} onOpenChange={setIsCourseOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="min-w-56 w-full h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]"
                                >
                                    <span className="truncate text-sm text-gray-700 ">
                                        {(watch("courses") || [])?.length > 0
                                            ? `${(watch("courses") || [])?.length} Strategy Selected`
                                            : "Select Strategy"}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-500" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[524px] p-0 pointer-events-auto" align="start" side="bottom">
                                <Command className="bg-white dark:bg-[#1c1f26]" shouldFilter={true}>
                                    <CommandList
                                        className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                                        style={{ maxHeight: '300px', overflowY: 'auto', pointerEvents: 'auto' }}
                                    >
                                        <CommandGroup>
                                            {coursesLoading ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                    <span className="ml-2 text-sm text-gray-500">Loading Strategy...</span>
                                                </div>
                                            ) : allCourses?.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-gray-500">
                                                    No Strategy found.
                                                </div>
                                            ) : (
                                                allCourses?.map((item) => {
                                                    const currentSelected = watch("courses") || [];
                                                    const selected = currentSelected?.includes(item?._id);
                                                    return (
                                                        <CommandItem
                                                            key={item?._id}
                                                            value={item?.title}
                                                            onPointerDown={(e) => {
                                                                e?.preventDefault();
                                                                e?.stopPropagation();

                                                                const updated = selected
                                                                    ? currentSelected?.filter((id) => id !== item?._id)
                                                                    : [...currentSelected, item?._id];

                                                                setValue("courses", updated, { shouldValidate: true });
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
                                                                "text-sm capitalize transition-colors",
                                                                selected ? "text-indigo-600 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-700"
                                                            )}>
                                                                {item?.title}
                                                            </span>
                                                        </CommandItem>
                                                    );
                                                })
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Selected Courses Chips */}
                        {
                            (watch("courses") || [])?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(watch("courses") || [])?.map((courseId) => {
                                        const course = allCourses?.find((c) => c?._id === courseId);
                                        if (!course) return null;
                                        return (
                                            <span
                                                key={courseId}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                                            >
                                                {course?.title}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = (watch("courses") || [])?.filter((id) => id !== courseId);
                                                        setValue("courses", updated, { shouldValidate: true });
                                                    }}
                                                    className="hover:bg-indigo-200 dark:hover:bg-indigo-500/30 rounded-full p-0.5 transition-colors"
                                                >
                                                    <CloseIcon className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )
                        }

                        {errors?.courses && <p className="text-xs text-rose-500 mt-1">{errors?.courses?.message}</p>}
                    </div>
                </div>

                {/* Media & Courses */}
                <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Strategy Image <span className="text-rose-500">*</span></label>
                        <div className="relative group border-2 border-dashed rounded-xl p-4 transition-all hover:border-indigo-500/50">
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={(e) => { e?.stopPropagation(); removeFile(); }}
                                    className="absolute top-2 right-2 z-20 p-1.5 bg-rose-500/90 text-white rounded-lg hover:bg-rose-600 transition-all shadow-lg backdrop-blur-sm"
                                >
                                    <CloseIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            {imagePreview ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Strategy" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <Upload className="text-white w-6 h-6" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 space-y-3 text-gray-500">
                                    <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-semibold">Upload Strategy Image</span>
                                    <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</span>
                                </div>
                            )}
                        </div>
                        {errors?.image && <p className="text-xs text-rose-500 mt-1">{errors?.image?.message}</p>}
                    </div>

                    {/* Category Multi-Select */}
                    <div className="space-y-2 relative">
                        <label className="block text-sm font-medium text-gray-700">Select Category</label>
                        <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="min-w-56 w-full h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]"
                                >
                                    <span className="truncate text-sm text-gray-700 ">
                                        {(watch("category") || [])?.length > 0
                                            ? `${(watch("category") || [])?.length} Category Selected`
                                            : "Select Category"}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-500" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[524px] p-0 pointer-events-auto" align="start" side="bottom">
                                <Command className="bg-white dark:bg-[#1c1f26]" shouldFilter={true}>
                                    <CommandList
                                        className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                                        style={{ maxHeight: '300px', overflowY: 'auto', pointerEvents: 'auto' }}
                                    >
                                        <CommandGroup>
                                            {!categories?.data ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                    <span className="ml-2 text-sm text-gray-500">Loading categories...</span>
                                                </div>
                                            ) : categories?.data?.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-gray-500">
                                                    No categories found.
                                                </div>
                                            ) : (
                                                categories?.data?.map((item) => {
                                                    const currentSelected = watch("category") || [];
                                                    const selected = currentSelected?.includes(item?._id);
                                                    return (
                                                        <CommandItem
                                                            key={item?._id}
                                                            value={item?.name}
                                                            onPointerDown={(e) => {
                                                                e?.preventDefault();
                                                                e?.stopPropagation();

                                                                const updated = selected
                                                                    ? currentSelected?.filter((id) => id !== item?._id)
                                                                    : [...currentSelected, item?._id];

                                                                setValue("category", updated, { shouldValidate: true });
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
                                                                "text-sm capitalize transition-colors",
                                                                selected ? "text-indigo-600 dark:text-white font-semibold" : "text-gray-700 dark:text-gray-700"
                                                            )}>
                                                                {item?.name}
                                                            </span>
                                                        </CommandItem>
                                                    );
                                                })
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Selected Category Chips */}
                        {
                            (watch("category") || [])?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(watch("category") || [])?.map((categoryId) => {
                                        const category = categories?.data?.find((c) => c?._id === categoryId);
                                        if (!category) return null;
                                        return (
                                            <span
                                                key={categoryId}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30"
                                            >
                                                {category?.name}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = (watch("category") || [])?.filter((id) => id !== categoryId);
                                                        setValue("category", updated, { shouldValidate: true });
                                                    }}
                                                    className="hover:bg-violet-200 dark:hover:bg-violet-500/30 rounded-full p-0.5 transition-colors"
                                                >
                                                    <CloseIcon className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )
                        }

                        {errors?.category && <p className="text-xs text-rose-500 mt-1">{errors?.category?.message}</p>}
                    </div>

                    {/* Tags Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <TagInput
                                    value={field?.value || []}
                                    onChange={field?.onChange}
                                    touched={!!errors?.tags}
                                    error={errors?.tags?.message}
                                />
                            )}
                        />
                        {errors?.tags && <p className="text-xs text-rose-500 mt-1">{errors?.tags?.message}</p>}
                    </div>
                </div>
            </div>



            {/* Submit Actions */}
            < div className="flex justify-end gap-5 pt-8 mt-2 border-t " >
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 h-[40px] py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary-light text-primary hover:bg-primary hover:text-white min-w-[140px] justify-center"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{Math.min(Math.round(uploadProgress), 100)}%</span>
                        </>
                    ) : (
                        initialData ? "Update Strategy" : "Save Strategy"
                    )}
                </button>
            </div >
        </form >
    );
};

export default StrategyForm;
