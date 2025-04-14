import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { useSectionStore } from "@/store/zustand/sectionStore";
import { useLectureStore } from "@/store/zustand/lectureStore";
import { useAuthContext } from "@/auth/useAuthContext";
import DraggableList from "./DraggableList";
// import SectionItem from "./SectionItem";
import SectionItem from "./sections/SectionItem";

const SectionList = ({ courseId, onLectureSelect }) => {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);

  const { auth } = useAuthContext();
  const {
    sections,
    fetchSections,
    createNewSection,
    updateExistingSection,
    deleteSection,
    reorderSections,
    isLoading: sectionsLoading,
  } = useSectionStore();
  const { moveLectureToSection, fetchLectures } = useLectureStore();

  useEffect(() => {
    if (courseId && auth?.token) {
      fetchSections(courseId, auth.token);
    }
  }, [courseId, auth?.token]);

  const handleMoveLecture = async (fromSectionId, toSectionId, lectureId) => {
    if (!auth?.token) return;

    try {
      await moveLectureToSection(lectureId, toSectionId, auth.token);

      // Update both source and target sections
      const sourceSection = sections.find((s) => s.id === fromSectionId);
      const targetSection = sections.find((s) => s.id === toSectionId);

      if (sourceSection) {
        await fetchLectures(fromSectionId, auth.token);
      }

      if (targetSection) {
        await fetchLectures(toSectionId, auth.token);
      }

      // Force UI update for both sections
      setForceUpdate((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to move lecture:", error);
    }
  };

  const moveSection = async (dragIndex, hoverIndex) => {
    if (!auth?.token) return;

    try {
      // Create a new array with the updated order
      const newSections = [...sections];
      const draggedSection = newSections[dragIndex];
      newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, draggedSection);

      // Update backend
      await reorderSections(courseId, dragIndex, hoverIndex, auth.token);

      // Force UI update
      setForceUpdate((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to reorder sections:", error);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !auth?.token) return;

    try {
      await createNewSection(
        {
          title: newSectionTitle,
          courseId,
        },
        auth.token
      );
      setNewSectionTitle("");
      setIsAddingSection(false);
    } catch (error) {
      console.error("Failed to create section:", error);
    }
  };

  const handleCancelAdd = () => {
    setNewSectionTitle("");
    setIsAddingSection(false);
  };

  const handleUpdateSection = async (sectionId, newTitle) => {
    if (!newTitle.trim() || !auth?.token) return;

    try {
      await updateExistingSection(
        sectionId,
        {
          title: newTitle,
          courseId,
        },
        auth.token
      );
      setEditTitle("");
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!auth?.token) return;

    try {
      await deleteSection(sectionId, auth.token);
    } catch (error) {
      console.error("Failed to delete section:", error);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sections</h3>
        <button
          onClick={() => setIsAddingSection(true)}
          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isAddingSection && (
        <form onSubmit={handleAddSection} className="flex items-center gap-2">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="New section title"
            className="flex-1 px-3 py-2 border rounded"
            autoFocus
          />
          <button
            type="submit"
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCancelAdd}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      <DraggableList
        items={sections}
        renderItem={(section, index) => (
          <SectionItem
            key={section.id}
            section={section}
            onLectureSelect={onLectureSelect}
            index={index}
            moveSection={moveSection}
            onMoveLecture={handleMoveLecture}
            isExpanded={expandedSections.has(section.id)}
            onToggleExpand={() => toggleSection(section.id)}
            onUpdate={handleUpdateSection}
            onDelete={handleDeleteSection}
            forceUpdate={forceUpdate}
          />
        )}
        onMove={moveSection}
        type="SECTION"
      />
    </div>
  );
};

export default SectionList;
