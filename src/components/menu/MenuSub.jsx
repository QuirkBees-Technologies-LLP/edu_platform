import { Collapse } from '@mui/material';
import clsx from 'clsx';
import { Children, cloneElement, forwardRef, isValidElement, memo } from 'react';
import { MenuItem } from './';
const MenuSubComponent = forwardRef(function MenuSub(props, ref) {
  const {
    show,
    enter,
    toggle = 'accordion',
    className,
    handleParentHide,
    handleEntered,
    handleExited,
    children,
    parentId
  } = props;
  const finalParentId = parentId !== undefined ? parentId : 'root';
  const modifiedChildren = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      if (child.type === MenuItem) {
        const modifiedProps = {
          handleParentHide,
          parentId: finalParentId,
          id: `${finalParentId}-${index}`
        };

        return cloneElement(child, modifiedProps);
      } else {
        return cloneElement(child);
      }
    }

    return child;
  });
  const renderContent = () => {
    if (toggle === 'accordion') {
      return <Collapse in={show} onEntered={handleEntered} onExited={handleExited} timeout="auto" enter={enter}>
            {modifiedChildren}
          </Collapse>;
    } else {
      return modifiedChildren;
    }
  };
  return <div ref={ref} className={clsx(toggle === 'accordion' && 'menu-accordion', toggle === 'dropdown' && 'menu-dropdown', className && className)}>
        {renderContent()}
      </div>;
});
const MenuSub = memo(MenuSubComponent);
export { MenuSub };