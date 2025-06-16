'use client'
import { createContext, ReactNode, useState } from "react";

interface ContactContextType {
  inputFocused: boolean;
  setInputFocused: (value: boolean) => void;
}

const defaultContextValue: ContactContextType = {
  inputFocused: false,
  setInputFocused: () => {}
};

export const ContactContext = createContext<ContactContextType>(defaultContextValue);

interface ContactContextProviderProps {
  children: ReactNode;
}

export const ContactContextProvider = ({ children }: ContactContextProviderProps) => {
  const [inputFocused, setInputFocused] = useState<boolean>(false);

  const value = {
    inputFocused,
    setInputFocused
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}; 