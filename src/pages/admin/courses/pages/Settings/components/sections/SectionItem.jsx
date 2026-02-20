import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
  Folder,
  FolderOpen,
  Loader2,
  GripVertical,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import {
  updateExistingSection,
  deleteSectionThunk,
} from "@/store/reducer/sectionSlice";
import { selectSectionsStatus } from "@/store/reducer/sectionSlice";
import LectureList from "../lectures/lectureList";

const SectionItem = ({
  section,
  courseId,
  onLectureSelect,
  onLectureUpdate,
  forceUpdateLectureList,
  setForceUpdateLectureList,
  reorderMode,
  readOnly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const sectionsStatus = useSelector(selectSectionsStatus);

  // Reset edit state when section changes
  useEffect(() => {
    setEditTitle(section.title);
    setIsEditing(false);
    setError(null);
  }, [section]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEditSection = async (e) => {
    e?.preventDefault();

    // Validations
    if (!editTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }
    if (!auth?.token) {
      setError("Authentication required");
      return;
    }
    if (!courseId) {
      setError("Course ID is required");
      return;
    }
    if (editTitle === section.title) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await dispatch(
        updateExistingSection({
          id: section._id,
          sectionData: {
            title: editTitle,
            course: courseId,
          },
          token: auth.token,
        })
      ).unwrap();

      if (result && result._id) {
        setIsEditing(false);
        setEditTitle(result.title);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Failed to update section:", error);
      setError(error.message || "Failed to update section");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!auth?.token) {
      setError("Authentication required");
      return;
    }

    if (window.confirm("Are you sure you want to delete this section?")) {
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await dispatch(
          deleteSectionThunk({
            sectionId: section._id,
            token: auth.token,
          })
        ).unwrap();

        if (!result || !result._id) {
          throw new Error("Failed to delete section: Invalid response");
        }
      } catch (error) {
        console.error("Failed to delete section:", error);
        setError(error.message || "Failed to delete section");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEditSection();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(section.title);
      setError(null);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditTitle(section.title);
    setError(null);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditTitle(section.title);
    setError(null);
  };

  return (
    <div
      className={`border-l-4 ${isExpanded ? "border-l-primary" : "border-l-transparent"} 
                   rounded-lg shadow-sm transition-all duration-200 
                  ${reorderMode ? "cursor-move pl-2 border-l-indigo-400" : ""}`}
    >
      {/* Section Header */}
      <div
        className={`border px-4 py-3  transition-colors ${isHovered && !isEditing ? "bg-primary-light" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {reorderMode && (
              <div className="text-gray-400 cursor-move">
                <GripVertical className="w-4 h-4" />
              </div>
            )}

            <button
              onClick={handleToggleExpand}
              className={`p-1.5 rounded-full transition-colors ${isExpanded
                  ? "text-primary bg-primary-light hover:bg-primary-clarity"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            <div className={`mr-2 text-${isExpanded ? "primary" : "primary"}-500`}>
              {isExpanded ? (
                <FolderOpen className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSection} className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-3 py-1.5 bg-light border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                      disabled={isSubmitting}
                      placeholder="Section title"
                    />
                    {error && (
                      <p className="text-xs text-red-500 mt-1">{error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-800 dark:hover:text-green-100 rounded-md flex items-center gap-1 transition-colors"
                      title="Save changes"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      disabled={isSubmitting}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-800 dark:hover:text-red-100 rounded-md transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 truncate">
                  {section.title}
                </h3>
              </div>
            )}
          </div>

          {!isEditing && !reorderMode && !readOnly && (
            <div
              className={`flex items-center gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"
                }`}
            >
              <button
                onClick={handleStartEditing}
                className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md transition-colors"
                title="Edit section"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteSection}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-600 dark:hover:text-red-100  rounded-md transition-colors"
                title="Delete section"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lecture List (Expanded View) */}
      {isExpanded && (
        <div className="border border-t-0 pt-2 pb-3 px-3 rounded-b-lg">
          <div className="ml-7">
            <LectureList
              sectionId={section._id}
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

export default SectionItem;
