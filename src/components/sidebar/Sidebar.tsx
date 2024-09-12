import React, { useEffect, useState } from 'react';
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
type SubElementKey = 'master' | 'setup';
import { useSelector } from 'react-redux';
import { generalSettingFields } from '../common/controlRoom/settings';
import { ControlRoomSettings } from '../common/controlRoom/ControlRoomSettings';
import { useControls } from '../../ControlRoomContext';
import PriceList from '../../views/partywisePriceList/PriceList';
import CopyPratywisePriceList from '../../views/partywisePriceList/copyPartyWisePriseList';
import { useTabs } from '../../TabsContext';

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
    setup: false,
  });
  const permissions = usePermission()
  const [isSidebar, setIsSidebar] = useState<boolean>(true);
  const { controlRoomSettings } = useControls();
  const {openTab} = useTabs()
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
      onClick: () => openTab?.('Ledger', <Ledger />),
      isDisabled: isNotReadAccess('ledger')
    },
    {
      url: '/groups',
      label: 'Groups',
      onClick: () => openTab?.('Groups', <Groups />),
      isDisabled: isNotReadAccess('groups')
    },
    {
      url: '/subgroups',
      label: 'Sub Groups',
      onClick: () => openTab?.('Sub Groups', <SubGroups />),
      isDisabled: isNotReadAccess('sub_groups')
    },
    {
      url: '/itemGroup',
      label: 'Item Groups',
      onClick: () => openTab?.('Item Groups', <ItemGroups />),
      isDisabled: isNotReadAccess('item_groups')
    },
    {
      url: '/items',
      label: 'Items',
      onClick: () => openTab?.('Items', <Items />),
      isDisabled: isNotReadAccess('items')
    },
    {
      url: '/stations',
      label: 'Station Setup',
      onClick: () => openTab?.('Station Setup', <Stations />),
      isDisabled: isNotReadAccess('station_setup')
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
      onClick: () => openTab?.('Sales Account', <Sales_Table type={'Sales'} />),
      isDisabled: isNotReadAccess('sales_account')
    },
    {
      url: '/sales_purchase_table',
      label: 'Purchase Account',
      onClick: () => openTab?.('Purchase Account', <Sales_Table type='Purchase' />),
      isDisabled: isNotReadAccess('purchase_account')
    },
    {
      url: '/stores',
      label: 'Store',
      onClick: () => openTab?.('Store', <Store />),
      isDisabled: isNotReadAccess('store')
    },
    {
      url: '/company',
      label: 'Company',
      icon: <FaPlus className='fill-yellow-900' />,
      onClick: () => openTab?.('Company', <Company />),
      isDisabled: isNotReadAccess('company')
    },
    {
      url: '/billBook',
      label: 'Bill Book Setup',
      onClick: () => openTab?.('Bill Book Setup', <BillBook />),
      isDisabled: isNotReadAccess('bill_book_setup')
    },
    {
      url: '/discount',
      label: 'Party-wise discount',
      icon: <FaPlus className='fill-yellow-900' />,
      onClick: () => openTab?.('Party-wise discount', <PartyWiseDiscount />),
      isDisabled: isNotReadAccess('party_wise_discount')
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
      onClick: () => openTab?.('Sale Challan', <DeliveryChallan />),
      isDisabled: isNotReadAccess('sale_challan')
    },
    {
      url: '/vouchers',
      label: 'Vouchers',
      onClick: () => openTab?.('Vouchers', <Vouchers />),
      isDisabled: isNotReadAccess('vouchers')
    }
  ];


  useEffect(() => {
    if (isGroup || isSubGroup) {
      setShowSubElements({
        master: true,
        setup: true,
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
            {menuItems.map((item, index) => {
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
        <div className='flex justify-between bg-[#EAFBFCFF] cursor-pointer text-base p-2 border border-solid border-[#009196FF]' onClick={() => openTab?.('Main Settings', <Organization />)}>
          <span className='flex items-center gap-2' >
            <MdLibraryBooks />
            {'  '}Main Settings
          </span>
          {<MdNavigateNext />}
        </div>
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
