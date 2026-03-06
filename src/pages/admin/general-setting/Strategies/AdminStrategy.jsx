/* eslint-disable prettier/prettier */
import { useState } from "react";
import { Plus, Edit2, Trash, Eye, Book, Globe2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// API hooks — uses /admin/strategy (singular) endpoint
import {
    useGetAdminStrategyModelsQuery,
    useCreateAdminStrategyModelMutation,
    useUpdateAdminStrategyModelMutation,
    useDeleteAdminStrategyModelMutation,
} from "@/store/api/admin/adminStrategyModelApiSlice";

// Strategy Form
import StrategyForm from "./StrategyForm";

const AdminStrategy = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);

    // RTK Query hooks — /admin/strategy
    const { data: strategiesData, isLoading, isFetching } = useGetAdminStrategyModelsQuery();
    const [createStrategy] = useCreateAdminStrategyModelMutation();
    const [updateStrategy] = useUpdateAdminStrategyModelMutation();
    const [deleteStrategy] = useDeleteAdminStrategyModelMutation();

    const strategies = strategiesData?.data || [];

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleCreateOrUpdate = async (formData) => {
        try {
            if (isEditMode && selectedStrategy) {
                await updateStrategy({
                    id: selectedStrategy?._id,
                    formData: formData,
                }).unwrap();
                toast.success("Strategy updated successfully!");
            } else {
                await createStrategy(formData).unwrap();
                toast.success("Strategy created successfully!");
            }
            handleCloseModal();
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(
                error?.data?.message ||
                (typeof error === "string" ? error : error?.message) ||
                "Operation failed. Please try again."
            );
        }
    };

    const handleEdit = (strategy) => {
        setSelectedStrategy(strategy);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (strategy) => {
        if (
            window.confirm(
                `Are you sure you want to delete "${strategy?.title}"? This action cannot be undone.`
            )
        ) {
            try {
                await deleteStrategy(strategy?._id).unwrap();
                toast.success("Strategy deleted successfully!");
            } catch (error) {
                toast.error(
                    error?.data?.message ||
                    error?.message ||
                    "Failed to delete strategy"
                );
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStrategy(null);
        setIsEditMode(false);
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setSelectedStrategy(null);
        setIsModalOpen(true);
    };

    // Fallback image
    const fallbackImage =
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

    // ─── Loading State ───────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-500">Loading strategies...</span>
            </div>
        );
    }

    return (
        <div className="mt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Strategies</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage all strategies from here. Create, edit or delete strategies.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 bg-primary text-white hover:bg-primary-active shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Strategy
                </button>
            </div>

            {/* Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategies?.length > 0 ? (
                    strategies.map((strategy) => {
                        const isHovered = hoveredId === strategy?._id;
                        const displayImage = strategy?.imageUrl;

                        return (
                            <div
                                key={strategy?._id}
                                className={`relative rounded-xl shadow-md overflow-hidden transition-all duration-300 ${isHovered
                                    ? "shadow-lg transform translate-y-[-4px]"
                                    : "hover:shadow-lg"
                                    }`}
                                onMouseEnter={() => setHoveredId(strategy?._id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video overflow-hidden">
                                    {displayImage ? (
                                        <img
                                            src={displayImage}
                                            alt={strategy?.title}
                                            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : ""
                                                }`}
                                            onError={(e) => {
                                                e.target.src = fallbackImage;
                                            }}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                                            <Plus className="w-10 h-10 text-blue-400" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div
                                        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovered ? "bg-opacity-20" : "bg-opacity-0"
                                            }`}
                                    >
                                        {isHovered && (
                                            <div className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-90 rounded-full shadow-md animate-fadeIn">
                                                <Eye className="w-5 h-5 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {strategy?.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {strategy?.description}
                                    </p>

                                    <div className="flex items-center gap-3 flex-wrap text-sm">
                                        {strategy?.instructor && (
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Book className="w-4 h-4 text-primary shrink-0" />
                                                <span className="font-medium text-primary">
                                                    {strategy?.instructor?.first_name} {strategy?.instructor?.last_name}
                                                </span>
                                            </div>
                                        )}
                                        {strategy?.createdAt && (
                                            <>
                                                {strategy?.instructor && <div className="h-4 w-px bg-gray-300"></div>}
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Globe2 className="w-4 h-4" />
                                                    <span>
                                                        {new Date(strategy?.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons (on hover) */}
                                <div
                                    className={`absolute top-2 left-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                                        }`}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(strategy);
                                        }}
                                        className="p-2.5 bg-primary rounded-full shadow-lg transition-all duration-200 hover:bg-primary-active hover:shadow-xl hover:scale-110 hover:rotate-12 group"
                                        title="Edit Strategy"
                                    >
                                        <Edit2 className="w-5 h-5 text-white group-hover:animate-pulse" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(strategy);
                                        }}
                                        className="p-2.5 bg-red-500 rounded-full shadow-lg transition-all duration-200 hover:bg-red-600 hover:shadow-xl hover:scale-110 hover:rotate-12 group"
                                        title="Delete Strategy"
                                    >
                                        <Trash className="w-5 h-5 text-white group-hover:animate-pulse" />
                                    </button>
                                </div>

                                {/* Bottom border indicator */}
                                <div
                                    className={`h-1 w-full bg-gradient-to-r bg-primary to-indigo-600 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                                        }`}
                                ></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full">
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 rounded-full bg-gray-100 mb-4">
                                <Book className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No Strategies Found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Create your first strategy to get started.
                            </p>
                        </div>
                    </div>
                )}

                {/* Create New Card */}
                <div
                    onClick={handleOpenCreate}
                    className="rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer transition-colors duration-200"
                >
                    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                        <Plus className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">
                            Create New Strategy
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Start building your Strategy
                        </p>
                    </div>
                </div>
            </div>

            {/* Create/Edit Strategy Modal */}
            <Dialog
                open={isModalOpen}
                onOpenChange={() => {
                    handleCloseModal();
                }}
            >
                <DialogContent className="p-5 max-w-[1200px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? "Edit Strategy" : "Create New Strategy"}
                        </DialogTitle>
                    </DialogHeader>

                    <StrategyForm
                        key={isEditMode ? `edit-${selectedStrategy?._id}` : "create-strategy"}
                        onSubmit={handleCreateOrUpdate}
                        initialData={isEditMode ? selectedStrategy : undefined}
                        isLoading={false}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminStrategy;
