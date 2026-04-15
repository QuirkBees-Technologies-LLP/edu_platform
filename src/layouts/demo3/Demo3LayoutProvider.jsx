import { createContext, useContext, useEffect, useState } from 'react';
import { MENU_SIDEBAR } from '@/config';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { Demo3LayoutConfig } from '.';

const initalLayoutProps = {
  layout: Demo3LayoutConfig,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: open => {
    console.log(`${open}`);
  }
};

const Demo3LayoutContext = createContext(initalLayoutProps);
const useDemo3Layout = () => useContext(Demo3LayoutContext);
const Demo3LayoutProvider = ({
  children
}) => {
  const {
    setMenuConfig
  } = useMenus();
  const {
    getLayout,
    setCurrentLayout
  } = useLayout();

  const layoutConfig = deepMerge(Demo3LayoutConfig, getLayout(Demo3LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  setMenuConfig('primary', MENU_SIDEBAR);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo3LayoutContext.Provider value={{
    layout,
    mobileSidebarOpen,
    setMobileSidebarOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo3LayoutContext.Provider>;
};

export { Demo3LayoutProvider, useDemo3Layout };