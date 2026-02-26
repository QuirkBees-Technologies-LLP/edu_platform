import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  Plus,
  Book,
  Video,
  Users,
  Star,
  Lock,
  Globe,
  Edit2,
  GripVertical,
  Trash,
  Eye,
} from "lucide-react";
import PropTypes from "prop-types";

/**
 * Represents a draggable course card component.
 * @param {Object} props - Component props
 * @param {Object} props.course - Course data object from backend
 * @param {number} props.index - Index of the course in the list
 * @param {Function} props.onEdit - Callback function for edit action
 * @param {Function} props.onMove - Callback function for reordering
 * @param {Function} props.onDelete - Callback function for delete action
 * @returns {JSX.Element} Draggable course card component
 */
const DraggableCourseCard = ({
  course,
  index,
  onEdit,
  onMove,
  onDelete,
  onSelect,
  activeTab,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = React.useRef(null);

  const {
    id,
    title,
    description,
    imageUrl,
    strategyBanner,
    category,
    published,
    tier,
    instructor,
    section,
  } = course || {};

  // For master-class tab prefer strategyBanner, fallback to imageUrl
  const displayImage = activeTab === "master-class"
    ? (strategyBanner || imageUrl)
    : imageUrl;

  // Fallback image URL
  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  // Drag and drop configuration
  const [{ isDragging }, drag] = useDrag({
    type: "COURSE_CARD",
    item: { id: course?._id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "COURSE_CARD",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle edit click
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(course);
  };

  // const handle select course
  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(course);
  };

  // Handle delete click
  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(course);
  };

  return (
    <div
      ref={ref}
      className={`relative rounded-xl shadow-md overflow-hidden transition-all duration-300 ${isDragging
        ? "opacity-50 scale-105 rotate-1 shadow-xl"
        : isHovered
          ? "shadow-lg transform translate-y-[-4px]"
          : "opacity-100 hover:shadow-lg"
        }`}
      role="article"
      aria-label={`${activeTab === "courses" ? "Course" : "Strategy"}: ${title}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div onClick={handleSelect} className="cursor-pointer">
        {/** Thumbnail Section */}
        <div className="relative aspect-video overflow-hidden">
          {displayImage ? (
            <img
              src={imageError ? fallbackImage : displayImage}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : ""
                }`}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <Plus className="w-10 h-10 text-blue-400" />
            </div>
          )}

          {/* Overlay when hovered */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovered ? "bg-opacity-20" : "bg-opacity-0"
              }`}
          >
            {isHovered && (
              <div className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-90 rounded-full shadow-md animate-fadeIn">
                <Eye className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>

          {/* Drag handle that appears on hover */}
          {isHovered && (
            <div
              className="absolute -top-4 left-44 p-2 bg-white rounded-xl shadow-md cursor-move animate-fadeIn rotate-90 py-5 px-0"
              role="button"
              aria-label="Drag handle"
            >
              <GripVertical className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </div>

        {/** Status Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {tier === "PRO" && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md transform transition-transform duration-200 hover:scale-105">
              <Star className="w-3.5 h-3.5" />
              <span>Pro</span>
            </div>
          )}
          {published ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md transform transition-transform duration-200 hover:scale-105">
              <Globe className="w-3.5 h-3.5" />
              <span>Live</span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md transform transition-transform duration-200 hover:scale-105">
              <Lock className="w-3 h-3" />
              <span>Draft</span>
            </div>
          )}
        </div>

        {/** Content Section */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-lg w-[200px] font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
            <span className="text-xs badge font-medium text-gray-900 rounded-2xl transition-colors duration-200">
              {section}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>

          {/* Course metadata with improved styling */}
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <div className="flex items-center gap-1.5 text-blue-600">
              <Book className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-primary">
                {category?.name || "Uncategorized"}
              </span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-1.5 text-gray-500">
              <Users className="w-4 h-4" />
              <span>
                {(instructor?.first_name && instructor?.last_name) ? `${instructor.first_name} ${instructor.last_name}` : "Unknown Instructor"}
              </span>
            </div>
          </div>
        </div>

        {/** Action Buttons - Edit & Delete for all tabs */}
        <div
          className={`absolute top-2 left-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
            }`}
        >
          <button
            onClick={handleEdit}
            className="p-2.5 bg-primary rounded-full shadow-lg transition-all duration-200 hover:bg-primary-active hover:shadow-xl hover:scale-110 hover:rotate-12 group"
            title={`Edit ${activeTab === "courses" ? "IQ Vault" : activeTab === "strategies" ? "Strategy" : "Master Class"}`}
            aria-label={`Edit ${activeTab === "courses" ? "IQ Vault" : activeTab === "strategies" ? "Strategy" : "Master Class"}`}
          >
            <Edit2 className="w-5 h-5 text-white group-hover:animate-pulse" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2.5 bg-red-500 rounded-full shadow-lg transition-all duration-200 hover:bg-red-600 hover:shadow-xl hover:scale-110 hover:rotate-12 group"
            title={`Delete ${activeTab === "courses" ? "IQ Vault" : activeTab === "strategies" ? "Strategy" : "Master Class"}`}
            aria-label={`Delete ${activeTab === "courses" ? "IQ Vault" : activeTab === "strategies" ? "Strategy" : "Master Class"}`}
          >
            <Trash className="w-5 h-5 text-white group-hover:animate-pulse" />
          </button>
        </div>
      </div>

      {/* Bottom border indicator */}
      <div
        className={`h-1 w-full bg-gradient-to-r bg-primary to-indigo-600 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
          }`}
      ></div>
    </div>
  );
};



DraggableCourseCard.defaultProps = {
  onEdit: () => { },
  onMove: () => { },
  onDelete: () => { },
  onSelect: () => { },
};

export default DraggableCourseCard;
