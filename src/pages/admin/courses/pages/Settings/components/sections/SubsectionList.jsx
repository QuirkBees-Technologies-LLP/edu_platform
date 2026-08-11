import { useState, useEffect } from "react";
import { Plus, Check, FolderTree, Loader2, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import {
  fetchSubsections,
  createNewSubsection,
  selectSubsectionsBySection,
  selectSubsectionsStatus,
} from "@/store/reducer/subsectionSlice";
import SubsectionItem from "./SubsectionItem";
import { motion, AnimatePresence } from "framer-motion";

const SubsectionList = ({
  sectionId,
  onLectureSelect,
  onLectureUpdate,
  forceUpdateLectureList,
  setForceUpdateLectureList,
  readOnly = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const subsections = useSelector(selectSubsectionsBySection(sectionId));
  const status = useSelector(selectSubsectionsStatus);

  useEffect(() => {
    if (sectionId && auth?.token) {
      dispatch(fetchSubsections({ sectionId, token: auth.token }));
    }
  }, [sectionId, auth?.token, dispatch]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !auth?.token) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createNewSubsection({
          subsectionData: {
            title: newTitle,
            order: subsections.length,
            section: sectionId,
          },
          token: auth.token,
        })
      ).unwrap();
      setNewTitle("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create subsection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <FolderTree className="w-3.5 h-3.5" />
          Subsections
        </div>
        {!readOnly && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-light text-primary hover:bg-primary-light rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subsection
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onSubmit={handleAdd}
            className="flex items-center gap-2 p-2 bg-light rounded"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter subsection title"
              className="flex-1 px-3 py-2 border rounded focus:outline-none bg-light focus:ring-2 focus:ring-primary w-full text-sm"
              autoFocus
              disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting} className="p-2 text-green-600 hover:bg-green-100 rounded-full">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} disabled={isSubmitting} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
              &times;
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {status === "loading" && subsections.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading subsections...
        </div>
      ) : subsections.length === 0 ? (
        !isAdding && (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
            <AlertCircle className="w-3.5 h-3.5" /> No subsections yet
          </div>
        )
      ) : (
        <div className="space-y-2">
          {subsections
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((subsection) => (
              <SubsectionItem
                key={subsection._id}
                subsection={subsection}
                sectionId={sectionId}
                onLectureSelect={onLectureSelect}
                onLectureUpdate={onLectureUpdate}
                forceUpdateLectureList={forceUpdateLectureList}
                setForceUpdateLectureList={setForceUpdateLectureList}
                readOnly={readOnly}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default SubsectionList;
