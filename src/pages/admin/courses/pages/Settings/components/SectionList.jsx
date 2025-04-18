import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// Hooks
import { useAuthContext } from "@/auth/useAuthContext";

// Redux
import {
  fetchSections,
  createNewSection,
  updateExistingSection,
  deleteExistingSection,
  reorderSections,
  selectAllSections,
  selectSectionsStatus,
} from "@/store/reducer/sectionSlice";
import {
  moveLectureToSection,
  fetchLectures,
} from "@/store/reducer/lectureSlice";

// Components
import DraggableList from "./DraggableList";
import SectionItem from "./sections/SectionItem";

const SectionList = ({ courseId, onLectureSelect, selectedLectureId }) => {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);

  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const sections = useSelector(selectAllSections);
  const sectionsStatus = useSelector(selectSectionsStatus);

  useEffect(() => {
    if (courseId && auth?.token) {
      dispatch(fetchSections({ courseId, token: auth.token }));
    }
  }, [courseId, auth?.token, dispatch]);

  const handleMoveLecture = async (fromSectionId, toSectionId, lectureId) => {
    if (!auth?.token) return;

    try {
      await dispatch(
        moveLectureToSection({
          lectureId,
          toSectionId,
          token: auth.token,
        })
      ).unwrap();

      // Update both source and target sections
      const sourceSection = sections.find((s) => s.id === fromSectionId);
      const targetSection = sections.find((s) => s.id === toSectionId);

      if (sourceSection) {
        await dispatch(
          fetchLectures({ sectionId: fromSectionId, token: auth.token })
        ).unwrap();
      }

      if (targetSection) {
        await dispatch(
          fetchLectures({ sectionId: toSectionId, token: auth.token })
        ).unwrap();
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

      // Update the order property for each section
      const sectionsWithOrder = newSections.map((section, index) => ({
        id: section._id,
        order: index,
      }));

      console.log("Reordering sections:", sectionsWithOrder);

      // Update backend
      const result = await dispatch(
        reorderSections({
          sections: sectionsWithOrder,
          token: auth.token,
        })
      ).unwrap();

      // Update local state immediately for better UX
      dispatch(fetchSections({ courseId, token: auth.token }));

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
      await dispatch(
        createNewSection({
          sectionData: {
            title: newSectionTitle,
            course: courseId,
            order: sections.length,
            description: "Section description",
          },
          token: auth.token,
        })
      ).unwrap();
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
      await dispatch(
        updateExistingSection({
          id: sectionId,
          sectionData: {
            title: newTitle,
            course: courseId,
          },
          token: auth.token,
        })
      ).unwrap();
      setEditTitle("");
    } catch (error) {
      console.error("Failed to update section:", error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!auth?.token) return;

    try {
      await dispatch(
        deleteExistingSection({
          id: sectionId,
          token: auth.token,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to delete section:", error);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const newSet = new Set();
      if (!prev.has(sectionId)) {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 mb-4 text-center">
          No sections found. Create your first section to start adding lectures.
        </p>
        <button
          onClick={() => setIsAddingSection(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Section
        </button>
      </div>
    );
  }

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
        <form
          onSubmit={handleAddSection}
          className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg"
        >
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Enter section title"
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
            title="Create section"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCancelAdd}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      <DraggableList
        items={sections}
        renderItem={(section, index) => (
          <SectionItem
            key={section._id}
            section={section}
            onLectureSelect={onLectureSelect}
            index={index}
            moveSection={moveSection}
            onMoveLecture={handleMoveLecture}
            isExpanded={expandedSections.has(section._id)}
            onToggleExpand={() => toggleSection(section._id)}
            onUpdate={handleUpdateSection}
            onDelete={handleDeleteSection}
            forceUpdate={forceUpdate}
            selectedLectureId={selectedLectureId}
          />
        )}
        onMove={moveSection}
        type="SECTION"
      />
    </div>
  );
};

export default SectionList;
