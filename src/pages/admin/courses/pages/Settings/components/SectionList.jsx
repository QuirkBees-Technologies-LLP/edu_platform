import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  selectAllSections,
  selectSectionsStatus,
  reorderSections,
} from "@/store/reducer/sectionSlice";
import { createNewSection } from "@/store/reducer/sectionSlice";
import SectionItem from "./sections/SectionItem";
import DraggableSection from "./sections/DraggableSection";

const SectionList = ({
  courseId,
  onLectureSelect,
  onLectureUpdate,
  forceUpdateLectureList,
  setForceUpdateLectureList,
}) => {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [sections, setSections] = useState([]);

  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const reduxSections = useSelector(selectAllSections);
  const sectionsStatus = useSelector(selectSectionsStatus);

  // Update local sections when redux sections change
  useEffect(() => {
    setSections(reduxSections);
  }, [reduxSections]);

  const moveSection = (fromIndex, toIndex) => {
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    setSections(newSections);
  };

  const handleReorder = async (newOrder) => {
    try {
      await dispatch(reorderSections(newOrder, auth.token)).unwrap();
      // No necesitamos actualizar el estado local aquí porque el useEffect
      // se encargará de actualizarlo cuando cambien las secciones en Redux
    } catch (error) {
      console.error("Failed to reorder sections:", error);
      // Si falla, volvemos al estado anterior
      setSections(reduxSections);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !auth?.token || !courseId) return;

    try {
      await dispatch(
        createNewSection({
          sectionData: {
            title: newSectionTitle,
            order: sections.length,
            course: courseId,
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sections</h3>
          <button
            onClick={() => setIsAddingSection(true)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add Section Form */}
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

        {/* Sections List */}
        {sectionsStatus === "loading" ? (
          <div className="text-center text-gray-500">Loading sections...</div>
        ) : sections.length === 0 ? (
          <div className="text-center text-gray-500">No sections found</div>
        ) : (
          <div className="space-y-2">
            {sections.map((section, index) => (
              <SectionItem
                key={section._id}
                section={section}
                courseId={courseId}
                onLectureSelect={onLectureSelect}
                onLectureUpdate={onLectureUpdate}
                forceUpdateLectureList={forceUpdateLectureList}
                setForceUpdateLectureList={setForceUpdateLectureList}
              />
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default SectionList;
