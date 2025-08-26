'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type SidebarTab = 'categories' | 'stats';

interface SidebarContextType {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('categories');

  return (
    <SidebarContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
