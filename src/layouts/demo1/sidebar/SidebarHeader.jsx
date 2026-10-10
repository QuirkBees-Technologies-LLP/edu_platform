// import React, { forwardRef, Fragment } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useDemo1Layout } from '../';
// import { toAbsoluteUrl } from '@/utils';
// import { SidebarToggle } from './';
// import { KeenIcon, DefaultTooltip } from '@/components';
// import { useAuthContext } from '../../../auth/useAuthContext';

// const StudentBackButton = () => {
//   const navigate = useNavigate();

//   return (
//     <DefaultTooltip title="Back" placement="right" className="z-50">
//       <button
//         onClick={() => navigate(-1)}
//         className="btn btn-icon btn-icon-md size-[30px] rounded-lg border bg-light dark:bg-primary text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-700 toggle absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4 border-gray-200 dark:border-gray-300 shadow-sm"
//         aria-label="Go back"
//       >
//         <KeenIcon icon="black-left" />
//       </button>
//     </DefaultTooltip>
//   );
// };

// const SidebarHeader = forwardRef((props, ref) => {
//   const {
//     layout
//   } = useDemo1Layout();

//   const { auth } = useAuthContext();
//   const location = useLocation();
//   const role = auth?.user?.role;
//   const homePaths = ["/", "/dashboard"];
//   const isHome = homePaths.includes(location.pathname);
//   const showBackButton = !!role && !isHome;

//   const lightLogo = () => <Fragment>
//     <Link to="/" className="dark:hidden">
//       <img src={toAbsoluteUrl('/media/app/logo-white.png')} className="default-logo w-full h-5" />
//       <img src={toAbsoluteUrl('/media/app/mini-logo-dark.png')} className="small-logo w-full h-8" />
//     </Link>
//     <Link to="/" className="hidden dark:block">
//       <img src={toAbsoluteUrl('/media/app/logo-white.png')} className="default-logo w-full h-5" />
//       <img src={toAbsoluteUrl('/media/app/mini-logo-dark.png')} className="small-logo w-full h-8" />
//     </Link>
//   </Fragment>;
//   const darkLogo = () => <Link to="/">
//     <img src={toAbsoluteUrl('/media/app/logo-white.png')} className="default-logo min-h-[22px] max-w-none" />
//     <img src={toAbsoluteUrl('/media/app/mini-logo.png')} className="small-logo min-h-[22px] max-w-none" />
//   </Link>;
//   return <div ref={ref} className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0">
//     {layout.options.sidebar.theme === 'light' ? lightLogo() : darkLogo()}
//     <SidebarToggle />
//     {showBackButton && <StudentBackButton />}
//   </div>;
// });
// export { SidebarHeader };

import React, { forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';
import { KeenIcon, DefaultTooltip } from '@/components';
import { useAuthContext } from '../../../auth/useAuthContext';

const StudentBackButton = () => {
  const navigate = useNavigate();

  return (
    <DefaultTooltip title="Back" placement="right" className="z-50">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-icon btn-icon-md size-[30px] rounded-lg border bg-light dark:bg-primary text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-700 toggle absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4 border-gray-200 dark:border-gray-300 shadow-sm"
        aria-label="Go back"
      >
        <KeenIcon icon="black-left" />
      </button>
    </DefaultTooltip>
  );
};

const SidebarHeader = forwardRef(({ isHovered = false, ...props }, ref) => {
  const { layout } = useDemo1Layout();
  const { auth } = useAuthContext();
  const location = useLocation();
  const role = auth?.user?.role;
  const homePaths = ["/", "/dashboard"];
  const isHome = homePaths.includes(location.pathname);
  const showBackButton = !!role && !isHome;

  const isCollapsed = layout?.options?.sidebar?.collapse;
  const showMiniLogo = isCollapsed && !isHovered;

  return (
    <div
      ref={ref}
      className={`sidebar-header hidden lg:flex items-center relative shrink-0 pt-4 pb-2 transition-all duration-300 ${showMiniLogo ? 'justify-center px-2' : 'justify-between px-5'
        }`}
    >
      <Link to="/" className="flex items-center justify-center shrink-0 overflow-hidden">
        {showMiniLogo ? (
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.png')}
            className="h-7 max-h-7 w-auto object-contain shrink-0 transition-all duration-300"
            alt="IQONIC Mini"
          />
        ) : (
          <img
            src={toAbsoluteUrl('/media/app/logo-white.png')}
            className="h-6 max-h-6 w-auto object-contain shrink-0 transition-all duration-300"
            alt="IQONIC"
          />
        )}
      </Link>

      <SidebarToggle isHovered={isHovered} />

      {showBackButton && <StudentBackButton />}
    </div>
  );
});

SidebarHeader.displayName = "SidebarHeader";

export { SidebarHeader };