
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useMenuChildren } from "@/components/menu";
import { MENU_SIDEBAR_LMS } from "@/config/lms.menu.config";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { LmsLayoutConfig } from ".";

const initalLayoutProps = {
  layout: LmsLayoutConfig,
  megaMenuEnabled: false,
  headerSticky: false,
  mobileSidebarOpen: false,
  mobileMegaMenuOpen: false,
  sidebarMouseLeave: false,
  setSidebarMouseLeave: (state) => {
    console.log(`${state}`);
  },
  setMobileMegaMenuOpen: (open) => {
    console.log(`${open}`);
  },
  setMobileSidebarOpen: (open) => {
    console.log(`${open}`);
  },
  setMegaMenuEnabled: (enabled) => {
    console.log(`${enabled}`);
  },
  setSidebarCollapse: (collapse) => {
    console.log(`${collapse}`);
  },
  setSidebarTheme: (mode) => {
    console.log(`${mode}`);
  },
};

const LmsLayoutContext = createContext(initalLayoutProps);
const useLmsLayout = () => useContext(LmsLayoutContext);
const LmsLayoutProvider = ({ children }) => {
  const { pathname } = useLocation();
  const { setMenuConfig } = useMenus();
  const secondaryMenu = useMenuChildren(pathname, MENU_SIDEBAR_LMS, 0);

  setMenuConfig("primary", MENU_SIDEBAR_LMS);
  setMenuConfig("secondary", secondaryMenu);
  const { getLayout, updateLayout, setCurrentLayout } = useLayout();

  const getLayoutConfig = () => {
    return deepMerge(LmsLayoutConfig, getLayout(LmsLayoutConfig.name));
  };
  const [layout, setLayout] = useState(getLayoutConfig);

  useEffect(() => {
    setCurrentLayout(layout);
  });
  const [megaMenuEnabled, setMegaMenuEnabled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false);
  const [sidebarMouseLeave, setSidebarMouseLeave] = useState(false);
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;
  const setSidebarCollapse = (collapse) => {
    const updatedLayout = {
      options: {
        sidebar: {
          collapse,
        },
      },
    };
    updateLayout(LmsLayoutConfig.name, updatedLayout);
    setLayout(getLayoutConfig());
  };

  const setSidebarTheme = (mode) => {
    const updatedLayout = {
      options: {
        sidebar: {
          theme: mode,
        },
      },
    };
    setLayout(deepMerge(layout, updatedLayout));
  };
  return (
    <LmsLayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        mobileMegaMenuOpen,
        megaMenuEnabled,
        sidebarMouseLeave,
        setMobileSidebarOpen,
        setMegaMenuEnabled,
        setSidebarMouseLeave,
        setMobileMegaMenuOpen,
        setSidebarCollapse,
        setSidebarTheme,
      }}
    >
      {children}
    </LmsLayoutContext.Provider>
  );
};

export { LmsLayoutProvider, useLmsLayout };
