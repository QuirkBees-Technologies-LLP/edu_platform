import clsx from 'clsx';
const MenuToggle = ({
  className,
  hasItemSub = false,
  handleToggle,
  children
}) => {
  if (hasItemSub) {
    return <div className={clsx('menu-toggle pe-0', className && className)} onClick={handleToggle}>
        {children}  <span class="badge badge-xs badge-primary badge-outline ms-2">Premium</span>
      </div>;
  } else {
    return <div className={clsx('menu-toggle', className && className)}>{children}</div>;
  }
};
export { MenuToggle };