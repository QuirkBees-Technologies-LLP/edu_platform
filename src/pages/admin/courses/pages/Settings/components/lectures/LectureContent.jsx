import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuthContext } from "@/auth/useAuthContext";
import { lmsLectures } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageInput } from "@/components/image-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import RichEditor from "@/components/ui/rich-editor";
import { toast } from "sonner";
import {
  Upload,
  Eye,
  EyeOff,
  FileText,
  Video,
  Save,
  PencilLine,
  X,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Paperclip,
  Download,
  Trash2,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  FileArchive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShowMoreLess from "../../../../../../../components/ui/showmoreless";

const LectureContent = ({
  lecture,
  onLectureUpdate,
  forceUpdateLectureList,
  setForceUpdateLectureList,
}) => {
  const { auth } = useAuthContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPreview1, setShowPreview1] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [videoFile, setVideoFile] = useState({});
  const [videoURL, setVideoURL] = useState(null);
  const [showPreviewVideo, setShowPreviewVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInputType, setVideoInputType] = useState("url");
  const [lectureContent, setLectureContent] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [resourceFiles, setResourceFiles] = useState([]);
  const [deletingResourceId, setDeletingResourceId] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);

  const [formData, setFormData] = useState({
    title: lecture?.title || "",
    description: lecture?.description || "",
    content: lecture?.content || "",
    type: lecture?.type || "TEXT",
    order: lecture?.order || 0,
    preview: lecture?.preview || false,
    section:
      typeof lecture?.section === "object"
        ? lecture?.section?._id
        : lecture?.section,
    thumbnail: lecture?.thumbnailUrl ? lecture?.thumbnailUrl : null,
    videoUrl: lecture?.videoUrl || null,
  });

  useEffect(() => {
    const fetchLectureContent = async () => {
      const response = await lmsLectures.getLectureById(
        lecture._id,
        auth.token
      );
      setLectureContent(response?.data);
    };

    // if (lecture.content) {
    //   setVideoInputType("url");
    // } else {
    //   setVideoInputType("upload");
    // }
    if (lecture.type === "VIDEO") {
      if (lecture.content && isValidVideoUrl(lecture.content)) {
        setVideoInputType("url");
      } else if (lecture.videoUrl || lecture.thumbnailUrl) {
        setVideoInputType("upload");
      } else {
        setVideoInputType("url");
      }
    } else {
      setVideoInputType("url");
    }

    if (lecture) {
      const sectionId =
        typeof lecture.section === "object"
          ? lecture.section._id
          : lecture.section;

      setFormData({
        title: lecture.title || "",
        description: lecture.description || "",
        content: lecture.content || "",
        type: lecture.type || "TEXT",
        order: lecture.order || 0,
        preview: lecture.preview || false,
        section: sectionId || "",
        thumbnail: lecture?.thumbnailUrl || null,
      });

      // setShowPreview(false);
      // setIsEditing(false);
      // setActiveTab("content");

      if (lecture?._id) {
        fetchLectureContent();
        setShowPreview(false);
        setIsEditing(false);
        setActiveTab("content");
        setResourceFiles([]);
      }
    }
  }, [lecture, onLectureUpdate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      ["description"]: value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      content: "", // Reset content when type changes
    }));
    setShowPreview(false);
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      content: url,
    }));

    if (isValidVideoUrl(url)) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  const isValidVideoUrl = (url) => {
    if (!url) return false;

    if (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("dyntube.com")
    ) {
      return true;
    }

    if (url.includes("vimeo.com")) {
      return true;
    }

    return false;
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // if (url.includes("vimeo.com/")) {
    //   const videoId = url.split("vimeo.com/")[1].split("?")[0];
    //   return `https://player.vimeo.com/video/${videoId}`;
    // }

    if (url.includes("vimeo.com/")) {
      const parts = url.split("vimeo.com/")[1].split("/");
      const videoId = parts[0].split("?")[0];
      const hash = parts[1] ? parts[1].split("?")[0] : null;
      return hash
        ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
        : `https://player.vimeo.com/video/${videoId}`;
    }

    if (url.includes("dailymotion.com/video/")) {
      const videoId = url.split("dailymotion.com/video/")[1].split("?")[0];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // Loom
    if (url.includes("loom.com/share/")) {
      const videoId = url.split("loom.com/share/")[1].split("?")[0];
      return `https://www.loom.com/embed/${videoId}`;
    }

    // Dyntube
    // if (url.includes("dyntube.com/video/")) {
    //     let videoId = url.split("dyntube.com/video/")[1].split("?")[0];
    //     videoId = videoId.replace(/\/$/, "");
    //     return `https://player.dyntube.com/video/${videoId}`;
    //   }
    if (url.includes("app.dyntube.com/#/video/")) {
      const match = url.match(/video\/([^/]+)/);
      if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
    }

    // CASE 2: https://videos.dyntube.com/iframes/<id>
    if (url.includes("videos.dyntube.com/iframes/")) {
      const match = url.match(/iframes\/([^/?#]+)/);
      if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
    }

    // CASE 3: https://player.dyntube.com/video/<id>
    if (url.includes("player.dyntube.com/video/")) {
      const match = url.match(/video\/([^/?#]+)/);
      if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
    }

    // CASE 4: fallback generic
    if (url.includes("dyntube.com/")) return url;

    return url;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file?.type?.startsWith("video/")) {
      setVideoFile(file);
    } else {
      setVideoFile(null);
      setShowPreviewVideo(null);
    }
  };

  useEffect(() => {
    if (videoFile instanceof File) {
      const url = URL.createObjectURL(videoFile);
      setShowPreviewVideo(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description?.trim()) {
      toast.error("Description is required");
      return;
    }

    // if (formData.type === "VIDEO" && !formData.thumbnail) {
    //   toast.error("Thumbnail is required for video lectures");
    //   return;
    // }

    // Content is required only when there are no resources (existing or staged)
    const hasExistingResources = (lectureContent?.resources?.length ?? 0) > 0;
    const hasStagedResources = resourceFiles.length > 0;
    const hasAnyResources = hasExistingResources || hasStagedResources;

    if (
      formData.type === "VIDEO" &&
      videoInputType === "url" &&
      !formData.content &&
      !hasAnyResources
    ) {
      toast.error("Video URL is required (or attach at least one resource)");
      return;
    }

    if (
      formData.type === "VIDEO" &&
      videoInputType === "upload" &&
      !videoFile &&
      !hasAnyResources
    ) {
      toast.error("Video file is required (or attach at least one resource)");
      return;
    }

    if (
      formData.type === "TEXT" &&
      !formData.content?.trim() &&
      !hasAnyResources
    ) {
      toast.error("Text content is required (or attach at least one resource)");
      return;
    }

    if (!auth?.token || !lecture?._id) return;

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("type", formData.type);
    dataToSend.append("order", formData.order);
    dataToSend.append("preview", formData.preview);
    dataToSend.append("section", formData.section);
    dataToSend.append("content", formData.content);
    if (videoFile) {
      dataToSend.append(
        "thumbnail",
        formData.thumbnail?.file ? formData.thumbnail?.file : null
      );
      dataToSend.append("video", videoFile);
    }

    // Append resource files
    if (resourceFiles.length > 0) {
      resourceFiles.forEach((file) => {
        dataToSend.append("resources", file);
      });
    }

    setIsLoading(true);
    setUploadProgress(0);
    let fakeProgress = 0;
    const interval = setInterval(() => {
      fakeProgress += 2;
      if (fakeProgress < 80) {
        setUploadProgress(fakeProgress);
      } else {
        clearInterval(interval);
      }
    }, 100); // adjust speed
    try {
      const updatedLecture = await lmsLectures.updateLecture(
        lecture._id,
        dataToSend,
        auth.token
      );

      setUploadProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setUploadProgress(0);
      }, 500);
      // Notify success
      toast.success("Lecture updated successfully");

      // Reset UI states
      setIsEditing(false);
      setShowPreview(false);
      setResourceFiles([]);

      // Update parent component if callback exists
      if (onLectureUpdate && typeof onLectureUpdate === "function") {
        onLectureUpdate(updatedLecture);
      }

      setForceUpdateLectureList(true);
    } catch (error) {
      clearInterval(interval);
      setIsLoading(false);
      setUploadProgress(0);
      console.error("Failed to update lecture:", error);
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unknown error";

      toast.error("Failed to update lecture: " + backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!lecture) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full p-4 inline-block mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 max-w-md">
            Select a lecture from the sidebar to view or edit its content
          </p>
        </div>
      </div>
    );
  }

  const renderContentEditor = () => {
    switch (formData.type) {
      case "TEXT":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4" />
              <Label htmlFor="content" className="font-medium">
                Text Content
              </Label>
            </div>
            <RichEditor
              content={formData.content}
              onChange={handleContentChange}
              className="min-h-[300px]"
            />
          </div>
        );
      case "VIDEO":
        return (
          <div className="space-y-4">
            {/* Dropdown Selector */}

            <div className="flex flex-col gap-1">
              <label className="form-label text-gray-900 gap-1">
                Thumbnail <span className="text-danger">*</span>
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData((prev) => ({
                          ...prev,
                          thumbnail: {
                            file,
                            preview: reader.result, // base64 for preview
                          },
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="thumbnailUpload"
                />
                <label
                  htmlFor="thumbnailUpload"
                  className="cursor-pointer border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100"
                >
                  <i className="ki-filled ki-upload mr-2"></i> Upload Thumbnail
                </label>

                {formData.thumbnail && (
                  <button
                    type="button"
                    className="btn btn-xs btn-icon rounded-full btn-danger"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, thumbnail: null }))
                    }
                  >
                    <i className="ki-outline ki-cross"></i>
                  </button>
                )}
              </div>

              {/* Thumbnail Preview */}
              {formData.thumbnail ||
                formData.thumbnail?.preview ||
                formData.thumbnail?.url ? (
                <div className="mt-3">
                  <img
                    src={
                      formData.thumbnail ||
                      formData.thumbnail?.preview ||
                      formData.thumbnail?.url || // fallback to existing thumbnail URL
                      ""
                    }
                    alt="Thumbnail"
                    className="w-48 h-28 rounded border border-success object-cover"
                  />
                </div>
              ) : null}
            </div>

            {/* <div className="space-y-2">
              <Label className="font-medium text-primary">
                Select Video Input Type
              </Label>
              <select
                value={videoInputType}
                onChange={(e) => {
                  setVideoInputType(e.target.value);
                  setFormData({ ...formData, content: "" });
                  setVideoFile(null);
                  setShowPreview(false);
                  setShowPreview1(false);
                  setShowPreviewVideo(null);
                }}
                className="border px-3 py-2 rounded-md w-full text-sm"
              >
                <option value="">-- Select --</option>
                <option value="url">Video URL</option>
                <option value="upload">Upload File</option>
              </select>
            </div> */}

            <Select
              value={videoInputType}
              onValueChange={(value) => {
                setVideoInputType(value);
                setFormData({ ...formData, content: "" });
                setVideoFile(null);
                setShowPreview(false);
                setShowPreview1(false);
                setShowPreviewVideo(null);
              }}
            >
              <SelectTrigger className="border-primary focus:border-primary focus:ring-primary">
                <SelectValue defaultValue="url" placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Video URL</span>
                  </div>
                </SelectItem>
                <SelectItem value="upload">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" />
                    <span>Upload File</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Video URL Input UI */}
            {videoInputType === "url" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Video className="w-4 h-4 text-primary" />
                  <Label htmlFor="videoUrl" className="font-medium">
                    Video URL
                  </Label>
                </div>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.content}
                  onChange={handleVideoUrlChange}
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  className="form-control input input-md w-full"
                />
                {formData.content && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 hover:bg-primary hover:text-white [&>*]:hover:text-white bg-none"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2 text-primary" />
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
                )}
                <AnimatePresence>
                  {showPreview && formData.content && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      <div className="aspect-video w-full border border-purple-200 rounded-md overflow-hidden shadow-sm">
                        <iframe
                          src={getEmbedUrl(formData.content)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Video Upload UI */}
            {videoInputType === "upload" && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <Label className="font-medium text-primary">
                    Upload Video
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="videoUpload"
                  />
                  <Label
                    htmlFor="videoUpload"
                    className="text-sm flex items-center gap-2 cursor-pointer border [&>*]:hover:text-white rounded-md px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                  >
                    <Upload className="h-4 w-4 text-primary" />
                    <span>Choose Video File</span>
                  </Label>
                </div>

                {videoFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 hover:bg-primary hover:text-white [&>*]:hover:text-white bg-none"
                    onClick={() => setShowPreview1(!showPreview1)}
                  >
                    <Eye className="h-4 w-4 mr-2 text-primary" />
                    {showPreview1 ? "Hide Preview" : "Show Preview"}
                  </Button>
                )}

                <p className="text-xs text-gray-500 italic">
                  Supported formats: MP4, WebM, Ogg (max 100MB)
                </p>

                <AnimatePresence>
                  {showPreview1 && videoFile && (
                    <motion.div
                      key="videoPreview"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3"
                    >
                      <div className="aspect-video w-full border border-purple-200 rounded-md overflow-hidden shadow-sm">
                        <video
                          src={showPreviewVideo}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // ── Resource helpers ──────────────────────────────────────────────
  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon className="w-5 h-5 text-gray-400" />;
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes("word") || mimeType.includes("document")) return <FileText className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType.includes("csv")) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return <FileText className="w-5 h-5 text-orange-500" />;
    if (mimeType.includes("image")) return <FileImage className="w-5 h-5 text-purple-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive className="w-5 h-5 text-yellow-600" />;
    return <FileIcon className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleResourceUpload = (e) => {
    const files = Array.from(e.target.files);
    setResourceFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeResourceFile = (index) => {
    setResourceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteResource = async (resourceId) => {
    if (!auth?.token || !lecture?._id) return;
    setDeletingResourceId(resourceId);
    try {
      await lmsLectures.deleteResource(lecture._id, resourceId, auth.token);
      // Refresh lecture content
      const response = await lmsLectures.getLectureById(lecture._id, auth.token);
      setLectureContent(response?.data);
      toast.success("Resource deleted successfully");
      setForceUpdateLectureList(true);
    } catch (error) {
      console.error("Failed to delete resource:", error);
      toast.error("Failed to delete resource");
    } finally {
      setDeletingResourceId(null);
    }
  };

  const renderResourcesEditor = () => (
    <div className="space-y-4 border-t border-gray-100 pt-4">
      <div className="flex items-center gap-2 text-primary">
        <Paperclip className="w-4 h-4" />
        <Label className="font-medium">Resources / Attachments</Label>
      </div>
      <p className="text-xs text-gray-500">
        Upload supporting materials like PDFs, PPTs, Word docs, or Excel sheets. Max 10 files per upload.
      </p>

      {/* Existing resources */}
      {lectureContent?.resources && lectureContent.resources.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 ">Existing Resources</p>
          {lectureContent.resources.map((resource) => (
            <div
              key={resource._id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200"
            >
              {getFileIcon(resource.mimeType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {resource.originalName}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(resource.size)}
                </p>
              </div>

              {/* Delete button */}
              {/* <button
                type="button"
                onClick={() => handleDeleteResource(resource._id)}
                disabled={deletingResourceId === resource._id}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors disabled:opacity-50"
                title="Delete resource"
              >
                {deletingResourceId === resource._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button> */}
            </div>
          ))}
        </div>
      )}

      {/* New file picker */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
          onChange={handleResourceUpload}
          className="hidden"
          id="resourceUpload"
        />
        <label
          htmlFor="resourceUpload"
          className="text-sm flex items-center gap-2 cursor-pointer border rounded-md px-4 py-2 hover:bg-primary hover:text-white [&>*]:hover:text-white transition-colors"
        >
          <Upload className="h-4 w-4 text-primary" />
          <span>Choose Files</span>
        </label>
      </div>

      {/* Staged files list */}
      {resourceFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Files to upload ({resourceFiles.length})</p>
          {resourceFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-primary/30 bg-primary/5"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-700">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeResourceFile(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const getPreviewType = (mimeType) => {
    if (!mimeType) return "other";
    if (mimeType.includes("image")) return "image";
    if (mimeType.includes("pdf")) return "pdf";
    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      mimeType.includes("presentation") ||
      mimeType.includes("powerpoint") ||
      mimeType.includes("sheet") ||
      mimeType.includes("excel")
    )
      return "office";
    return "other";
  };

  const renderViewResources = () => {
    const resources = lectureContent?.resources || [];
    if (resources.length === 0) {
      return null;
    }
    return (
      <>
        <div className="space-y-3 p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary" />
            Resources
            <span className="bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full leading-none">
              {resources.length}
            </span>
          </h3>
          <div className="space-y-2">
            {resources?.map((resource) => (
              <div
                key={resource._id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
              >
                {getFileIcon(resource.mimeType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {resource.originalName}
                  </p>
                  <p className="text-xs text-gray-700">
                    {formatFileSize(resource.size)}
                  </p>
                </div>

                {/* View / Preview button */}
                <button
                  type="button"
                  onClick={() => {
                    const type = getPreviewType(resource.mimeType);
                    if (type === "other") {
                      window.open(resource.url, "_blank", "noopener,noreferrer");
                    } else {
                      setPreviewResource(resource);
                    }
                  }}
                  className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>

                {/* <button
                  type="button"
                  onClick={() => handleDeleteResource(resource._id)}
                  disabled={deletingResourceId === resource._id}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors disabled:opacity-50"
                  title="Delete resource"
                >
                  {deletingResourceId === resource._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button> */}
              </div>
            ))}
          </div>
        </div>

        {/* Resource Preview Modal */}
        {createPortal(
          <AnimatePresence>
            {previewResource && (
              <motion.div
                key="resource-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ position: "fixed", inset: 0, zIndex: 9999 }}
                className="flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setPreviewResource(null)}
              >
                <motion.div
                  key="resource-modal"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(previewResource.mimeType)}
                      <span className="text-sm font-medium text-gray-100 truncate">
                        {previewResource.originalName}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatFileSize(previewResource.size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <a
                        href={previewResource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => setPreviewResource(null)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-hidden relative">
                    {getPreviewType(previewResource.mimeType) === "image" ? (
                      <div className="flex items-center justify-center p-6 h-full">
                        <img
                          src={previewResource.url}
                          alt={previewResource.originalName}
                          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                        />
                      </div>
                    ) : getPreviewType(previewResource.mimeType) === "pdf" ? (
                      // Native browser PDF viewer — opens instantly
                      <iframe
                        src={previewResource.url}
                        className="w-full h-[70vh] border-0"
                        title={previewResource.originalName}
                      />
                    ) : getPreviewType(previewResource.mimeType) === "office" ? (
                      // Office docs need an external renderer
                      <div className="relative w-full h-[70vh]">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 text-gray-400 text-sm z-0">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span>Loading preview…</span>
                        </div>
                        <iframe
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewResource.url)}`}
                          className="relative z-10 w-full h-full border-0"
                          title={previewResource.originalName}
                        />
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </>
    );
  };

  const renderViewContent = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="space-y-3 p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Title
            </h3>
            <p className="text-gray-700 p-2 rounded-md">
              {lectureContent?.title}
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Description
            </h3>
            {lectureContent?.description ? (
              <ShowMoreLess html={lectureContent?.description} limit={120} />
            ) : (
              "No description provided"
            )}
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            {lectureContent?.type === "VIDEO" ? (
              <Video className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
            {lectureContent?.type === "VIDEO"
              ? "Video Content"
              : "Text Content"}
          </h3>
          <div className="mt-2">
            {lectureContent?.type === "VIDEO" ? (
              <div className="aspect-video w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <iframe
                  src={getEmbedUrl(
                    lectureContent?.videoUrl
                      ? lectureContent?.videoUrl
                      : lectureContent?.content
                  )}
                  className="w-full h-full rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="p-4  border border-gray-200 rounded-lg prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: lectureContent?.videoUrl
                    ? lectureContent?.videoUrl
                    : lectureContent?.content,
                }}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              Preview Access
            </h3>
            <p className="text-sm text-gray-500">
              {lectureContent?.preview
                ? "Students can preview this lecture before enrollment"
                : "This lecture is only available after enrollment"}
            </p>
          </div>
          <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-100">
            <span
              className={`flex items-center gap-1.5 text-sm font-medium ${lectureContent?.preview ? "text-green-700" : "text-gray-500"
                }`}
            >
              {lectureContent?.preview ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Enabled
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-gray-500" />
                  Disabled
                </>
              )}
            </span>
          </div>
        </div>

        {/* Resources section inline */}
        {renderViewResources()}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-3  p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Lecture Order
          </h3>
          <p className="text-gray-700 p-2  rounded-md">
            {lectureContent?.order || "0"} (Position in section)
          </p>
        </div>

        <div className="flex items-center gap-4  p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              Preview Access
            </h3>
            <p className="text-sm text-gray-500">
              {lectureContent?.preview
                ? "Students can preview this lecture before enrolling in the course"
                : "This lecture is only available after enrollment"}
            </p>
          </div>
          <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-100">
            <span
              className={`flex items-center gap-1.5 text-sm font-medium ${lectureContent?.preview ? "text-green-700" : "text-gray-500"
                }`}
            >
              {lectureContent?.preview ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Enabled
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-gray-500" />
                  Disabled
                </>
              )}
            </span>
          </div>
        </div>

        <div className="space-y-3  p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            Lecture Type
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${lecture?.type === "VIDEO"
                ? "bg-primary-light text-primary"
                : "bg-primary-light text-primary"
                }`}
            >
              {lecture?.type === "VIDEO" ? (
                <>
                  <Video className="w-3.5 h-3.5 text-primary" />
                  Video
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Text
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };
  const handleEditClick = () => {
    if (!isEditing) {
      if (formData.type === "VIDEO") {
        if (isValidVideoUrl(formData.content)) {
          setVideoInputType("url");
        } else if (formData.thumbnail || formData.videoUrl) {
          setVideoInputType("upload");
        } else {
          setVideoInputType("url");
        }
      } else {
        setVideoInputType("url");
      }
    } else {
      setShowPreview(false);
      setShowPreview1(false);
    }

    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between  p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {lecture?.type === "VIDEO" ? (
              <Video className="w-5 h-5 text-primary" />
            ) : (
              <FileText className="w-5 h-5 text-primary" />
            )}
            {lecture?.title}
          </h2>
          {lecture?.description ? (
            <ShowMoreLess html={lecture?.description} limit={120} />
          ) : (
            "No description provided"
          )}
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          className={
            isEditing
              ? "btn border-red-600 text-red-600"
              : "bg-primary hover:bg-primary"
          }
          onClick={handleEditClick}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PencilLine className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className=" p-6 rounded-lg border border-gray-200 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <FileText className="w-4 h-4" />
                      <Label htmlFor="title" className="font-medium">
                        Title
                      </Label>
                    </div>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Lecture title"
                      required
                      className="border-primary focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <FileText className="w-4 h-4" />
                      <Label htmlFor="description" className="font-medium">
                        Description
                      </Label>
                    </div>
                    {/* <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of this lecture"
                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    /> */}
                    <RichEditor
                      id="description"
                      name="description"
                      content={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Brief description of this lecture"
                      className="min-h-[300px]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="w-4 h-4" />
                    <Label htmlFor="type" className="font-medium">
                      Content Type
                    </Label>
                  </div>
                  <Select
                    value={formData.type}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="border-primary focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="TEXT"
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Text</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="VIDEO">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-primary" />
                          <span>Video</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  {renderContentEditor()}
                </div>

                {/* Resources section */}
                {renderResourcesEditor()}

                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <Switch
                    id="preview"
                    checked={formData.preview}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, preview: checked }))
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                  <div>
                    <Label htmlFor="preview" className="font-medium">
                      Allow Preview
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      If enabled, students can view this lecture before
                      enrolling in the course
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setShowPreview(false);
                    }}
                    className="border-red-900 text-red-600 hover:bg-light"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploadProgress < 100
                          ? `Uploading ${uploadProgress}%`
                          : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className=" rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${activeTab === "content"
                    ? "text-primary border-b-2 border-primary bg-light"
                    : "text-gray-500 hover:text-gray-700 hover:bg-light"
                    }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${activeTab === "settings"
                    ? "text-primary border-b-2 border-primary bg-light"
                    : "text-gray-500 hover:text-gray-700 hover:bg-light"
                    }`}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {activeTab === "content" ? (
                    <motion.div
                      key="content-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {renderViewContent()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="settings-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {renderSettings()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LectureContent;
