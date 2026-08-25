import { useEffect, useState } from 'react';
const useScrollPosition = ({
  targetRef
} = {}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  useEffect(() => {
    const target = targetRef?.current || document;
    const scrollable = target === document ? window : target;
    const updatePosition = () => {
      const scrollY = target === document ? window.scrollY : target.scrollTop;
      setScrollPosition(scrollY);
    };
    scrollable.addEventListener('scroll', updatePosition);

    updatePosition();
    return () => {
      scrollable.removeEventListener('scroll', updatePosition);
    };
  }, [targetRef]);
  return scrollPosition;
};
export { useScrollPosition };