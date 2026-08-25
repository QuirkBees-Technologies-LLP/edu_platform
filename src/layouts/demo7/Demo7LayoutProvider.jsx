
import { createContext, useContext, useEffect, useState } from 'react';
import { MENU_SIDEBAR } from '@/config';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useMenus } from '@/providers';
import { useLayout } from '@/providers';
import { deepMerge } from '@/utils';
import { Demo7LayoutConfig } from './';
import { useMenuChildren } from '@/components';
import { useLocation } from 'react-router';

const initalLayoutProps = {
  layout: Demo7LayoutConfig,
  headerSticky: false,
  mobileMegaMenuOpen: false,
  setMobileMegaMenuOpen: open => {}
};

const Demo7LayoutContext = createContext(initalLayoutProps);
const useDemo7Layout = () => useContext(Demo7LayoutContext);
const Demo7LayoutProvider = ({
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

  const layoutConfig = deepMerge(Demo7LayoutConfig, getLayout(Demo7LayoutConfig.name));
  const [layout] = useState(layoutConfig);
  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > layout.options.header.stickyOffset;

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  return <Demo7LayoutContext.Provider value={{
    layout,
    headerSticky,
    mobileMegaMenuOpen,
    setMobileMegaMenuOpen
  }}>
      {children} {/* Render child components that consume this context */}
    </Demo7LayoutContext.Provider>;
};

export { Demo7LayoutProvider, useDemo7Layout };