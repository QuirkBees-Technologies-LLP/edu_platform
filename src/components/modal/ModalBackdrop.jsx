
import clsx from 'clsx';
import { forwardRef } from 'react';
const ModalBackdrop = forwardRef(({
  className,
  ownerState,
  ...props
}, ref) => {
  const {
    ...other
  } = props;
  return <div ref={ref} className={clsx('modal-backdrop transition-all duration-300 -z-1', className && className)} aria-hidden="true" {...other} />;
});
export { ModalBackdrop };