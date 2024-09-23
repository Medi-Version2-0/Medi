export class TabManager {
    private static instance: TabManager;
    private tabs: Array<{ tabId: string, focusChain: string[], lastFocusedElementId: string | null }> = [
        {
            tabId: `tab-id-1`,
            focusChain: [],
            lastFocusedElementId: null
        }
    ];
    private activeTabId: string | null = null;

    private constructor() {
        document.addEventListener('keydown', this.handleTabKeyPress.bind(this));
    }

    public static getInstance(): TabManager {
        if (!TabManager.instance) {
            TabManager.instance = new TabManager();
        }
        return TabManager.instance;
    }

    private handleTabKeyPress(event: KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.focusManager();
        }
    }

    public focusManager() {
        if (!this.activeTabId) return;
        const tab = this.tabs.find(tab => tab.tabId === this.activeTabId);
        if (!tab || tab.focusChain.length === 0) return;
        const tabContainer = document.querySelector(`div[tab-id="${this.activeTabId}"]`);
        if (!tabContainer) return;
        const currentFocusedElementIndex = tab.focusChain.indexOf(tab.lastFocusedElementId || '');
        const nextIndex = (currentFocusedElementIndex + 1) % tab.focusChain.length;
        const nextElementId = tab.focusChain[nextIndex];
        const nextElement = tabContainer.querySelector(`#${nextElementId}`) as HTMLElement;
        if (nextElement) {
            nextElement.focus();
            tab.lastFocusedElementId = nextElementId;
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
            lastFocusedElementId: focusChain.length > 0 ? focusChain[0] : null
        });
        await openTabFunc(`${tabName}[${tabId}]`, component, `tab-id-${tabId}`);
        this.setActiveTab(`tab-id-${tabId}`);
        console.log(this.tabs , 'opentabs')
    }

    public setActiveTab(tabId: string) {
        this.activeTabId = tabId;
        const tab = this.tabs.find(tab => tab.tabId === tabId);
        if (tab && tab.lastFocusedElementId) {
            const tabContainer = document.querySelector(`div[tab-id="${tabId}"]`);
            if (tabContainer) {
                const lastFocusedElement = tabContainer.querySelector(`#${tab.lastFocusedElementId}`);
                if (lastFocusedElement) {
                    (lastFocusedElement as HTMLElement).focus();
                }
            }
        }
    }
    public closeTab(tabId: string) {
        console.log(tabId, 'tab to remove');
    
        let updatedTabs = [...this.tabs];
        const tabIndex = updatedTabs.findIndex(tab => tab.tabId === tabId);
        console.log(tabIndex, 'index of tab to remove');
        if (tabIndex === -1) return; 
        console.log(updatedTabs, 'tabs before removing');
        
        updatedTabs = updatedTabs.filter(tab => tab.tabId !== tabId);
        console.log(updatedTabs, 'tabs after removing');
    
        updatedTabs.forEach((tab, index) => {
            const newTabId = `tab-id-${index + 1}`;
            tab.tabId = newTabId; 
            
            const oldTabElements = document.querySelectorAll(`[tab-id="tab-id-${index + 2}"]`);
            console.log(oldTabElements, 'old tab elements');
            
            oldTabElements.forEach((element) => {
                element.setAttribute('tab-id', newTabId);
            });
        });
    
        this.tabs = updatedTabs;
    
        if (this.activeTabId === tabId) {
            this.activeTabId = this.tabs.length > 0 ? this.tabs[0].tabId : null;
        }
    }
    
    
    



}

