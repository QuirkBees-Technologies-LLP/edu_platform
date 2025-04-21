import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Plus as AddIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Video,
  Edit2,
  Star,
  Lock,
  Globe,
  ChevronRight,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Code,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Type,
  Highlighter,
  Palette,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import useCourseStore from "../store/courseStoreV2";
import RichTextContent from "./RichTextContent";
import VideoEmbed from "./extensions/VideoEmbed";

const DraggableLecture = ({
  lecture,
  sectionId,
  index,
  moveLecture,
  onEditTitle,
  onDelete,
  isEditingTitle,
  isSelected,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // If lecture is undefined or null, don't render anything
  if (!lecture) return null;

  const [{ isDragging }, drag] = useDrag({
    type: "LECTURE",
    item: { sectionId, index, type: "LECTURE" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "LECTURE",
    hover: (draggedItem) => {
      if (
        !draggedItem ||
        (draggedItem.sectionId === sectionId && draggedItem.index === index)
      ) {
        return;
      }
      moveLecture(draggedItem.sectionId, draggedItem.index, sectionId, index);
      draggedItem.index = index;
      draggedItem.sectionId = sectionId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleTitleEdit = (newTitle) => {
    if (newTitle && newTitle.trim()) {
      onEditTitle(newTitle);
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`group flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 cursor-move
        ${isDragging ? "opacity-50 scale-105 bg-blue-50 shadow-lg" : ""}
        ${isOver ? "bg-blue-50 border border-blue-200" : ""}
        ${isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}
      `}
      onClick={() => onSelect(lecture)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-1">
        {isEditingTitle ? (
          <input
            type="text"
            defaultValue={lecture.title || ""}
            className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            onBlur={(e) => handleTitleEdit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTitleEdit(e.target.value);
              }
            }}
            autoFocus
          />
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-500" />
            <span className="text-sm flex-1">
              {lecture.title || "Untitled Lecture"}
            </span>
            <div
              className={`flex items-center gap-1 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTitle(lecture.title);
                }}
                className="p-1 text-gray-500 hover:text-blue-500 rounded hover:bg-blue-50"
                title="Edit lecture title"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-gray-500 hover:text-red-500 rounded hover:bg-red-50"
                title="Delete lecture"
              >
                <DeleteIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DraggableSection = ({
  section,
  index,
  moveSection,
  moveLecture,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: { index, type: "SECTION" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ["SECTION", "LECTURE"],
    hover: (draggedItem) => {
      if (!draggedItem) return;

      if (draggedItem.type === "SECTION") {
        if (draggedItem.index === index) {
          return;
        }
        moveSection(draggedItem.index, index);
        draggedItem.index = index;
      } else if (draggedItem.type === "LECTURE") {
        // Handle lecture drops
        if (draggedItem.sectionId === section.id) {
          return;
        }
        // Move lecture to the end of the current section
        moveLecture(
          draggedItem.sectionId,
          draggedItem.index,
          section.id,
          section.lectures.length
        );
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 
        ${isDragging ? "opacity-50 scale-105 shadow-lg border-blue-300" : ""}
        ${isOver ? "border-blue-300 bg-blue-50" : ""}
      `}
    >
      {children}
    </div>
  );
};

const ContentManagementPage = ({ course, onUpdate }) => {
  const {
    updateCourse,
    addSection,
    updateSection,
    deleteSection,
    addLecture,
    updateLecture,
    deleteLecture,
  } = useCourseStore();
  const [localCourse, setLocalCourse] = useState(course);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    isFeatured: false,
    isPublic: false,
    isPro: false,
  });
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);
  const [isAddingLecture, setIsAddingLecture] = useState(null);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lectureContent, setLectureContent] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [lectureVideo, setLectureVideo] = useState(null);
  const [lectureThumbnail, setLectureThumbnail] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingContent, setEditingContent] = useState(null);

  // Update the editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      CodeBlock,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-blue-500 hover:text-blue-700 underline",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your lecture content...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Strike,
      Highlight,
      TextStyle,
      Color,
      VideoEmbed,
    ],
    content: selectedLecture?.content || "",
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setLectureContent(content);
    },
  });

  // Update the useEffect for editor content
  useEffect(() => {
    if (editor && selectedLecture?.content) {
      editor.commands.setContent(selectedLecture.content);
      setLectureContent(selectedLecture.content);
    }
  }, [editor, selectedLecture]);

  // Add a new useEffect to handle content updates
  useEffect(() => {
    if (selectedLecture?.content) {
      setLectureContent(selectedLecture.content);
    }
  }, [selectedLecture]);

  // Update local state when course prop changes
  useEffect(() => {
    setLocalCourse(course);
    setCourseData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      isFeatured: course.isFeatured,
      isPublic: course.isPublic,
      isPro: course.isPro,
    });
  }, [course]);

  const handleCourseUpdate = () => {
    const updatedCourse = { ...localCourse, ...courseData };
    updateCourse(updatedCourse);
    setIsEditingCourse(false);
  };

  const handleAddSection = (e) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      const newSection = {
        id: `section-${Date.now()}`,
        title: newSectionTitle,
        lectures: [],
      };

      // Update store first
      addSection(course.id, newSection);

      // Update local state
      const updatedCourse = {
        ...localCourse,
        sections: [...localCourse.sections, newSection],
      };
      setLocalCourse(updatedCourse);

      // Reset form state
      setNewSectionTitle("");
      setIsAddingSection(false);
    } else {
      // If no text entered, just close the input
      setIsAddingSection(false);
      setNewSectionTitle("");
    }
  };

  const handleUpdateSection = (sectionId, updatedTitle) => {
    if (updatedTitle.trim()) {
      // Update local state first
      const updatedSections = localCourse.sections.map((section) =>
        section.id === sectionId ? { ...section, title: updatedTitle } : section
      );

      const updatedCourse = {
        ...localCourse,
        sections: updatedSections,
      };

      setLocalCourse(updatedCourse);

      // Then update store
      updateSection(course.id, sectionId, { title: updatedTitle });
      setEditingSection(null);
    }
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      deleteSection(course.id, sectionId);
    }
  };

  const handleAddLecture = (sectionId, e) => {
    e.preventDefault();
    if (newLectureTitle.trim()) {
      const newLecture = {
        id: `lecture-${Date.now()}`,
        title: newLectureTitle,
        content: "",
        video: null,
        thumbnail: null,
        isComplete: false,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update store first
      addLecture(course.id, sectionId, newLecture);

      // Update local state
      const updatedSections = localCourse.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lectures: [
                ...(section.lectures || []).filter(Boolean),
                newLecture,
              ],
            }
          : section
      );

      const updatedCourse = {
        ...localCourse,
        sections: updatedSections,
      };

      setLocalCourse(updatedCourse);
      setNewLectureTitle("");
      setIsAddingLecture(null);
    } else {
      setIsAddingLecture(null);
      setNewLectureTitle("");
    }
  };

  const handleUpdateLecture = (sectionId, lectureId, updatedTitle) => {
    if (!updatedTitle?.trim()) {
      setEditingTitle(null);
      return;
    }

    try {
      // Find the section first to validate it exists
      const section = localCourse.sections.find((s) => s?.id === sectionId);
      if (!section?.lectures) {
        console.error("Section or lectures not found");
        setEditingTitle(null);
        return;
      }

      // Safely find the lecture
      const lectureIndex = section.lectures.findIndex(
        (l) => l?.id === lectureId
      );
      if (lectureIndex === -1) {
        console.error("Lecture not found");
        setEditingTitle(null);
        return;
      }

      // Update local state first
      const updatedSections = localCourse.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lectures: section.lectures.map((lecture, index) =>
              index === lectureIndex
                ? { ...lecture, title: updatedTitle }
                : lecture
            ),
          };
        }
        return section;
      });

      const updatedCourse = {
        ...localCourse,
        sections: updatedSections,
      };

      setLocalCourse(updatedCourse);

      // Then update store
      updateLecture(course.id, sectionId, lectureId, { title: updatedTitle });
      setEditingTitle(null);
    } catch (error) {
      console.error("Error updating lecture:", error);
      setEditingTitle(null);
    }
  };

  const handleContentUpdate = (sectionId, lectureId, content) => {
    try {
      if (!sectionId || !lectureId || !content) {
        console.error("Missing required data for content update");
        return;
      }

      // Create the updated lecture object
      const updatedLecture = {
        ...selectedLecture,
        content,
        updatedAt: new Date().toISOString(),
        sectionId, // Ensure sectionId is included
      };

      // Update store first
      updateLecture(course.id, sectionId, lectureId, updatedLecture);

      // Update local state
      const updatedSections = localCourse.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lectures: section.lectures.map((lecture) =>
              lecture?.id === lectureId ? updatedLecture : lecture
            ),
          };
        }
        return section;
      });

      const updatedCourse = {
        ...localCourse,
        sections: updatedSections,
      };

      // Update all states
      setLocalCourse(updatedCourse);
      setSelectedLecture(updatedLecture);
      setLectureContent(content);

      // Update editor content to ensure consistency
      if (editor) {
        editor.commands.setContent(content);
      }

      setEditingContent(null);
    } catch (error) {
      console.error("Error updating lecture content:", error);
      setEditingContent(null);
    }
  };

  const handleDeleteLecture = (sectionId, lectureId) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        // Find the section first to validate it exists
        const section = localCourse.sections.find((s) => s?.id === sectionId);
        if (!section?.lectures) {
          console.error("Section or lectures not found");
          return;
        }

        // Safely find the lecture
        const lecture = section.lectures.find((l) => l?.id === lectureId);
        if (!lecture) {
          console.error("Lecture not found");
          return;
        }

        // Update store first to ensure persistence
        deleteLecture(course.id, sectionId, lectureId);

        // Update local state
        const updatedSections = localCourse.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              lectures: section.lectures.filter(
                (lecture) => lecture?.id !== lectureId
              ),
            };
          }
          return section;
        });

        const updatedCourse = {
          ...localCourse,
          sections: updatedSections,
        };

        setLocalCourse(updatedCourse);

        // If the deleted lecture was selected, clear the selection and content
        if (selectedLecture?.id === lectureId) {
          setSelectedLecture(null);
          setLectureContent("");
          setEditingLecture(null);
        }
      } catch (error) {
        console.error("Error deleting lecture:", error);
      }
    }
  };

  const moveSection = (dragIndex, hoverIndex) => {
    // Create a new array with the updated order
    const newSections = [...localCourse.sections];
    const draggedSection = newSections[dragIndex];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedSection);

    // Create the updated course object
    const updatedCourse = {
      ...localCourse,
      sections: newSections,
    };

    // Update local state
    setLocalCourse(updatedCourse);

    // Update store
    updateCourse(updatedCourse);
  };

  const moveLecture = (
    sourceSectionId,
    sourceIndex,
    targetSectionId,
    targetIndex
  ) => {
    // Create a deep copy of the sections
    const newSections = localCourse.sections.map((section) => ({
      ...section,
      lectures: [...section.lectures],
    }));

    // Find the source and target sections
    const sourceSection = newSections.find((s) => s.id === sourceSectionId);
    const targetSection = newSections.find((s) => s.id === targetSectionId);

    if (!sourceSection || !targetSection) return;

    // Get the lecture to move
    const [movedLecture] = sourceSection.lectures.splice(sourceIndex, 1);

    // Insert the lecture at the target position
    targetSection.lectures.splice(targetIndex, 0, movedLecture);

    // Create the updated course object
    const updatedCourse = {
      ...localCourse,
      sections: newSections,
    };

    // Update local state
    setLocalCourse(updatedCourse);

    // Update store
    updateCourse(updatedCourse);
  };

  // Add this new function to handle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Add this new function to handle lecture selection
  const handleLectureSelect = (lecture) => {
    setSelectedLecture(lecture);
    setLectureContent(lecture.content || "");
    setLectureVideo(lecture.video || null);
    setLectureThumbnail(lecture.thumbnail || null);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Here you would typically upload the video to your storage service
      // For now, we'll just create a URL
      const videoUrl = URL.createObjectURL(file);
      setLectureVideo(videoUrl);

      // Update the lecture with the video URL
      if (selectedLecture) {
        updateLecture(
          course.id,
          selectedLecture.sectionId,
          selectedLecture.id,
          {
            video: videoUrl,
          }
        );
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Here you would typically upload the thumbnail to your storage service
      // For now, we'll just create a URL
      const thumbnailUrl = URL.createObjectURL(file);
      setLectureThumbnail(thumbnailUrl);

      // Create updated lecture object with new thumbnail
      const updatedLecture = {
        ...selectedLecture,
        thumbnail: thumbnailUrl,
        updatedAt: new Date().toISOString(),
      };

      // Update local state immediately
      setSelectedLecture(updatedLecture);

      // Update local course state
      const updatedSections = localCourse.sections.map((section) => {
        if (section.id === selectedLecture.sectionId) {
          return {
            ...section,
            lectures: section.lectures.map((lecture) =>
              lecture?.id === selectedLecture.id ? updatedLecture : lecture
            ),
          };
        }
        return section;
      });

      setLocalCourse({
        ...localCourse,
        sections: updatedSections,
      });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      alert("Error uploading thumbnail. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Add this function to handle video embed insertion
  const handleVideoEmbed = () => {
    const url = window.prompt("Enter video URL (YouTube, Vimeo, or Loom)");
    if (!url) return;

    let provider = null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      provider = "youtube";
    } else if (url.includes("vimeo.com")) {
      provider = "vimeo";
    } else if (url.includes("loom.com")) {
      provider = "loom";
    } else {
      alert("Please enter a valid YouTube, Vimeo, or Loom URL");
      return;
    }

    editor
      ?.chain()
      .focus()
      .insertContent({
        type: "videoEmbed",
        attrs: { url, provider },
      })
      .run();
  };

  const handleSaveLecture = () => {
    if (!selectedLecture) return;

    try {
      // Get the current content from the editor
      const content = editor?.getHTML() || selectedLecture.content || "";

      // Create the updated lecture object with all current data
      const updatedLecture = {
        ...selectedLecture,
        content,
        video: lectureVideo,
        thumbnail: lectureThumbnail, // Include the current thumbnail
        updatedAt: new Date().toISOString(),
        sectionId: selectedLecture.sectionId,
      };

      // Update store first
      updateLecture(
        course.id,
        selectedLecture.sectionId,
        selectedLecture.id,
        updatedLecture
      );

      // Update local state
      const updatedSections = localCourse.sections.map((section) => {
        if (section.id === selectedLecture.sectionId) {
          return {
            ...section,
            lectures: section.lectures.map((lecture) =>
              lecture?.id === selectedLecture.id ? updatedLecture : lecture
            ),
          };
        }
        return section;
      });

      const updatedCourse = {
        ...localCourse,
        sections: updatedSections,
      };

      // Update all states
      setLocalCourse(updatedCourse);
      setSelectedLecture(updatedLecture);
      setLectureContent(content);

      // Show success message
      alert("Lecture saved successfully!");
    } catch (error) {
      console.error("Error saving lecture:", error);
      alert("Error saving lecture. Please try again.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Course Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {localCourse.title}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    {localCourse.isFeatured && (
                      <span className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    {localCourse.isPro && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Pro
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingCourse(!isEditingCourse)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sections List */}
            <div className="space-y-2">
              {localCourse.sections.map((section, index) => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  index={index}
                  moveSection={moveSection}
                  moveLecture={moveLecture}
                >
                  <div className="flex items-center gap-2 p-2 group">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedSections[section.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {editingSection === section.id ? (
                      <input
                        type="text"
                        defaultValue={section.title}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        onBlur={(e) =>
                          handleUpdateSection(section.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateSection(section.id, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <h3 className="flex-1 text-sm font-medium">
                        {section.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingSection(section.id)}
                        className="p-1 text-gray-500 hover:text-blue-500 rounded hover:bg-blue-50"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1 text-gray-500 hover:text-red-500 rounded hover:bg-red-50"
                      >
                        <DeleteIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {expandedSections[section.id] && (
                    <div className="pl-8 pr-2 pb-2 space-y-1">
                      {Array.isArray(section.lectures) &&
                      section.lectures.filter(Boolean).length > 0 ? (
                        section.lectures
                          .filter(Boolean)
                          .map((lecture, lectureIndex) => (
                            <DraggableLecture
                              key={lecture.id}
                              lecture={lecture}
                              sectionId={section.id}
                              index={lectureIndex}
                              moveLecture={moveLecture}
                              isEditingTitle={editingTitle === lecture.id}
                              onEditTitle={(newTitle) =>
                                handleUpdateLecture(
                                  section.id,
                                  lecture.id,
                                  newTitle
                                )
                              }
                              onDelete={() =>
                                handleDeleteLecture(section.id, lecture.id)
                              }
                              isSelected={selectedLecture?.id === lecture.id}
                              onSelect={() => handleLectureSelect(lecture)}
                            />
                          ))
                      ) : (
                        <p className="text-gray-500 text-sm italic px-2">
                          No lectures yet
                        </p>
                      )}
                      {isAddingLecture === section.id ? (
                        <form
                          onSubmit={(e) => handleAddLecture(section.id, e)}
                          className="mt-2 px-2"
                        >
                          <input
                            type="text"
                            value={newLectureTitle}
                            onChange={(e) => setNewLectureTitle(e.target.value)}
                            placeholder="Enter lecture title"
                            className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onBlur={(e) => {
                              if (!e.target.value.trim()) {
                                setIsAddingLecture(null);
                                setNewLectureTitle("");
                              }
                            }}
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsAddingLecture(section.id)}
                          className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          <AddIcon className="w-3 h-3" />
                          Add Lecture
                        </button>
                      )}
                    </div>
                  )}
                </DraggableSection>
              ))}

              {isAddingSection ? (
                <form
                  onSubmit={handleAddSection}
                  className="bg-white rounded-lg shadow-sm p-2"
                >
                  <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="Enter section title"
                    className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingSection(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-500 hover:border-blue-500 flex items-center justify-center gap-2 text-sm"
                >
                  <AddIcon className="w-4 h-4" />
                  Add New Section
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedLecture ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedLecture.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        selectedLecture.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedLecture.isPublished ? "Published" : "Draft"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        selectedLecture.isComplete
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedLecture.isComplete ? "Complete" : "In Progress"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveLecture()}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Lecture
                  </button>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {lectureThumbnail ? (
                      <img
                        src={lectureThumbnail}
                        alt="Lecture thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block">
                      <span className="sr-only">Choose thumbnail</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Video Upload */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {lectureVideo ? (
                      <video
                        src={lectureVideo}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Video className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block">
                      <span className="sr-only">Choose video</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Rich Text Editor */}
              {selectedLecture && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="border rounded-lg">
                    <div className="border-b p-2 flex flex-wrap gap-2">
                      {/* Text Style */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("bold") ? "bg-blue-100" : ""
                          }`}
                          title="Bold"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("italic") ? "bg-blue-100" : ""
                          }`}
                          title="Italic"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleUnderline().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("underline") ? "bg-blue-100" : ""
                          }`}
                          title="Underline"
                        >
                          <UnderlineIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleStrike().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("strike") ? "bg-blue-100" : ""
                          }`}
                          title="Strikethrough"
                        >
                          <Strikethrough className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Headings */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={() =>
                            editor
                              ?.chain()
                              .focus()
                              .toggleHeading({ level: 1 })
                              .run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("heading", { level: 1 })
                              ? "bg-blue-100"
                              : ""
                          }`}
                          title="Heading 1"
                        >
                          <Heading1 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor
                              ?.chain()
                              .focus()
                              .toggleHeading({ level: 2 })
                              .run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("heading", { level: 2 })
                              ? "bg-blue-100"
                              : ""
                          }`}
                          title="Heading 2"
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor
                              ?.chain()
                              .focus()
                              .toggleHeading({ level: 3 })
                              .run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("heading", { level: 3 })
                              ? "bg-blue-100"
                              : ""
                          }`}
                          title="Heading 3"
                        >
                          <Heading3 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Lists */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("bulletList") ? "bg-blue-100" : ""
                          }`}
                          title="Bullet List"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("orderedList") ? "bg-blue-100" : ""
                          }`}
                          title="Numbered List"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Alignment */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("left").run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive({ textAlign: "left" })
                              ? "bg-blue-100"
                              : ""
                          }`}
                          title="Align Left"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("center").run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive({ textAlign: "center" })
                              ? "bg-blue-100"
                              : ""
                          }`}
                          title="Align Center"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("right").run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive({ textAlign: "right" })
                              ? "bg-blue-100"
                              : ""
                          }`}
                          title="Align Right"
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Code and Links */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleCodeBlock().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("codeBlock") ? "bg-blue-100" : ""
                          }`}
                          title="Code Block"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const url = window.prompt("Enter the URL");
                            if (url) {
                              editor
                                ?.chain()
                                .focus()
                                .setLink({ href: url })
                                .run();
                            }
                          }}
                          className={`p-2 rounded ${
                            editor?.isActive("link") ? "bg-blue-100" : ""
                          }`}
                          title="Add Link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tables */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={() => {
                            editor
                              ?.chain()
                              .focus()
                              .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                              })
                              .run();
                          }}
                          className="p-2 rounded"
                          title="Insert Table"
                        >
                          <TableIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Highlight and Color */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={() =>
                            editor?.chain().focus().toggleHighlight().run()
                          }
                          className={`p-2 rounded ${
                            editor?.isActive("highlight") ? "bg-blue-100" : ""
                          }`}
                          title="Highlight"
                        >
                          <Highlighter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const color = window.prompt(
                              "Enter color (e.g., #ff0000)"
                            );
                            if (color) {
                              editor?.chain().focus().setColor(color).run();
                            }
                          }}
                          className="p-2 rounded"
                          title="Text Color"
                        >
                          <Palette className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Add the video embed button to the toolbar */}
                      <div className="flex items-center gap-1 border-r pr-2">
                        <button
                          onClick={handleVideoEmbed}
                          className="p-2 rounded hover:bg-gray-100"
                          title="Insert Video"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Undo/Redo */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => editor?.chain().focus().undo().run()}
                          className={`p-2 rounded ${
                            !editor?.can().undo() ? "opacity-50" : ""
                          }`}
                          title="Undo"
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editor?.chain().focus().redo().run()}
                          className={`p-2 rounded ${
                            !editor?.can().redo() ? "opacity-50" : ""
                          }`}
                          title="Redo"
                        >
                          <Redo className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="min-h-[600px] max-h-[800px] overflow-y-auto">
                      <EditorContent
                        editor={editor}
                        className="p-4 prose max-w-none min-h-[600px]"
                      />
                    </div>
                    <div className="border-t p-4 flex justify-end gap-2 bg-gray-50">
                      <button
                        onClick={() => {
                          if (selectedLecture?.content) {
                            editor?.commands.setContent(
                              selectedLecture.content
                            );
                          }
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          if (!editor || !selectedLecture) return;
                          const content = editor.getHTML();
                          handleContentUpdate(
                            selectedLecture.sectionId,
                            selectedLecture.id,
                            content
                          );
                        }}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Save Content
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a lecture to view its content
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default ContentManagementPage;
