import { useDrag, useDrop } from "react-dnd";
import { useDispatch } from "react-redux";
import { useAuthContext } from "@/auth/useAuthContext";

const DraggableSection = ({
  section,
  index,
  moveSection,
  onReorder,
  children,
}) => {
  const { auth } = useAuthContext();

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
      if (draggedItem.index === index) return;

      moveSection(draggedItem.index, index);
      draggedItem.index = index;
    },
    drop: async (draggedItem) => {
      if (draggedItem.index === index) return;

      try {
        const sections = document.querySelectorAll("[data-section-id]");
        const newOrder = Array.from(sections).map((el, idx) => ({
          id: el.dataset.sectionId,
          order: idx,
        }));

        await onReorder(newOrder);
      } catch (error) {
        console.error("Failed to reorder sections:", error);
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
