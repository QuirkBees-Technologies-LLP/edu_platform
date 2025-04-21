import { useEffect } from 'react';

export const useOnClickOutside = ({ onClickOutside, targets = [] }) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (targets.every((target) => target && !target.contains(event.target))) {
        onClickOutside(event);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClickOutside, targets]);
};
