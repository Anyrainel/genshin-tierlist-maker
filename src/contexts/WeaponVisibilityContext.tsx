import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WeaponVisibilityContextType {
  showWeapons: boolean;
  setShowWeapons: (show: boolean) => void;
}

const WeaponVisibilityContext = createContext<WeaponVisibilityContextType | undefined>(undefined);

interface WeaponVisibilityProviderProps {
  children: ReactNode;
}

export const WeaponVisibilityProvider: React.FC<WeaponVisibilityProviderProps> = ({ children }) => {
  const [showWeapons, setShowWeapons] = useState<boolean>(() => {
    // Try to get weapon visibility from localStorage, default to true
    const savedVisibility = localStorage.getItem('tierlist-show-weapons');
    return savedVisibility !== 'false';
  });

  // Save weapon visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tierlist-show-weapons', showWeapons.toString());
  }, [showWeapons]);

  const value: WeaponVisibilityContextType = {
    showWeapons,
    setShowWeapons,
  };

  return (
    <WeaponVisibilityContext.Provider value={value}>
      {children}
    </WeaponVisibilityContext.Provider>
  );
};

export const useWeaponVisibility = (): WeaponVisibilityContextType => {
  const context = useContext(WeaponVisibilityContext);
  if (context === undefined) {
    throw new Error('useWeaponVisibility must be used within a WeaponVisibilityProvider');
  }
  return context;
};
