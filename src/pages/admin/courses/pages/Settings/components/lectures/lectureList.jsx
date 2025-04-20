import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuthContext } from "@/auth/useAuthContext";
import { getAllLectures } from "@/services/lms.lectures";
// import { deleteLecture } from "@/services/lms.api";
import { lmsLectures } from "../../../../../../../services";
import CreateLectureForm from "../sections/CreateLectureForm";

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

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading lectures...</div>
      ) : lectures.length === 0 ? (
        <div className="text-sm text-gray-500">No lectures yet</div>
      ) : (
        <div className="space-y-2">
          {lectures.map((lecture) => (
            <div
              key={lecture._id}
              className={`flex items-center justify-between p-2 bg-gray-50 rounded ${
                selectedLectureId === lecture._id ? "ring-2 ring-blue-400" : ""
              }`}
              onClick={() => handleLectureSelect(lecture)}
            >
              <span className="text-sm">{lecture.title}</span>
              <div className="flex items-center gap-2">
                <button
                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Edit lecture"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLectureSelect(lecture);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLecture(lecture._id);
                  }}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete lecture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {isCreatingLecture ? (
        <CreateLectureForm
          sectionId={sectionId}
          onCancel={() => setIsCreatingLecture(false)}
          onSuccess={handleLectureCreated}
        />
      ) : (
        <button
          onClick={() => setIsCreatingLecture(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          title="Add new lecture"
        >
          <Plus className="w-4 h-4" />
          Add Lecture
        </button>
      )}
    </div>
  );
};

export default LectureList;
