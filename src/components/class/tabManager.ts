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
    private dynTabsInstance: any | null = null;

    private constructor() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
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
        if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
            const tabIndex = parseInt(event.key, 10) - 1;
            if (this.tabs.length > tabIndex) {
                this.setSelectedTab(this.tabs[tabIndex].tabId);
            }
        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.focusManager();
        }
    }

    public setSelectedTab(tabId: string) {
        if (!this.dynTabsInstance) {
            return;
        }
        this.dynTabsInstance.select(tabId);
        this.setActiveTab(tabId);
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

