import React, { useContext, useState, createContext } from 'react';

const GiphyContext = createContext({
  giphyState: false,
  setGiphyState: () => {},
});

export const GiphyContextProvider = ({ children }) => {
  const [giphyState, setGiphyState] = useState(false);

  const value = { giphyState, setGiphyState };
  return <GiphyContext.Provider value={value}>{children}</GiphyContext.Provider>;
};

export const useGiphyContext = () => useContext(GiphyContext);
