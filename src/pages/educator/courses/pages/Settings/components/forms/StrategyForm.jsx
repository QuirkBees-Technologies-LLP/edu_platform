import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X as CloseIcon, Check, ChevronDown } from "lucide-react";
import {
    useGetEducatorAcademyCategoryQuery,
    useGetLanguageListQuery,
    useGetCoursesTypesQuery,
} from "../../../../../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { useGetAdminStrategyListQuery } from "../../../../../../../store/api/client/clientStrategiesApiSlice";
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
import { useAuthContext } from "../../../../../../../auth/useAuthContext";


// Unified schema — all fields that were in either CourseForm or StrategyForm
const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    // Long Description (aboutStrategy) — optional, can be filled in later
    aboutStrategy: z.string().optional().nullable(),
    selectedStrategies: z.array(z.string()).optional(),
    strategyBanner: z
        .any()
        .optional()
        .nullable(),
    category: z.string().min(1, "Please select a category"),
    tags: z.array(z.string()).optional(),
    published: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    tier: z.string().default("FREE").optional(),
    section: z.string().optional().default("Masterclass"),
    language: z.string().min(1, "Please select a language"),
    isStrategy: z.boolean().default(true),
    isPaidMasterclass: z.boolean().default(false),
    // Controls isMasterClass flag — "masterclass" or "course"
    contentType: z.enum(["masterclass", "course"]).default("masterclass"),
});

const StrategyForm = ({ onSubmit, initialData, isLoading, isAdmin: isAdminProp }) => {
    const [bannerPreview, setBannerPreview] = useState(initialData?.strategyBanner || initialData?.imageUrl || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isStrategyOpen, setIsStrategyOpen] = useState(false);
    const [sectionSelect, setSectionSelect] = useState(initialData?.section || "IQ Academy");

    const { data: languagesList } = useGetLanguageListQuery();
    const { data: courseTypesList } = useGetCoursesTypesQuery();
    // Educators always fetch categories from "IQ Academy" regardless of stored section.
    // Admins use whichever section they've selected in the Type of Course dropdown.
    const categorySection = isAdminProp ? sectionSelect : "IQ Academy";
    const { data: categories } = useGetEducatorAcademyCategoryQuery(categorySection);
    const { data: strategiesData, isLoading: isStrategiesLoading, isFetching: isStrategiesFetching } = useGetAdminStrategyListQuery();

    const { auth } = useAuthContext();
    const educatorId = auth?.user?._id;

    // Determine admin status: use prop if provided, otherwise check auth context
    const isAdmin = isAdminProp !== undefined
        ? isAdminProp
        : (auth?.user?.role === "admin" || auth?.user?.role === "super_admin");

    // For educators: section is always "Masterclass" — they have no choice per the brief.
    // For admins: filter available course types (Fast Start restricted to admins only, which they are).
    const MASTERCLASS_OPTION = { _id: "masterclass", name: "Masterclass" };
    const availableCourseTypes = isAdmin
        ? [
            ...(courseTypesList?.data || []),
            MASTERCLASS_OPTION,
        ]
        : [];



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
        defaultValues: initialData
            ? {
                title: initialData.title || "",
                description: initialData.description || "",
                // Auto-fill Long Description from description if not set
                aboutStrategy: initialData.aboutStrategy || initialData.description || "",
                selectedStrategies: [],
                strategyBanner: undefined,
                category: initialData?.category?._id || initialData?.category || "",
                tags: [],
                published: initialData.published ?? true,
                isFeatured: initialData.isFeatured ?? false,
                section: initialData.section || "",
                language: initialData.language || "",
                tier: initialData.tier || "FREE",
                isStrategy: true,
                isPaidMasterclass: initialData.isPaidMasterclass ?? false,
                // Derive contentType from isMasterClass flag on existing record
                contentType: initialData.isMasterClass === false ? "course" : "masterclass",
            }
            : {
                title: "",
                description: "",
                aboutStrategy: "",
                selectedStrategies: [],
                strategyBanner: undefined,
                category: "",
                tags: [],
                published: true,
                isFeatured: false,
                section: isAdmin ? "" : "IQ Academy",
                language: "",
                tier: "FREE",
                isStrategy: true,
                isPaidMasterclass: false,
                contentType: "masterclass",
            },
    });

    // Watch section to filter categories
    const selectedSection = watch("section");
    useEffect(() => {
        if (selectedSection) {
            setSectionSelect(selectedSection);
            // Reset category when section changes (create mode only)
            if (!initialData) {
                setValue("category", "");
            }
        }
    }, [selectedSection, initialData, setValue]);

    // For existing records, restore saved section; for new educator records, hardcode to IQ Academy
    useEffect(() => {
        if (initialData?.section) {
            setValue("section", initialData.section);
            setSectionSelect(initialData.section);
        } else if (!isAdmin && !initialData) {
            // Educators creating new content → always IQ Academy
            setValue("section", "IQ Academy");
            setSectionSelect("IQ Academy");
        }
    }, [initialData?.section, isAdmin, initialData, setValue]);

    useEffect(() => {
        if (initialData) {
            // Banner image — strategyBanner is the actual display banner; imageUrl is the icon
            if (initialData?.strategyBanner) {
                setBannerPreview(initialData.strategyBanner);
                setValue("strategyBanner", initialData.strategyBanner);
            } else if (initialData?.imageUrl) {
                setBannerPreview(initialData.imageUrl);
                setValue("strategyBanner", initialData.imageUrl);
            }

            if (initialData?.category?._id && categories?.data?.length > 0) {
                setValue("category", initialData.category._id);
            }

            // Restore selected strategies
            const backendStrategies = initialData?.strategies || initialData?.selectedStrategies;
            if (backendStrategies?.length > 0) {
                const strategyIds = backendStrategies.map((s) => (typeof s === "object" ? s._id : s));
                setValue("selectedStrategies", strategyIds);
            }

            // Restore isPaidMasterclass flag
            if (initialData?.isPaidMasterclass !== undefined) {
                setValue("isPaidMasterclass", initialData.isPaidMasterclass);
            }

            // Set section after courseTypesList has loaded
            if (initialData.section && courseTypesList?.data?.length > 0) {
                setValue("section", initialData.section);
                setSectionSelect(initialData.section);
            }

            // Set language after languagesList has loaded
            if (initialData.language && languagesList?.data?.length > 0) {
                setValue("language", initialData.language);
            }

            if (initialData.tier) {
                setValue("tier", initialData.tier);
            }

            // Auto-fill Long Description from description if aboutStrategy is missing
            const longDesc = initialData.aboutStrategy;
            if (!longDesc || longDesc.trim() === "") {
                setValue("aboutStrategy", initialData.description || "");
            } else {
                setValue("aboutStrategy", longDesc);
            }

            // Tags parsing
            if (initialData?.tags) {
                let tagsArray = [];
                if (Array.isArray(initialData.tags)) {
                    if (
                        initialData.tags.length === 1 &&
                        typeof initialData.tags[0] === "string" &&
                        initialData.tags[0].startsWith("[")
                    ) {
                        try {
                            tagsArray = JSON.parse(initialData.tags[0]);
                        } catch {
                            tagsArray = initialData.tags;
                        }
                    } else {
                        tagsArray = initialData.tags;
                    }
                } else if (typeof initialData.tags === "string") {
                    try {
                        const parsed = JSON.parse(initialData.tags);
                        tagsArray = Array.isArray(parsed) ? parsed : [initialData.tags];
                    } catch {
                        tagsArray = initialData.tags.split(",").map((tag) => tag.trim());
                    }
                }
                setValue("tags", tagsArray);
            }
        }
    }, [initialData, categories, courseTypesList, languagesList, setValue]);

    const handleFileChange = (e, field) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setValue(field, file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === "strategyBanner") setBannerPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFile = (field) => {
        setValue(field, undefined, { shouldValidate: true });
        if (field === "strategyBanner") setBannerPreview(null);
    };

    const submitHandler = async (values) => {
        setIsSubmitting(true);
        setUploadProgress(0);

        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            const formData = new FormData();

            // Educators always create Masterclasses (isMasterClass forced true)
            // Admins use contentType dropdown to choose
            const isMasterClass = isAdmin ? (values.contentType === "masterclass") : true;
            // Educators: section is always "Masterclass" (hardcoded per brief)
            // Admins: masterclass → "Masterclass", course → selected section
            const resolvedSection = isAdmin
                ? (isMasterClass ? "Masterclass" : (values.section || "IQ Academy"))
                : "Masterclass";

            [
                "title", "description", "aboutStrategy", "category", "published",
                "isFeatured", "tier", "language", "isStrategy", "isPaidMasterclass"
            ].forEach((key) => {
                const val = values[key];
                if (val !== undefined && val !== null) {
                    formData.append(key, val);
                }
            });

            formData.append("section", resolvedSection);
            formData.append("isMasterClass", isMasterClass);
            formData.append("tags", JSON.stringify(values?.tags || []));
            formData.append("educators", JSON.stringify([educatorId]));
            formData.append("isStrategies", false);
            formData.append("strategies", JSON.stringify(values?.selectedStrategies || []));

            if (values?.strategyBanner instanceof File) {
                formData.append("image", values.strategyBanner);
            }

            await onSubmit(formData);
            setUploadProgress(100);
        } finally {
            clearInterval(progressInterval);
            setTimeout(() => {
                setIsSubmitting(false);
                setUploadProgress(0);
            }, 500);
        }
    };

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6 py-6 rounded-2xl" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column — Text fields */}
                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {isAdmin ? "Course Title" : "Masterclass Title"} <span className="text-rose-500">*</span>
                        </label>
                        <input
                            {...register("title")}
                            className="w-full dark:bg-[#1a1c23] border rounded-lg px-4 py-2.5 text-gray-700 placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder={isAdmin ? "Enter course title" : "Enter masterclass title"}
                        />
                        {errors?.title && <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Short Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            {...register("description")}
                            className="w-full dark:bg-[#1a1c23] border rounded-lg px-4 py-2.5 text-gray-700 placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all min-h-[80px]"
                            placeholder="Enter a short description..."
                        />
                        {errors?.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
                    </div>

                    {/* Long Description (aboutStrategy) — optional */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Long Description{" "}
                            <span className="text-gray-400 text-xs font-normal">(optional)</span>
                        </label>
                        <textarea
                            {...register("aboutStrategy")}
                            className="w-full dark:bg-[#1a1c23] border rounded-lg px-4 py-2.5 text-gray-700 placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all min-h-[120px]"
                            placeholder="Enter a detailed description of the course..."
                        />
                        {errors?.aboutStrategy && <p className="text-xs text-rose-500 mt-1">{errors.aboutStrategy.message}</p>}
                    </div>
                </div>

                {/* Right column — Media & Strategy */}
                <div className="space-y-6">
                    {/* Banner Upload */}
                    <div className="space-y-2 col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {isAdmin ? "Course Banner" : "Masterclass Banner"}{" "}
                            <span className="text-gray-400 text-xs font-normal">(optional)</span>
                        </label>

                        <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-all duration-300 cursor-pointer"
                            style={{ minHeight: "200px" }}>

                            {/* Hidden file input — covers entire area */}
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => handleFileChange(e, "strategyBanner")}
                                accept="image/*"
                            />

                            {bannerPreview ? (
                                <>
                                    {/* Full-width image preview */}
                                    <img
                                        src={bannerPreview}
                                        className="w-full object-cover"
                                        style={{ maxHeight: "260px", objectPosition: "center" }}
                                        alt={isAdmin ? "Course Banner" : "Masterclass Banner"}
                                    />

                                    {/* Hover overlay — change photo prompt */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 z-5">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-white text-sm font-semibold drop-shadow">Click to change image</span>
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile("strategyBanner"); }}
                                        className="absolute top-3 right-3 z-20 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all shadow-lg hover:scale-110"
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                /* Empty state — styled upload zone */
                                <div className="flex flex-col items-center justify-center py-14 px-6 gap-3 bg-[#1c1f26] group-hover:bg-[#22263000] transition-all duration-300">

                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-300">
                                            Click to upload banner image
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP recommended • 16:9 ratio works best</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors?.strategyBanner && <p className="text-xs text-rose-500 mt-1">{errors.strategyBanner.message}</p>}
                    </div>


                    {/* Strategies — optional multi-select */}
                    <div className="space-y-2 relative">
                        <label className="block text-sm font-medium text-gray-700">
                            Select Strategies{" "}
                            <span className="text-gray-400 text-xs font-normal">(optional)</span>
                        </label>
                        <Popover open={isStrategyOpen} onOpenChange={setIsStrategyOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="min-w-56 w-full h-11 flex justify-between items-center border rounded-md px-3 py-2 bg-white border-[#dce0e9] dark:border-[#363944] dark:bg-[#1c1f26]"
                                >
                                    <span className="truncate text-sm text-gray-700">
                                        {(watch("selectedStrategies") || []).length > 0
                                            ? `${(watch("selectedStrategies") || []).length} ${(watch("selectedStrategies") || []).length === 1 ? "Strategy" : "Strategies"} Selected`
                                            : "Select Strategies"}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-500" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[524px] p-0 pointer-events-auto" align="start" side="bottom">
                                <Command className="bg-white dark:bg-[#1c1f26]" shouldFilter={true}>
                                    <CommandInput placeholder="Search strategies..." className="h-9 border-b" />
                                    <CommandList
                                        className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300"
                                        style={{ maxHeight: "300px", overflowY: "auto", pointerEvents: "auto" }}
                                    >
                                        <CommandGroup>
                                            {(isStrategiesLoading || isStrategiesFetching) ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                    <span className="ml-2 text-sm text-gray-500">Loading strategies...</span>
                                                </div>
                                            ) : strategiesData?.data?.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-gray-500">
                                                    No strategies found.
                                                </div>
                                            ) : (
                                                strategiesData?.data?.map((item) => {
                                                    const currentSelected = watch("selectedStrategies") || [];
                                                    const selected = currentSelected.includes(item._id);
                                                    return (
                                                        <CommandItem
                                                            key={item._id}
                                                            value={item.title}
                                                            onPointerDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const updated = selected
                                                                    ? currentSelected.filter((id) => id !== item._id)
                                                                    : [...currentSelected, item._id];
                                                                setValue("selectedStrategies", updated, { shouldValidate: true });
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
                                                            <span
                                                                className={cn(
                                                                    "text-sm capitalize transition-colors",
                                                                    selected ? "text-indigo-600 dark:text-white font-semibold" : "text-gray-700"
                                                                )}
                                                            >
                                                                {item.title}
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
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <TagInput
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    touched={!!errors?.tags}
                                    error={errors?.tags?.message}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Selects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 border-t pt-8 mt-4">
                {/* Content Type — only visible to admins; educators always create Masterclasses */}
                {isAdmin && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Content Type <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                        name="contentType"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full text-gray-700 rounded-lg h-11">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="text-gray-700">
                                    <SelectItem value="masterclass">Master Class</SelectItem>
                                    <SelectItem value="course">Course</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                )}

                {/* Type of Course (section) — shown only for admins when contentType=course */}
                {isAdmin && watch("contentType") === "course" && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Type of Course <span className="text-rose-500">*</span>
                        </label>
                        <Controller
                            name="section"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full text-gray-700 rounded-lg h-11">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="text-gray-700">
                                        {availableCourseTypes.length > 0 ? (
                                            availableCourseTypes.map((type) => (
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
                        {errors?.section && <p className="text-xs text-rose-500 mt-1">{errors.section.message}</p>}
                    </div>
                )}

                {/* Language */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Language <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full text-gray-700 rounded-lg h-11">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent className="text-gray-700">
                                    {languagesList?.data?.map((lang) => (
                                        <SelectItem key={lang._id} value={lang.name}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors?.language && <p className="text-xs text-rose-500 mt-1">{errors.language.message}</p>}
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Category <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full text-gray-700 rounded-lg h-11">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="text-gray-700">
                                    {categories?.data?.length > 0 ? (
                                        categories.data.map((item) => (
                                            <SelectItem key={item._id} value={item._id}>
                                                {item.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem disabled value="null">
                                            {selectedSection ? "No categories for this type" : "Select a type first"}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors?.category && <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>}
                </div>

                {/* Tier */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Tier <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                        name="tier"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full text-gray-700 rounded-lg h-11">
                                    <SelectValue placeholder="Select Tier" />
                                </SelectTrigger>
                                <SelectContent className="text-gray-700">
                                    <SelectItem value="FREE">Free</SelectItem>
                                    <SelectItem value="PREMIUM">Pro</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors?.tier && <p className="text-xs text-rose-500 mt-1">{errors.tier.message}</p>}
                </div>
            </div>

            {/* Toggle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
                <div className="border p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                    <div className="text-left space-y-1">
                        <label htmlFor="published" className="text-sm font-bold text-gray-700 cursor-pointer">
                            {isAdmin ? "Publish Course" : "Publish Masterclass"}
                        </label>
                        <p className="text-xs text-gray-500">Visible to students immediately.</p>
                    </div>
                    <Controller
                        name="published"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="published"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="w-6 h-6 rounded-md data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                        )}
                    />
                </div>

                <div className="border p-5 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                    <div className="text-left space-y-1">
                        <label htmlFor="isPaidMasterclass" className="text-sm font-bold text-gray-700 cursor-pointer">
                            {isAdmin ? "Publish as Paid Course" : "Publish as Paid Masterclass"}
                        </label>
                        {/* <p className="text-xs text-gray-500">Flag for upcoming marketplace — no payment gating yet.</p> */}
                    </div>
                    <Controller
                        name="isPaidMasterclass"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="isPaidMasterclass"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="w-6 h-6 rounded-md data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                        )}
                    />
                </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-5 pt-8 mt-2 border-t">
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
                        initialData
                            ? (isAdmin ? "Update Course" : "Update Masterclass")
                            : (isAdmin ? "Save Course" : "Save Masterclass")
                    )}
                </button>
            </div>
        </form>
    );
};

export default StrategyForm;
