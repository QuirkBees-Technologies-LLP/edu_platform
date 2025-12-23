const isMobileDevice = () => {
  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  return isMobile;
};
const isMacDevice = () => {
  return navigator.userAgent.includes('Mac OS X');
};
const isWindowsDevice = () => {
  return navigator.userAgent.includes('Windows');
};
const isSafari = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent;
  // Check for Safari specifically (not Chrome/Chromium/Edge)
  const isSafariUA = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isSafariVendor = /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/Chromium/.test(userAgent) && !/Edg/.test(userAgent);
  return isSafariUA || isSafariVendor;
};
export { isMacDevice, isMobileDevice, isWindowsDevice, isSafari };