import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Image,
  Video,
  FileText,
  Globe,
  Users,
  Lock,
  FolderOpen,
  Trash2,
  Link2,
  Play,
  BarChart3,
} from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableLinkList from "@/components/ui/DraggableLinkList";
import { isDyntubeUrl, getEmbedUrl, getVideoThumbnail } from "@/utils/videoUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  createEducatorPost,
  updateEducatorPost,
  clearCreatePostStatus,
  clearEducatorPostsStatus,
  selectCreateEducatorPostStatus,
  selectCreateEducatorPostError,
  selectEducatorPostsStatus,
  selectEducatorPostsError,
} from "@/store/reducer/postSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/alert/Alert";
import { toast } from "sonner";
import { useAuthContext } from "@/auth/useAuthContext";
import { isJwtExpiredError, handleJwtExpired } from "@/utils/authUtils";

// showCategorySelector: the real social-feed composer (EducatorCommunityFeed) lets the
// author pick a category; the "share this update as a post" composer opened from the
// Idea/Live Idea update flow doesn't need that choice — it always posts as "General
// Updates" — so callers there pass showCategorySelector={false}.
const CreatePostModal = ({ isOpen, onClose, editingPost = null, showCategorySelector = true }) => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const createStatus = useSelector(selectCreateEducatorPostStatus);
  const createError = useSelector(selectCreateEducatorPostError);
  const generalStatus = useSelector(selectEducatorPostsStatus);
  const generalError = useSelector(selectEducatorPostsError);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [category, setCategory] = useState("General Updates");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [dyntubeUrl, setDyntubeUrl] = useState("");
  const [dyntubeError, setDyntubeError] = useState("");
  const [showDyntubeInput, setShowDyntubeInput] = useState(false);
  const [tradingViewLinks, setTradingViewLinks] = useState([""]);
  const [showTradingViewInput, setShowTradingViewInput] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearCreatePostStatus());
      dispatch(clearEducatorPostsStatus());
      setHasInitialized(false);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (editingPost) {
      setIsEditing(true);
      setContent(editingPost.content || "");
      setImages(editingPost.images || []);
      setVideos(editingPost.videos || []);
      setDocuments(editingPost.documents || []);
      setVisibility(editingPost.visibility || "public");
      setCategory(editingPost.category || "General Updates");
      setDyntubeUrl(editingPost.dyntubeUrl || "");
      setDyntubeError("");
      setShowDyntubeInput(!!editingPost.dyntubeUrl);
      const tvLinks = editingPost.tradingViewLinks?.length > 0 ? editingPost.tradingViewLinks : [""];
      setTradingViewLinks(tvLinks);
      setShowTradingViewInput(editingPost.tradingViewLinks?.length > 0);

      setTimeout(() => {
        setHasInitialized(true);
      }, 100);
    } else {
      setIsEditing(false);
      setHasInitialized(true);
    }
  }, [editingPost]);

  useEffect(() => {
    if (!hasInitialized) return;

    if (createStatus === "succeeded" && !isEditing) {
      handleClose();
      dispatch(clearCreatePostStatus());
    }

    if (generalStatus === "succeeded" && isEditing) {
      handleClose();
      dispatch(clearEducatorPostsStatus());
    }
  }, [createStatus, generalStatus, dispatch, isEditing, hasInitialized]);

  useEffect(() => {
    return () => {
      images.forEach((file) => {
        if (file instanceof File) {
          // Note: URL.revokeObjectURL is not needed here as the URL will be garbage collected
          // when the component unmounts, but we could add it if needed
        }
      });
    };
  }, [images, videos, documents]);

  const handleClose = () => {
    setContent("");
    setImages([]);
    setVideos([]);
    setDocuments([]);
    setVisibility("public");
    setCategory("General Updates");
    setIsSubmitting(false);
    setIsEditing(false);
    setHasInitialized(false);
    setDyntubeUrl("");
    setDyntubeError("");
    setShowDyntubeInput(false);
    setTradingViewLinks([""]);
    setShowTradingViewInput(false);
    dispatch(clearCreatePostStatus());
    dispatch(clearEducatorPostsStatus());
    onClose();
  };

  const handleFileChange = (event, type) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`File ${file.name} must be less than 100MB`);
        return;
      }

      if (type === "image" && !file.type.startsWith("image/")) {
        toast.error(`Please select a valid image file for ${file.name}`);
        return;
      }
      if (type === "video" && !file.type.startsWith("video/")) {
        toast.error(`Please select a valid video file for ${file.name}`);
        return;
      }
      if (
        type === "document" &&
        !file.type.includes("pdf") &&
        !file.type.includes("doc") &&
        !file.type.includes("txt")
      ) {
        toast.error(`Please select a valid document file for ${file.name}`);
        return;
      }

      if (type === "image") {
        setImages((prev) => [...prev, file]);
      } else if (type === "video") {
        setVideos((prev) => [...prev, file]);
      } else if (type === "document") {
        setDocuments((prev) => [...prev, file]);
      }
    });
  };

  const removeFile = (file, type) => {
    if (type === "image") {
      setImages((prev) => prev.filter((f) => f !== file));
    } else if (type === "video") {
      setVideos((prev) => prev.filter((f) => f !== file));
    } else if (type === "document") {
      setDocuments((prev) => prev.filter((f) => f !== file));
    }
  };

  const getFileSource = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    } else if (typeof file === "string") {
      return file;
    } else if (file && file.url) {
      return file.url;
    }
    return "";
  };

  const clearAllFiles = () => {
    setImages([]);
    setVideos([]);
    setDocuments([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
    setDyntubeUrl("");
    setDyntubeError("");
    setShowDyntubeInput(false);
    setTradingViewLinks([""]);
    setShowTradingViewInput(false);
  };

  // TradingView link handlers (same pattern as IQ Insight)
  const handleReorderLinks = useCallback((dragIndex, hoverIndex) => {
    setTradingViewLinks((prev) => {
      const items = [...prev];
      const [removed] = items.splice(dragIndex, 1);
      items.splice(hoverIndex, 0, removed);
      return items;
    });
  }, []);

  const handleLinkChange = useCallback((index, value) => {
    setTradingViewLinks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleRemoveLink = useCallback((index) => {
    setTradingViewLinks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddLink = useCallback(() => {
    setTradingViewLinks((prev) => [...prev, ""]);
  }, []);

  const hasFilesChanged = () => {
    if (!editingPost) return true;

    const hasNewImages = images.some((file) => file instanceof File);
    const hasNewVideos = videos.some((file) => file instanceof File);
    const hasNewDocuments = documents.some((file) => file instanceof File);

    const originalImageCount = editingPost.images?.length || 0;
    const originalVideoCount = editingPost.videos?.length || 0;
    const originalDocumentCount = editingPost.documents?.length || 0;

    const currentImageCount = images.filter(
      (file) => !(file instanceof File)
    ).length;
    const currentVideoCount = videos.filter(
      (file) => !(file instanceof File)
    ).length;
    const currentDocumentCount = documents.filter(
      (file) => !(file instanceof File)
    ).length;

    return (
      hasNewImages ||
      hasNewVideos ||
      hasNewDocuments ||
      originalImageCount !== currentImageCount ||
      originalVideoCount !== currentVideoCount ||
      originalDocumentCount !== currentDocumentCount
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tvLinks = (tradingViewLinks || []).filter((l) => l && l.trim());

    if (
      !content.trim() &&
      images.length === 0 &&
      videos.length === 0 &&
      documents.length === 0 &&
      !dyntubeUrl.trim() &&
      tvLinks.length === 0
    ) {
      toast.error("Please add some content or media to your post");
      return;
    }

    // Validate TradingView URLs
    const tvUrlPattern = /tradingview\.com/i;
    for (const link of tvLinks) {
      if (!tvUrlPattern.test(link.trim())) {
        toast.error(`Invalid TradingView URL: ${link}`);
        return;
      }
    }

    // Check for duplicate TradingView URLs
    const uniqueTVLinks = new Set(tvLinks.map((l) => l.trim().toLowerCase()));
    if (uniqueTVLinks.size !== tvLinks.length) {
      toast.error("Duplicate TradingView links detected. Please remove duplicates.");
      return;
    }

    // Validate DynTube URL if provided
    if (dyntubeUrl.trim() && !isDyntubeUrl(dyntubeUrl.trim())) {
      setDyntubeError("Please enter a valid DynTube URL");
      return;
    }

    setIsSubmitting(true);

    try {
      const processFiles = (files) => {
        if (!files || files.length === 0) return undefined;

        return files.map((file) => {
          if (file instanceof File) {
            return file;
          } else if (typeof file === "string") {
            return { url: file };
          } else if (file && file.url) {
            return file;
          } else {
            return file;
          }
        });
      };

      const postData = {
        content: content.trim(),
        visibility,
        category,
      };

      if (hasFilesChanged()) {
        postData.images = processFiles(images);
        postData.videos = processFiles(videos);
        postData.documents = processFiles(documents);
      }

      // Add DynTube URL if provided
      if (dyntubeUrl.trim()) {
        postData.dyntubeUrl = dyntubeUrl.trim();
      }

      // Add TradingView links
      if (tvLinks.length > 0) {
        postData.tradingViewLinks = tvLinks;
      } else {
        postData.tradingViewLinks = [];
      }

      // When editing, signal the backend to remove existing media if the educator cleared them
      if (editingPost) {
        if ((editingPost.images?.length > 0) && images.length === 0) {
          postData.removeImages = true;
        }
        if ((editingPost.videos?.length > 0) && videos.length === 0) {
          postData.removeVideos = true;
        }
        // Handle DynTube URL changes during edit
        if (editingPost.dyntubeUrl && !dyntubeUrl.trim()) {
          postData.removeDyntubeUrl = true;
        } else if (dyntubeUrl.trim()) {
          postData.dyntubeUrl = dyntubeUrl.trim();
        }

        // Handle TradingView links changes during edit
        if (editingPost.tradingViewLinks?.length > 0 && tvLinks.length === 0) {
          postData.removeTradingViewLinks = true;
        }
        postData.tradingViewLinks = tvLinks;
      }

      if (editingPost) {
        await dispatch(
          updateEducatorPost({ id: editingPost.id, postData })
        ).unwrap();
        toast.success("Post updated successfully!");
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        const result = await dispatch(createEducatorPost(postData)).unwrap();

        toast.success("Post created successfully!");
        handleClose();
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to submit post:", error);

      if (isJwtExpiredError(error)) {
        handleJwtExpired(handleClose, "/auth/login", 1500);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public":
        return <Globe size={16} />;
      case "connections":
        return <Users size={16} />;
      case "private":
        return <Lock size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  const getVisibilityText = () => {
    switch (visibility) {
      case "public":
        return "Anyone";
      case "connections":
        return "Connections";
      case "private":
        return "Only you";
      default:
        return "Anyone";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-5 max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingPost ? "Edit Post" : "Create a Post"}
          </DialogTitle>
        </DialogHeader>

        {/* Error Alert */}
        {createError && (
          <div className="px-5">
            <Alert variant="danger" icon="shield-cross">
              {createError}
            </Alert>
          </div>
        )}
        {generalError && (
          <div className="px-5">
            <Alert variant="danger" icon="shield-cross">
              {generalError}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 px-0 py-5">
            {/* User Info and Privacy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={
                      auth?.user?.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.first_name || "User")}&background=random&color=fff&size=48`
                    }
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.first_name || "User")}&background=random&color=fff&size=48`;
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {auth?.user?.first_name && auth?.user?.last_name
                      ? `${auth.user.first_name} ${auth.user.last_name}`
                      : auth?.user?.name || "User"}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setVisibility(
                        visibility === "public"
                          ? "connections"
                          : visibility === "connections"
                            ? "private"
                            : "public"
                      )
                    }
                    className="flex items-center gap-2 mt-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {getVisibilityIcon()}
                    <span>Post to {getVisibilityText()}</span>
                  </button>
                </div>
              </div>

              {/* {showCategorySelector && (
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-gray-500" />
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                    defaultValue={category}
                  >
                    <SelectTrigger className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {["General Updates", "Analysis Updates"].map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )} */}
            </div>

            {/* Content Textarea */}
            <div className="flex flex-col gap-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-32 p-3 border border-gray-200 bg-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-lg"
                placeholder="What do you want to talk about?"
                maxLength={2000}
              />

              {/* Character count */}
              <div className="text-right text-sm text-gray-500">
                {content.length}/2000
              </div>
            </div>

            {/* Selected Files Preview */}
            {(images.length > 0 ||
              videos.length > 0) /* || documents.length > 0 */ && (
              <div className="space-y-3">
                {/* Images */}
                {images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Images ({images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={getFileSource(image)}
                            alt={`Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(image, "image")}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Videos ({videos.length})
                    </h4>
                    <div className="space-y-2">
                      {videos.map((video, index) => (
                        <div key={index} className="relative group">
                          <video
                            src={getFileSource(video)}
                            controls
                            className="w-full max-h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(video, "video")}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DynTube URL Input */}
            {showDyntubeInput && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  DynTube Video URL
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={dyntubeUrl}
                    onChange={(e) => {
                      setDyntubeUrl(e.target.value);
                      setDyntubeError("");
                    }}
                    onBlur={() => {
                      if (dyntubeUrl.trim() && !isDyntubeUrl(dyntubeUrl.trim())) {
                        setDyntubeError("Please enter a valid DynTube URL (e.g. https://videos.dyntube.com/iframes/...)");
                      }
                    }}
                    placeholder="Paste DynTube video URL here..."
                    className="flex-1 px-3 py-2 border border-gray-200 bg-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDyntubeUrl("");
                      setDyntubeError("");
                      setShowDyntubeInput(false);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove DynTube URL"
                  >
                    <X size={16} />
                  </button>
                </div>
                {dyntubeError && (
                  <p className="text-xs text-red-500">{dyntubeError}</p>
                )}
                {/* DynTube Preview - Non-interactive iframe thumbnail */}
                {dyntubeUrl.trim() && isDyntubeUrl(dyntubeUrl.trim()) && (
                  <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={getEmbedUrl(dyntubeUrl.trim())}
                      className="w-full h-full"
                      loading="lazy"
                      tabIndex={-1}
                      scrolling="no"
                      style={{ pointerEvents: 'none', border: 'none', overflow: 'hidden' }}
                      title="DynTube Video Preview"
                    />
                    {/* Invisible overlay to prevent any interaction if needed */}
                    <div className="absolute inset-0" />
                  </div>
                )}
              </div>
            )}

            {/* TradingView Links Input */}
            {showTradingViewInput && (
              <DndProvider backend={HTML5Backend}>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    TradingView Links
                  </h4>
                  <DraggableLinkList
                    links={tradingViewLinks}
                    onReorder={handleReorderLinks}
                    onChange={handleLinkChange}
                    onRemove={handleRemoveLink}
                    onAdd={handleAddLink}
                  />
                </div>
              </DndProvider>
            )}

            {/* Media Upload Buttons */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              {/* File Change Indicator - Removed read-only message */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => handleFileChange(e, "image")}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 p-2 rounded-md transition-colors text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Image size={20} />
                  <span>Images</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={(e) => handleFileChange(e, "video")}
                  className="hidden"
                  accept="video/*"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 p-2 rounded-md transition-colors text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <Video size={20} />
                  <span>Videos</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDyntubeInput(!showDyntubeInput)}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    showDyntubeInput || dyntubeUrl
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Link2 size={20} />
                  <span>DynTube</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTradingViewInput(!showTradingViewInput)}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    showTradingViewInput || (tradingViewLinks || []).some((l) => l && l.trim())
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <BarChart3 size={20} />
                  <span>TradingView</span>
                </button>
              </div>

              {/* Clear All Button - only show when files exist */}
              {(images.length > 0 || videos.length > 0 || dyntubeUrl || (tradingViewLinks || []).some((l) => l && l.trim())) && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="flex items-center gap-2 p-2 ml-auto rounded-md transition-colors text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-400"
                >
                  <Trash2 size={18} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex border-gray-200 border-t justify-end py-5 rounded-b dark:border-gray-200 gap-3 md:py-5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (!content.trim() &&
                    images.length === 0 &&
                    videos.length === 0 &&
                    documents.length === 0 &&
                    !dyntubeUrl.trim() &&
                    !(tradingViewLinks || []).some((l) => l && l.trim()))
                }
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Posting..."
                  : editingPost
                    ? "Update Content"
                    : "Post"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
