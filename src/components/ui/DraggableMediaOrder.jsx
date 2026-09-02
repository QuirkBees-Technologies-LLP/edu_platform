import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { GripVertical } from "lucide-react";

const DRAG_TYPE = "MEDIA_ORDER_ITEM";

const MediaOrderChip = ({ item, index, onMove }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: DRAG_TYPE,
    hover: (dragged, monitor) => {
      if (!ref.current) return;
      const dragIndex = dragged.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      dragged.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white cursor-grab select-none"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <GripVertical size={14} className="text-gray-400 flex-shrink-0" />
      <span className="text-xs font-semibold text-gray-500 w-4">{index + 1}</span>
      {item.icon}
      <span className="text-sm text-gray-800">{item.label}</span>
    </div>
  );
};

/**
 * Lets the educator drag-reorder which media type (image / TradingView chart / DynTube
 * video) students see first (Task 14). `items` is the full ordered list of
 * { key, label, icon? } — only entries the record actually has media for need to be
 * passed in; reordering unavailable/empty groups doesn't affect anything.
 *
 * @param {Object} props
 * @param {Array} props.order - ordered array of type keys, e.g. ["image", "tradingview", "dyntube"]
 * @param {Object} props.labels - { [key]: { label, icon } } describing each key
 * @param {Function} props.onChange - called with the new ordered array of keys
 */
export default function DraggableMediaOrder({ order, labels, onChange }) {
  const handleMove = (dragIndex, hoverIndex) => {
    const next = [...order];
    const [removed] = next.splice(dragIndex, 1);
    next.splice(hoverIndex, 0, removed);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {order.map((key, index) => (
        <MediaOrderChip
          key={key}
          index={index}
          onMove={handleMove}
          item={labels[key] || { label: key }}
        />
      ))}
    </div>
  );
}
