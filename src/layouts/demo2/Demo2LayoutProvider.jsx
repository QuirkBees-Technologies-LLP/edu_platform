import { createContext, useContext, useEffect, useState } from 'react';
import { MENU_SIDEBAR } from '@/config';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { Demo2LayoutConfig } from './';

const initalLayoutProps = {
  layout: Demo2LayoutConfig,
  headerSticky: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: open => {
    console.log(`${open}`);
  }
};

const Demo2LayoutContext = createContext(initalLayoutProps);
const useDemo2Layout = () => useContext(Demo2LayoutContext);
const Demo2LayoutProvider = ({
  children
}) => {
  const {
    setMenuConfig
  } = useMenus();
  const {
    getLayout,
    setCurrentLayout
  } = useLayout();

  const layoutConfig = deepMerge(Demo2LayoutConfig, getLayout(Demo2LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > layout.options.header.stickyOffset;

  setMenuConfig('primary', MENU_SIDEBAR);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo2LayoutContext.Provider value={{
    layout,
    headerSticky,
    mobileSidebarOpen,
    setMobileSidebarOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo2LayoutContext.Provider>;
};

export { Demo2LayoutProvider, useDemo2Layout };