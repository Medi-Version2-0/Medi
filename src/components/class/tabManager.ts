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
        console.log(`${tabId} - Tab to remove` , this.tabs);

        // Find the index of the tab to remove
        const tabIndex = this.tabs.findIndex(tab => tab.tabId === tabId);
        if (tabIndex === -1) {
            console.log(`Tab with ID ${tabId} not found.`);
            return;
        }

        // Remove the tab from the tabs array
        this.tabs.splice(tabIndex, 1);
        console.log(`Tabs after removal:`, this.tabs);

        // Reindex tabIds and update titles for subsequent tabs
        console.log(tabIndex , this.tabs.length)
        for (let i = tabIndex; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            const oldTabId = tab.tabId;
            const newTabId = `tab-id-${i + 1}`;
            tab.tabId = newTabId;

            // Update the tab-id attribute in the DOM
            const tabContainers = document.querySelectorAll(`div[tab-id="${oldTabId}"], li[tab-id="${oldTabId}"]`);
            console.log('title cont' , tabContainers)

            tabContainers.forEach((tabContainer, index) => {
                // Update the tab-id
                tabContainer.setAttribute('tab-id', newTabId);

                // Update the tab title
                const titleElement = tabContainer.querySelector('.rc-dyn-tabs-title'); // Adjust selector as needed
                console.log('title elemnt' , titleElement?.textContent)
                if (titleElement) {
                    // Extract the base name before the ID
                    const baseNameMatch = titleElement.textContent?.match(/^(.*)\[\d+\]$/);
                    const baseName = baseNameMatch ? baseNameMatch[1] : 'Tab';
                    titleElement.textContent = `${baseName}[${i + 1}]`; 
                }
            });

            console.log(`Updated ${oldTabId} to ${newTabId} with new title.`);
        }

        // Determine the new activeTabId based on the array order
        if (this.activeTabId === tabId) {
            if (this.tabs.length > 0) {
                // Set active to the previous tab if it exists, otherwise to the first tab
                const newActiveTab = this.tabs[tabIndex - 1] || this.tabs[0];
                this.setActiveTab(newActiveTab.tabId);
            } else {
                // No tabs left to set as active
                this.activeTabId = null;
                console.log('No active tab set.');
            }
        }
    }
    
    



}

