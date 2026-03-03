import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X as CloseIcon, Check, ChevronDown } from "lucide-react";
import {
    useGetEducatorAcademyCategoryQuery,
    useGetLanguageListQuery,
} from "../../../../../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { useGetEducatorsQuery } from "../../../../../../../store/api/admin/adminEducatorsApiSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TagInput from "@/components/ui/tagInput";

// Schema for strategy validation
const strategySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    aboutStrategy: z.string().min(10, "About Strategy  must be at least 10 characters"),
    selectedEducators: z.array(z.string()).min(1, "Please select at least one educator"),
    iconThumbnail: z
        .any()
        .refine(
            (file) => (file instanceof File && file.size > 0) || (typeof file === 'string' && file.length > 0),
            {
                message: "Strategy icon thumbnail is required",
            }
        ),
    // strategyBanner: z
    //     .any()
    //     .refine(
    //         (file) => (file instanceof File && file.size > 0) || (typeof file === 'string' && file.length > 0),
    //         {
    //             message: "Strategy banner is required",
    //         }
    //     ),
    category: z.string().min(1, "Please select a category"),
    tags: z.array(z.string()).optional(),
    published: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    tier: z.enum(["FREE", "PREMIUM"], {
        required_error: "Please select a tier",
    }),
    section: z.string().min(1, "Please select a type"),
    language: z.string().min(1, "Please select a language"),
    isStrategy: z.boolean().default(true),
});

const StrategyForm = ({ onSubmit, initialData, isLoading }) => {
    const [iconPreview, setIconPreview] = useState(initialData?.iconThumbnail || null);
    // const [bannerPreview, setBannerPreview] = useState(initialData?.strategyBanner || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [isEducatorOpen, setIsEducatorOpen] = useState(false);

    const { data: languagesList } = useGetLanguageListQuery();
    const { data: categories } = useGetEducatorAcademyCategoryQuery();
    const { data: educatorsData, isLoading: isEducatorsLoading, isFetching: isEducatorsFetching } = useGetEducatorsQuery({ limit: 100 });

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
        defaultValues: initialData || {
            title: "",
            description: "",
            aboutStrategy: "",
            selectedEducators: [],
            iconThumbnail: undefined,
            // strategyBanner: undefined,
            category: "",
            tags: [],
            published: false,
            isFeatured: false,
            section: "Strategy",
            language: "",
            tier: "FREE",
            isStrategy: true,
        },
    });


    useEffect(() => {
        if (initialData) {
            // console.log(initialData);

            // console.log(initialData?.strategyBanner);
            // console.log(initialData?.imageUrl);

            // Backend strategyBanner is the Icon, imageUrl is the Banner
            if (initialData?.imageUrl) {
                setIconPreview(initialData?.imageUrl);
                setValue("iconThumbnail", initialData?.imageUrl);
            }
            // if (initialData?.strategyBanner) {
            //     setBannerPreview(initialData?.strategyBanner);
            //     setValue("iconThumbnail", initialData?.strategyBanner);
            // }

            if (initialData?.category?._id && categories?.data?.length > 0) {
                setValue("category", initialData?.category?._id);
            }

            // Backend sends 'educators', frontend uses 'selectedEducators'
            const backendEducators = initialData?.educators || initialData?.selectedEducators;
            if (backendEducators?.length > 0) {
                const educatorIds = backendEducators?.map(e => typeof e === 'object' ? e?._id : e);
                setValue("selectedEducators", educatorIds);
            }

            // Improved tag parsing for various backend formats
            if (initialData?.tags) {
                let tagsArray = [];
                if (Array.isArray(initialData?.tags)) {
                    // Check if the array contains a stringified version of another array
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

    const handleFileChange = (e, field) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setValue(field, file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === "iconThumbnail") setIconPreview(reader?.result);
                // if (field === "strategyBanner") setBannerPreview(reader?.result);
            };
            reader.readAsDataURL(file);
        }
    };



    const removeFile = (field) => {
        setValue(field, undefined, { shouldValidate: true });
        if (field === "iconThumbnail") setIconPreview(null);
        // if (field === "strategyBanner") setBannerPreview(null);
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

            [
                "title", "description", "aboutStrategy", "category", "published",
                "isFeatured", "tier", "section", "language", "isStrategy"
            ].forEach(key => {
                formData.append(key, values?.[key]);
            });

            formData.append("educators", JSON.stringify(values?.selectedEducators));
            formData.append("tags", JSON.stringify(values?.tags));
            formData.append("isStrategies", true);

            if (values?.iconThumbnail instanceof File) formData.append("icon", values?.iconThumbnail);
            // if (values?.strategyBanner instanceof File) formData.append("image", values?.strategyBanner);

            await onSubmit(formData);
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
                        <label className="block text-sm font-medium text-gray-700">Short Description <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register("description")}
                            className="w-full dark:bg-[#1a1c23] border rounded-lg px-4 py-2.5 text-gray-700 placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all min-h-[45px]"
                            placeholder="Enter short description..."
                        />
                        {errors?.description && <p className="text-xs text-rose-500 mt-1">{errors?.description?.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">About Strategy <span className="text-rose-500">*</span></label>
                        <textarea
                            {...register("aboutStrategy")}
                            className="w-full dark:bg-[#1a1c23] border rounded-lg px-4 py-2.5 text-gray-700 placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all min-h-[120px]"
                            placeholder="Enter about strategy..."
                        />
                        {errors?.aboutStrategy && <p className="text-xs text-rose-500 mt-1">{errors?.aboutStrategy?.message}</p>}
                    </div>
                </div>

                {/* Media & Configuration */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Icon Thumbnail <span className="text-rose-500">*</span></label>
                            <div className="relative group border-2 border-dashed  rounded-xl p-4 transition-all hover:border-indigo-500/50 /30">
                                {iconPreview && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e?.stopPropagation(); removeFile("iconThumbnail"); }}
                                        className="absolute top-2 right-2 z-20 p-1.5 bg-rose-500/90 text-gray-700 rounded-lg hover:bg-rose-600 transition-all shadow-lg backdrop-blur-sm"
                                    >
                                        <CloseIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleFileChange(e, "iconThumbnail")}
                                    accept="image/*"
                                />
                                {iconPreview ? (
                                    <div className="relative aspect-square rounded-lg overflow-hidden">
                                        <img src={iconPreview} className="w-full h-full object-cover" alt="Icon" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <Upload className="text-gray-700 w-6 h-6" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 space-y-3 text-gray-500">
                                        <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold">Upload Icon</span>
                                    </div>
                                )}
                            </div>
                            {errors?.iconThumbnail && <p className="text-xs text-rose-500 mt-1">{errors?.iconThumbnail?.message}</p>}
                        </div>

                        {/* <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Strategy Banner <span className="text-rose-500">*</span></label>
                            <div className="relative group border-2 border-dashed  rounded-xl p-4 transition-all hover:border-indigo-500/50 /30 text-center">
                                {bannerPreview && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e?.stopPropagation(); removeFile("strategyBanner"); }}
                                        className="absolute top-2 right-2 z-20 p-1.5 bg-rose-500/90 text-gray-700 rounded-lg hover:bg-rose-600 transition-all shadow-lg backdrop-blur-sm"
                                    >
                                        <CloseIcon className="w-3.5 h-3.5" />
                                    </button>

                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleFileChange(e, "strategyBanner")}
                                    accept="image/*"
                                />
                                {bannerPreview ? (
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <Upload className="text-gray-700 w-6 h-6" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 space-y-3 text-gray-500 h-full">
                                        <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold">Upload Banner</span>
                                    </div>
                                )}
                            </div>
                            {errors?.strategyBanner && <p className="text-xs text-rose-500 mt-1">{errors?.strategyBanner?.message}</p>}
                        </div> */}
                    </div>

                    {/* Educators Dropdown (Multi-select) */}
                    <div className="space-y-2 relative">
                        <label className="block text-sm font-medium text-gray-700">Select Educators <span className="text-rose-500">*</span></label>
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
                                                            // Using onPointerDown to bypass potential cmdk focus issues
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
                        {errors?.selectedEducators && <p className="text-xs text-rose-500 mt-1">{errors?.selectedEducators?.message}</p>}
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

            {/* Selects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t  pt-8 mt-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Language <span className="text-rose-500">*</span></label>
                    <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                            <Select value={field?.value} onValueChange={field?.onChange}>
                                <SelectTrigger className="w-full   text-gray-700 rounded-lg h-11">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent className="  text-gray-700">
                                    {languagesList?.data?.map((lang) => (
                                        <SelectItem key={lang?._id} value={lang?.name} className="focus:bg-indigo-600 focus:text-gray-700">{lang?.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors?.language && <p className="text-xs text-rose-500 mt-1">{errors?.language?.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category <span className="text-rose-500">*</span></label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select value={field?.value} onValueChange={field?.onChange}>
                                <SelectTrigger className="w-full   text-gray-700 rounded-lg h-11">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="  text-gray-700">
                                    {categories?.data?.map((item) => (
                                        <SelectItem key={item?._id} value={item?._id} className="focus:bg-indigo-600 focus:text-gray-700">{item?.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors?.category && <p className="text-xs text-rose-500 mt-1">{errors?.category?.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tier <span className="text-rose-500">*</span></label>
                    <Controller
                        name="tier"
                        control={control}
                        render={({ field }) => (
                            <Select value={field?.value} onValueChange={field?.onChange}>
                                <SelectTrigger className="w-full   text-gray-700 rounded-lg h-11">
                                    <SelectValue placeholder="Select Tier" />
                                </SelectTrigger>
                                <SelectContent className="  text-gray-700">
                                    <SelectItem value="FREE" className="focus:bg-indigo-600 focus:text-gray-700">Free</SelectItem>
                                    <SelectItem value="PREMIUM" className="focus:bg-indigo-600 focus:text-gray-700">Pro</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors?.tier && <p className="text-xs text-rose-500 mt-1">{errors?.tier?.message}</p>}
                </div>
            </div>

            {/* Toggle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t  text-right">
                <div className=" border  p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                    <div className="text-left space-y-1">
                        <label htmlFor="published" className="text-sm font-bold text-gray-700cursor-pointer">Publish Strategy</label>
                        <p className="text-xs text-gray-500">Visible to students immediately.</p>
                    </div>
                    <Controller
                        name="published"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="published"
                                checked={field?.value}
                                onCheckedChange={field?.onChange}
                                className="w-6 h-6 rounded-md  data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                        )}
                    />
                </div>

                <div className=" border  p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                    <div className="text-left space-y-1">
                        <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 cursor-pointer">Feature Strategy</label>
                        <p className="text-xs text-gray-500">Highlight on platform home.</p>
                    </div>
                    <Controller
                        name="isFeatured"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="isFeatured"
                                checked={field?.value}
                                onCheckedChange={field?.onChange}
                                className="w-6 h-6 rounded-md  data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                        )}
                    />
                </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-5 pt-8 mt-2 border-t ">
                <button
                    type="button"
                    onClick={() => reset()}
                    disabled={isSubmitting}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-light text-gray-700 hover:bg-gray-50 dark:hover:bg-dark"
                >
                    Reset
                </button>
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
            </div>
        </form>
    );
};

export default StrategyForm;
