import { useEffect, useRef, useState } from 'react';
import { useResponsive } from '@/hooks';
import { useDemo1Layout } from '../';
import { SidebarContent, SidebarHeader } from './';
import clsx from 'clsx';
import { usePathname } from '@/providers';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const Sidebar = () => {
  const selfRef = useRef(null);
  const headerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const { pathname, prevPathname } = usePathname();

  const desktopMode = useResponsive('up', 'lg');
  const {
    mobileSidebarOpen,
    setSidebarMouseLeave,
    setMobileSidebarOpen,
    mobileSidebarOpenedAt,
    layout
  } = useDemo1Layout();

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  const handleMobileSidebarChange = (open) => {
    if (!open && Date.now() - (mobileSidebarOpenedAt?.current || 0) < 400) return;
    setMobileSidebarOpen(open);
  };

  const handleMouseEnter = () => {
    setSidebarMouseLeave(false);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setSidebarMouseLeave(true);
    setIsHovered(false);
  };

  const isCollapsed = layout.options.sidebar.collapse;

  const renderContent = () => {
    return (
      <div
        ref={selfRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={clsx(
          'sidebar transition-all duration-300 ease-in-out lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:z-[100] lg:h-screen lg:max-h-screen flex flex-col items-stretch shrink-0',
          'bg-[#07050C] backdrop-blur-2xl border-r border-[#26153B] shadow-[25px_0_60px_rgba(0,0,0,0.95)] lg:rounded-r-[28px]',
          desktopMode
            ? isCollapsed && !isHovered
              ? 'w-[78px]'
              : 'w-[280px] absolute lg:fixed left-0 top-0 bottom-0'
            : 'relative h-full w-full'
        )}
      >
        <SidebarHeader ref={headerRef} isHovered={desktopMode ? isHovered : true} />
        <SidebarContent
          isHovered={isHovered}
          isCollapsed={isCollapsed}
        />
      </div>
    );
  };

  useEffect(() => {
    if (!desktopMode && prevPathname && prevPathname !== pathname) {
      handleMobileSidebarClose();
    }
  }, [desktopMode, pathname, prevPathname]);

  if (desktopMode) {
    return renderContent();
  } else {
    return (
      <Sheet open={mobileSidebarOpen} onOpenChange={handleMobileSidebarChange}>
        <SheetContent
          className="z-[80] border-0 p-0 w-[280px] max-w-[85vw] scrollable-y-auto bg-[#07050C] text-white data-[state=open]:translate-x-0"
          forceMount={true}
          side="left"
          close={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => {
            if (Date.now() - (mobileSidebarOpenedAt?.current || 0) < 400) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (Date.now() - (mobileSidebarOpenedAt?.current || 0) < 400) event.preventDefault();
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Mobile Menu</SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          {renderContent()}
        </SheetContent>
      </Sheet>
    );
  }
};