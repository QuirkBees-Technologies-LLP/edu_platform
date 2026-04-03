import { forwardRef } from 'react';
import { Modal as MuiModal } from '@mui/base/Modal';
import { ModalBackdrop } from '@/components';
import clsx from 'clsx';
const Modal = forwardRef(({
  open,
  onClose,
  children,
  className,
  zIndex = 100,
  ...props
}, ref) => {
  return <MuiModal ref={ref} open={open} onClose={onClose} style={{
    zIndex: `${zIndex}`,
    opacity: open ? 1 : 0,
    display: open ? 'block' : 'none'
  }} className={clsx('modal', className)} {...props}
  slots={{
    backdrop: ModalBackdrop
  }}
  >
        {children}
      </MuiModal>;
});
export { Modal };