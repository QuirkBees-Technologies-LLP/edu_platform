import React, { useCallback, useState } from 'react';

export const useBoolState = ({ initValue, setState } = { initValue: false }) => {
  const [state, _setState] = useState(initValue);
  const setStateFinal = setState || _setState;

  const off = useCallback(() => {
    setStateFinal(false);
  }, []); // eslint-disable-line

  const on = useCallback(() => {
    setStateFinal(true);
  }, []); // eslint-disable-line

  const toggle = useCallback(() => {
    setStateFinal((prev) => !prev);
  }, []); // eslint-disable-line

  return {
    off,
    on,
    toggle,
    state,
  };
};
