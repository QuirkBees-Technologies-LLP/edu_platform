import { forwardRef } from 'react';
const ModalHeader = forwardRef(({
  className,
  children
}, ref) => {
  return <div ref={ref} className={`modal-header ${className}`}>
        {children}
      </div>;
});
export { ModalHeader };