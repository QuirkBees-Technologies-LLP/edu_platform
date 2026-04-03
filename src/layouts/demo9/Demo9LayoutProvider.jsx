import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { MENU_SIDEBAR } from '@/config';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { useMenuChildren } from '@/components';
import { Demo9LayoutConfig } from './';

const initalLayoutProps = {
  layout: Demo9LayoutConfig,
  headerSticky: false,
  mobileMegaMenuOpen: false,
  setMobileMegaMenuOpen: open => {
    console.log(`${open}`);
  }
};

const Demo9LayoutContext = createContext(initalLayoutProps);
const useDemo9Layout = () => useContext(Demo9LayoutContext);
const Demo9LayoutProvider = ({
  children
}) => {
  const {
    pathname
  } = useLocation();
  const {
    getLayout,
    setCurrentLayout
  } = useLayout();
  const {
    setMenuConfig
  } = useMenus();
  const secondaryMenu = useMenuChildren(pathname, MENU_SIDEBAR, 0);

  setMenuConfig('primary', MENU_SIDEBAR);
  setMenuConfig('secondary', secondaryMenu);

  const layoutConfig = deepMerge(Demo9LayoutConfig, getLayout(Demo9LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > layout.options.header.stickyOffset;

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo9LayoutContext.Provider value={{
    layout,
    headerSticky,
    mobileMegaMenuOpen,
    setMobileMegaMenuOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo9LayoutContext.Provider>;
};

export { Demo9LayoutProvider, useDemo9Layout };