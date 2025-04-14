import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

const DraggableItem = ({ id, type, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: { id, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {children}
    </div>
  );
};

export default DraggableItem;
