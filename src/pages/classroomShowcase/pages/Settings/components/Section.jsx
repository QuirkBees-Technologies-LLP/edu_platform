import { useState, useEffect } from "react";
import {
  GripVertical,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useLectureStore } from "@/store/lectureStore";
import { useAuthContext } from "@/auth/useAuthContext";

const Section = ({
  section,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onLectureSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [editingLecture, setEditingLecture] = useState(null);
  const [editLectureTitle, setEditLectureTitle] = useState("");

  const { auth } = useAuthContext();
  const {
    lectures,
    fetchLectures,
    createNewLecture,
    updateExistingLecture,
    deleteLecture,
    reorderLectures,
    isLoading,
  } = useLectureStore();

  // Fetch lectures when section is expanded
  useEffect(() => {
    if (isExpanded && auth?.token) {
      fetchLectures(section.id, auth.token);
    }
  }, [isExpanded, section.id, auth?.token]);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleUpdate = () => {
    onUpdate(section.id, editTitle);
    setIsEditing(false);
  };

  const handleAddLecture = async () => {
    if (!newLectureTitle.trim() || !auth?.token) return;

    try {
      await createNewLecture(
        {
          title: newLectureTitle,
          sectionId: section.id,
        },
        auth.token
      );
      setNewLectureTitle("");
      setIsAddingLecture(false);
    } catch (error) {
      console.error("Failed to create lecture:", error);
    }
  };

  const handleUpdateLecture = async (lectureId) => {
    if (!editLectureTitle.trim() || !auth?.token) return;

    try {
      await updateExistingLecture(
        lectureId,
        {
          title: editLectureTitle,
          sectionId: section.id,
        },
        auth.token
      );
      setEditingLecture(null);
      setEditLectureTitle("");
    } catch (error) {
      console.error("Failed to update lecture:", error);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!auth?.token) return;

    try {
      await deleteLecture(lectureId, auth.token);
    } catch (error) {
      console.error("Failed to delete lecture:", error);
    }
  };

  const handleReorderLectures = async (dragIndex, hoverIndex) => {
    if (!auth?.token) return;

    try {
      await reorderLectures(dragIndex, hoverIndex, auth.token);
    } catch (error) {
      console.error("Failed to reorder lectures:", error);
    }
  };

  return (
    <div
      className={`bg-white rounded border transition-colors ${
        isSelected ? "border-blue-500" : "hover:border-gray-300"
      }`}
    >
      <div
        className="flex items-center gap-1 p-2 cursor-pointer"
        onClick={() => onSelect(section)}
      >
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <button
          onClick={toggleExpand}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isEditing ? (
          <div
            className="flex-1 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded"
              autoFocus
            />
            <button
              onClick={handleUpdate}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditTitle(section.title);
              }}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 text-sm hover:text-blue-600">
              {section.title}
            </div>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(section.id)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
      {isExpanded && (
        <div className="pl-8 pr-2 pb-2 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2">
              <h4 className="text-sm font-medium text-gray-700">Lectures</h4>
              <button
                onClick={() => setIsAddingLecture(true)}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {isAddingLecture && (
              <div className="flex items-center gap-1 mb-2">
                <input
                  type="text"
                  value={newLectureTitle}
                  onChange={(e) => setNewLectureTitle(e.target.value)}
                  placeholder="New lecture"
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  autoFocus
                />
                <button
                  onClick={handleAddLecture}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAddingLecture(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-1">
              {lectures?.map((lecture, index) => (
                <div
                  key={lecture.id}
                  className="flex items-center gap-1 p-2 bg-white rounded border hover:border-gray-300"
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {editingLecture === lecture.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="text"
                        value={editLectureTitle}
                        onChange={(e) => setEditLectureTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateLecture(lecture.id)}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLecture(null);
                          setEditLectureTitle("");
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex-1 text-sm cursor-pointer hover:text-blue-600"
                        onClick={() => onLectureSelect(lecture)}
                      >
                        {lecture.title}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingLecture(lecture.id);
                            setEditLectureTitle(lecture.title);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLecture(lecture.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section;
