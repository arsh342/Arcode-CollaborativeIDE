"use client";

import ArcodeContext from '@/contexts/ArcodeContext';
import { useContext } from 'react';

export const useArcodeContext = () => {
  const context = useContext(ArcodeContext);
  if (context === undefined) {
    throw new Error('useArcodeContext must be used within an ArcodeProvider');
  }
  return context;
};
