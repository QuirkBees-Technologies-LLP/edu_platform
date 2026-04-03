import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { useSettings } from '@/providers';
export const KeenIcon = forwardRef(({
  icon,
  style,
  className = '',
  ...props
}, ref) => {
  const {
    settings
  } = useSettings();
  if (!style) {
    style = settings.keeniconsStyle;
  }

  return <i ref={ref} {...props} className={clsx(`ki-${style}`, `ki-${icon}`, className)} />;
});