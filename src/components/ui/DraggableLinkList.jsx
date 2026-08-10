import React, { useRef, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import { GripVertical } from "lucide-react";

const DRAG_TYPE = "DRAGGABLE_LINK_ITEM";

/**
 * Single draggable TradingView link row.
 */
const DraggableLinkItem = ({
  link,
  index,
  totalCount,
  onMove,
  onChange,
  onRemove,
  placeholder = "https://www.tradingview.com/chart/...",
}) => {
  const ref = useRef(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: DRAG_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: DRAG_TYPE,
    hover: (item, monitor) => {
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

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  dragPreview(drop(ref));

  return (
    <div
      ref={ref}
      className="flex items-center gap-2"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {/* Drag handle — only show when there's more than 1 link */}
      {totalCount > 1 && (
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
      )}
      <input
        type="text"
        value={link}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={placeholder}
        className="input flex-1"
      />
      {/* Remove button — only show for additional links (index > 0) */}
      {index > 0 && (
        <button
          type="button"
          className="btn btn-xs btn-icon rounded-full btn-danger flex-shrink-0"
          onClick={() => onRemove(index)}
        >
          <i className="ki-outline ki-cross"></i>
        </button>
      )}
    </div>
  );
};

/**
 * A list of draggable TradingView link inputs with reorder support.
 *
 * @param {Object} props
 * @param {string[]} props.links - Array of link strings
 * @param {Function} props.onReorder - Called with (fromIndex, toIndex)
 * @param {Function} props.onChange - Called with (index, newValue)
 * @param {Function} props.onRemove - Called with index to remove
 * @param {Function} props.onAdd - Called to add a new empty link
 * @param {string} [props.placeholder] - Input placeholder text
 */
const DraggableLinkList = ({
  links,
  onReorder,
  onChange,
  onRemove,
  onAdd,
  placeholder,
}) => {
  const handleMove = useCallback(
    (dragIndex, hoverIndex) => {
      onReorder(dragIndex, hoverIndex);
    },
    [onReorder]
  );

  return (
    <div className="flex flex-col gap-2">
      {(links || [""]).map((link, index) => (
        <DraggableLinkItem
          key={index}
          link={link}
          index={index}
          totalCount={links.length}
          onMove={handleMove}
          onChange={onChange}
          onRemove={onRemove}
          placeholder={placeholder}
        />
      ))}
      <button
        type="button"
        className="btn btn-sm btn-light w-fit"
        onClick={onAdd}
      >
        + Add Another TradingView Link
      </button>
    </div>
  );
};

export default DraggableLinkList;
