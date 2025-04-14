import { useEffect, useState } from "react";
import { useAuthContext } from "@/auth/useAuthContext";
import { useLectureStore } from "@/store/zustand/lectureStore";
import { useSectionStore } from "@/store/zustand/sectionStore";
import TiptapEditor from "./TiptapEditor";
import LectureFields from "./LectureFields";
import { getLectureById } from "../../../../../../../services/lms.api";

const LectureContentEditor = ({ lecture, courseId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const { auth } = useAuthContext();
  const { updateExistingLecture, updateLectureInStore } = useLectureStore();
  const { updateSection, sections, updateSectionInStore } = useSectionStore();

  // Local state for the current lecture
  const [currentLecture, setCurrentLecture] = useState(lecture);

  // Fetch fresh lecture data when the lecture prop changes
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const freshLecture = await getLectureById(lecture.id, auth.token);
        setCurrentLecture(freshLecture);
      } catch (error) {
        console.error("Error fetching lecture:", error);
        setError("Error loading lecture data");
      }
    };

    fetchLecture();
  }, [lecture.id, auth.token]);

  const handleSave = async (updatedFields) => {
    if (!auth?.token || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedLecture = {
        ...currentLecture,
        ...updatedFields,
      };

      // Update lecture in backend
      await updateExistingLecture(lecture.id, updatedLecture, auth.token);

      // Update local state
      setCurrentLecture(updatedLecture);
      setLastSaved(new Date());

      // Find the section containing this lecture
      const section = sections.find((s) => s.id === lecture.sectionId);
      if (section) {
        // Update the section with the new lecture data
        const updatedSection = {
          ...section,
          lectures: section.lectures.map((l) =>
            l.id === lecture.id ? updatedLecture : l
          ),
        };

        // Update section in backend
        await updateSection(section.id, updatedSection, auth.token);

        // Update section in global store
        updateSectionInStore(updatedSection);
      }

      // Update lecture in global store
      updateLectureInStore(updatedLecture);
    } catch (error) {
      console.error("Error saving lecture:", error);
      setError("Error saving lecture. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = async (content) => {
    await handleSave({ content });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <LectureFields
        lecture={currentLecture}
        onSave={handleSave}
        isSaving={isSaving}
        error={error}
        lastSaved={lastSaved}
      />
      <TiptapEditor
        content={currentLecture.content}
        onUpdate={handleContentChange}
      />
    </div>
  );
};

export default LectureContentEditor;
