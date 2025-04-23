import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Video,
  Play,
  CheckCircle,
  Clock,
} from "lucide-react";

import { lmsSections } from "../../../../../../services";
import { useAuthContext } from "../../../../../../auth/useAuthContext";

const LectureListItem = ({ lecture, isActive, onClick, handleViewLecture }) => {
  const isVideo = lecture.type === "VIDEO" || lecture.type === "video";
  const isCompleted = lecture.completed || false; // Esto dependería de tu lógica de completado

  return (
    <li
      onClick={() => {
        onClick && onClick(lecture);
        handleViewLecture && handleViewLecture(lecture);
      }}
      className={`
        flex items-center justify-between py-2 px-3 rounded-md cursor-pointer
        transition-all duration-200 hover:bg-gray-50
        ${isActive ? "bg-indigo-50 border-l-2 border-indigo-500" : ""}
      `}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isActive ? (
          <Play className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        ) : isVideo ? (
          <Video className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
        )}
        <span
          className={`text-sm truncate ${isCompleted ? "text-gray-400" : "text-gray-700"}`}
        >
          {lecture.title}
        </span>

        {lecture.duration && (
          <div className="flex items-center gap-1 text-gray-400 ml-1">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{lecture.duration}</span>
          </div>
        )}
      </div>

      {isCompleted && (
        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-2" />
      )}

      {lecture.preview && (
        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">
          Preview
        </span>
      )}
    </li>
  );
};

const CourseContentSideBar = ({
  course,
  handleBack,
  onSelectLecture,
  handleViewLecture,
}) => {
  const [listOfSections, setListOfSections] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [progress, setProgress] = useState(0);

  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchSections = async () => {
      const params = {
        course: course._id,
      };
      const response = await lmsSections.getAllSections(params, auth.token);
      setListOfSections(response.data);
    };
    fetchSections();
  }, [course._id, auth.token]);

  // Función para alternar secciones
  const toggleSection = (sectionId) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleLectureClick = (lecture) => {
    setCurrentLecture(lecture);
    if (onSelectLecture) {
      onSelectLecture(lecture);
    }
  };

  return (
    <motion.div
      className="lg:w-72 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-5 border-b border-gray-100">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to Courses</span>
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          {course.title}
        </h2>

        {/* Progress bar component would go here */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-gray-500">Course Progress</span>
          <span className="text-xs font-medium text-indigo-600">
            {progress}%
          </span>
        </div>
      </div>

      <div className="max-h-[calc(100vh-350px)] overflow-y-auto p-1">
        {listOfSections.length > 0 ? (
          listOfSections.map((section, sectionIndex) => (
            <div key={`${section._id || sectionIndex}`} className="py-2">
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full flex items-center justify-between px-4 py-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1 bg-indigo-100 rounded-md text-indigo-700">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 truncate">
                    {section.title || `Section ${sectionIndex + 1}`}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full">
                    {section.lectures?.length || 0}
                  </span>
                  {activeSection === section._id ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {activeSection === section._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 pl-6 pr-2"
                >
                  <ul className="space-y-1 py-1 border-l-2 border-gray-100">
                    {section.lectures?.map((lecture, lectureIndex) => (
                      <LectureListItem
                        key={`${lecture}-${lectureIndex}`}
                        lecture={lecture}
                        isActive={currentLecture?._id === lecture._id}
                        onClick={handleLectureClick}
                        handleViewLecture={handleViewLecture}
                      />
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-6 text-gray-500 bg-gray-50 mx-4 my-2 rounded-lg">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No sections available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CourseContentSideBar;
