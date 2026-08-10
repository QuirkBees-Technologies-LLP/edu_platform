import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X as CloseIcon } from "lucide-react";
import {
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

// Schema for strategy validation
const strategySchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    aboutStrategy: z.string().min(10, "About Strategy  must be at least 10 characters"),
    iconThumbnail: z
        .any()
        .refine(
            (file) => (file instanceof File && file.size > 0) || (typeof file === 'string' && file.length > 0),
            {
                message: "Strategy icon thumbnail is required",
            }
        ),
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { data: languagesList } = useGetLanguageListQuery();

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
            iconThumbnail: undefined,
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

            // Backend: imageUrl = icon thumbnail
            if (initialData?.imageUrl) {
                setIconPreview(initialData?.imageUrl);
                setValue("iconThumbnail", initialData?.imageUrl);
            }
        }
    }, [initialData, setValue]);

    const handleFileChange = (e, field) => {
        const file = e?.target?.files?.[0];
        if (file) {
            setValue(field, file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === "iconThumbnail") setIconPreview(reader?.result);
            };
            reader.readAsDataURL(file);
        }
    };



    const removeFile = (field) => {
        setValue(field, undefined, { shouldValidate: true });
        if (field === "iconThumbnail") setIconPreview(null);
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
                "title", "description", "aboutStrategy", "published",
                "isFeatured", "tier", "section", "language", "isStrategy"
            ].forEach(key => {
                formData.append(key, values?.[key]);
            });

            formData.append("isStrategies", true);

            if (values?.iconThumbnail instanceof File) formData.append("icon", values?.iconThumbnail);

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


                    </div>


                </div>
            </div>

            {/* Selects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t  pt-8 mt-4">
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
