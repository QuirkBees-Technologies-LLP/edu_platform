import clsx from 'clsx';
import { KeenIcon } from '@/components';
import { useResponsive } from '@/hooks';
import { useDemo1Layout } from '../Demo1LayoutProvider';

const SidebarToggle = ({ isHovered = false }) => {
  const { layout, setSidebarCollapse, setMobileSidebarOpen } = useDemo1Layout();
  const desktopMode = useResponsive('up', 'lg');

  const handleClick = () => {
    if (!desktopMode) {
      setMobileSidebarOpen(false);
      return;
    }
    setSidebarCollapse(!layout.options.sidebar.collapse);
  };

  const isCollapsed = layout.options.sidebar.collapse;
  const isVisible = !isCollapsed || isHovered;

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'btn btn-icon btn-icon-md size-[30px] rounded-full border border-white/10 bg-[#140A26] text-gray-800 hover:text-white hover:bg-[#200F3E] transition-all duration-300',
        isVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none hidden'
      )}
      aria-label="Toggle sidebar"
    >
      <KeenIcon
        icon="black-left-line"
        className={clsx('transition-transform duration-300 text-xs', {
          'rotate-180': isCollapsed,
        })}
      />
    </button>
  );
};

export { SidebarToggle };