import useBodyClasses from '@/hooks/useBodyClasses';
import { Demo2LayoutProvider, Main } from './';
const Demo2Layout = () => {
  useBodyClasses(`
    [--tw-page-bg:var(--tw-light)]
    [--tw-page-bg-dark:var(--tw-coal-500)]
    [--tw-header-height-default:100px]
    [[data-sticky-header=on]&]:[--tw-header-height:60px]
    [--tw-header-height:--tw-header-height-default]	
    bg-[--tw-page-bg]
    dark:bg-[--tw-page-bg-dark]
  `);
  return (
    <Demo2LayoutProvider>
      <Main />
    </Demo2LayoutProvider>
  );
};
export { Demo2Layout };