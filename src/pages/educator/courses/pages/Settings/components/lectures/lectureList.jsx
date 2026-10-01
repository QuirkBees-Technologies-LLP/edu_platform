import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Video,
  Loader2,
  BookOpen,
  ArrowRight,
  Type,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

import { useAuthContext } from "@/auth/useAuthContext";
import { getAllLectures } from "@/services/lms.lectures";
// import { deleteLecture } from "@/services/lms.api";
import { lmsLectures } from "../../../../../../../services";
import CreateLectureForm from "../sections/CreateLectureForm";
import { motion, AnimatePresence } from "framer-motion";
import ShowMoreLess from "../../../../../../../components/ui/showmoreless";

const LectureList = ({
  sectionId,
  onLectureSelect,
  onLectureUpdate,
  forceUpdateLectureList,
  setForceUpdateLectureList,
}) => {
  const [isCreatingLecture, setIsCreatingLecture] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [hoveredLectureId, setHoveredLectureId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { auth } = useAuthContext();

  const loadLectures = async () => {
    if (!sectionId || !auth?.token) return;

    setIsLoading(true);
    try {
      const response = await getAllLectures({ section: sectionId }, auth.token);
      setLectures(response.data);
    } catch (error) {
      console.error("Failed to fetch lectures:", error);
    } finally {
      setIsLoading(false);
      if (forceUpdateLectureList) {
        setForceUpdateLectureList(false);
      }
    }
  };

  // Fetch lectures when sectionId changes
  useEffect(() => {
    loadLectures();
  }, [sectionId, auth?.token]);

  useEffect(() => {
    if (forceUpdateLectureList) {
      loadLectures();
    }
  }, [forceUpdateLectureList]);

  const handleDeleteLecture = async (lectureId) => {
    if (!auth?.token) return;

    if (window.confirm("Are you sure you want to delete this lecture?")) {
      setDeleteLoading(lectureId);
      try {
        await lmsLectures.deleteLecture(lectureId, auth.token);
        // Recargar las lectures desde el backend
        await loadLectures();

        // Si el lecture eliminado era el seleccionado, informar al componente padre
        if (lectureId === selectedLectureId && onLectureUpdate) {
          onLectureUpdate(null);
        }
      } catch (error) {
        console.error("Failed to delete lecture:", error);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleLectureCreated = (newLecture) => {
    setLectures((prevLectures) => [...prevLectures, newLecture]);
    setIsCreatingLecture(false);

    // Seleccionar automáticamente el nuevo lecture
    if (onLectureSelect) {
      onLectureSelect(newLecture);
    }
  };

  const handleLectureSelect = (lecture) => {
    setSelectedLectureId(lecture._id);
    if (onLectureSelect) {
      onLectureSelect(lecture);
    }
  };

  // Función para actualizar un lecture en la lista
  const handleLectureUpdated = (updatedLecture) => {
    if (!updatedLecture) return;

    setLectures((prevLectures) =>
      prevLectures.map((lecture) =>
        lecture._id === updatedLecture._id ? updatedLecture : lecture
      )
    );

    // Propagar la actualización al componente padre
    if (onLectureUpdate) {
      onLectureUpdate(updatedLecture);
    }
  };

  // Get appropriate icon based on lecture type
  const getLectureIcon = (type) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-4 h-4 text-primary" />;
      case "TEXT":
        return <FileText className="w-4 h-4 text-primary" />;
      default:
        return <Type className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-gray-500">Loading lectures...</p>
          </div>
        </div>
      ) : lectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center rounded-lg border border-dashed border-gray-200">
          <div className="bg-gray-100 p-3 rounded-full mb-2">
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">No lectures yet</p>
          <p className="text-xs text-gray-400 mb-3">
            Add your first lecture to get started
          </p>
          <button
            onClick={() => setIsCreatingLecture(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-light text-primary hover:bg-primary-light rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Lecture
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {lectures.map((lecture, index) => (
              <motion.div
                key={lecture._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onMouseEnter={() => setHoveredLectureId(lecture._id)}
                onMouseLeave={() => setHoveredLectureId(null)}
              >
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-md cursor-pointer transition-all ${selectedLectureId === lecture._id
                    ? "bg-primary-light border-l-4 border-l-primary"
                    : "hover:bg-primary-light border-l-4 border-l-transparent"
                    }`}
                  onClick={() => handleLectureSelect(lecture)}
                >
                  {/* Lecture icon */}
                  <div className="flex-shrink-0">
                    {getLectureIcon(lecture.type)}
                  </div>

                  {/* Lecture content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-800 truncate">
                      {lecture.title}
                    </h4>
                    {/* {lecture.description && (
                      // <p className="text-xs text-gray-500 truncate mt-0.5">
                      //   {lecture.description}
                      // </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                      {lecture.description ? (
                        /<[^>]+>/.test(lecture.description) ? (
                          <span dangerouslySetInnerHTML={{ __html: lecture.description }} />
                        ) : (
                          <span>{lecture.description}</span>
                        )
                      ) : (
                        "No description provided"
                      )}
                    </p>
                    )} */}
                    {/* {lecture.description ? <ShowMoreLess html={lecture.description} limit={10} />: "No description provided"} */}


                  </div>

                  {/* Preview indicator */}
                  {lecture.preview && (
                    <span className="px-1.5 py-0.5 bg-light text-primary text-xs rounded">
                      Preview
                    </span>
                  )}

                  {/* Actions - only show on hover or when selected */}
                  <div
                    className={`flex items-center gap-1 transition-opacity ${hoveredLectureId === lecture._id ||
                      selectedLectureId === lecture._id
                      ? "opacity-100"
                      : "opacity-0"
                      }`}
                  >
                    <button
                      className="p-1.5 text-gray-700 hover:text-primary rounded-md transition-colors"
                      title="Edit lecture"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLectureSelect(lecture);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLecture(lecture._id);
                      }}
                      disabled={deleteLoading === lecture._id}
                      className="p-1.5 text-gray-700 hover:text-red-500 rounded-md transition-colors disabled:opacity-50"
                      title="Delete lecture"
                    >
                      {deleteLoading === lecture._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Selected indicator */}
                  {selectedLectureId === lecture._id && (
                    <div className="text-primary">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create lecture form or button */}
      <div className="mt-4">
        <AnimatePresence>
          {isCreatingLecture ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="border border-gray-200 rounded-md bg-light p-3 mb-2">
                <CreateLectureForm
                  sectionId={sectionId}
                  onCancel={() => setIsCreatingLecture(false)}
                  onSuccess={handleLectureCreated}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setIsCreatingLecture(true)}
                className="flex items-center gap-2 w-full py-2 px-3 text-sm text-center justify-center hover:bg-gray-100 text-gray-700 rounded-md transition-colors border border-dashed border-gray-200"
                title="Add new lecture"
              >
                <Plus className="w-4 h-4" />
                Add Lecture
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LectureList;
