import { createContext, useContext, useEffect, useState } from 'react';
import { MENU_SIDEBAR } from '@/config';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { Demo4LayoutConfig } from '.';
import { useMenuChildren } from '@/components';
import { useLocation } from 'react-router';

const initalLayoutProps = {
  layout: Demo4LayoutConfig,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: open => {
    console.log(`${open}`);
  }
};

const Demo4LayoutContext = createContext(initalLayoutProps);
const useDemo4Layout = () => useContext(Demo4LayoutContext);
const Demo4LayoutProvider = ({
  children
}) => {
  const {
    pathname
  } = useLocation();
  const {
    setMenuConfig
  } = useMenus();
  const {
    getLayout,
    setCurrentLayout
  } = useLayout();

  const layoutConfig = deepMerge(Demo4LayoutConfig, getLayout(Demo4LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  setMenuConfig('primary', MENU_SIDEBAR);
  const secondaryMenu = useMenuChildren(pathname, MENU_SIDEBAR, 0);
  setMenuConfig('secondary', secondaryMenu);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo4LayoutContext.Provider value={{
    layout,
    mobileSidebarOpen,
    setMobileSidebarOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo4LayoutContext.Provider>;
};

export { Demo4LayoutProvider, useDemo4Layout };