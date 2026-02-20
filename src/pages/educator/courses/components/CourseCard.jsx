import { Play, Clock, Tag, Award, User, BarChart2 } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const CourseCard = (props) => {
  const { course, onSelectCourse } = props;
  const {
    id,
    title,
    description,
    strategyBanner: imageUrl,
    category,
    published,
    tier,
    instructor,
    large,
  } = course;
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate random progress for mock courses (between 0 and 100)
  const progress = useMemo(() => Math.floor(Math.random() * 101), [id]);

  // Fallback image URL
  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  // Color based on tier
  const getTierColor = () => {
    switch (tier?.toLowerCase()) {
      case "FREE" || "free":
        return "bg-emerald-500";
      case "PRO" || "pro":
        return "bg-amber-500";
      default:
        return "bg-primary";
    }
  };

  // Format instructor name
  const formatInstructorName = (name) => {
    if (!name) return "Unknown";
    return name.length > 15 ? `${name.substring(0, 15)}...` : name;
  };

  return (
    <motion.div
      className={`relative group overflow-hidden rounded-2xl h-[400px] shadow-lg `}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Course Image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={imageError || !imageUrl ? fallbackImage : imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          onError={() => setImageError(true)}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`px-2 py-0.5 rounded-full ${published ? "bg-green-500" : "bg-gray-500"} text-white text-xs font-medium`}
          >
            {published ? "Published" : "Draft"}
          </div>
        </div>

        {/* Top Info */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div
            className={`px-2 py-0.5 rounded-full ${getTierColor()} text-white text-xs font-medium flex items-center gap-1`}
          >
            <Award className="w-3 h-3" />
            <span>{tier || "Standard"}</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="absolute bottom-0 p-6 w-full">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-white/90" />
              <span className="text-white/90 text-xs font-medium">
                {category?.name || "General"}
              </span>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-white/20">
              <span className="text-white text-sm font-medium">
                {((instructor?.first_name?.charAt(0) || '').toUpperCase() +
                  (instructor?.last_name?.charAt(0) || '').toUpperCase()) || 'U'}
              </span>
            </div>
            <span className="text-white/90 text-sm font-medium">
              {formatInstructorName(instructor?.first_name + " " + instructor?.last_name)}
            </span>
          </div>

          {/* Title & Description */}
          <motion.div
            animate={{ y: isHovered ? -5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3
              className={`text-white font-bold mb-2 ${large ? "text-2xl" : "text-xl"
                } line-clamp-2`}
            >
              {title}
            </h3>
            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {description}
            </p>
          </motion.div>

          {/* Actions & Progress */}
          <motion.div
            className="space-y-3"
            animate={{ opacity: isHovered ? 1 : 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Watch Button */}
            <motion.button
              className="flex items-center justify-center gap-2 bg-blue-gradient text-white w-full py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-500/30"
              onClick={() => onSelectCourse(course)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-4 h-4" />
              <span className="font-medium">Watch Now</span>
            </motion.button>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" />
                  <span>Progress</span>
                </span>
                <span className="text-xs text-white/90 font-medium">
                  {progress}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
