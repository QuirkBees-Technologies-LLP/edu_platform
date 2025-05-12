import { useState, useEffect } from "react";
import { useAuthContext } from "@/auth/useAuthContext";
import { lmsLectures } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FileText,
  Video,
  Save,
  PencilLine,
  X,
  Check,
  Clock,
  AlertCircle,
  Loader2,
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
  const [activeTab, setActiveTab] = useState("content");

  const [lectureContent, setLectureContent] = useState(null);

  const [formData, setFormData] = useState({
    title: lecture?.title || "",
    description: lecture?.description || "",
    content: lecture?.content || "",
    type: lecture?.type || "TEXT",
    order: lecture?.order || 0,
    preview: lecture?.preview || false,
    section: lecture?.section?._id || "",
  });

  useEffect(() => {
    const fetchLectureContent = async () => {
      const response = await lmsLectures.getLecture(lecture._id, auth.token);
      setLectureContent(response);
    };
    console.log(lecture, "lecture");

    if (lecture) {
      setFormData({
        title: lecture.title || "",
        description: lecture.description || "",
        content: lecture.content || "",
        type: lecture.type || "TEXT",
        order: lecture.order || 0,
        preview: lecture.preview || false,
        section: lecture.section?._id || "",
      });
      setShowPreview(false);
      setIsEditing(false);
      setActiveTab("content");
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

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return true;
    }

    if (url.includes('vimeo.com')) {
      return true;
    }

    return false;
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';

    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return url;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Aquí deberías implementar la lógica para subir el archivo a tu servidor
    // Por ahora, solo mostraremos un mensaje
    toast.info("File upload functionality to be implemented");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth?.token || !lecture?._id) return;

    setIsLoading(true);
    try {
      const updatedLecture = await lmsLectures.updateLecture(
        lecture._id,
        formData,
        auth.token
      );

      // Notify success
      toast.success("Lecture updated successfully");

      // Reset UI states
      setIsEditing(false);
      setShowPreview(false);

      // Update parent component if callback exists
      if (onLectureUpdate && typeof onLectureUpdate === "function") {
        onLectureUpdate(updatedLecture);
      }

      setForceUpdateLectureList(true);
    } catch (error) {
      toast.error(
        "Failed to update lecture: " + (error.message || "Unknown error")
      );
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
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <Label className="font-medium text-primary">Upload Video</Label>
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
              <p className="text-xs text-gray-500 italic">
                Supported formats: MP4, WebM, Ogg (max 100MB)
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
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
              {lecture.title}
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Description
            </h3>
            {lecture.description ? <ShowMoreLess html={lecture.description} limit={120} />: "No description provided"}
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            {lecture.type === "VIDEO" ? (
              <Video className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
            {lecture.type === "VIDEO" ? "Video Content" : "Text Content"}
          </h3>
          <div className="mt-2">
            {lecture.type === "VIDEO" ? (
              <div className="aspect-video w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <iframe
                  src={getEmbedUrl(lecture.content)}
                  className="w-full h-full rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="p-4  border border-gray-200 rounded-lg prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lecture.content }}
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
              {lecture.preview
                ? "Students can preview this lecture before enrollment"
                : "This lecture is only available after enrollment"}
            </p>
          </div>
          <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-100">
            <span
              className={`flex items-center gap-1.5 text-sm font-medium ${lecture.preview ? "text-green-700" : "text-gray-500"
                }`}
            >
              {lecture.preview ? (
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
            {lecture.order || "0"} (Position in section)
          </p>
        </div>

        <div className="flex items-center gap-4  p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              Preview Access
            </h3>
            <p className="text-sm text-gray-500">
              {lecture.preview
                ? "Students can preview this lecture before enrolling in the course"
                : "This lecture is only available after enrollment"}
            </p>
          </div>
          <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-100">
            <span
              className={`flex items-center gap-1.5 text-sm font-medium ${lecture.preview ? "text-green-700" : "text-gray-500"
                }`}
            >
              {lecture.preview ? (
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
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${lecture.type === "VIDEO"
                ? "bg-primary-light text-primary"
                : "bg-primary-light text-primary"
                }`}
            >
              {lecture.type === "VIDEO" ? (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between  p-4 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {lecture.type === "VIDEO" ? (
              <Video className="w-5 h-5 text-primary" />
            ) : (
              <FileText className="w-5 h-5 text-primary" />
            )}
            {lecture.title}
          </h2>
          {lecture.description ? <ShowMoreLess html={lecture.description} limit={120} />: "No description provided"}
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          className={
            isEditing
              ? "btn border-red-600 text-red-600"
              : "bg-primary hover:bg-primary"
          }
          onClick={() => {
            setIsEditing(!isEditing);
            setShowPreview(false);
          }}
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
                        Saving...
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
