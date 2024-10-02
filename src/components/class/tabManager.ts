export class TabManager {
    private static instance: TabManager;
    private tabs: Array<{
        tabId: string,
        focusChain: string[],
        lastFocusedElementId: string | null,
        popups: Array<{
            popupId: string,
            focusChain: string[],
            lastFocusedElementId: string | null
        }>
    }> = [
            {
                tabId: `tab-id-1`,
                focusChain: [],
                lastFocusedElementId: null,
                popups: []
            }
        ];
    public activeTabId: string | null = 'tab-id-1';
    private activeTabIndex: number | null = 0;
    private dynTabsInstance: any | null = null;

    private constructor() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    private emitFocusChange(tabId: string, focusedElementId: string | null) {
        const event = new CustomEvent('tabFocusChange', {
            detail: { tabId, focusedElementId }
        });
        window.dispatchEvent(event);
    }

    public setDynTabsInstance(dynTabsInstance: any) {
        this.dynTabsInstance = dynTabsInstance;
    }

    public static getInstance(): TabManager {
        if (!TabManager.instance) {
            TabManager.instance = new TabManager();
        }
        return TabManager.instance;
    }

    private handleKeyPress(event: KeyboardEvent) {
        const activeElement = document.activeElement as HTMLElement;
        const isInAgGrid = activeElement && (activeElement.classList.contains('ag-root-wrapper') || activeElement.closest('.ag-root-wrapper'));
        const isInSelectList = activeElement && (activeElement.classList.contains('selectList') || activeElement.closest('selectList')); 
        if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
            const tabIndex = parseInt(event.key, 10) - 1;
            if (this.tabs.length > tabIndex) {
                this.setSelectedTab(this.tabs[tabIndex].tabId);
            }
        } else if (event.ctrlKey && event.key === 'w') {
            event.preventDefault();
            if (this.activeTabId && this.activeTabIndex !== null) {
                this.closeTab(this.activeTabId);
                if (!this.dynTabsInstance) {
                    return;
                }
                this.dynTabsInstance.close(this.activeTabId);
            }
        } 
    
        else if (this.activeTabId && this.activeTabIndex !== null) {
            const activeTab = this.tabs[this.activeTabIndex];
            if (activeTab && activeTab.popups.length > 0) {
                const lastPopup = activeTab.popups[activeTab.popups.length - 1];
                console.log(lastPopup)
                if (lastPopup.popupId.includes('selectList')) {
                    return;
                }
                    if (event.ctrlKey && event.key === 'n') {
                    const newButton = document.querySelector(`[id="${lastPopup.popupId}"] #add`) as HTMLElement;
                    if (newButton) {
                        newButton.click();
                        return;
                    }
                }
    
                if (event.ctrlKey && event.key === 's') {
                    event.preventDefault();
                    const saveButton = document.querySelector(`[id="${lastPopup.popupId}"] #save`) as HTMLButtonElement;
                    if (saveButton && !saveButton.disabled) {
                        saveButton.click();
                        return;
                    }
                }

                if(event.key === 'Escape'){
                    const cross = document.querySelector(`[id="${lastPopup.popupId}"] #cross`) as HTMLElement;
                    if(cross){
                        cross.click();
                        return;
                    }
                }
            }
            if (activeTab?.lastFocusedElementId?.includes('cell')){
                return;
            }
    
            if (event.ctrlKey && event.key === 'n') {
                const newButton = document.querySelector(`div[tab-id="${this.activeTabId}"] #add`) as HTMLElement;
                if (newButton) {
                    newButton.click();
                    return;
                }
            }
    
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                const saveButton = document.querySelector(`div[tab-id="${this.activeTabId}"] #save`) as HTMLButtonElement;
                if (saveButton && !saveButton.disabled) {
                    saveButton.click();
                    return;
                }
            }
        }
        if(isInAgGrid || isInSelectList) return;
    
      if (event.shiftKey && event.key === 'Tab') {
            event.preventDefault();
            this.focusManager(true);
        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.focusManager();
        } else if (event.key === 'Enter') {
            if (activeElement && activeElement.tagName.toLowerCase() === 'button') {
                return;
            }
            if (activeElement && (activeElement.id.includes('custom_select') || activeElement.id.includes('upload'))) {
                return;
            }
            event.preventDefault();
            this.focusManager();
        }
    }
    

    public addPopupToActiveTab(popupId: string, focusChain: string[]) {
        if (this.activeTabIndex === null) return;

        const activeTab = this.tabs[this.activeTabIndex];
        if (!activeTab) return;
        const isAlready = activeTab.popups.some((x)=> x.popupId === `${activeTab.tabId}-${popupId}`)
        if(isAlready) return;
        activeTab.popups.push({
            popupId : `${activeTab.tabId}-${popupId}`,
            focusChain,
            lastFocusedElementId: focusChain.length > 0 ? focusChain[0] : null
        });

        if (focusChain.length > 0) {
            const firstElement = document.querySelector(`[id="${activeTab.tabId}-${popupId}"] #${focusChain[0]}`) as HTMLElement;
            if (firstElement) {
                firstElement.focus();
            }
        }
    }

    public removePopupFromActiveTab(popupId: string) {
        if (this.activeTabIndex === null) return;
        
        const activeTab = this.tabs[this.activeTabIndex];
        if (!activeTab || !activeTab.popups) return;

        const popupIndex = activeTab.popups.findIndex(popup => popup.popupId === `${activeTab.tabId}-${popupId}`);
        if (popupIndex !== -1) {
            activeTab.popups.splice(popupIndex, 1);
        }
        if (activeTab.popups.length > 0) {
            const lastPopup = activeTab.popups[activeTab.popups.length - 1];
            if (lastPopup.lastFocusedElementId) {
                const popupContainer = document.querySelector(`[id="${lastPopup.popupId}"]`);
                if (popupContainer) {
                    const lastFocusedElement = popupContainer.querySelector(`#${lastPopup.lastFocusedElementId}`);
                    if (lastFocusedElement) {
                        (lastFocusedElement as HTMLElement).focus();
                        return;
                    }
                }
            }
        }
        if (activeTab.lastFocusedElementId) {
            const tabContainer = document.querySelector(`div[tab-id="${this.activeTabId}"]`);
            if (tabContainer) {
                const lastFocusedElement = tabContainer.querySelector(`#${activeTab.lastFocusedElementId}`);
                if (lastFocusedElement) {
                    (lastFocusedElement as HTMLElement).focus();
                }
            }
        }
    }

    public setSelectedTab(tabId: string) {
        if (!this.dynTabsInstance) return;
        this.dynTabsInstance.select(tabId);
        this.setActiveTab(tabId);
    }

    public updateFocusChainAndSetFocus(newFocusChain: string[], focusElementId: string) {
        if (this.activeTabIndex === null) return;
        const activeTab = this.tabs[this.activeTabIndex];
        if (!activeTab) return;

        activeTab.focusChain = newFocusChain;
        activeTab.lastFocusedElementId = focusElementId;

        const tabContainer = document.querySelector(`div[tab-id="${this.activeTabId}"]`);
        if (!tabContainer) return;

        const focusElement = tabContainer.querySelector(`#${focusElementId}`) as HTMLElement;
        if (focusElement) {
            focusElement.focus();
        }
    }

    public setLastFocusedElementId(focusElementId: string) {
        setTimeout(() => {
            if (this.activeTabIndex === null) return;
            const activeTab = this.tabs[this.activeTabIndex];
            if (!activeTab) return;
    
            let elementFound = false;
            for (let i = activeTab.popups.length - 1; i >= 0; i--) {
                const popup = activeTab.popups[i];
                if (popup.focusChain.includes(focusElementId)) {
                    popup.lastFocusedElementId = focusElementId;
                    elementFound = true; 
                    break; 
                }
            }

            if (!elementFound) {
                activeTab.lastFocusedElementId = focusElementId;
                this.emitFocusChange(this.activeTabId!, focusElementId);
            }
        }, 0);
    }

    public setTabLastFocusedElementId(focusElementId: string) {
            if (this.activeTabIndex === null) return;
            const activeTab = this.tabs[this.activeTabIndex];
            if (!activeTab) return;
                activeTab.lastFocusedElementId = focusElementId;
            this.emitFocusChange(this.activeTabId!, focusElementId);
    }

    public focusManager(reverse: boolean = false) {
        if (this.activeTabIndex === null) return;
        const tab = this.tabs[this.activeTabIndex];
        if (tab?.popups.length > 0) {
            const popup = tab.popups[tab.popups.length - 1];
            if (!popup.focusChain.length) return;

            const popupContainer = document.querySelector(`div[id="${popup.popupId}"]`);
            if (!popupContainer) return;
            const currentFocusedElementIndex = popup.focusChain.indexOf(popup.lastFocusedElementId || '');
            const nextIndex = reverse
                ? (currentFocusedElementIndex - 1 + popup.focusChain.length) % popup.focusChain.length
                : (currentFocusedElementIndex + 1) % popup.focusChain.length;

            const nextElementId = popup.focusChain[nextIndex];

            const nextElement = popupContainer.querySelector(`#${nextElementId}`) as HTMLElement;
            if (nextElement) {
                nextElement.focus();
                popup.lastFocusedElementId = nextElementId;
            }
        } else {
            if(!tab?.focusChain) return;
            const currentFocusedElementIndex = tab.focusChain.indexOf(tab.lastFocusedElementId || '');
            const nextIndex = reverse
                ? (currentFocusedElementIndex - 1 + tab.focusChain.length) % tab.focusChain.length
                : (currentFocusedElementIndex + 1) % tab.focusChain.length;

            const nextElementId = tab.focusChain[nextIndex];

            const nextElement = document.querySelector(`div[tab-id="${this.activeTabId}"] #${nextElementId}`) as HTMLElement;
            if (nextElement) {
                nextElement.focus();
                tab.lastFocusedElementId = nextElementId;
            }
        }
    }

    public async openTab(
        tabName: string,
        component: React.ReactNode,
        focusChain: string[],
        openTabFunc: (title: string, component: React.ReactNode, tabId: string) => Promise<void>
    ) {
        const tabId = this.tabs.length + 1;
        this.tabs.push({
            tabId: `tab-id-${tabId}`,
            focusChain,
            lastFocusedElementId: focusChain.length > 0 ? focusChain[0] : null,
            popups: []
        });
        await openTabFunc(`${tabName}[${tabId}]`, component, `tab-id-${tabId}`);
        this.setActiveTab(`tab-id-${tabId}`);
    }

    public setActiveTab(tabId: string) {
        this.activeTabId = tabId;
        this.activeTabIndex = this.tabs.findIndex(tab => tab.tabId === tabId);

        const tab = this.tabs[this.activeTabIndex];
        if (tab) {
            if (tab.popups.length > 0) {
                const lastPopup = tab.popups[tab.popups.length - 1];
                const popupContainer = document.querySelector(`[id="${lastPopup.popupId}"]`);
                if (popupContainer) {
                    const lastFocusedElement = popupContainer.querySelector(`#${lastPopup.lastFocusedElementId}`);
                    if (lastFocusedElement) {
                        (lastFocusedElement as HTMLElement).focus();
                    }
                }
            } else if (tab.lastFocusedElementId) {
                const tabContainer = document.querySelector(`div[tab-id="${tabId}"]`);
                if (tabContainer) {
                    const lastFocusedElement = tabContainer.querySelector(`#${tab.lastFocusedElementId}`);
                    if (lastFocusedElement) {
                        (lastFocusedElement as HTMLElement).focus();
                    }
                }
                this.emitFocusChange(tabId , tab.lastFocusedElementId)
            }
        }
    }

    public closeTab(tabId: string) {
        const tabIndex = this.tabs.findIndex(tab => tab.tabId === tabId);
        if (tabIndex === -1) {
            return;
        }
        this.tabs.splice(tabIndex, 1);
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            const tabId = tab.tabId;
            const tabContainers = document.querySelectorAll(`div[tab-id="${tabId}"], li[tab-id="${tabId}"]`);

            tabContainers.forEach((tabContainer) => {
                const titleElement = tabContainer.querySelector('.rc-dyn-tabs-title');
                if (titleElement) {
                    const baseNameMatch = titleElement.textContent?.match(/^(.*)\[\d+\]$/);
                    const baseName = baseNameMatch ? baseNameMatch[1] : 'Tab';
                    titleElement.textContent = `${baseName}[${i + 1}]`;
                }
            });
        }
    }
}
