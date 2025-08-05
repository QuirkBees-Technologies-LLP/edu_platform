import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSettings } from '@/providers/SettingsProvider';
import { AppRouting } from '@/routing';
import { PathnameProvider } from '@/providers';
import { Toaster } from '@/components/ui/sonner';
import { Provider } from 'react-redux';
import { persistor, store } from './store';
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/styles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'react-quill/dist/quill.snow.css';
import "react-datepicker/dist/react-datepicker.css";
import { PersistGate } from 'redux-persist/integration/react';

const {
  BASE_URL
} = import.meta.env;
const App = () => {
  const {
    settings
  } = useSettings();
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add(settings.themeMode);
  }, [settings]);
  return <BrowserRouter basename={BASE_URL} future={{
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PathnameProvider>
          <AppRouting />
        </PathnameProvider>
        <Toaster />
      </PersistGate>
    </Provider>
  </BrowserRouter>;
};
export { App };