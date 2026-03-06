"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneAuthContextType {
  confirmationResult: ConfirmationResult | null;
  setConfirmationResult: (result: ConfirmationResult | null) => void;
}

const PhoneAuthContext = createContext<PhoneAuthContextType | undefined>(undefined);

export function PhoneAuthContextProvider({ children }: { children: ReactNode }) {
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  return (
    <PhoneAuthContext.Provider value={{ confirmationResult, setConfirmationResult }}>
      {children}
    </PhoneAuthContext.Provider>
  );
}

export function usePhoneAuth() {
  const context = useContext(PhoneAuthContext);
  if (context === undefined) {
    throw new Error('usePhoneAuth must be used within a PhoneAuthContextProvider');
  }
  return context;
}
