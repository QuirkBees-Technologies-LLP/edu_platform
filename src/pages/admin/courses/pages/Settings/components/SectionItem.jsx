import React, { useCallback } from "react";
import { useDrag } from "react-dnd";
import { MoreVertical } from "lucide-react";
import { ItemTypes } from "../../../constants/ItemTypes";

const DraggableLecture = ({ lecture, onSelect }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.LECTURE,
    item: { id: lecture.id, type: ItemTypes.LECTURE, lecture },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(lecture);
    }
  };

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm">{lecture.title}</span>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            // Handle lecture actions
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DraggableLecture;
