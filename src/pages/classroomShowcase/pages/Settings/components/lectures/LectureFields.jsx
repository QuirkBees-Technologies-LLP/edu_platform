import { useState } from "react";
import {
  Edit,
  Save,
  Type,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";

const LectureFields = ({ lecture, onSave, isSaving, error, lastSaved }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(lecture.title);
  const [editedDescription, setEditedDescription] = useState(
    lecture.description || ""
  );
  const [lectureType, setLectureType] = useState(lecture.type || "text");
  const [isPreview, setIsPreview] = useState(lecture.preview || false);
  const [thumbnailUrl, setThumbnailUrl] = useState(lecture.thumbnailUrl || "");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    await onSave({
      title: editedTitle,
      description: editedDescription,
      type: lectureType,
      preview: isPreview,
      thumbnailUrl: thumbnailUrl,
    });
  };

  const handleDescriptionSave = async () => {
    setIsEditingDescription(false);
    await onSave({
      title: editedTitle,
      description: editedDescription,
      type: lectureType,
      preview: isPreview,
      thumbnailUrl: thumbnailUrl,
    });
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingThumbnail(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload to your storage service
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload thumbnail");
      }

      const data = await response.json();
      setThumbnailUrl(data.url);

      // Update lecture with new thumbnail
      await onSave({
        title: editedTitle,
        description: editedDescription,
        type: lectureType,
        preview: isPreview,
        thumbnailUrl: data.url,
      });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Title and Description */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleTitleSave}
                className="p-2 text-green-600 hover:text-green-700"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <h2 className="text-2xl font-bold">{editedTitle}</h2>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-4">
            {error && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {lastSaved && (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isEditingDescription ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="flex-1 text-gray-600 border-b-2 border-blue-500 focus:outline-none"
                placeholder="Add a description..."
                autoFocus
              />
              <button
                onClick={handleDescriptionSave}
                className="p-2 text-green-600 hover:text-green-700"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <p className="text-gray-600">
                {editedDescription || "No description"}
              </p>
              <button
                onClick={() => setIsEditingDescription(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lecture Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Lecture Type
          </label>
          <select
            value={lectureType}
            onChange={(e) => {
              setLectureType(e.target.value);
              onSave({
                title: editedTitle,
                description: editedDescription,
                type: e.target.value,
                preview: isPreview,
                thumbnailUrl: thumbnailUrl,
              });
            }}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* Preview Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview Status
          </label>
          <button
            onClick={() => {
              setIsPreview(!isPreview);
              onSave({
                title: editedTitle,
                description: editedDescription,
                type: lectureType,
                preview: !isPreview,
                thumbnailUrl: thumbnailUrl,
              });
            }}
            className={`p-2 rounded flex items-center gap-2 ${
              isPreview
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {isPreview ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Preview enabled</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Preview disabled</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Lecture Thumbnail
        </label>
        <div className="flex items-center gap-4">
          <label
            className={`p-3 rounded flex items-center gap-2 cursor-pointer ${
              isUploadingThumbnail
                ? "bg-gray-100 text-gray-700"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
              disabled={isUploadingThumbnail}
            />
            <Upload className="w-5 h-5" />
            <span>
              {isUploadingThumbnail
                ? "Uploading..."
                : thumbnailUrl
                  ? "Change thumbnail"
                  : "Add thumbnail"}
            </span>
          </label>
          {thumbnailUrl && (
            <div className="relative">
              <img
                src={thumbnailUrl}
                alt="Lecture thumbnail"
                className="w-20 h-20 rounded object-cover border"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                <button
                  onClick={() => setThumbnailUrl("")}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureFields;
