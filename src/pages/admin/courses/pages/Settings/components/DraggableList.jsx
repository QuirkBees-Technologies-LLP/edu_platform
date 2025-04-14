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
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      {children}
    </div>
  );
};

const DraggableList = ({ items, renderItem, onMove, type }) => {
  const [{ isOver }, drop] = useDrop({
    accept: [ItemTypes.SECTION, ItemTypes.LECTURE],
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`space-y-2 ${isOver ? "bg-gray-50 rounded-lg p-2" : ""}`}
    >
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export default DraggableList;
