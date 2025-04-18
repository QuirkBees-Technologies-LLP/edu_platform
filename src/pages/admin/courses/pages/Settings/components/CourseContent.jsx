import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import { fetchSections } from "@/store/reducer/sectionSlice";
import SectionList from "./SectionList";

const CourseContent = ({ courseId }) => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();

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
        <SectionList courseId={courseId} />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4">
        <div className="text-gray-500">
          Select a section to view its content
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
