import React from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

const DropZone = ({ onDrop, children, className = "" }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.SECTION, ItemTypes.LECTURE],
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`${className} ${
        isOver && canDrop ? "bg-blue-50 border-blue-500" : ""
      } transition-colors duration-200 ease-in-out`}
    >
      {children}
    </div>
  );
};

export default DropZone;
