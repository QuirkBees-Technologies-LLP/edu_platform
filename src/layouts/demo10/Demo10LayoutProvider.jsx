import { createContext, useContext, useEffect, useState } from 'react';
import { MENU_SIDEBAR } from '@/config';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { Demo10LayoutConfig } from '.';

const initalLayoutProps = {
  layout: Demo10LayoutConfig,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: open => {
    console.log(`${open}`);
  }
};

const Demo10LayoutContext = createContext(initalLayoutProps);
const useDemo10Layout = () => useContext(Demo10LayoutContext);
const Demo10LayoutProvider = ({
  children
}) => {
  const {
    setMenuConfig
  } = useMenus();
  const {
    getLayout,
    setCurrentLayout
  } = useLayout();

  const layoutConfig = deepMerge(Demo10LayoutConfig, getLayout(Demo10LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  setMenuConfig('primary', MENU_SIDEBAR);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo10LayoutContext.Provider value={{
    layout,
    mobileSidebarOpen,
    setMobileSidebarOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo10LayoutContext.Provider>;
};

export { Demo10LayoutProvider, useDemo10Layout };