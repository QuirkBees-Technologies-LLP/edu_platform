import {
  BookOpen,
  Award,
  Bookmark,
  GraduationCap,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

// Colección de imágenes de fallback para diferentes categorías
const FALLBACK_IMAGES = {
  default:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
  programming:
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2574&auto=format&fit=crop",
  design:
    "https://images.unsplash.com/photo-1545235617-7a424c1a60cc?q=80&w=2680&auto=format&fit=crop",
  business:
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2671&auto=format&fit=crop",
  marketing:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
  music:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2670&auto=format&fit=crop",
  photography:
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2670&auto=format&fit=crop",
};

const HeroSectionCourse = ({ course }) => {
  const [imageError, setImageError] = useState(false);

  if (!course) return null;

  const {
    _id,
    title,
    description,
    price,
    published,
    isFeatured,
    tier,
    order,
    category,
    imageUrl,
    instructor,
    sections,
  } = course;

  const amountOfLectures = sections.reduce((acc, section) => {
    return acc + section.lectures.length;
  }, 0);

  // Obtener color basado en el tier
  const getTierColor = () => {
    switch (tier?.toLowerCase()) {
      case "basic":
        return "from-emerald-600 to-teal-500";
      case "premium":
        return "from-purple-600 to-pink-500";
      case "pro":
        return "from-amber-500 to-orange-500";
      default:
        return "from-blue-600 to-indigo-500";
    }
  };

  // Obtener icono para la categoría
  // const getCategoryIcon = () => {
  //   switch (category?.toLowerCase()) {
  //     case "programming":
  //       return <CodeIcon className="w-4 h-4" />;
  //     case "design":
  //       return <PenToolIcon className="w-4 h-4" />;
  //     case "business":
  //       return <BarChartIcon className="w-4 h-4" />;
  //     default:
  //       return <Bookmark className="w-4 h-4" />;
  //   }
  // };

  // Obtener imagen de fallback basada en la categoría
  const getFallbackImage = () => {
    if (!category) return FALLBACK_IMAGES.default;

    const lowercaseCategory = category.name.toLowerCase();
    return FALLBACK_IMAGES[lowercaseCategory] || FALLBACK_IMAGES.default;
  };

  // Manejar error de carga de imagen
  const handleImageError = () => {
    setImageError(true);
    console.log(`Error loading image for course: ${title}`);
  };

  return (
    <div className="w-full h-[350px] relative bg-gray-100">
      {/* Imagen de fondo estática */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Si hay error en la imagen o no hay URL, mostrar un fallback o placeholder */}
        {imageError || !imageUrl ? (
          <div className="relative w-full h-full">
            {/* Fallback image */}
            <img
              src={getFallbackImage()}
              alt={title || "Course cover"}
              className="w-full h-full object-cover brightness-[0.7]"
            />

            {/* Overlay pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/30 mix-blend-multiply"></div>

            {/* Si es explícitamente un error (no solo falta URL), mostrar icono de error sutilmente */}
            {imageError && (
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm p-2 rounded-lg text-white/60">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={title || "Course cover"}
            className="w-full h-full object-cover brightness-[0.7]"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {/* Badges informativos */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          {published && (
            <div className="px-3 py-1.5 bg-green-500/20 backdrop-blur-md rounded-full text-green-400 font-medium text-sm flex items-center gap-1.5 border border-green-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Published</span>
            </div>
          )}

          {isFeatured && (
            <div className="px-3 py-1.5 bg-amber-500/20 backdrop-blur-md rounded-full text-amber-400 font-medium text-sm flex items-center gap-1.5 border border-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Featured</span>
            </div>
          )}

          {category && (
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white font-medium text-sm flex items-center gap-1.5 border border-white/20">
              <Bookmark className="w-3.5 h-3.5" />
              <span>{category?.name}</span>
            </div>
          )}
        </div>

        {/* Contenedor del contenido */}
        <div className="container mx-auto px-6 h-full flex items-end pb-10">
          <div className="max-w-3xl mb-6">
            {/* Título y descripción */}
            <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
              {title}
            </h1>

            <p className="text-lg text-white/80 mb-5 line-clamp-2">
              {description}
            </p>

            {/* Información del curso - versión compacta */}
            <div className="flex flex-wrap items-center gap-4">
              {instructor && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-medium text-sm">
                    {((instructor?.first_name?.charAt(0) || '').toUpperCase() +
                      (instructor?.last_name?.charAt(0) || '').toUpperCase()) || 'U'}
                  </div>
                  <span className="text-white/90 text-sm">
                    {instructor.first_name + ' ' + instructor.last_name}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {amountOfLectures > 0 && (
                  <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white/90 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{amountOfLectures} lectures</span>
                  </div>
                )}

                {tier && (
                  <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white/90 text-sm flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>{tier}</span>
                  </div>
                )}

                {price === 0 ? (
                  <div className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-lg text-emerald-300 text-sm font-medium">
                    Free
                  </div>
                ) : (
                  price && (
                    <div className="px-3 py-1.5 bg-indigo-500/20 backdrop-blur-sm rounded-lg text-indigo-300 text-sm font-medium">
                      ${price.toFixed(2)}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Iconos auxiliares en caso de no tener Lucide completo
const CodeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const PenToolIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </svg>
);

const BarChartIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export default HeroSectionCourse;
