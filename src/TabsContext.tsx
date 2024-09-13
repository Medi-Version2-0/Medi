import React, { createContext, useContext, useRef } from 'react';

interface TabActions {
  openTab: (title: string, component: React.ReactNode) => Promise<void>;
}

const TabsContext = createContext<TabActions | undefined>(undefined);

export const TabsProvider: React.FC<{ children: React.ReactNode, ready: (cb: (instance: any) => void) => void }> = ({ children, ready }) => {
  const instanceRef = useRef<any>(null);

  ready((instance: any) => {
    instanceRef.current = instance;
  });

  const actions: TabActions = {
    openTab: async (title, component) => {
      if (!instanceRef.current) return;
      const newTab = await instanceRef.current.open({
        title,
        closable: true,
        panelComponent: component,
      });

      const focusTab = newTab.currentData.openTabIDs.length - 1;
      instanceRef.current.select(newTab.currentData.openTabIDs[focusTab]);
    },
  };

  return (
    <TabsContext.Provider value={actions}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = (): TabActions => {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};
