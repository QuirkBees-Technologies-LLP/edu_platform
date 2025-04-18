import { useEffect, useState } from "react";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { useAuthContext } from "@/auth/useAuthContext";
import {
  updateExistingSection,
  deleteExistingSection,
} from "@/store/reducer/sectionSlice";

const SectionItem = (props) => {
  const {
    section,
    onLectureSelect,
    index,
    moveSection,
    onMoveLecture,
    isExpanded,
    onToggleExpand,
    forceUpdate,
  } = props;

  const dispatch = useDispatch();
  const { auth } = useAuthContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [editingLecture, setEditingLecture] = useState(null);
  const [editLectureTitle, setEditLectureTitle] = useState("");
  const [lectures, setLectures] = useState([]);

  // Drag and Drop for Section Title
  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: { id: section._id, index, type: "SECTION" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ["SECTION", "LECTURE"],
    hover(item) {
      if (item.type === "SECTION") {
        if (item.index === index) return;
        moveSection(item.index, index);
        item.index = index;
      } else if (item.type === "LECTURE" && item.sectionId !== section._id) {
        onMoveLecture(item.sectionId, section._id, item.lectureId);
      }
    },
  });

  const handleUpdateSection = async () => {
    if (!editTitle.trim() || !auth?.token) return;

    console.log("Updating section", section);

    try {
      await dispatch(
        updateExistingSection({
          id: section._id,
          sectionData: {
            title: editTitle,
            course: section.course._id || section.course,
          },
          token: auth.token,
        })
      ).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  };

  const handleDeleteSection = async () => {
    if (!auth?.token) return;

    try {
      await dispatch(
        deleteExistingSection({
          id: section.id,
          token: auth.token,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to delete section:", error);
    }
  };

  return (
    <div
      ref={drop}
      className={`border rounded-lg p-2 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div ref={drag} className="flex items-center justify-between cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <button
            onClick={onToggleExpand}
            className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-full"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="px-2 py-1 border rounded"
              autoFocus
            />
          ) : (
            <span className="font-medium">{section.title}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdateSection}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditTitle(section.title);
                  setIsEditing(false);
                }}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSection}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 pl-6">
          {isAddingLecture ? (
            <form
              onSubmit={handleAddLecture}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={newLectureTitle}
                onChange={(e) => setNewLectureTitle(e.target.value)}
                placeholder="New lecture title"
                className="flex-1 px-2 py-1 border rounded"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewLectureTitle("");
                  setIsAddingLecture(false);
                }}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingLecture(true)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 rounded"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lecture</span>
            </button>
          )}

          <div className="space-y-1 mt-2">
            {lectures.map((lecture, lectureIndex) => (
              <DraggableLecture
                key={lecture.id}
                lecture={lecture}
                index={lectureIndex}
                sectionId={section.id}
                moveLecture={moveLecture}
                onSelect={() => onLectureSelect(lecture)}
                onEdit={() => {
                  setEditingLecture(lecture.id);
                  setEditLectureTitle(lecture.title);
                }}
                onDelete={() => handleDeleteLecture(lecture.id)}
                isEditing={editingLecture === lecture.id}
                editTitle={editLectureTitle}
                onUpdateTitle={handleUpdateLecture}
                onCancelEdit={() => {
                  setEditingLecture(null);
                  setEditLectureTitle("");
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Draggable Lecture Component
const DraggableLecture = ({
  lecture,
  index,
  sectionId,
  moveLecture,
  onSelect,
  onEdit,
  onDelete,
  isEditing,
  editTitle,
  onUpdateTitle,
  onCancelEdit,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "LECTURE",
    item: { type: "LECTURE", lectureId: lecture.id, sectionId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "LECTURE",
    hover(item) {
      if (item.index === index) return;
      moveLecture(item.index, index);
      item.index = index;
    },
  });

  return (
    <div
      ref={drop}
      className={`flex items-center justify-between p-2 border rounded ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isOver ? "bg-blue-50" : ""}`}
    >
      <div
        ref={drag}
        className="flex items-center gap-2 cursor-move"
        onClick={onSelect}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="px-2 py-1 border rounded"
            autoFocus
          />
        ) : (
          <span className="text-sm">{lecture.title}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <button
              onClick={() => onUpdateTitle(lecture.id)}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SectionItem;
