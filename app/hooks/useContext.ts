'use client'
import { useContext } from 'react';
import { ContextProvider } from '../../components/Context/ContextProvider';

export const useAppContext = () => {
  const context = useContext(ContextProvider);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within a ContextProviderWrapper');
  }
  
  return context;
}; 