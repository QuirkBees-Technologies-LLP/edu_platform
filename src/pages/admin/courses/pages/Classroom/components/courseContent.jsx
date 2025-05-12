import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

// components
import HeroSectionCourse from "./HeroSectionCourse";
import LectureCard from "./LectureCard";
import CourseContentSideBar from "./CourseContentSideBar";

// services
import { lmsSections } from "../../../../../../services";
import { useAuthContext } from "../../../../../../auth/useAuthContext";

const CourseContent = ({ course, handleBack, handleViewLecture }) => {
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

  const { _id } = course;

  // Calcular progreso (esto podría venir de una API en una implementación real)
  useEffect(() => {
    if (listOfSections && listOfSections.length > 0) {
      const totalLectures = listOfSections.reduce(
        (acc, section) => acc + (section.lectures?.length || 0),
        0
      );
      // Simulamos progreso para demostración
      // En implementación real, habría un seguimiento de lecciones completadas
      const randomProgress = Math.floor(Math.random() * 101);
      setProgress(totalLectures > 0 ? randomProgress : 0);
    }
  }, [listOfSections]);

  return (
    <div className=" min-h-screen pb-16">
      <HeroSectionCourse course={course} />

      {/* Main Content */}
      <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <CourseContentSideBar
            course={course}
            handleBack={handleBack}
            handleViewLecture={handleViewLecture}
            onSelectLecture={setCurrentLecture}
          />

          {/* Main Content Area */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {listOfSections.length > 0 ? (
              <div className="space-y-10">
                {listOfSections.map((section, sectionIndex) => (
                  <div
                    key={section._id || sectionIndex}
                    className="rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {section.title || `Section ${sectionIndex + 1}`}
                      </h2>
                      {section.description && (
                        <p className="text-gray-600">{section.description}</p>
                      )}
                    </div>

                    <div className="p-6">
                      {section.lectures?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {section.lectures.map((lecture, lectureIndex) => {
                            return (
                              <div className="h-full" key={lecture._id}>
                                <LectureCard
                                  lectureId={lecture._id}
                                  courseId={_id}
                                  handleViewLecture={handleViewLecture}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <p className="text-gray-500">
                            No lectures available in this section yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No sections available
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This course doesn't have any sections or content yet. Check
                  back later for updates.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
