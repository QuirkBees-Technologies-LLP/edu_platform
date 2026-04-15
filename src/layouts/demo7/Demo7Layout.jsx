import useBodyClasses from '@/hooks/useBodyClasses';
import { Demo7LayoutProvider, Main } from '.';
const Demo7Layout = () => {
  useBodyClasses(`
    [--tw-page-bg:var(--tw-light)]
    [--tw-page-bg-dark:var(--tw-coal-500)]
    [--tw-header-height-default:95px]
    [[data-sticky-header=on]&]:[--tw-header-height:60px]
    [--tw-header-height:--tw-header-height-default]	
    [--tw-header-height-mobile:70px]	
    bg-[--tw-page-bg]
    dark:bg-[--tw-page-bg-dark]
  `);
  return (
    <Demo7LayoutProvider>
      <Main />
    </Demo7LayoutProvider>
  );
};
export { Demo7Layout };