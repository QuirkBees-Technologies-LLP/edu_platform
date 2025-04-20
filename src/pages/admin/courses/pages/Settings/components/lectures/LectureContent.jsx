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
import { Upload, Eye } from "lucide-react";

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
    }
  }, [lecture]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setFormData((prev) => ({
      ...prev,
      content: e.target.value,
    }));
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!lecture) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a lecture to view its content</p>
      </div>
    );
  }

  const renderContentEditor = () => {
    switch (formData.type) {
      case "TEXT":
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
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
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={formData.content}
                onChange={handleVideoUrlChange}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              />
              {formData.content && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              )}
              {showPreview && formData.content && (
                <div className="mt-2">
                  <div className="aspect-video w-full border rounded-md overflow-hidden">
                    <iframe
                      src={formData.content}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Or upload a video file</Label>
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
                  className="flex items-center gap-2 cursor-pointer border rounded-md px-4 py-2 hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose File</span>
                </Label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lecture Content</h2>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => {
            setIsEditing(!isEditing);
            setShowPreview(false);
          }}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Lecture title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Lecture description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Text</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderContentEditor()}

          <div className="flex items-center space-x-2">
            <Switch
              id="preview"
              checked={formData.preview}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, preview: checked }))
              }
            />
            <Label htmlFor="preview">Allow preview</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setShowPreview(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Title</h3>
            <p className="text-gray-700">{lecture.title}</p>
          </div>

          <div>
            <h3 className="font-medium">Description</h3>
            <p className="text-gray-700">{lecture.description}</p>
          </div>

          <div>
            <h3 className="font-medium">Type</h3>
            <p className="text-gray-700">{lecture.type}</p>
          </div>

          <div>
            <h3 className="font-medium">Content</h3>
            {lecture.type === "VIDEO" ? (
              <div className="mt-2">
                <div className="aspect-video w-full">
                  <iframe
                    src={lecture.content}
                    className="w-full h-full rounded-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div
                className="mt-2 p-4 bg-gray-50 rounded prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lecture.content }}
              />
            )}
          </div>

          <div>
            <h3 className="font-medium">Preview</h3>
            <p className="text-gray-700">{lecture.preview ? "Yes" : "No"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureContent;
