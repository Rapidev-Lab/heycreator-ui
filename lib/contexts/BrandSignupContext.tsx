'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandSignupData } from '@/types/firebase';

interface BrandSignupContextType {
  signupData: Partial<BrandSignupData>;
  updateSignupData: (data: Partial<BrandSignupData>) => void;
  clearSignupData: () => void;
}

const BrandSignupContext = createContext<BrandSignupContextType | undefined>(undefined);

const STORAGE_KEY = 'brandSignupData';

// Helper to get data from sessionStorage
const getStoredData = (): Partial<BrandSignupData> => {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading signup data from sessionStorage:', error);
    return {};
  }
};

// Helper to save data to sessionStorage
const saveToStorage = (data: Partial<BrandSignupData>) => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving signup data to sessionStorage:', error);
  }
};

export function BrandSignupProvider({ children }: { children: React.ReactNode }) {
  const [signupData, setSignupData] = useState<Partial<BrandSignupData>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedData = getStoredData();
    setSignupData(storedData);
    setIsInitialized(true);
  }, []);

  const updateSignupData = (data: Partial<BrandSignupData>) => {
    setSignupData((prev) => {
      const updated = { ...prev, ...data };
      saveToStorage(updated);
      return updated;
    });
  };

  const clearSignupData = () => {
    setSignupData({});
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <BrandSignupContext.Provider value={{ signupData, updateSignupData, clearSignupData }}>
      {children}
    </BrandSignupContext.Provider>
  );
}

export function useBrandSignup() {
  const context = useContext(BrandSignupContext);
  if (context === undefined) {
    throw new Error('useBrandSignup must be used within a BrandSignupProvider');
  }
  return context;
}
