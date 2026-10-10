import clsx from 'clsx';
import { useEffect } from 'react';
import { Container } from '@/components/container';
import { MegaMenu } from '../mega-menu';
import { HeaderLogo, HeaderTopbar } from './';
import { Breadcrumbs, useDemo1Layout } from '../';
import { useLocation } from 'react-router';
const Header = () => {
  const {
    headerSticky
  } = useDemo1Layout();
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    if (headerSticky) {
      document.body.setAttribute('data-sticky-header', 'on');
    } else {
      document.body.removeAttribute('data-sticky-header');
    }
  }, [headerSticky]);
  return <header className={clsx(
    'header fixed top-0 z-40 start-0 end-0 flex items-stretch shrink-0 transition-all duration-300',
    'bg-[#07030E]/40 backdrop-blur-md border-b border-[#1E0D3B]/40',
    headerSticky && 'shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
  )}>
    <div className="flex justify-between items-stretch lg:gap-4 container-fluid">
      <HeaderLogo />
      {/* {pathname.includes('/account') ? <Breadcrumbs /> : <MegaMenu />} */}
      <Breadcrumbs />
      <HeaderTopbar />
    </div>
  </header>;
};
export { Header };