import React, { forwardRef } from 'react';
import { Tabs as MuiTabs } from '@mui/base/Tabs';

const Tabs = forwardRef((props, ref) => {
  return <MuiTabs {...props} ref={ref} />;
});
export { Tabs };