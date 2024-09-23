import useDynTabs from 'react-dyn-tabs';
import 'react-dyn-tabs/style/react-dyn-tabs.min.css';
import 'react-dyn-tabs/themes/react-dyn-tabs-card.min.css';
import Sidebar from '../sidebar/Sidebar';
import './tabs.css';
import { TabsProvider } from '../../TabsContext';

export const Tabs = () => {
  const options = {
    tabs: [
      {
        id: 'tab-id-1',
        title: 'tab [1]',
        panelComponent: <p>Welcome!</p>,
      },
    ],
    selectedTabID: '1',
  };

  const [Tablist, Panellist, ready] = useDynTabs(options);

  return (
    <TabsProvider ready={ready}>
      <div className='flex w-full h-full'>
        <Sidebar />
        <div
          className='m-[10px] bg-white p-[10px] rounded-[7px] min-h-full h-fit'
          style={{ width: 'calc(100vw - 215px)' }}
        >
          <Tablist />
          <Panellist />
        </div>
      </div>
    </TabsProvider>
  );
};
