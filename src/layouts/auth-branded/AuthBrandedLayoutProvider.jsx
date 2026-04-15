import { createContext, useContext, useEffect, useState } from 'react';
import { deepMerge } from '@/utils';
import { useLayout } from '@/providers';
import { authLayoutBrandedConfig } from './AuthBrandedLayoutConfig';

const initalLayoutProps = {
  layout: authLayoutBrandedConfig
};

const LayoutContext = createContext(initalLayoutProps);

const useAuthBrandedLayout = () => useContext(LayoutContext);

const AuthBrandedLayoutProvider = ({
  children
}) => {
  const {
    getLayout,
    setCurrentLayout
  } = useLayout();

  const getLayoutConfig = () => {
    return deepMerge(authLayoutBrandedConfig, getLayout(authLayoutBrandedConfig.name));
  };

  const [layout] = useState(getLayoutConfig);

  useEffect(() => {
    setCurrentLayout(layout);
  }, []);

  return <LayoutContext.Provider value={{
    layout
  }}>
      {children}
    </LayoutContext.Provider>;
};

export { AuthBrandedLayoutProvider, useAuthBrandedLayout };