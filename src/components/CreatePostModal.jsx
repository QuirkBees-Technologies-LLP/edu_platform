import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image,
  Video,
  FileText,
  Globe,
  Users,
  Lock,
  FolderOpen,
} from "lucide-react";
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

const CreatePostModal = ({ isOpen, onClose, editingPost = null }) => {
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

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // Reset all statuses when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear any previous statuses to prevent immediate closure
      dispatch(clearCreatePostStatus());
      dispatch(clearEducatorPostsStatus());
      setHasInitialized(false);
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (editingPost) {
      setIsEditing(true);
      setContent(editingPost.content || "");
      // For editing, images/videos/documents might be URLs, not File objects
      // We'll keep them as is for display, but new uploads will be File objects
      setImages(editingPost.images || []);
      setVideos(editingPost.videos || []);
      setDocuments(editingPost.documents || []);
      setVisibility(editingPost.visibility || "public");
      setCategory(editingPost.category || "General Updates");

      // Set initialization flag after a short delay to prevent immediate closure
      setTimeout(() => {
        setHasInitialized(true);
      }, 100);
    } else {
      setIsEditing(false);
      // For new posts, set hasInitialized to true immediately
      setHasInitialized(true);
    }
  }, [editingPost]);

  useEffect(() => {
    // Only handle success after component has properly initialized
    if (!hasInitialized) return;

    // Handle create post success (only when not editing)
    if (createStatus === "succeeded" && !isEditing) {
      handleClose();
      dispatch(clearCreatePostStatus());
    }

    // Handle update post success (only when actively editing)
    if (generalStatus === "succeeded" && isEditing) {
      handleClose();
      // Clear the general error state when update succeeds
      dispatch(clearEducatorPostsStatus());
    }
  }, [createStatus, generalStatus, dispatch, isEditing, hasInitialized]);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      // Clean up any object URLs to prevent memory leaks
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
    // Clear any Redux errors when closing
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

  // Helper function to get the display source for files
  const getFileSource = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    } else if (typeof file === "string") {
      return file; // URL string
    } else if (file && file.url) {
      return file.url; // Object with url property
    }
    return ""; // Fallback
  };

  const clearAllFiles = () => {
    setImages([]);
    setVideos([]);
    setDocuments([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  // Helper function to detect if files have changed during editing
  const hasFilesChanged = () => {
    if (!editingPost) return true; // Always true for new posts

    // Check if any new files were added
    const hasNewImages = images.some((file) => file instanceof File);
    const hasNewVideos = videos.some((file) => file instanceof File);
    const hasNewDocuments = documents.some((file) => file instanceof File);

    // Check if any existing files were removed
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

    if (
      !content.trim() &&
      images.length === 0 &&
      videos.length === 0 &&
      documents.length === 0
    ) {
      toast.error("Please add some content or media to your post");
      return;
    }

    setIsSubmitting(true);

    try {
      // When editing, we need to separate existing files (URLs) from new files (File objects)
      const processFiles = (files) => {
        if (!files || files.length === 0) return undefined;

        return files.map((file) => {
          if (file instanceof File) {
            // New file - keep as is for FormData
            return file;
          } else if (typeof file === "string") {
            // Existing file URL - convert to object with url property
            return { url: file };
          } else if (file && file.url) {
            // Already in correct format
            return file;
          } else {
            // Fallback - keep as is
            return file;
          }
        });
      };

      const postData = {
        content: content.trim(),
        visibility,
        category,
      };

      // Only include files in the API call if they've actually changed
      if (hasFilesChanged()) {
        postData.images = processFiles(images);
        postData.videos = processFiles(videos);
        postData.documents = processFiles(documents);
      }

      if (editingPost) {
        await dispatch(
          updateEducatorPost({ id: editingPost.id, postData })
        ).unwrap();
        toast.success("Post updated successfully!");
        // Close modal after a short delay so user can see the success message
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        const result = await dispatch(createEducatorPost(postData)).unwrap();

        toast.success("Post created successfully!");
        // Close modal immediately and also after a delay as backup
        handleClose();
        // Additional backup close after delay
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to submit post:", error);

      // Check for JWT expired error
      if (isJwtExpiredError(error)) {
        handleJwtExpired(handleClose, "/auth/login", 1500);
        return;
      }

      // Don't show toast here - let the Redux error state handle it
      // The error will be displayed in the Alert component above the form
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

  const categories = [
    "General Updates",
    "Analysis Updates",
    // 'general',
    // 'education',
    // 'trading',
    // 'technology',
    // 'business',
    // 'lifestyle',
    // 'news',
    // 'other'
  ];

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

              {/* Category Selection */}
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
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                          {/* Only show remove button when not editing OR when editing but no existing images */}
                          {(!editingPost ||
                            (editingPost && !editingPost.images?.length)) && (
                            <button
                              type="button"
                              onClick={() => removeFile(image, "image")}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          )}
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
                          {/* Only show remove button when not editing OR when editing but no existing videos */}
                          {(!editingPost ||
                            (editingPost && !editingPost.videos?.length)) && (
                            <button
                              type="button"
                              onClick={() => removeFile(video, "video")}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents - Button commented out but functionality remains */}
                {/* {documents.length > 0 && (
                                     <div>
                                         <h4 className="text-sm font-medium text-gray-700 mb-2">Documents ({documents.length})</h4>
                                         <div className="space-y-2">
                                             {documents.map((doc, index) => (
                                                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                                     <div className="flex items-center gap-2">
                                                         <FileText size={20} className="text-blue-500" />
                                                         <span className="text-sm text-gray-700">{doc.name}</span>
                                                     </div>
                                                     {(!editingPost || (editingPost && !editingPost.documents?.length)) && (
                                                         <button
                                                             type="button"
                                                             onClick={() => removeFile(doc, 'document')}
                                                             className="p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                         >
                                                             <X size={16} />
                                                         </button>
                                                     )}
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )} */}

                {/* Clear All Button - Only show when not editing OR when editing but no existing files */}
                {(!editingPost ||
                  (editingPost &&
                    !editingPost.images?.length &&
                    !editingPost.videos?.length &&
                    !editingPost.documents?.length)) && (
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    className="text-sm text-red-600 hover:text-red-800 hover:underline"
                  >
                    Clear all files
                  </button>
                )}
              </div>
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
                  disabled={editingPost && editingPost.images?.length > 0}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !editingPost ||
                      (editingPost && !editingPost.images?.length)
                    ) {
                      imageInputRef.current?.click();
                    }
                  }}
                  disabled={editingPost && editingPost.images?.length > 0}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    editingPost && editingPost.images?.length > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Image size={20} />
                  <span>{editingPost ? "Images" : "Images"}</span>
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
                  disabled={editingPost && editingPost.videos?.length > 0}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !editingPost ||
                      (editingPost && !editingPost.videos?.length)
                    ) {
                      videoInputRef.current?.click();
                    }
                  }}
                  disabled={editingPost && editingPost.videos?.length > 0}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    editingPost && editingPost.videos?.length > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Video size={20} />
                  <span>{editingPost ? "Videos" : "Videos"}</span>
                </button>
              </div>

              {/* Document upload button - Commented out but functionality remains */}
              {/* <div className="flex items-center gap-2">
                                     <input
                                         type="file"
                                         ref={documentInputRef}
                                         onChange={(e) => handleFileChange(e, 'document')}
                                         className="hidden"
                                         accept=".pdf,.doc,.docx,.txt"
                                         multiple
                                         disabled={editingPost && (editingPost.documents?.length > 0)}
                                     />
                                     <button 
                                         type="button"
                                         onClick={() => {
                                             if (!editingPost || (editingPost && !editingPost.documents?.length)) {
                                                 documentInputRef.current?.click();
                                             }
                                         }} 
                                         disabled={editingPost && (editingPost.documents?.length > 0)}
                                         className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                                             editingPost && (editingPost.documents?.length > 0)
                                                 ? 'text-gray-400 cursor-not-allowed' 
                                                 : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                         }`}
                                     >
                                         <FileText size={20} />
                                         <span>
                                             {editingPost 
                                                 ? 'Documents'
                                                 : 'Documents'
                                             }
                                         </span>
                                     </button>
                                 </div> */}
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
                    documents.length === 0)
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
