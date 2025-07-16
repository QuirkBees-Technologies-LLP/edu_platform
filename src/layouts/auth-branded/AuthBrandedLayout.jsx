import { Link, Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';
const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses('dark:bg-coal-500');
  return <Fragment>
    <style>
      {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/edwin-andrade.png')}');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
             
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-dark.png')}');
          }
      `}
    </style>

    <div className="grid lg:grid-cols-1 grow branded-bg">
      <div className="flex justify-center items-center p-3 lg:p-10  z-10">
        <Outlet />
      </div>
    </div>
  </Fragment>;
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => <AuthBrandedLayoutProvider>
  <Layout />
</AuthBrandedLayoutProvider>;
export { AuthBrandedLayout };