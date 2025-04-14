import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SectionList from "./SectionList";
import LectureContentEditor from "./lectures/LectureContentEditor";
import { useLectureStore } from "@/store/zustand/lectureStore";
import { useAuthContext } from "@/auth/useAuthContext";

const CourseContent = ({ courseId }) => {
  const [selectedLecture, setSelectedLecture] = useState(null);
  const { auth } = useAuthContext();
  const { fetchLectures } = useLectureStore();

  const handleLectureSelect = async (lecture) => {
    if (!auth?.token || !lecture) return;

    try {
      // Set the lecture immediately for better UX
      setSelectedLecture(lecture);

      // Then fetch the latest data
      const lectures = await fetchLectures(lecture.sectionId, auth.token);

      if (lectures && Array.isArray(lectures)) {
        const updatedLecture = lectures.find((l) => l.id === lecture.id);
        if (updatedLecture) {
          setSelectedLecture(updatedLecture);
        }
      }
    } catch (error) {
      console.error("Error fetching lecture:", error);
      // Keep the selected lecture even if fetch fails
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        {/* Sidebar with sections and lectures */}
        <div className="w-80 border-r overflow-y-auto p-4">
          <SectionList
            courseId={courseId}
            onLectureSelect={handleLectureSelect}
            selectedLectureId={selectedLecture?.id}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6">
          {selectedLecture ? (
            <LectureContentEditor
              key={selectedLecture.id} // Add key to force re-render when lecture changes
              lecture={selectedLecture}
              courseId={courseId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Select a lecture to view and edit its content
              </p>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default CourseContent;
