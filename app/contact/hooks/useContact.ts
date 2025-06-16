import { useContext } from 'react';
import { ContactContext } from '../components/ContactContext';

export const useContact = () => {
  const context = useContext(ContactContext);
  
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactContextProvider');
  }
  
  return context;
}; 