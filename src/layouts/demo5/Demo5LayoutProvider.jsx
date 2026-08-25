
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useMenuChildren } from '@/components/menu';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { demo5LayoutConfig } from './Demo5LayoutConfig';

const initalLayoutProps = {
  layout: demo5LayoutConfig,
  headerSticky: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: open => {
    console.log(`${open}`);
  }
};

const Demo5LayoutContext = createContext(initalLayoutProps);
const useDemo5Layout = () => useContext(Demo5LayoutContext);
const Demo5LayoutProvider = ({
  children
}) => {
  const {
    pathname
  } = useLocation();
  const {
    setMenuConfig
  } = useMenus();
  const secondaryMenu = useMenuChildren(pathname, MENU_SIDEBAR, 0);

  setMenuConfig('primary', MENU_SIDEBAR);
  setMenuConfig('secondary', secondaryMenu);
  const {
    getLayout,
    updateLayout,
    setCurrentLayout
  } = useLayout();

  const getLayoutConfig = () => {
    return deepMerge(demo5LayoutConfig, getLayout(demo5LayoutConfig.name));
  };
  const [layout, setLayout] = useState(getLayoutConfig);

  useEffect(() => {
    setCurrentLayout(layout);
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const scrollPosition = useScrollPosition();

  const headerSticky = scrollPosition > layout.options.header.stickyOffset;

  return (
    <Demo5LayoutContext.Provider value={{
      layout,
      headerSticky,
      mobileSidebarOpen,
      setMobileSidebarOpen
    }}>
      {children}
    </Demo5LayoutContext.Provider>
  );
};

export { Demo5LayoutProvider, useDemo5Layout };