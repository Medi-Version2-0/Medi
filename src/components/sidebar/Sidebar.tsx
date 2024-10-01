import React, { useEffect, useState } from 'react';
import { TabManager } from '../../components/class/tabManager';
import { CiSearch } from 'react-icons/ci';
import { MdLibraryBooks, MdNavigateNext } from 'react-icons/md';
import { IoChevronDownSharp } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa6';
import { FaCircleArrowRight, FaCircleArrowLeft } from 'react-icons/fa6';
import MenuItem from './MenuItem';
import { Groups } from '../../views/groups';
import { SubGroups } from '../../views/subgroups';
import { ItemGroups } from '../../views/itemGroups';
import Items from '../../views/item';
import { Stations } from '../../views/stations';
import { PartyLockedSetup } from '../../views/partyLockedPopup/addPartyLockedSetup'
import { Headquarters } from '../../views/headquarters';
import { Store } from '../../views/Stores';
import { Company } from '../../views/company';
import { Ledger } from '../../views/ledger';
import { Sales_Table } from '../../views/sales_purchase';
import { BillBook } from '../../views/BillBook';
import { PartyWiseDiscount } from '../../views/discount';
import DeliveryChallan from '../../views/DeliveryChallan';
import { Vouchers } from '../../views/vouchers/index'
import { Organization } from '../../views/organization';
import usePermission from '../../hooks/useRole';
import SaleBill from '../../views/saleBill';
type SubElementKey = 'master' | 'miscellaneous';
import { useControls } from '../../ControlRoomContext';
import PriceList from '../../views/partywisePriceList/PriceList';
import CopyPratywisePriceList from '../../views/partywisePriceList/copyPartyWisePriseList';
import { useTabs } from '../../TabsContext';
import { useUser } from '../../UserContext';
import { Godown } from '../../views/godown/godown';
import { saleChallanView } from '../../constants/focusChain/saleChallan';
import { stationFocusChain } from '../../constants/focusChain/stationFocusChain';
import { ledgerViewChain } from '../../constants/focusChain/ledgerFocusChain';
import { groupViewChain } from '../../constants/focusChain/groupsFocusChain';
import { subGroupViewChain } from '../../constants/focusChain/subGroupFocusChain';
import { salePurchaseAccountViewChain } from '../../constants/focusChain/salePurchaseAccountFocusChain';
import { storeViewChain } from '../../constants/focusChain/storeFocusChain';
import { companyViewChain } from '../../constants/focusChain/companyFocusChain';

interface SidebarProps {
  isGroup?: boolean;
  isSubGroup?: boolean;
  // openTab?: (title: string, component: React.ReactNode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isGroup = false,
  isSubGroup = false,
  // openTab,
}) => {
  const [showSubElements, setShowSubElements] = useState({
    master: false,
    miscellaneous: false,
  });
  const permissions = usePermission()
  const [isSidebar, setIsSidebar] = useState<boolean>(true);
  const { controlRoomSettings } = useControls();
  const {openTab} = useTabs()
  const { user } = useUser();
  const tabManager = TabManager.getInstance();

  const isNotReadAccess = (key: string) => {
    if (permissions[key]) {
      return !permissions[key].readAccess
    }
    return false
  }


  const menuItems = [
    {
      url: '/ledger_table',
      label: 'Ledger',
      icon: <FaPlus className='fill-red-900' />,
      onClick: () => tabManager.openTab('Ledger', <Ledger /> , ledgerViewChain , openTab),
      isDisabled: isNotReadAccess('ledger')
    },
    {
      url: '/groups',
      label: 'Groups',
      onClick: () => tabManager.openTab('Groups', <Groups />, groupViewChain, openTab),
      isDisabled: isNotReadAccess('group')
    },
    {
      url: '/subgroups',
      label: 'Sub Groups',
      onClick: () => tabManager.openTab('Sub Groups', <SubGroups />, subGroupViewChain, openTab),
      isDisabled: isNotReadAccess('subgroup')
    },
    {
      url: '/itemGroup',
      label: 'Item Groups',
      onClick: () => openTab?.('Item Groups', <ItemGroups />),
      isDisabled: isNotReadAccess('itemgroup')
    },
    {
      url: '/items',
      label: 'Items',
      onClick: () => openTab?.('Items', <Items />),
      isDisabled: isNotReadAccess('item')
    },
    {
      url: '/stations',
      label: 'Station Setup',
      onClick: () => tabManager.openTab('Station Setup', <Stations /> , stationFocusChain , openTab),
      isDisabled: isNotReadAccess('station')
    },
    {
      url: '/headquarters',
      label: 'Headquarters',
      onClick: () => openTab?.('Headquarters', <Headquarters />),
      isDisabled: isNotReadAccess('headquarters')
    },
    {
      url: '/sales_purchase_table',
      label: 'Sales Account',
      onClick: () => tabManager.openTab('Sales Account', <Sales_Table type={'Sales'} />, salePurchaseAccountViewChain, openTab),
      isDisabled: isNotReadAccess('saleaccount')
    },
    {
      url: '/sales_purchase_table',
      label: 'Purchase Account',
      onClick: () => tabManager.openTab('Purchase Account', <Sales_Table type='Purchase' />, salePurchaseAccountViewChain, openTab),
      isDisabled: isNotReadAccess('purchaseaccount')
    },
    {
      url: '/stores',
      label: 'Store',
      onClick: () => tabManager.openTab('Store', <Store />, storeViewChain, openTab),
      isDisabled: isNotReadAccess('store')
    },
    {
      url: '/company',
      label: 'Company',
      icon: <FaPlus className='fill-yellow-900' />,
      onClick: () => tabManager.openTab('Company', <Company /> , companyViewChain , openTab),
      isDisabled: isNotReadAccess('company')
    },
    {
      url: '/billBook',
      label: 'Bill Book Setup',
      onClick: () => openTab?.('Bill Book Setup', <BillBook />),
      isDisabled: isNotReadAccess('billbook')
    },
    {
      url: '/discount',
      label: 'Party-wise discount',
      icon: <FaPlus className='fill-yellow-900' />,
      onClick: () => openTab?.('Party-wise discount', <PartyWiseDiscount />),
      isDisabled: isNotReadAccess('partywisediscount')
    },
    ...(controlRoomSettings.pricewisePartyList ? [
      {
        url: '/partywisePriceList',
        label: 'Party-wise PriceList',
        icon: <FaPlus className='fill-yellow-900' />,
        onClick: () => openTab?.('Party-Wise PriceList', <PriceList />),
        isDisabled: isNotReadAccess('partywise_pricelist')
      }
    ] : []),
    ...(controlRoomSettings.pricewisePartyList ? [
      {
        url: '/copyPartywisePriceList',
        label: 'Copy Party-wise PriceList',
        icon: <FaPlus className='fill-yellow-900' />,
        onClick: () => openTab?.('Copy Party-wise PriceList', <CopyPratywisePriceList />),
        isDisabled: isNotReadAccess('copy_partywise_pricelist')
      }
    ] : []),
    {
      url: '/deliveryChallan',
      label: 'Sale Challan',
      onClick: () => tabManager.openTab('Sale Challan', <DeliveryChallan />, saleChallanView , openTab),
      isDisabled: isNotReadAccess('deliverychallan')
    },
    {
      url: '/vouchers',
      label: 'Vouchers',
      onClick: () => openTab?.('Vouchers', <Vouchers />),
      isDisabled: isNotReadAccess('vouchers')
    },
    {
      url: '/saleBill',
      label: 'Sale Bill',
      onClick: () => openTab?.('Sale Bill', <SaleBill />),
      isDisabled: isNotReadAccess('invoicebill')
    }
  ];

  const miscellaneousItems =[
    {
      url: '/partyLockedSetup',
      label: 'Party Locked Setup',
      icon: <FaPlus className='fill-red-900' />,
      onClick: () => openTab?.('Party Locked Setup', <PartyLockedSetup />),
      isDisabled: isNotReadAccess('party_locked_setup')
    },
    {
      url: '/godown',
      label: 'Godown Setup',
      icon: <FaPlus className='fill-red-900' />,
      onClick: () => openTab?.('Godown Setup', <Godown />),
      isDisabled: isNotReadAccess('godown_setup')
    },
  ]


  useEffect(() => {
    if (isGroup || isSubGroup) {
      setShowSubElements({
        master: true,
        miscellaneous: true,
      });
    }
  }, [isGroup, isSubGroup]);

  const toggleSubElements = (element: SubElementKey) => {
    setShowSubElements((prevState) => ({
      ...prevState,
      [element]: !prevState[element],
    }));
  };


  return isSidebar ? (
    <div className='w-100 h-screen border relative transition-[width] duration-[0.3s] ease-[ease] pt-2.5 pb-0 px-0 border-solid border-black'>
      <div className='relative'>
        <div className='text-[2rem] text-center pb-2.5 border-b-[gray] border-[1px] border-solid'>
          Medi App
        </div>
        <span
          className='absolute flex items-center justify-center bg-white z-[2] text-[1.9rem] rounded-[50%] left-[93.4%] top-[33%] cursor-pointer'
          onClick={() => {
            setIsSidebar(false);
          }}
        >
          <FaCircleArrowLeft />
        </span>
        <div className='w-[92%] flex gap-[5px] mx-auto my-4'>
          <input
            type='text'
            className='w-full border px-1 py-2 rounded-[5px] border-solid border-[#ccc]'
            placeholder='Search...'
          />
          <span className='block text-[#433e3e] w-[1.4rem] bg-transparent ml-[-30px] cursor-pointer mt-2'>
            <CiSearch />
          </span>
        </div>
      </div>
      <div className='bg-[#009196FF]'>
        <div
          className='flex justify-between bg-[#EAFBFCFF] cursor-pointer text-base p-2 border border-solid border-[#009196FF]'
          onClick={() => toggleSubElements('master')}
        >
          <span className='flex items-center gap-2'>
            <MdLibraryBooks />
            {'  '}Master
          </span>
          <span className=''>
            {showSubElements.master ? (
              <IoChevronDownSharp />
            ) : (
              <MdNavigateNext />
            )}
          </span>
        </div>
        {showSubElements.master && (
          <>
            {menuItems.map((item:any, index) => {
              return (
                <MenuItem
                  key={index}
                  url={item.url}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => item.onClick()}
                  isDisabled={item.isDisabled}
                />
              )
            })}
          </>
        )}
        <div className='flex justify-between bg-[#EAFBFCFF] cursor-pointer text-base p-2 border border-solid border-[#009196FF]'>
          <span className='flex items-center gap-2'>
            <MdLibraryBooks />
            Purchases
          </span>
          <MdNavigateNext />
        </div>
        <div
          className='flex justify-between bg-[#EAFBFCFF] cursor-pointer text-base p-2 border border-solid border-[#009196FF]'
          onClick={() => toggleSubElements('miscellaneous')}
        >
          <span className='flex items-center gap-2'>
            <MdLibraryBooks />
            {'  '}Miscellaneous
          </span>
          <span className=''>
            {showSubElements.master ? (
              <IoChevronDownSharp />
            ) : (
              <MdNavigateNext />
            )}
          </span>
        </div>
        {showSubElements.miscellaneous && (
          <>
            {miscellaneousItems.map((item, index) => {
              return (
                <MenuItem
                  key={index}
                  url={item.url}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => item.onClick()}
                  isDisabled={item.isDisabled}
                />
              )
            })}
          </>
        )}
        {/* only admin can access this */}
        {user?.isAdmin && (
          <div className='flex justify-between bg-[#EAFBFCFF] cursor-pointer text-base p-2 border border-solid border-[#009196FF]' onClick={() => openTab?.('Main Settings', <Organization />)}>
            <span className='flex items-center gap-2' >
              <MdLibraryBooks />
              {'  '}Main Settings
            </span>
            {<MdNavigateNext />}
          </div>
        ) }
      </div>
    </div>
  ) : (
    <div className='w-[70px] relative h-screen border border-solid border-black'>
      <span
        className='absolute flex items-center justify-center bg-white z-[2] text-[1.9rem] rounded-[50%] right-[-10px] top-[33%] cursor-pointer'
        onClick={() => {
          setIsSidebar(true);
        }}
      >
        <FaCircleArrowRight />
      </span>
    </div>
  );
};

export default Sidebar;
