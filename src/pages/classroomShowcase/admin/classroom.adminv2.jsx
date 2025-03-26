import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "./components/adminv2.sidebar";
import { CourseContent } from "./components/adminv2.content";

const ClassroomAdminPagev2 = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen">
        <Sidebar />
        <CourseContent />
      </div>
    </DndProvider>
  );
};

export default ClassroomAdminPagev2;
