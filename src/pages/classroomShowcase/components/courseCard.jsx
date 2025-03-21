import { Play, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseCard = (props) => {
  const { title, subtitle, instructor, image, large, id } = props;

  const navigate = useNavigate();

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl h-full ${large ? "aspect-square" : "aspect-square"}`}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="absolute bottom-0 p-6 w-full">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={instructor.image}
              alt={instructor.name}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <span className="text-white/90 text-sm">{instructor.name}</span>
          </div>
          <h3
            className={`text-white font-bold mb-2 ${large ? "text-3xl" : "text-xl"} line-clamp-2`}
          >
            {title}
          </h3>
          <p className="text-white/80 text-sm mb-4 line-clamp-2">{subtitle}</p>
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => navigate(`/classroom/course/${id}`)}
            >
              <Play className="w-4 h-4" />
              <span>Watch Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
