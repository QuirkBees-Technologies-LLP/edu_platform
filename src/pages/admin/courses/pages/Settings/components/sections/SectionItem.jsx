import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import {
  updateExistingSection,
  deleteSectionThunk,
} from "@/store/reducer/sectionSlice";
import { selectSectionsStatus } from "@/store/reducer/sectionSlice";
import LectureList from "../lectures/lectureList";

const SectionItem = ({ section, courseId, onLectureSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <div className="border rounded-lg p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleExpand}
            className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-full"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isEditing ? (
            <form onSubmit={handleEditSection} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                  title="Save changes"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={isSubmitting}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {error && <span className="text-xs text-red-500">{error}</span>}
            </form>
          ) : (
            <span className="font-medium">{section.title}</span>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartEditing}
              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              title="Edit section"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteSection}
              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 pl-6">
          <LectureList
            sectionId={section._id}
            onLectureSelect={onLectureSelect}
          />
        </div>
      )}
    </div>
  );
};

export default SectionItem;
