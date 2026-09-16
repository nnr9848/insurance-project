import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeModeContext = createContext();

export function ThemeModeProvider({ children }) {
  const [designMode, setDesignMode] = useState(() => {
    return localStorage.getItem('aadhiraksha_design_mode') || 'modern';
  });

  useEffect(() => {
    localStorage.setItem('aadhiraksha_design_mode', designMode);
  }, [designMode]);

  const toggleDesignMode = (mode) => {
    setDesignMode(mode);
  };

  return (
    <ThemeModeContext.Provider value={{ designMode, toggleDesignMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
