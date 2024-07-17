import React, { useEffect } from 'react';
import 'react-dyn-tabs/style/react-dyn-tabs.min.css';
import 'react-dyn-tabs/themes/react-dyn-tabs-card.min.css';
import useDynTabs from 'react-dyn-tabs';
import Sidebar from '../sidebar/Sidebar';
import './tabs.css';

export const Tabs = () => {
  const options = {
    tabs: [
      {
        id: '1',
        title: 'tab 1',
        panelComponent: <p>Welcome!</p>,
      },
    ],
    selectedTabID: '1',
  };

  const [Tablist, Panellist, ready] = useDynTabs(options);
  let _instance: any;

  ready((instance) => {
    _instance = instance;
  });

  const actions = {
    openTab: async (title: any, component: any) => {
      const newTab = await _instance.open({
        title: title,
        closable: true,
        panelComponent: component,
      });

      const focusTab = newTab.currentData.openTabIDs.length - 1;
      _instance.select(newTab.currentData.openTabIDs[focusTab]);
    },

    closeTab: (id: any) => {
      _instance.close(id);
    },

    // closeAllTabs: () => {
    //   const openTabIDs = _instance.getData().openTabIDs;
    //   openTabIDs.forEach((id: any) => {
    //     if (id === '1') {
    //       return;
    //     }
    //     _instance.close(id);
    //   });
    // },

    selectNextTab: () => {
      const openTabIDs = _instance.getData().openTabIDs;
      const selectedTabId = _instance.getData().selectedTabID;
      const currentIndex = openTabIDs.indexOf(selectedTabId);
      const nextIndex = (currentIndex + 1) % openTabIDs.length;
      _instance.select(openTabIDs[nextIndex]);
    },

    selectPreviousTab: () => {
      const openTabIDs = _instance.getData().openTabIDs;
      const selectedTabId = _instance.getData().selectedTabID;
      const currentIndex = openTabIDs.indexOf(selectedTabId);
      const previousIndex =
        (currentIndex - 1 + openTabIDs.length) % openTabIDs.length;
      _instance.select(openTabIDs[previousIndex]);
    },
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentTabId = _instance.getData().selectedTabID;
      const currentTab = _instance.getTab(currentTabId);

      if (event.ctrlKey && (event.key === 't' || event.key === 'T')) {
        event.preventDefault();
        if (currentTab) {
          actions.openTab(currentTab.title, currentTab.panelComponent);
        }
      }

      if (event.ctrlKey && (event.key === 'w' || event.key === 'W')) {
        event.preventDefault();
        const confirmClose = window.confirm(
          'Your changes will be lost. Do you want to proceed?'
        );

        if (confirmClose) {
          actions.closeTab(currentTabId);
        }
      }

      if (event.ctrlKey && event.key === 'Tab') {
        event.preventDefault();
        actions.selectNextTab();
      }

      if (event.ctrlKey && event.shiftKey && event.key === 'Tab') {
        event.preventDefault();
        actions.selectPreviousTab();
      }
      //Info: To disable refresh
      // if (event.ctrlKey && (event.key === 'r' || event.key === 'R')) {
      //   event.preventDefault();
      // }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        (event.key === 'r' || event.key === 'R')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [_instance]);

  return (
    <div className='flex w-full h-full'>
      <Sidebar openTab={actions.openTab} />
      <div
        className='m-[10px] bg-white p-[10px] rounded-[7px] min-h-full h-fit'
        style={{ width: 'calc(100vw - 215px)' }}
      >
        <Tablist />
        <Panellist />
      </div>
    </div>
  );
};
