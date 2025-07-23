import { useDrag, useDrop } from "react-dnd";

const DraggableSection = ({ section, index, moveSection, onReorder,sections, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: { id: section._id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "SECTION",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveSection(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    drop: async () => {
      if (!onReorder) return;

      // const sections = document.querySelectorAll("[data-section-id]");
      console.log("sections________________>",sections)
      const newOrder = Array.from(sections).map((el, idx) => ({
        id: el._id,
        order: idx,
      }));

      console.log("📦 Sending reorder payload to API", newOrder);

      try {
        await onReorder(newOrder);
      } catch (err) {
        console.error("❌ Reorder API error:", err);
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      data-section-id={section._id}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      {children}
    </div>
  );
};

export default DraggableSection;
