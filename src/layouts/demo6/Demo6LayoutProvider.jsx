import { createContext, useContext, useEffect, useState } from 'react';
import { MENU_SIDEBAR } from '@/config';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { Demo6LayoutConfig } from '.';

const initalLayoutProps = {
  layout: Demo6LayoutConfig,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: open => {
    console.log(`${open}`);
  }
};

const Demo6LayoutContext = createContext(initalLayoutProps);
const useDemo6Layout = () => useContext(Demo6LayoutContext);
const Demo6LayoutProvider = ({
  children
}) => {
  const {
    setMenuConfig
  } = useMenus();
  const {
    getLayout,
    setCurrentLayout
  } = useLayout();

  const layoutConfig = deepMerge(Demo6LayoutConfig, getLayout(Demo6LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  setMenuConfig('primary', MENU_SIDEBAR);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo6LayoutContext.Provider value={{
    layout,
    mobileSidebarOpen,
    setMobileSidebarOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo6LayoutContext.Provider>;
};

export { Demo6LayoutProvider, useDemo6Layout };