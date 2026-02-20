import clsx from 'clsx';
import { Link } from 'react-router-dom';
const MenuLink = ({
  path,
  newTab,
  hasItemSub = false,
  externalLink,
  className,
  handleToggle,
  handleClick,
  children
}) => {
  if (path) {
    const Component = externalLink ? 'a' : Link;
    const props = {
      className: clsx('menu-link', className && className),
      onClick: hasItemSub ? handleToggle : handleClick
    };

    if (externalLink) {
      props.href = path;
      props.target = newTab ? '_blank' : '_self';
      props.rel = "noopener";
    } else {
      props.to = path;
    }

    return (
      <Component {...props}>
        {children}
      </Component>
    );
  } else {
    return (
      <div className={clsx('menu-link', className && className)} onClick={hasItemSub ? handleToggle : handleClick}>
        {children}
      </div>
    );
  }
};
export { MenuLink };