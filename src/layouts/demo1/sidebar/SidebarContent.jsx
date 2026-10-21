import { SidebarMenu } from './';

const SidebarContent = ({ height = 0, isHovered = false, isCollapsed = false }) => {
  return (
    <div className="sidebar-content flex grow shrink-0 py-3 pe-2 overflow-x-hidden">
      <div
        className="scrollable-auto grow shrink-0 flex ps-2 lg:ps-4 pe-1 lg:pe-3 flex-col gap-1.5"
        style={{
          ...(height > 0 && {
            height: `${height}px`,
          }),
        }}
      >
        <SidebarMenu isHovered={isHovered} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export { SidebarContent };