import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  FolderTree,
  Loader2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import {
  updateExistingSubsection,
  deleteSubsectionThunk,
} from "@/store/reducer/subsectionSlice";
import LectureList from "../lectures/lectureList";

const SubsectionItem = ({
  subsection,
  sectionId,
  onLectureSelect,
  onLectureUpdate,
  forceUpdateLectureList,
  setForceUpdateLectureList,
  readOnly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subsection.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { auth } = useAuthContext();

  useEffect(() => {
    setEditTitle(subsection.title);
    setIsEditing(false);
    setError(null);
  }, [subsection]);

  const handleEditSubsection = async (e) => {
    e?.preventDefault();

    if (!editTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }
    if (editTitle === subsection.title) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await dispatch(
        updateExistingSubsection({
          id: subsection._id,
          subsectionData: { title: editTitle, section: sectionId },
          token: auth.token,
        })
      ).unwrap();
      setIsEditing(false);
    } catch (err) {
      setError(err?.message || "Failed to update subsection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubsection = async () => {
    if (!window.confirm("Delete this subsection? Its lectures will not be deleted.")) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await dispatch(
        deleteSubsectionThunk({ subsectionId: subsection._id, token: auth.token })
      ).unwrap();
    } catch (err) {
      setError(err?.message || "Failed to delete subsection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-l-4 border-l-transparent rounded-lg">
      <div
        className={`border px-3 py-2 transition-colors ${isHovered && !isEditing ? "bg-primary-light" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded-full transition-colors ${isExpanded ? "text-primary bg-primary-light" : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <FolderTree className="w-3.5 h-3.5 text-primary shrink-0" />

            {isEditing ? (
              <form onSubmit={handleEditSubsection} className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSubsection(e);
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                    className="flex-1 min-w-0 px-2 py-1 bg-light border border-primary rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                    disabled={isSubmitting}
                  />
                  <button type="submit" disabled={isSubmitting} className="p-1 text-green-600 hover:bg-green-50 rounded-md">
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="p-1 text-red-600 hover:bg-red-50 rounded-md">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </form>
            ) : (
              <span className="text-sm font-medium text-gray-800 truncate">{subsection.title}</span>
            )}
          </div>

          {!isEditing && !readOnly && (
            <div className={`flex items-center gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
              <button onClick={() => setIsEditing(true)} className="p-1 text-gray-500 hover:text-primary rounded-md" title="Edit subsection">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDeleteSubsection} disabled={isSubmitting} className="p-1 text-gray-500 hover:text-red-600 rounded-md" title="Delete subsection">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border border-t-0 pt-2 pb-3 px-3 rounded-b-lg">
          <div className="ml-6">
            <LectureList
              sectionId={sectionId}
              subsectionId={subsection._id}
              onLectureSelect={onLectureSelect}
              onLectureUpdate={onLectureUpdate}
              forceUpdateLectureList={forceUpdateLectureList}
              setForceUpdateLectureList={setForceUpdateLectureList}
              readOnly={readOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubsectionItem;
