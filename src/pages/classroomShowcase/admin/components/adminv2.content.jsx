import React, { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  PlusCircle,
  GripVertical,
  Video,
  BookOpen,
  Layout,
  Trash2,
  AlertCircle,
} from "lucide-react";
// import { useCourseStore } from "../store/courseStore";
import { useCourseStore } from "../store/courseStore";

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-500" size={24} />
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const DraggableLecture = ({ lecture, sectionId, index }) => {
  const ref = useRef(null);
  const {
    selectedCourse,
    reorderLecture,
    moveLectureToSection,
    deleteLecture,
  } = useCourseStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: "LECTURE",
    item: { type: "LECTURE", lectureId: lecture.id, sectionId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "LECTURE",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceSectionId = item.sectionId;
      const targetSectionId = sectionId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && sourceSectionId === targetSectionId) {
        return;
      }

      // Get rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      if (selectedCourse) {
        if (sourceSectionId === targetSectionId) {
          reorderLecture(
            selectedCourse.id,
            sectionId,
            item.lectureId,
            hoverIndex
          );
        } else {
          moveLectureToSection(
            selectedCourse.id,
            sourceSectionId,
            targetSectionId,
            item.lectureId
          );
        }
        item.index = hoverIndex;
        item.sectionId = targetSectionId;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const handleDelete = () => {
    if (selectedCourse) {
      deleteLecture(selectedCourse.id, sectionId, lecture.id);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border transition-all ${
          isDragging
            ? "opacity-40 scale-105 shadow-lg border-blue-500"
            : isOver
              ? "border-blue-300 bg-blue-50"
              : "border-slate-200 hover:shadow-md"
        }`}
      >
        <GripVertical
          size={18}
          className="text-slate-400 cursor-grab active:cursor-grabbing"
        />
        <Video size={18} className="text-blue-500" />
        <span className="font-medium text-slate-700 flex-1">
          {lecture.title}
        </span>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Lecture"
        message="Are you sure you want to delete this lecture? This action cannot be undone."
      />
    </>
  );
};

const DroppableSection = ({ section, index }) => {
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    selectedCourse,
    addLecture,
    moveLectureToSection,
    reorderSection,
    deleteSection,
  } = useCourseStore();
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: { type: "SECTION", sectionId: section.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ["SECTION", "LECTURE"],
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }

      if (item.type === "SECTION") {
        const dragIndex = item.index;
        const hoverIndex = index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }

        // Get rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        // Get mouse position
        const clientOffset = monitor.getClientOffset();
        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        // Time to actually perform the action
        if (selectedCourse) {
          reorderSection(selectedCourse.id, item.sectionId, hoverIndex);
          item.index = hoverIndex;
        }
      } else if (item.type === "LECTURE") {
        const didDrop = monitor.didDrop();
        if (didDrop) {
          return;
        }

        if (item.sectionId !== section.id && selectedCourse) {
          moveLectureToSection(
            selectedCourse.id,
            item.sectionId,
            section.id,
            item.lectureId
          );
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drag(drop(ref));

  const handleAddLecture = (e) => {
    e.preventDefault();
    if (newLectureTitle.trim() && selectedCourse) {
      addLecture(selectedCourse.id, section.id, newLectureTitle);
      setNewLectureTitle("");
      setIsAddingLecture(false);
    }
  };

  const handleDelete = () => {
    if (selectedCourse) {
      deleteSection(selectedCourse.id, section.id);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`p-6 rounded-xl border transition-all ${
          isDragging
            ? "opacity-40 scale-[1.02] shadow-xl border-blue-500"
            : isOver
              ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50"
              : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GripVertical
              size={24}
              className="text-slate-400 cursor-grab active:cursor-grabbing"
            />
            <BookOpen size={24} className="text-blue-600" />
            <h3 className="text-xl font-semibold text-slate-800">
              {section.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingLecture(true)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <PlusCircle size={24} />
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>

        {isAddingLecture && (
          <form onSubmit={handleAddLecture} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newLectureTitle}
                onChange={(e) => setNewLectureTitle(e.target.value)}
                placeholder="New Lecture Title"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingLecture(false)}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {section.lectures.map((lecture, index) => (
            <DraggableLecture
              key={lecture.id}
              lecture={lecture}
              sectionId={section.id}
              index={index}
            />
          ))}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Section"
        message="Are you sure you want to delete this section? This will also delete all lectures within it. This action cannot be undone."
      />
    </>
  );
};

export const CourseContent = () => {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { selectedCourse, addSection, deleteCourse } = useCourseStore();

  const handleDelete = () => {
    if (selectedCourse) {
      deleteCourse(selectedCourse.id);
      setShowDeleteDialog(false);
    }
  };

  const handleAddSection = (e) => {
    e.preventDefault();
    if (newSectionTitle.trim() && selectedCourse) {
      addSection(selectedCourse.id, newSectionTitle);
      setNewSectionTitle("");
    }
  };

  if (!selectedCourse) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-slate-500">
        <Layout size={48} className="mb-4 text-slate-400" />
        <h2 className="text-2xl font-semibold mb-2">No Course Selected</h2>
        <p>Select a course from the sidebar to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            {selectedCourse.title}
          </h2>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={24} />
          </button>
        </div>

        <form onSubmit={handleAddSection} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="New Section Title"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Section
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {selectedCourse.sections.map((section, index) => (
            <DroppableSection
              key={section.id}
              section={section}
              index={index}
            />
          ))}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This will delete all sections and lectures. This action cannot be undone."
      />
    </div>
  );
};
