// import clsx from 'clsx';
// import { KeenIcon } from '@/components';
// import { useDemo1Layout } from '../Demo1LayoutProvider';
// import { useMatchPath } from '@/hooks';
// const SidebarToggle = () => {
//   const {
//     layout,
//     setSidebarCollapse
//   } = useDemo1Layout();
//   const {
//     match
//   } = useMatchPath('/dark-sidebar');
//   const handleClick = () => {
//     if (layout.options.sidebar.collapse) {
//       setSidebarCollapse(false);
//     } else {
//       setSidebarCollapse(true);
//     }
//   };
//   const buttonBaseClass = clsx('btn btn-icon btn-icon-md size-[30px] rounded-lg border bg-light text-gray-500 hover:text-gray-700 toggle', layout.options.sidebar.collapse && 'active');
//   const iconClass = clsx('transition-all duration-300', layout.options.sidebar.collapse ? 'ltr:rotate-180' : 'rtl:rotate-180');
//   const lightToggle = () => {
//     return <button onClick={handleClick} className={clsx(buttonBaseClass, 'border-gray-200 dark:border-gray-300')} aria-label="Toggle sidebar">
//         <KeenIcon icon="black-left-line" className={iconClass} />
//       </button>;
//   };
//   const darkToggle = () => {
//     return <div onClick={handleClick}>
//         <div className="hidden [html.dark_&]:block">
//           <button className={clsx(buttonBaseClass, 'border-gray-300')}>
//             <KeenIcon icon="black-left-line" className={iconClass} />
//           </button>
//         </div>
//         <div className="[html.dark_&]:hidden light">{lightToggle()}</div>
//       </div>;
//   };
//   return match ? darkToggle() : lightToggle();
// };
// export { SidebarToggle };

import clsx from 'clsx';
import { KeenIcon } from '@/components';
import { useDemo1Layout } from '../Demo1LayoutProvider';

const SidebarToggle = ({ isHovered = false }) => {
  const { layout, setSidebarCollapse } = useDemo1Layout();

  const handleClick = () => {
    setSidebarCollapse(!layout.options.sidebar.collapse);
  };

  const isCollapsed = layout.options.sidebar.collapse;
  const isVisible = !isCollapsed || isHovered;

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'btn btn-icon btn-icon-md size-[30px] rounded-full border border-white/10 bg-[#140A26] text-gray-300 hover:text-white hover:bg-[#200F3E] transition-all duration-300',
        isVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none hidden'
      )}
      aria-label="Toggle sidebar"
    >
      <KeenIcon
        icon="black-left-line"
        className={clsx('transition-transform duration-300 text-xs', {
          'rotate-180': isCollapsed,
        })}
      />
    </button>
  );
};

export { SidebarToggle };