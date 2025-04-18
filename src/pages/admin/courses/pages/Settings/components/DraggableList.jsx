import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

const DraggableItem = ({ id, index, moveItem, children, type = "ITEM" }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, index, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: type,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.2s ease",
      }}
      className="cursor-move"
    >
      {children}
    </div>
  );
};

const DraggableList = ({ items, renderItem, onMove, type }) => {
  const moveItem = (dragIndex, hoverIndex) => {
    onMove(dragIndex, hoverIndex);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <DraggableItem
          key={item._id}
          id={item._id}
          index={index}
          moveItem={moveItem}
          type={type}
        >
          {renderItem(item, index)}
        </DraggableItem>
      ))}
    </div>
  );
};

export default DraggableList;
