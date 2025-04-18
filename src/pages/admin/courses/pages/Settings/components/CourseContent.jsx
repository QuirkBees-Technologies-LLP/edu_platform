import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import { fetchSections } from "@/store/reducer/sectionSlice";
import SectionList from "./SectionList";
import LectureContent from "./lectures/LectureContent";

const CourseContent = ({ courseId }) => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const [selectedLecture, setSelectedLecture] = useState(null);

  // Fetch sections when courseId changes
  useEffect(() => {
    if (courseId && auth?.token) {
      dispatch(fetchSections({ courseId, token: auth.token }));
    }
  }, [courseId, auth?.token, dispatch]);

  return (
    <div className="flex h-full">
      {/* Sidebar with sections */}
      <div className="w-80 border-r overflow-y-auto p-4">
        <SectionList courseId={courseId} onLectureSelect={setSelectedLecture} />
      </div>
      {/* Main content area */}
      <div className="flex-1 p-4">
        {selectedLecture ? (
          <LectureContent lecture={selectedLecture} />
        ) : (
          <div className="text-gray-500">
            Select a lecture to view its content
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;
