import { useEffect } from 'react';
const useBodyClasses = classNames => {
  useEffect(() => {
    const classes = classNames.split(/\s+/).filter(Boolean);

    classes.forEach(className => {
      document.body.classList.add(className);
    });

    return () => {
      classes.forEach(className => {
        document.body.classList.remove(className);
      });
    };
  }, [classNames]);
};
export default useBodyClasses;