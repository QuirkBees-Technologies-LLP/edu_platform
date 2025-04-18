import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuthContext } from "@/auth/useAuthContext";
import { getAllLectures } from "@/services/lms.lectures";
// import { deleteLecture } from "@/services/lms.api";
import { lmsLectures } from "../../../../../../../services";
import CreateLectureForm from "../sections/CreateLectureForm";

const LectureList = ({ sectionId, onLectureSelect }) => {
  const [isCreatingLecture, setIsCreatingLecture] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
    }
  };

  // Fetch lectures when sectionId changes
  useEffect(() => {
    loadLectures();
  }, [sectionId, auth?.token]);

  const handleDeleteLecture = async (lectureId) => {
    if (!auth?.token) return;

    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await lmsLectures.deleteLecture(lectureId, auth.token);
        // Recargar las lectures desde el backend
        await loadLectures();
      } catch (error) {
        console.error("Failed to delete lecture:", error);
      }
    }
  };

  const handleLectureCreated = (newLecture) => {
    setLectures((prevLectures) => [...prevLectures, newLecture]);
    setIsCreatingLecture(false);
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
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
              onClick={() => onLectureSelect(lecture)}
            >
              <span className="text-sm">{lecture.title}</span>
              <div className="flex items-center gap-2">
                <button
                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Edit lecture"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteLecture(lecture._id)}
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
