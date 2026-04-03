import { createContext, useContext, useEffect, useState } from 'react';
import { MENU_MEGA, MENU_SIDEBAR } from '@/config';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { Demo8LayoutConfig } from '.';
import { useMenuChildren } from '@/components';
import { useLocation } from 'react-router';

const initalLayoutProps = {
  layout: Demo8LayoutConfig,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: open => {
    console.log(`${open}`);
  }
};

const Demo8LayoutContext = createContext(initalLayoutProps);
const useDemo8Layout = () => useContext(Demo8LayoutContext);
const Demo8LayoutProvider = ({
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

  const layoutConfig = deepMerge(Demo8LayoutConfig, getLayout(Demo8LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  setMenuConfig('primary', MENU_SIDEBAR);
  setMenuConfig('mega', MENU_MEGA);
  const secondaryMenu = useMenuChildren(pathname, MENU_SIDEBAR, 0);
  setMenuConfig('secondary', secondaryMenu);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo8LayoutContext.Provider value={{
    layout,
    mobileSidebarOpen,
    setMobileSidebarOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo8LayoutContext.Provider>;
};

export { Demo8LayoutProvider, useDemo8Layout };