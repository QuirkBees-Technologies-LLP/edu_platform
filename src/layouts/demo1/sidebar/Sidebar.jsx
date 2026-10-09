
// import { useEffect, useRef, useState } from 'react';
// import { useResponsive, useViewport } from '@/hooks';
// import { useDemo1Layout } from '../';
// import { SidebarContent, SidebarHeader } from './';
// import clsx from 'clsx';
// import { getHeight } from '@/utils';
// import { usePathname } from '@/providers';
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// export const Sidebar = () => {
//   const selfRef = useRef(null);
//   const headerRef = useRef(null);
//   const [scrollableHeight, setScrollableHeight] = useState(0);
//   const scrollableOffset = 40;
//   const [viewportHeight] = useViewport();
//   const {
//     pathname,
//     prevPathname
//   } = usePathname();
//   useEffect(() => {
//     if (headerRef.current) {
//       const headerHeight = getHeight(headerRef.current);
//       const availableHeight = viewportHeight - headerHeight - scrollableOffset;
//       setScrollableHeight(availableHeight);
//     } else {
//       setScrollableHeight(viewportHeight);
//     }
//   }, [viewportHeight]);
//   const desktopMode = useResponsive('up', 'lg');
//   const {
//     mobileSidebarOpen,
//     setSidebarMouseLeave,
//     setMobileSidebarOpen
//   } = useDemo1Layout();
//   const {
//     layout
//   } = useDemo1Layout();
//   const themeClass = layout.options.sidebar.theme === 'dark' || pathname === '/dark-sidebar' ? 'dark [&.dark]:bg-coal-600' : 'dark:bg-coal-600';
//   const handleMobileSidebarClose = () => {
//     setMobileSidebarOpen(false);
//   };
//   const handleMouseEnter = () => {
//     setSidebarMouseLeave(false);
//   };
//   const handleMouseLeave = () => {
//     setSidebarMouseLeave(true);
//   };
//   const renderContent = () => {
//     return <div ref={selfRef} onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter} className={clsx('sidebar bg-dark-imperial-blue lg:border-e lg:border-e-gray-200 dark:border-e-coal-100 lg:fixed lg:top-0 lg:bottom-0 lg:z-20 lg:flex flex-col items-stretch shrink-0', themeClass)}>
//         {desktopMode && <SidebarHeader ref={headerRef} />}
//         <SidebarContent {...desktopMode && {
//         height: scrollableHeight
//       }} />
//       </div>;
//   };
//   useEffect(() => {
//     if (!desktopMode && prevPathname !== pathname) {
//       handleMobileSidebarClose();
//     }
//   }, [desktopMode, pathname, prevPathname]);
//   if (desktopMode) {
//     return renderContent();
//   } else {
//     return <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
//         <SheetContent className="border-0 p-0 w-[--tw-sidebar-width] scrollable-y-auto" forceMount={true} side="left" close={false}>
//           <SheetHeader className="sr-only">
//             <SheetTitle>Mobile Menu</SheetTitle>
//             <SheetDescription></SheetDescription>
//           </SheetHeader>
//           {renderContent()}
//         </SheetContent>
//       </Sheet>;
//   }
// };

import { useEffect, useRef, useState } from 'react';
import { useResponsive, useViewport } from '@/hooks';
import { useDemo1Layout } from '../';
import { SidebarContent, SidebarHeader } from './';
import clsx from 'clsx';
import { getHeight } from '@/utils';
import { usePathname } from '@/providers';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const Sidebar = () => {
  const selfRef = useRef(null);
  const headerRef = useRef(null);
  const [scrollableHeight, setScrollableHeight] = useState(0);
  const scrollableOffset = 40;
  const [viewportHeight] = useViewport();
  const [isHovered, setIsHovered] = useState(false);

  const { pathname, prevPathname } = usePathname();

  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = getHeight(headerRef.current);
      const availableHeight = viewportHeight - headerHeight - scrollableOffset;
      setScrollableHeight(availableHeight);
    } else {
      setScrollableHeight(viewportHeight);
    }
  }, [viewportHeight]);

  const desktopMode = useResponsive('up', 'lg');
  const {
    mobileSidebarOpen,
    setSidebarMouseLeave,
    setMobileSidebarOpen,
    layout
  } = useDemo1Layout();

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
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
          'sidebar transition-all duration-300 ease-in-out lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:z-50 flex flex-col items-stretch shrink-0',
          'bg-[#07050C]/95 backdrop-blur-xl border-r border-[#26153B]/60 shadow-[10px_0_40px_rgba(0,0,0,0.8)] lg:rounded-r-[28px]',
          desktopMode && isCollapsed && !isHovered
            ? 'w-[78px]'
            : 'w-[280px]'
        )}
      >
        {desktopMode && <SidebarHeader ref={headerRef} isHovered={isHovered} />}
        <SidebarContent
          height={scrollableHeight}
          isHovered={isHovered}
          isCollapsed={isCollapsed}
        />
      </div>
    );
  };

  useEffect(() => {
    if (!desktopMode && prevPathname !== pathname) {
      handleMobileSidebarClose();
    }
  }, [desktopMode, pathname, prevPathname]);

  if (desktopMode) {
    return renderContent();
  } else {
    return (
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          className="border-0 p-0 w-[280px] scrollable-y-auto bg-[#07050C] text-white"
          forceMount={true}
          side="left"
          close={false}
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