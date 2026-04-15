import React, { forwardRef } from 'react';
import { TabPanel as MuiTabPanel } from '@mui/base/TabPanel';

const TabPanel = forwardRef((props, ref) => {
  return <MuiTabPanel {...props} ref={ref} />;
});
export { TabPanel };