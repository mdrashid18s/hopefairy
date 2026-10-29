'use client';

import { createContext, useContext, useState } from 'react';

const ChromeContext = createContext({
  hideChrome: false,
  setHideChrome: () => {},
});

export function ChromeProvider({ children }) {
  const [hideChrome, setHideChrome] = useState(false);

  return (
    <ChromeContext.Provider value={{ hideChrome, setHideChrome }}>
      {children}
    </ChromeContext.Provider>
  );
}

export const useChrome = () => useContext(ChromeContext);
