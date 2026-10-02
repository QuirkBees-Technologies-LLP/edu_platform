import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Check,
  Folder,
  FolderPlus,
  Loader2,
  List,
  AlertCircle,
  MoveVertical,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

const SectionList = ({
  courseId,
  onLectureSelect,
  onLectureUpdate,
  forceUpdateLectureList,
  setForceUpdateLectureList,
  isLoading,
}) => {
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const reduxSections = useSelector(selectAllSections);
  const sectionsStatus = useSelector(selectSectionsStatus);

  useEffect(() => {
    setSections(reduxSections);
  }, [reduxSections]);

  const moveSection = (fromIndex, toIndex) => {
    setSections((prevSections) => {
      const updated = [...prevSections];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleReorder = async (newOrder) => {
    try {
      const payload = newOrder.map(({ id, order }) => ({
        _id: id,
        order,
      }));

      await dispatch(
        reorderSections({ sections: payload, token: auth.token })
      ).unwrap();

    } catch (error) {
      console.error("Failed to reorder sections:", error);
      setSections(reduxSections);
    } finally {
      setReorderMode(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !auth?.token || !courseId) return;

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setNewSectionTitle("");
    setIsAddingSection(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-800">Sections</h3>
          </div>
          <div className="flex items-center gap-2">
            {sections.length > 1 && (
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`p-2 rounded-full transition-colors ${
                  reorderMode
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                title={reorderMode ? "Exit reorder mode" : "Reorder sections"}
              >
                <MoveVertical className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsAddingSection(true)}
              disabled={isAddingSection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary hover:bg-primary-light rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Section</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isAddingSection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form
                onSubmit={handleAddSection}
                className="flex flex-col gap-3 p-5 bg-light border border-primary-100 rounded-lg mb-4"
              >
                <div className="flex items-center gap-2 text-primary mb-1">
                  <FolderPlus className="w-4 h-4" />
                  <h4 className="font-medium">New Section</h4>
                </div>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Enter section title"
                  className="w-full px-3 py-2 input  rounded-md"
                  autoFocus
                  disabled={isSubmitting}
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    className="px-3 py-1.5 text-sm btn-secondary btn rounded-md"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm rounded-md btn btn-primary flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Create Section</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading || sectionsStatus === "loading" ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-500">Loading sections...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-light rounded-lg border border-dashed border-gray-300">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-1">No sections found</p>
            <p className="text-gray-400 text-sm mb-4">
              Create a section to get started
            </p>
            <button
              onClick={() => setIsAddingSection(true)}
              className="px-4 py-2 btn border-primary text-primary hover:bg-primary hover:text-white rounded-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Section</span>
            </button>
          </div>
        ) : (
          <div
            className={`space-y-3 transition-all ${reorderMode ? "pt-2" : ""}`}
          >
            {reorderMode && (
              <div className="bg-indigo-50 text-indigo-700 text-sm p-3 rounded-md flex items-center mb-3">
                <List className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>
                  Drag sections to reorder them. Changes are saved
                  automatically.
                </span>
              </div>
            )}
            {sections.map((section, index) => (
              <motion.div
                key={section._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="transform transition-transform"
              >
                {reorderMode ? (
                  <DraggableSection
                    section={section}
                    index={index}
                    moveSection={moveSection}
                    sections={sections}
                    onReorder={handleReorder}
                    // onReorder={async (newOrder) => {
                    //   try {
                    //     const reorderedPayload = newOrder.map(
                    //       ({ id, order }) => ({
                    //         _id: id,
                    //         order,
                    //       })
                    //     );
                    //     await dispatch(
                    //       reorderSections(reorderedPayload, auth.token)
                    //     ).unwrap();
                    //   } catch (error) {
                    //     console.error("Failed to reorder:", error);
                    //   }
                    // }}
                  >
                    <SectionItem section={section} reorderMode={true} />
                  </DraggableSection>
                ) : (
                  <SectionItem
                    section={section}
                    courseId={courseId}
                    onLectureSelect={onLectureSelect}
                    onLectureUpdate={onLectureUpdate}
                    forceUpdateLectureList={forceUpdateLectureList}
                    setForceUpdateLectureList={setForceUpdateLectureList}
                    reorderMode={false}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default SectionList;
