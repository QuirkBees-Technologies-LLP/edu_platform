import { SidebarMenu } from './';

const SidebarContent = ({ isHovered = false, isCollapsed = false }) => {
  return (
    <div className="sidebar-content flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto py-3 pe-2">
      <div className="flex min-h-full w-full flex-col ps-2 lg:ps-4 pe-1 lg:pe-3">
        <SidebarMenu isHovered={isHovered} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export { SidebarContent };