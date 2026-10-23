import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';
import { useDemo1Layout } from '../';
const HeaderLogo = () => {
  const {
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setMobileMegaMenuOpen,
    megaMenuEnabled
  } = useDemo1Layout();
  const handleSidebarOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  const handleMegaMenuOpen = () => {
    setMobileMegaMenuOpen(true);
  };
  return <div className="flex gap-3 lg:hidden items-center -ms-1">
      <Link to="/" className="shrink-0 dark:hidden">
        <img src={toAbsoluteUrl('/media/app/mini-logo.png')} className="max-h-[25px] w-[25px]" alt="mini-logo" />
      </Link>
      <Link to="/" className="shrink-0 hidden dark:block">
        <img src={toAbsoluteUrl('/media/app/mini-logo-dark.png')} className="max-h-[25px] w-[25px]" alt="mini-logo" />
      </Link>

      <div className="flex items-center">
        <button type="button" className="btn btn-icon btn-light btn-clear btn-sm relative z-10 !h-10 !w-10 shrink-0" onClick={handleSidebarOpen} aria-label="Open menu">
          <KeenIcon icon="menu" />
        </button>

        {megaMenuEnabled && <button type="button" className="btn btn-icon btn-light btn-clear btn-sm" onClick={handleMegaMenuOpen}>
            <KeenIcon icon="burger-menu-2" />
          </button>}
      </div>
    </div>;
};
export { HeaderLogo };