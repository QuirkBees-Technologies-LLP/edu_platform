/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Video, FileText, Plus, GripVertical, Pencil, Download, Trash2, Eye } from "lucide-react";
import { KeenIcon } from "@/components";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddVideoModal from "./AddVideoModal";
import FileDropzone from "./FileDropzone";
import DraggableCourseCard from "@/pages/admin/courses/pages/Settings/components/DraggableCourseCard";
import VideoPlayerModal from "@/pages/admin/recording/VideoPlayerModal";
import { getVideoThumbnail } from "@/utils/videoUtils";
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/partials/toolbar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useGetLearningContentDetailQuery,
  useAddVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useToggleVideoStatusMutation,
  useReorderVideosMutation,
  useUploadResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useToggleResourceStatusMutation,
  useReorderResourcesMutation,
} from "../../../store/api/admin/adminLearningContentApiSlice";

// ── Drag & Drop helpers ────────────────────────────────────────────────
function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

const LearningContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("videos");

  const { data, isLoading, isError } = useGetLearningContentDetailQuery(id);
  const content = data?.data;

  if (isLoading) {
    return (
      <div className="container-fluid pb-5">
        {/* Skeleton Toolbar */}
        <div className="flex items-center justify-between py-4 mb-4">
          <div>
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        {/* Skeleton Tabs */}
        <div className="flex gap-3 mb-6">
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        {/* Skeleton Card Grid */}
        <div className="card">
          <div className="card-header px-6 py-4">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !content) {
    return (
      <div className="container-fluid flex items-center justify-center py-20">
        <p className="text-danger">Failed to load content</p>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-5">
      {/* Toolbar */}
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={content.contentType === "FAST_START"
            ? "Fast Start Training"
            : content.strategy?.title || "Strategy"} />
          <ToolbarDescription>
            {content.title}
            {content.description ? ` · ${content.description}` : ""}
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <button
            className="btn btn-light"
            onClick={() => navigate(`/admin/learning-content?tab=${content.contentType}`)}
          >
            Back
          </button>
        </ToolbarActions>
      </Toolbar>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => setActiveTab("videos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "videos"
            ? "bg-primary text-white shadow-sm"
            : "bg-gray-100 dark:bg-[#1e2028] text-gray-600 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-[#25272f]"
            }`}
        >
          <Video size={16} />
          Videos ({content.videos?.length || 0})
        </button>
        {content.contentType !== "FAST_START" && (
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "resources"
              ? "bg-primary text-white shadow-sm"
              : "bg-gray-100 dark:bg-[#1e2028] text-gray-600 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-[#25272f]"
              }`}
          >
            <FileText size={16} />
            Resources ({content.resources?.length || 0})
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "videos" ? (
        <VideoManager contentId={id} videos={content.videos || []} />
      ) : content.contentType !== "FAST_START" ? (
        <ResourceManager contentId={id} resources={content.resources || []} />
      ) : null}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// VIDEO MANAGER
// ═══════════════════════════════════════════════════════════════════════
function VideoManager({ contentId, videos }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [localVideos, setLocalVideos] = useState(videos);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  // Sync localVideos whenever the videos prop changes (e.g. after add/update/delete)
  const videosKey = JSON.stringify(videos.map((v) => ({ id: v._id, t: v.thumbnail, u: v.videoUrl, ti: v.title, s: v.status })));
  React.useEffect(() => {
    setLocalVideos(videos);
  }, [videosKey]);

  const [addVideo, { isLoading: isAdding }] = useAddVideoMutation();
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();
  const [toggleStatus] = useToggleVideoStatusMutation();
  const [reorderVideos] = useReorderVideosMutation();

  const handleAddVideo = async (formData) => {
    try {
      await addVideo({ contentId, formData }).unwrap();
      toast.success("Video added successfully");
      setIsVideoModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add video");
    }
  };

  const handleUpdateVideo = async (formData) => {
    if (!editingVideo) return;
    try {
      await updateVideo({ videoId: editingVideo._id, contentId, formData }).unwrap();
      toast.success("Video updated successfully");
      setIsVideoModalOpen(false);
      setEditingVideo(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update video");
    }
  };

  const handleDeleteVideo = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVideo({ videoId: deleteTarget._id, contentId }).unwrap();
      toast.success("Video deleted successfully");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete video");
    }
  };

  const handleToggleStatus = async (video) => {
    try {
      await toggleStatus({
        videoId: video._id,
        status: !video.status,
        contentId,
      }).unwrap();
      toast.success(`Video ${!video.status ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  // Drag & drop handlers
  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setLocalVideos(reorder(localVideos, dragIndex, index));
    setDragIndex(index);
  };
  const handleDragEnd = async () => {
    setDragIndex(null);
    const items = localVideos.map((v, i) => ({ id: v._id, displayOrder: i }));
    try {
      await reorderVideos({ contentId, items }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reorder");
    }
  };

  return (
    <>
      {/* Add/Edit Video Modal */}
      <AddVideoModal
        key={editingVideo?._id || "add"}
        open={isVideoModalOpen}
        onOpenChange={(open) => {
          setIsVideoModalOpen(open);
          if (!open) setEditingVideo(null);
        }}
        video={editingVideo}
        onSubmit={editingVideo ? handleUpdateVideo : handleAddVideo}
        isLoading={isAdding || isUpdating}
      />

      <div className="card">
        <div className="card-header px-6 py-4">
          <h3 className="card-title">Videos</h3>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setEditingVideo(null);
              setIsVideoModalOpen(true);
            }}
          >
            <Plus size={14} className="mr-1.5" />
            Add Video
          </button>
        </div>
        <div className="card-body p-0">

          {/* Video Grid */}
          {localVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1e2028] mb-4">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-300 font-medium">No Videos Added</p>
              <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
                Add your first video to get started.
              </p>
            </div>
          ) : (
            <DndProvider backend={HTML5Backend}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
                {localVideos.map((video, index) => (
                  <DraggableCourseCard
                    key={video._id}
                    course={{
                      _id: video._id,
                      title: video.title || "Untitled Video",
                      description: video.videoUrl || video.uploadedVideoUrl || "",
                      imageUrl: video.thumbnail || "",
                      videoUrl: video.videoUrl || video.uploadedVideoUrl || "",
                      published: video.status,
                      category: { name: video.videoSourceType === "UPLOAD" ? "Uploaded" : "URL" },
                      instructor: {},
                      section: `Video No. ${index + 1}`,
                    }}
                    index={index}
                    onEdit={() => {
                      setEditingVideo(video);
                      setIsVideoModalOpen(true);
                    }}
                    onMove={(dragIdx, hoverIdx) => {
                      const reordered = reorder(localVideos, dragIdx, hoverIdx);
                      setLocalVideos(reordered);
                    }}
                    onDragEnd={async () => {
                      const items = localVideos.map((v, i) => ({ id: v._id, displayOrder: i }));
                      try {
                        await reorderVideos({ contentId, items }).unwrap();
                        toast.success("Video order updated successfully");
                      } catch (err) {
                        toast.error(err?.data?.message || "Failed to update video order");
                      }
                    }}
                    onDelete={() => {
                      setDeleteTarget(video);
                      setIsDeleteOpen(true);
                    }}
                    onSelect={() => {
                      setPlayingVideo(video);
                      setIsPlayerOpen(true);
                    }}
                    activeTab="courses"
                    hideMetadata
                  />
                ))}
              </div>
            </DndProvider>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={isPlayerOpen}
        onOpenChange={(open) => {
          setIsPlayerOpen(open);
          if (!open) setPlayingVideo(null);
        }}
        videoUrl={playingVideo?.videoUrl || playingVideo?.uploadedVideoUrl || ""}
        data={{
          call_title: playingVideo?.title || "Video Playback",
          call_description: "",
        }}
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{deleteTarget?.title}"</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="btn btn-light"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={isDeleting}
              onClick={handleDeleteVideo}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}



// ═══════════════════════════════════════════════════════════════════════
// RESOURCE MANAGER
// ═══════════════════════════════════════════════════════════════════════
function ResourceManager({ contentId, resources }) {
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [localResources, setLocalResources] = useState(resources);

  React.useEffect(() => {
    setLocalResources(resources);
  }, [resources]);

  const [uploadResource, { isLoading: isUploading }] =
    useUploadResourceMutation();
  const [updateResource, { isLoading: isUpdatingResource }] =
    useUpdateResourceMutation();
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteResourceMutation();
  const [toggleStatus] = useToggleResourceStatusMutation();
  const [reorderResources] = useReorderResourcesMutation();

  const handleUploadResource = async (formData) => {
    try {
      await uploadResource({ contentId, formData }).unwrap();
      toast.success("Resource uploaded successfully");
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to upload resource");
    }
  };

  const handleUpdateResource = async (resourceId, formData) => {
    try {
      await updateResource({ resourceId, contentId, formData }).unwrap();
      toast.success("Resource updated successfully");
      setEditingResource(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update resource");
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResource({
        resourceId: deleteTarget._id,
        contentId,
      }).unwrap();
      toast.success("Resource deleted successfully");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete resource");
    }
  };

  const handleToggleStatus = async (resource) => {
    try {
      await toggleStatus({
        resourceId: resource._id,
        status: !resource.status,
        contentId,
      }).unwrap();
      toast.success(`Resource ${!resource.status ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  // Drag & drop
  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setLocalResources(reorder(localResources, dragIndex, index));
    setDragIndex(index);
  };
  const handleDragEnd = async () => {
    setDragIndex(null);
    const items = localResources.map((r, i) => ({
      id: r._id,
      displayOrder: i,
    }));
    try {
      await reorderResources({ contentId, items }).unwrap();
      toast.success("Resource order updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update resource order");
    }
  };

  const getFileIcon = (fileType) => {
    const icons = {
      PDF: "📄",
      DOC: "📝",
      DOCX: "📝",
      XLS: "📊",
      XLSX: "📊",
      PPT: "📊",
      PPTX: "📊",
      IMAGE: "🖼️",
    };
    return icons[fileType] || "📁";
  };

  return (
    <>
      {/* Upload/Edit Resource Modal */}
      <ResourceModal
        key={editingResource?._id || "upload"}
        open={showForm || !!editingResource}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false);
            setEditingResource(null);
          }
        }}
        resource={editingResource}
        onSubmit={
          editingResource
            ? (fd) => handleUpdateResource(editingResource._id, fd)
            : handleUploadResource
        }
        isLoading={isUploading || isUpdatingResource}
      />

      <div className="card">
        <div className="card-header px-6 py-4">
          <h3 className="card-title">Resources</h3>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setEditingResource(null);
              setShowForm(true);
            }}
          >
            <Plus size={14} className="mr-1.5" />
            Upload Resource
          </button>
        </div>
        <div className="card-body p-0">

          {/* Resource Cards */}
          {localResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1e2028] mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-300 font-medium">
                No Resources Uploaded
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
                Upload your first resource to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {localResources.map((resource, index) => (
                <div
                  key={resource._id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-[#1a1c23] transition-all duration-200 cursor-move hover:border-primary/30 hover:shadow-md ${dragIndex === index
                    ? "opacity-50 bg-primary/5 border-primary/50"
                    : ""
                    }`}
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                      {resource.displayName || "Untitled Resource"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      <span className="uppercase">{resource.fileType || "FILE"}</span>
                      <span>•</span>
                      <span>
                        {resource.createdAt
                          ? new Date(resource.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View */}
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 flex items-center justify-center text-primary hover:text-primary/70 transition-colors duration-200"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </a>

                    {/* Edit */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowForm(false);
                        setEditingResource(resource);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-primary hover:text-primary/70 transition-colors duration-200"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Download */}
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 flex items-center justify-center text-primary hover:text-primary/70 transition-colors duration-200"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(resource);
                        setIsDeleteOpen(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{deleteTarget?.displayName}"</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="btn btn-light"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              disabled={isDeleting}
              onClick={handleDeleteResource}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Resource Modal ──────────────────────────────────────────────────────
function ResourceModal({ open, onOpenChange, resource, onSubmit, isLoading }) {
  const isEdit = !!resource;
  const [displayName, setDisplayName] = useState(
    resource?.displayName || ""
  );
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    if (!resource && !file) {
      toast.error("File is required");
      return;
    }

    const formData = new FormData();
    formData.append("displayName", displayName.trim());
    if (file) {
      formData.append("file", file);
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Resource" : "Upload Resource"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update resource details and file"
              : "Upload a new resource file with a display name"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Strategy Blueprint PDF"
                className="w-full dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>

            {/* File */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                File{" "}
                {!resource && <span className="text-rose-500">*</span>}
                {resource && (
                  <span className="text-gray-400 font-normal text-xs ml-1">
                    (Leave empty to keep current file)
                  </span>
                )}
              </label>
              <FileDropzone
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
                maxSize={50 * 1024 * 1024}
                file={file}
                preview={resource?.fileUrl || ""}
                onChange={(f) => setFile(f)}
                onRemove={() => setFile(null)}
                label="Upload File"
                hint="PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images – Max 50MB"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2.5 pt-4">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              )}
              {isEdit ? "Update Resource" : "Upload Resource"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LearningContentDetail;
