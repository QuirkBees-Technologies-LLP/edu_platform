import { Link, useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

const LectureCard = ({ lecture, courseId }) => {
  const navigate = useNavigate();
  return (
    <>
      <div
        className={`relative group overflow-hidden rounded-2xl h-full aspect-square`}
      >
        <img
          src={lecture.image}
          alt={lecture.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="absolute bottom-0 p-6 w-full">
            <span className="text-sm font-medium text-gray-500">
              {lecture.type === "video" ? "📹 Video" : "📝 Text"}
            </span>
            <h3 className={`text-white font-bold mb-2 text-xl line-clamp-2`}>
              {lecture.title}
            </h3>
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={() =>
                  navigate(
                    `/classroom/course/${courseId}/lecture/${lecture.id}`
                  )
                }
              >
                <Play className="w-4 h-4" />
                <span>Watch Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LectureCard;
