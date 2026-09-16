import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeModeContext = createContext();

export function ThemeModeProvider({ children }) {
  const [designMode, setDesignMode] = useState(() => {
    const saved = localStorage.getItem('aadhiraksha_design_mode');
    // Ensure standard default is always modern
    return saved === 'classic' ? 'classic' : 'modern';
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
