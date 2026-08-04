import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";
import { fetchSections } from "@/store/reducer/sectionSlice";
import SectionList from "./SectionList";
import LectureContent from "./lectures/LectureContent";
import {
  Book,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CourseContent = ({ courseId, activeTab }) => {
  const dispatch = useDispatch();
  const { auth } = useAuthContext();
  const [selectedLecture, setSelectedLecture] = useState();
  //     () => {
  //   const savedLectureId = localStorage.getItem("selectedLectureId");
  //   return savedLectureId ? { _id: savedLectureId } : null;
  // }
  const [forceUpdateLectureList, setForceUpdateLectureList] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState([]); // ✅ Local state for sections

  // Fetch sections when courseId changes
  useEffect(() => {
    if (courseId && auth?.token) {
      setIsLoading(true);
      dispatch(fetchSections({ courseId, token: auth?.token }))
        .unwrap()
        .then((data) => {
          setSections(data?.sections || []); // ✅ Save sections locally
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [courseId, auth?.token, dispatch]);

  // ✅ Restore selected lecture from localStorage when sections are ready
  //  useEffect(() => {
  //   const savedLectureId = localStorage.getItem("selectedLectureId");
  //   if (!savedLectureId || !Array.isArray(sections)) return;

  //   const allLectures = sections.flatMap((section) => section.lectures || []);
  //   const foundLecture = allLectures.find((l) => l._id === savedLectureId);

  //   if (foundLecture) {
  //     setSelectedLecture(foundLecture);
  //   }
  // }, [sections]);

  // Update handler
  const handleLectureUpdate = (updatedLecture) => {
    if (updatedLecture && selectedLecture?._id === updatedLecture._id) {
      setSelectedLecture(updatedLecture);
    } else if (updatedLecture === null && selectedLecture) {
      setSelectedLecture(null);
      // localStorage.removeItem("selectedLectureId");
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-gray-800">
              {activeTab === "courses" ? "Academy" : activeTab === "strategies" ? "Strategy" : "Master Class"} Structure
            </h1>
          </div>
          {selectedLecture && (
            <div className="text-sm px-3 py-1.5 bg-primary-light text-primary rounded-md flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              <span>Editing: {selectedLecture?.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content with sidebar and lecture content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with sections */}
        <div
          className={`relative transition-all duration-300 ease-in-out border-r border-gray-200 min-w-0  ${sidebarCollapsed ? "w-0" : "w-[400px]"
            }`}
        >
          <div
            className={`h-full overflow-y-auto ${sidebarCollapsed ? "opacity-0" : "opacity-100"}`}
          >
            <div className="p-5 ps-0">
              <SectionList
                courseId={courseId}
                onLectureSelect={(lecture) => {
                  setSelectedLecture(lecture);
                  localStorage.setItem("selectedLectureId", lecture?._id);
                  if (window.innerWidth < 768) {
                    setSidebarCollapsed(true);
                  }
                }}
                onLectureUpdate={handleLectureUpdate}
                forceUpdateLectureList={forceUpdateLectureList}
                setForceUpdateLectureList={setForceUpdateLectureList}
                isLoading={isLoading}
                readOnly={false}
              />
            </div>
          </div>

          {/* Collapse/Expand Button */}
          <button
            onClick={toggleSidebar}
            className="absolute top-5 -right-4 bg-light rounded-full p-1.5 shadow-md border border-gray-200 z-10 transition-all duration-200"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Main content area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? "pl-0" : "pl-0 md:pl-6"
            }`}
        >
          <div className="h-full overflow-y-auto p-6">
            {selectedLecture ? (
              <div className=" rounded-xl shadow-sm">
                <LectureContent
                  lecture={selectedLecture}
                  onLectureUpdate={handleLectureUpdate}
                  forceUpdateLectureList={forceUpdateLectureList}
                  setForceUpdateLectureList={setForceUpdateLectureList}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="bg-primary-light p-6 rounded-full mb-4">
                  <Book className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  No Lecture Selected
                </h2>
                <p className="text-gray-500 max-w-md">
                  Select a lecture from the sidebar to view or edit its content
                </p>
                {sidebarCollapsed && (
                  <button
                    onClick={toggleSidebar}
                    className="mt-4 px-4 py-2 bg-primary-light text-primary rounded-lg hover:bg-primary-clarity transition-colors flex items-center"
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Show Lectures
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
