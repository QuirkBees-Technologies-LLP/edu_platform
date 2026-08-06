import React, { useRef, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import { GripVertical } from "lucide-react";

const DRAG_TYPE = "DRAGGABLE_IMAGE_ITEM";

/**
 * Single draggable image thumbnail.
 */
const DraggableImageItem = ({ file, index, onMove, onRemove }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
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
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="relative group"
      style={{ opacity: isDragging ? 0.4 : 1, cursor: "grab" }}
    >
      {/* Drag handle */}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5">
        <GripVertical size={14} className="text-white" />
      </div>
      <img
        src={file.dataURL}
        alt="uploaded"
        className="rounded-lg border-2 border-success size-24 object-cover"
      />
      <div className="absolute -right-4 -top-4">
        <button
          type="button"
          className="btn btn-xs btn-icon rounded-full btn-danger"
          onClick={() => onRemove(index)}
        >
          <i className="ki-outline ki-cross"></i>
        </button>
      </div>
    </div>
  );
};

/**
 * A list of draggable image thumbnails with reorder support.
 *
 * @param {Object} props
 * @param {Array} props.files - Array of { file, dataURL } objects
 * @param {Function} props.onReorder - Called with (fromIndex, toIndex)
 * @param {Function} props.onRemove - Called with index to remove
 */
const DraggableImageList = ({ files, onReorder, onRemove }) => {
  const handleMove = useCallback(
    (dragIndex, hoverIndex) => {
      onReorder(dragIndex, hoverIndex);
    },
    [onReorder]
  );

  const visibleFiles = (files || []).filter((f) => !!f?.dataURL);

  if (visibleFiles.length === 0) return null;

  return (
    <>
      {visibleFiles.map((file, index) => (
        <DraggableImageItem
          key={file.dataURL + index}
          file={file}
          index={index}
          onMove={handleMove}
          onRemove={onRemove}
        />
      ))}
    </>
  );
};

export default DraggableImageList;
