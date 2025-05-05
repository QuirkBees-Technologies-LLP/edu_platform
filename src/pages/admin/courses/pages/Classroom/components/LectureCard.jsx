import {
  Play,
  Clock,
  FileText,
  Video,
  ChevronRight,
  CheckCircle,
  Star,
  AlertCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuthContext } from "../../../../../../auth/useAuthContext";
import { lmsLectures } from "../../../../../../services";
import ShowMoreLess from "../../../../../../components/ui/showmoreless";

const LectureCard = ({ lectureId, courseId, handleViewLecture }) => {
  const { auth } = useAuthContext();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecture, setLecture] = useState(null);

  useEffect(() => {
    const fetchLectureById = async () => {
      if (!lectureId || !auth?.token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await lmsLectures.getLectureById(
          lectureId,
          auth.token
        );
        setLecture(response.data);

        // Simulamos que algunas lecciones están completadas aleatoriamente
        // En una implementación real, esto vendría de un estado global o API
        const randomCompleted = Math.random() > 0.7;
        setIsCompleted(randomCompleted);

        // Simulamos que algunas lecciones son marcadas como importantes
        const randomImportant = Math.random() > 0.8;
        setIsImportant(randomImportant);
      } catch (err) {
        setError(err.message || "Error fetching lecture");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectureById();
  }, [lectureId, auth?.token]);

  // Obtener icono basado en el tipo de lección
  const getLectureTypeIcon = () => {
    if (!lecture) return <FileText className="w-5 h-5 text-gray-400" />;

    if (lecture.type === "video" || lecture.type === "VIDEO") {
      return <Video className="w-5 h-5 text-blue-400" />;
    } else {
      return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  // Gradiente basado en el tipo de lección
  const getGradient = () => {
    if (!lecture) return "from-gray-500 to-gray-700";

    if (lecture.type === "video" || lecture.type === "VIDEO") {
      return "from-blue-600 to-indigo-700";
    } else {
      return "from-purple-600 to-pink-700";
    }
  };

  // Determinar imagen de fallback si no hay imagen
  const getImageFallback = () => {
    if (!lecture)
      return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=3546&auto=format&fit=crop";

    if (lecture.type === "video" || lecture.type === "VIDEO") {
      return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";
    } else {
      return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=3546&auto=format&fit=crop";
    }
  };

  // Obtener fecha formateada (simulada)
  const getFormattedDate = () => {
    const date = new Date();
    return `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;
  };

  // Si está cargando, muestra un skeleton loader
  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
        <p className="text-sm text-gray-500">Loading lecture...</p>
      </div>
    );
  }

  // Si hay un error, muestra un mensaje de error
  if (error) {
    return (
      <div className="h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-sm text-gray-700 font-medium">
          Failed to load lecture
        </p>
        <p className="text-xs text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  // Si no hay lecture, muestra un placeholder
  if (!lecture) {
    return (
      <div className="h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center">
        <FileText className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Lecture not found</p>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
        {/* Imagen superior con altura mayor */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* Imagen con fallback */}
          <img
            src={lecture.image || getImageFallback()}
            alt={lecture.title}
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? "scale-110 brightness-110" : "scale-100"}`}
            onError={(e) => {
              e.target.src = getImageFallback();
            }}
          />

          {/* Overlay con gradiente mejorado */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-60 transition-opacity duration-300 ${isHovered ? "opacity-70" : "opacity-60"}`}
          ></div>

          {/* Indicador de progreso/completado */}
          {isCompleted && (
            <motion.div
              className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <CheckCircle className="w-4 h-4 text-white" />
            </motion.div>
          )}

          {/* Indicador de lección importante */}
          {isImportant && (
            <motion.div
              className="absolute top-2 left-12 bg-amber-500 rounded-full p-1 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.1,
              }}
            >
              <Star className="w-4 h-4 text-white" />
            </motion.div>
          )}

          {/* Botón de play para videos - más grande y centrado */}
          {(lecture.type === "video" || lecture.type === "VIDEO") && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0.8,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-3 bg-white/30 backdrop-blur-sm rounded-full shadow-lg">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </motion.div>
          )}

          {/* Badge de tipo de contenido mejorado */}
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-1.5 shadow-md">
            {getLectureTypeIcon()}
            <span>
              {lecture.type === "video" || lecture.type === "VIDEO"
                ? "Video"
                : "Lecture"}
            </span>
          </div>

          {/* Fecha de publicación */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{getFormattedDate()}</span>
          </div>
        </div>

        {/* Contenido / Info con más espacio */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
              {lecture.title}
            </h3>

            {lecture.description && (
              <p dangerouslySetInnerHTML={{ __html: lecture.description }} className="text-xs text-gray-600 line-clamp-2 mb-2" />  
            )}
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-100">
            {/* Status con botón más visible - siempre visible */}
            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="text-green-600 font-medium flex items-center gap-1 bg-green-50 py-0.5 px-1.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-xs">Done</span>
                </span>
              )}
              <motion.div
                className="flex items-center text-xs"
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={() => handleViewLecture(lecture)}
                  className="bg-indigo-600 text-white py-0.5 px-2 rounded-full flex items-center gap-1 font-medium"
                >
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            </div>

            {/* Duración con posición fija */}
            {lecture.duration && (
              <div className="flex items-center text-gray-500 text-xs font-medium">
                <Clock className="w-3 h-3 mr-1" />
                {lecture.duration}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LectureCard;
