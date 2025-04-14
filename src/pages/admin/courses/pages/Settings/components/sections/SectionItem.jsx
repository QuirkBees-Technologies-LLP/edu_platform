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
import { getLecturesBySectionId } from "../../../../../../../services/lms.api";
import { useAuthContext } from "../../../../../../../auth/useAuthContext";
import { useSectionStore } from "@/store/zustand/sectionStore";
import { useLectureStore } from "@/store/zustand/lectureStore";
import { useDrag, useDrop } from "react-dnd";

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

  const { auth } = useAuthContext();
  const { updateExistingSection, deleteSection } = useSectionStore();
  const {
    createNewLecture,
    updateExistingLecture,
    deleteLecture,
    reorderLectures,
    moveLectureToSection,
  } = useLectureStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [editingLecture, setEditingLecture] = useState(null);
  const [editLectureTitle, setEditLectureTitle] = useState("");

  // lectures
  const [lectures, setLectures] = useState([]);

  // useEffect
  useEffect(() => {
    const fetchLectures = async () => {
      if (isExpanded && auth?.token) {
        const getLectures = await getLecturesBySectionId(
          section.id,
          auth.token
        );
        const sortedLectures = getLectures.sort((a, b) => a.order - b.order);
        setLectures(sortedLectures);
      }
    };

    fetchLectures();
  }, [isExpanded, section.id, auth?.token, forceUpdate]);

  // Drag and Drop for Section Title
  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: { id: section.id, index, type: "SECTION" },
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
      } else if (item.type === "LECTURE" && item.sectionId !== section.id) {
        // Handle lecture drop from another section
        onMoveLecture(item.sectionId, section.id, item.lectureId);
      }
    },
    drop: async (item) => {
      if (item.type === "LECTURE" && item.sectionId !== section.id) {
        try {
          await moveLectureToSection(item.lectureId, section.id, auth.token);
        } catch (error) {
          console.error("Failed to move lecture:", error);
        }
      }
    },
  });

  // Lecture Management Functions
  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!newLectureTitle.trim() || !auth?.token) return;

    try {
      const newLecture = await createNewLecture(
        {
          title: newLectureTitle,
          sectionId: section.id,
        },
        auth.token
      );
      setLectures((prev) => [...prev, newLecture]);
      setNewLectureTitle("");
      setIsAddingLecture(false);
    } catch (error) {
      console.error("Failed to create lecture:", error);
    }
  };

  const handleUpdateLecture = async (lectureId) => {
    if (!editLectureTitle.trim() || !auth?.token) return;

    try {
      const updatedLecture = await updateExistingLecture(
        lectureId,
        {
          title: editLectureTitle,
          sectionId: section.id,
        },
        auth.token
      );
      setLectures((prev) =>
        prev.map((lecture) =>
          lecture.id === lectureId ? updatedLecture : lecture
        )
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
      setLectures((prev) => prev.filter((lecture) => lecture.id !== lectureId));
    } catch (error) {
      console.error("Failed to delete lecture:", error);
    }
  };

  const moveLecture = async (dragIndex, hoverIndex) => {
    if (!auth?.token) return;

    try {
      await reorderLectures(dragIndex, hoverIndex, auth.token);
      const newLectures = [...lectures];
      const draggedLecture = newLectures[dragIndex];
      newLectures.splice(dragIndex, 1);
      newLectures.splice(hoverIndex, 0, draggedLecture);
      setLectures(newLectures);
    } catch (error) {
      console.error("Failed to reorder lectures:", error);
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
                onClick={() => {
                  props.onUpdate(section.id, editTitle);
                  setIsEditing(false);
                }}
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
                onClick={() => props.onDelete(section.id)}
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
