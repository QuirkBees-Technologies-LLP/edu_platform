import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";

// Components
import SectionList from "./SectionList";
import LectureContentEditor from "./lectures/LectureContentEditor";

// Hooks
import { useAuthContext } from "@/auth/useAuthContext";

// Redux
import {
  fetchSections,
  createNewSection,
  selectAllSections,
  selectSectionsStatus,
} from "@/store/reducer/sectionSlice";
import {
  fetchLectures,
  selectSelectedLecture,
} from "@/store/reducer/lectureSlice";

const CourseContent = ({ courseId }) => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const sections = useSelector(selectAllSections);
  const sectionsStatus = useSelector(selectSectionsStatus);
  const selectedLecture = useSelector(selectSelectedLecture);

  // Fetch sections when component mounts or courseId changes
  useEffect(() => {
    if (auth?.token && courseId) {
      dispatch(fetchSections({ courseId, token: auth.token }));
    }
  }, [dispatch, auth?.token, courseId]);

  const handleCreateSection = async () => {
    if (!auth?.token || !courseId) return;

    try {
      await dispatch(
        createNewSection({
          sectionData: {
            title: "New Section",
            description: "Section description",
            course: courseId,
            order: sections.length,
          },
          token: auth.token,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error creating section:", error);
    }
  };

  const handleLectureSelect = async (lecture) => {
    if (!auth?.token || !lecture) return;

    try {
      // Fetch the latest lecture data
      const result = await dispatch(
        fetchLectures({ sectionId: lecture.sectionId, token: auth.token })
      ).unwrap();

      if (result && Array.isArray(result)) {
        const updatedLecture = result.find((l) => l.id === lecture.id);
        if (updatedLecture) {
          // The lecture will be updated in the Redux store
          // No need to set it locally
        }
      }
    } catch (error) {
      console.error("Error fetching lecture:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        {/* Sidebar with sections and lectures */}
        <div className="w-80 border-r overflow-y-auto p-4">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 mb-4 text-center">
                No sections found. Create your first section to start adding
                lectures.
              </p>
              <button
                onClick={handleCreateSection}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Section
              </button>
            </div>
          ) : (
            <SectionList
              courseId={courseId}
              onLectureSelect={handleLectureSelect}
              selectedLectureId={selectedLecture?.id}
            />
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 p-6">
          {selectedLecture ? (
            <LectureContentEditor
              key={selectedLecture.id}
              lecture={selectedLecture}
              courseId={courseId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {sections.length === 0
                  ? "Create a section to start adding lectures"
                  : "Select a lecture to view and edit its content"}
              </p>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default CourseContent;
