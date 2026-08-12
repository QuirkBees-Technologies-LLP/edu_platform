import clsx from 'clsx';
import { Fragment } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { KeenIcon } from '@/components';
import { useMenuBreadcrumbs } from '@/components/menu';
import { useMenus } from '@/providers';
import { selectBreadcrumbSuffix } from '@/store/reducer/breadcrumbSlice';
const Breadcrumbs = () => {
  const {
    pathname
  } = useLocation();
  const {
    getMenuConfig
  } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const breadcrumbSuffix = useSelector(selectBreadcrumbSuffix);
  const baseItems = useMenuBreadcrumbs(pathname, menuConfig);
  // Strategies page appends the selected strategy's name (e.g. "Strategies > Defy").
  // Scoped to its own route so no other page's breadcrumb is affected.
  const items = (breadcrumbSuffix && pathname === '/trading-strategies')
    ? [
      ...baseItems.map((item) => ({ ...item, active: false })),
      { title: breadcrumbSuffix, path: pathname, active: true },
    ]
    : baseItems;
  const renderItems = items => {
    return items.map((item, index) => {
      const last = index === items.length - 1;
      return <Fragment key={`root-${index}`}>
          <span className={clsx(item.active ? 'text-gray-700' : 'text-gray-700')} key={`item-${index}`}>
            {item.title}
          </span>
          {!last && <KeenIcon icon="right" className="text-gray-500 text-3xs" key={`separator-${index}`} />}
        </Fragment>;
    });
  };
  const render = () => {
    return <div className="flex [.header_&]:below-lg:hidden items-center gap-1.25 text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
        {items && renderItems(items)}
      </div>;
  };
  return render();
};
export { Breadcrumbs };