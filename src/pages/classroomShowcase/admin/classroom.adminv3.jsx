import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Plus,
  Edit2,
} from "lucide-react";
import CourseListPageV3 from "./components/CourseListPageV3";
import useCourseStore from "@/store/courseStore";
import CreateCourseModal from "@/pages/classroomShowcase/pages/Settings/components/CreateCourseModal";
import { toast } from "react-hot-toast";
import ContentManagementPage from "./features/content-management/ContentManagementPage";

/**
 * Componente principal de administración de cursos
 */
const ClassroomAdmin = () => {
  const {
    selectedCourse,
    clearSelectedCourse,
    fetchCourses,
    createNewCourse,
    updateExistingCourse,
    isLoading,
    error,
  } = useCourseStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [view, setView] = useState("courses"); // 'courses' or 'content'

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (courseData) => {
    try {
      await createNewCourse(courseData);
      toast.success("Course created successfully!");
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to create course");
    }
  };

  const handleUpdateCourse = async (courseData) => {
    if (!selectedCourse) return;
    try {
      await updateExistingCourse(selectedCourse.id, courseData);
      toast.success("Course updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update course");
    }
  };

  const handleUpdateCourses = (updatedCourses) => {
    // Aquí iría la lógica para guardar los cambios en la API
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setView("content");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-gray-900">Course Admin</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !selectedCourse
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={clearSelectedCourse}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </button>

              {selectedCourse && (
                <>
                  <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <BookOpen className="w-5 h-5 mr-3" />
                    Content
                  </button>

                  <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <Users className="w-5 h-5 mr-3" />
                    Students
                  </button>

                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-200 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {/* Top Navigation */}
          <div className="bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 mr-4"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                )}
                {selectedCourse && (
                  <button
                    onClick={clearSelectedCourse}
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to IQ Vault
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {selectedCourse ? selectedCourse.title : "All IQ Vault"}
                </span>
                {!selectedCourse ? (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit IQ Vault
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            ) : view === "courses" ? (
              <CourseListPageV3
                courses={selectedCourse ? [selectedCourse] : []}
                onUpdate={handleUpdateCourses}
                onSelect={handleSelectCourse}
              />
            ) : (
              <ContentManagementPage
                course={selectedCourse}
                onUpdate={handleUpdateCourse}
              />
            )}
          </div>
        </div>

        {/* Create Course Modal */}
        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCourse}
          isLoading={isLoading}
        />

        {/* Edit Course Modal */}
        <CreateCourseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateCourse}
          initialData={selectedCourse}
          isLoading={isLoading}
        />
      </div>
    </DndProvider>
  );
};

export default ClassroomAdmin;
