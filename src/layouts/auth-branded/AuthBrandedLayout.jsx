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
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/edwin-andrade.jpg')}');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
             
          }
          .branded-bg::before {
            content: ''; /* Essential for pseudo-elements to render */
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgb(219 168 72 / 27%)); 
            pointer-events: none; 
          }
          .dark .branded-bg {
            // background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1-dark.png')}');
          }
      `}
    </style>

    <div className="grid lg:grid-cols-1 grow branded-bg">
      <div className="flex justify-center items-center p-8 lg:p-10  z-10">
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