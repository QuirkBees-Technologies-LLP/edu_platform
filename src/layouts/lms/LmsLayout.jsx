import useBodyClasses from "@/hooks/useBodyClasses";
import { LmsLayoutProvider, Main } from ".";
const LmsLayout = () => {
  // Using the useBodyClasses hook to set background styles for light and dark modes
  useBodyClasses(`
    [--tw-page-bg:#fefefe]
    [--tw-page-bg-dark:var(--tw-coal-500)]
    demo1 
    sidebar-fixed 
    header-fixed 
    bg-[--tw-page-bg]
    dark:bg-[--tw-page-bg-dark]
  `);
  return (
    <LmsLayoutProvider>
      <Main />
    </LmsLayoutProvider>
  );
};
export { LmsLayout };
