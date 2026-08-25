import { forwardRef } from 'react';
const ModalTitle = forwardRef(({
  className,
  children
}, ref) => {
  return <h3 ref={ref} className={`modal-title ${className}`}>
      {children}
    </h3>;
});
export { ModalTitle };