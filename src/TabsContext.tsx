import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { TabManager } from './components/class/tabManager';

interface TabActions {
  openTab: (title: string, component: React.ReactNode, tabId?: string) => Promise<void>;
}

const TabsContext = createContext<TabActions | undefined>(undefined);

export const TabsProvider: React.FC<{ children: React.ReactNode; ready: (cb: (instance: any) => void) => void }> = ({ children, ready }) => {
  const instanceRef = useRef<any>(null);
  const tabManager = TabManager.getInstance();
  const listenersAddedRef = useRef(false);

  useEffect(() => {
    const onReady = (instance: any) => {
      instanceRef.current = instance;
      tabManager.setDynTabsInstance(instance)
      if (!listenersAddedRef.current) {
        const handleSelect = (tab: { currentSelectedTabId: string; previousSelectedTabId: string }) => {
          console.log('calling on select');
          tabManager.setActiveTab(tab.currentSelectedTabId);
        };
        const handleClose = (closedTab: [string]) => {
          console.log('calling onClose', closedTab[0]);
          tabManager.closeTab(closedTab[0]);
        };
        instance.on('onSelect', handleSelect);
        instance.on('onClose', handleClose);
        listenersAddedRef.current = true;

        return () => {
          instance.off('onSelect', handleSelect);
          instance.off('onClose', handleClose);
          listenersAddedRef.current = false;
        };
      }
    };

    ready(onReady);
  }, [ready, tabManager]);

  const actions: TabActions = {
    openTab: async (title, component, tabId) => {
      if (!instanceRef.current) return;

      const newTab = await instanceRef.current.open({
        ...(tabId && { id: tabId }),
        title,
        closable: true,
        panelComponent: component,
      });

      const focusTab = newTab.currentData.openTabIDs.length - 1;
      const selectedTabId = newTab.currentData.openTabIDs[focusTab];
      instanceRef.current.select(selectedTabId);
      tabManager.setActiveTab(selectedTabId);
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
