import { useState } from "react";
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
}) => {
  const [imageError, setImageError] = useState(false);

  const {
    id,
    title,
    description,
    imageUrl,
    category,
    published,
    tier,
    instructor,
  } = course;

  // Fallback image URL
  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

  // Drag and drop configuration
  const [{ isDragging: isDraggingState }, drag] = useDrag({
    type: "COURSE_CARD",
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "COURSE_CARD",
    hover: (item) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

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
      ref={(node) => drag(drop(node))}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative group ${
        isDraggingState ? "opacity-50 scale-105 shadow-xl" : ""
      }`}
      role="article"
      aria-label={`Course: ${title}`}
    >
      <div onClick={handleSelect} className="cursor-pointer">
        {/** Thumbnail Section */}
        <div className="relative aspect-video rounded-t-lg overflow-hidden">
          {imageUrl ? (
            <img
              src={imageError ? fallbackImage : imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* Overlay with drag handle and badges */}
          {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200">
            <div
              className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              role="button"
              aria-label="Drag handle"
            >
              <GripVertical className="w-5 h-5 text-gray-600" />
            </div>
          </div> */}
        </div>

        {/** Status Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {tier === "PRO" && (
            <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
              <Star className="w-4 h-4" />
              Pro
            </div>
          )}
          {published ? (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
              <Globe className="w-4 h-4" />
              Published
            </div>
          ) : (
            <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
              <Lock className="w-3 h-3" />
              Draft
            </div>
          )}
        </div>

        {/** Content Section */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Book className="w-4 h-4" />
            <span>{category}</span>
            <span className="mx-1">•</span>
            <Users className="w-4 h-4" />
            <span>{instructor?.name || "Unknown Instructor"}</span>
          </div>
        </div>

        {/** Edit Button */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <button
            onClick={handleEdit}
            className="p-2.5 bg-blue-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-600 hover:shadow-xl hover:scale-110 hover:rotate-12"
            title="Edit course"
            aria-label="Edit course"
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>

          {/** Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2.5 bg-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:shadow-xl hover:scale-110 hover:rotate-12"
            title="Delete course"
            aria-label="Delete course"
          >
            <Trash className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

DraggableCourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    category: PropTypes.string,
    published: PropTypes.bool,
    tier: PropTypes.oneOf(["FREE", "PRO"]),
    instructor: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
      role: PropTypes.string,
      tier: PropTypes.string,
    }),
    sections: PropTypes.arrayOf(PropTypes.object),
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func,
  onMove: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
};

DraggableCourseCard.defaultProps = {
  onEdit: () => {},
  onMove: () => {},
  onDelete: () => {},
  onSelect: () => {},
};

export default DraggableCourseCard;
