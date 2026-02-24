import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useMenuChildren } from "@/components/menu";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { demo1LayoutConfig } from "./";
import { useAuthContext } from "../../auth/useAuthContext";
import { sideMenus, filterSidebarByPlan } from "../../config/menu.config";

const initalLayoutProps = {
  layout: demo1LayoutConfig,
  megaMenuEnabled: false,
  headerSticky: false,
  mobileSidebarOpen: false,
  mobileMegaMenuOpen: false,
  sidebarMouseLeave: false,
  setSidebarMouseLeave: (state) => console.log(`${state}`),
  setMobileMegaMenuOpen: (open) => console.log(`${open}`),
  setMobileSidebarOpen: (open) => console.log(`${open}`),
  setMegaMenuEnabled: (enabled) => console.log(`${enabled}`),
  setSidebarCollapse: (collapse) => console.log(`${collapse}`),
  setSidebarTheme: (mode) => console.log(`${mode}`),
};

const Demo1LayoutContext = createContext(initalLayoutProps);
const useDemo1Layout = () => useContext(Demo1LayoutContext);

const Demo1LayoutProvider = ({ children }) => {
  const { pathname } = useLocation();
  const { setMenuConfig } = useMenus();
  const { auth } = useAuthContext();

  const { getLayout, updateLayout, setCurrentLayout } = useLayout();
  const getLayoutConfig = () =>
    deepMerge(demo1LayoutConfig, getLayout(demo1LayoutConfig.name));
  const [layout, setLayout] = useState(getLayoutConfig());

  const [megaMenuEnabled, setMegaMenuEnabled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false);
  const [sidebarMouseLeave, setSidebarMouseLeave] = useState(false);

  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;

  // ✅ SET MENU BASED ON ROLE & PLAN
  useEffect(() => {
    if (!auth?.user) return;

    const userRole = auth.user.role;

    if (userRole === "student") {
      const allowedRoutes = auth.user.plan?.allowedSideBar || [];

      const fullMenu = sideMenus["student"] || [];
      const filteredMenu = filterSidebarByPlan(fullMenu, allowedRoutes);

      const secondaryMenu = useMenuChildren(pathname, filteredMenu, 0);

      setMenuConfig("primary", filteredMenu);
      setMenuConfig("secondary", secondaryMenu);
    } else {
      let fullMenu = sideMenus[userRole] || [];

      // ✅ Hide finance-specific routes for Digital Marketing educators
      if (userRole === "educator") {
        const isDigitalMarketing = auth.user?.categories?.some(
          (cat) =>
            cat?.slug?.toLowerCase() === "digital-marketing" ||
            cat?.name?.toLowerCase() === "digital marketing" ||
            cat?.name?.toLowerCase() === "digitalmarketing"
        );

        if (isDigitalMarketing) {
          const hiddenPaths = [
            "/educator/trade-analysis",
            "/educator/ideas",
            "/educator/live-ideas",
          ];
          fullMenu = fullMenu.filter(
            (item) => !hiddenPaths.includes(item.path)
          );
        }
      }

      const secondaryMenu = useMenuChildren(pathname, fullMenu, 0);

      setMenuConfig("primary", fullMenu);
      setMenuConfig("secondary", secondaryMenu);
    }
  }, [auth, pathname]);

  // Update layout whenever state changes
  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  const setSidebarCollapse = (collapse) => {
    const updatedLayout = {
      options: {
        sidebar: { collapse },
      },
    };
    updateLayout(demo1LayoutConfig.name, updatedLayout);
    setLayout(getLayoutConfig());
  };

  const setSidebarTheme = (mode) => {
    const updatedLayout = {
      options: {
        sidebar: { theme: mode },
      },
    };
    setLayout(deepMerge(layout, updatedLayout));
  };

  return (
    <Demo1LayoutContext.Provider
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
    </Demo1LayoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { Demo1LayoutProvider, useDemo1Layout };
