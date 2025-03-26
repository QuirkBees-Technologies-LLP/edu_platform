import React, { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  PlusCircle,
  GripVertical,
  Video,
  BookOpen,
  Layout,
} from "lucide-react";
// import { useCourseStore } from "../store/courseStore";
import { useCourseStore } from "../store/courseStore";

const DraggableLecture = ({ lecture, sectionId, index }) => {
  const ref = useRef(null);
  const { selectedCourse, reorderLecture, moveLectureToSection } =
    useCourseStore();

  const [{ isDragging }, drag] = useDrag({
    type: "LECTURE",
    item: { type: "LECTURE", lectureId: lecture.id, sectionId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
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
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-all ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <GripVertical size={18} className="text-slate-400" />
      <Video size={18} className="text-blue-500" />
      <span className="font-medium text-slate-700">{lecture.title}</span>
    </div>
  );
};

const DroppableSection = ({ section }) => {
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const { selectedCourse, addLecture, moveLectureToSection } = useCourseStore();
  const ref = useRef(null);

  const [{ isOver }, drop] = useDrop({
    accept: "LECTURE",
    drop: (item, monitor) => {
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
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  const handleAddLecture = (e) => {
    e.preventDefault();
    if (newLectureTitle.trim() && selectedCourse) {
      addLecture(selectedCourse.id, section.id, newLectureTitle);
      setNewLectureTitle("");
      setIsAddingLecture(false);
    }
  };

  drop(ref);

  return (
    <div
      ref={ref}
      className={`p-6 rounded-xl border ${
        isOver
          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-50"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-800">
            {section.title}
          </h3>
        </div>
        <button
          onClick={() => setIsAddingLecture(true)}
          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <PlusCircle size={24} />
        </button>
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
  );
};

export const CourseContent = () => {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const { selectedCourse, addSection } = useCourseStore();

  const handleAddSection = (e) => {
    e.preventDefault();
    if (newSectionTitle.trim() && selectedCourse) {
      addSection(selectedCourse.id, newSectionTitle);
      setNewSectionTitle("");
    }
  };

  if (!selectedCourse) {
    console.log(selectedCourse);
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
        <h2 className="text-3xl font-bold mb-8 text-slate-800">
          {selectedCourse.title}
        </h2>

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
          {selectedCourse.sections.map((section) => (
            <DroppableSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
};
