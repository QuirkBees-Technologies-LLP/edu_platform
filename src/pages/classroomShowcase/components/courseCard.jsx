import { Play, Clock, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

const CourseCard = (props) => {
  const {
    id,
    title,
    description,
    imageUrl,
    category,
    published,
    tier,
    instructor,
    large,
  } = props;

  const { onSelectCourse } = props;

  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Generate random progress for mock courses (between 0 and 100)
  const progress = useMemo(() => Math.floor(Math.random() * 101), [id]);

  // Fallback image URL
  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl h-full ${large ? "aspect-square" : "aspect-square"}`}
    >
      <img
        src={imageError || !imageUrl ? fallbackImage : imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="absolute bottom-0 p-6 w-full">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-white/90" />
            <span className="text-white/90 text-sm font-medium">
              {category}
            </span>
            <span className="text-white/60 text-sm">•</span>
            <span className="text-white/80 text-sm">{tier}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {instructor?.name?.charAt(0) || "U"}
              </span>
            </div>
            <span className="text-white/90 text-sm">{instructor?.name}</span>
          </div>
          <h3
            className={`text-white font-bold mb-2 ${large ? "text-3xl" : "text-xl"} line-clamp-2`}
          >
            {title}
          </h3>
          <p className="text-white/80 text-sm mb-4 line-clamp-2">
            {description}
          </p>
          <div className="space-y-3">
            <button
              className="flex items-center gap-2 bg-primary hover:bg-primary-active text-white px-4 py-2 rounded-lg transition-colors"
              // onClick={() => navigate(`/classroom/course/${id}`)}
              onClick={() => onSelectCourse(props)}
            >
              <Play className="w-4 h-4" />
              <span>Watch Now</span>
            </button>

            {/* Minimalistic Progress Bar */}
            <div className="relative">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300 ease-in-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-white/60">Progress</span>
                <span className="text-xs text-white/80 font-medium">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
