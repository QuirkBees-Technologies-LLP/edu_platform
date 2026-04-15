import React, { forwardRef } from 'react';
import { TabsList as MuiTabsList } from '@mui/base/TabsList';

const TabsList = forwardRef((props, ref) => {
  return <MuiTabsList slotProps={{
    root: () => ({
      className: 'tabs'
    })
  }} {...props} ref={ref} />;
});
export { TabsList };