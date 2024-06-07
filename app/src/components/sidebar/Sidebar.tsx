import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import { MdLibraryBooks, MdNavigateNext } from 'react-icons/md';
import { IoChevronDownSharp } from 'react-icons/io5';
import { GoPlus } from "react-icons/go";
import { FaCircleArrowRight } from "react-icons/fa6";
import { FaCircleArrowLeft } from "react-icons/fa6";
import MenuItem from "./MenuItem";

type SubElementKey = 'master' | 'setup';

interface SidebarProps {
  isGroup?: boolean;
  isSubGroup?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isGroup = false,
  isSubGroup = false,
}) => {
  const [showSubElements, setShowSubElements] = useState({
    master: false,
    setup: false,
  });
  const [isSidebar, setIsSidebar] = useState<boolean>(true);

  const navigate = useNavigate();

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

  return (
    isSidebar ?
      (<div className='w-[215px] h-screen border relative transition-[width] duration-[0.3s] ease-[ease] pt-2.5 pb-0 px-0 border-solid border-black'>
        <div className='relative'>
          <div className='text-[2rem] text-center pb-2.5 border-b-[gray] border-[1px] border-solid'>Medi App</div>
          <span className='absolute flex items-center justify-center bg-white z-[2] text-[1.9rem] rounded-[50%] left-[93.4%] top-[33%] cursor-pointer' onClick={() => { setIsSidebar(false) }}>
            <FaCircleArrowLeft />
          </span>
          <div className='w-[92%] flex gap-[5px] mx-auto my-4'>
            <input type='text' className='w-full border px-1 py-2 rounded-[5px] border-solid border-[#ccc]' placeholder='Search...' />
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
              <MenuItem url="/ledger_table" label='Ledger' icon={<GoPlus />} onClickIcon={() => navigate('/ledger')}/>
              <MenuItem url="/groups" label='Groups'/>
              <MenuItem url="/subgroups" label='Sub Groups'/>
              <MenuItem url="/stations" label='Stations'/>
              <MenuItem url="/headquarters" label='Headquarters'/>
              <MenuItem url="/sales_purchase_table" label='Sales' icon={<GoPlus />} onClickIcon={() => navigate('/sales_purchase', {state: "Sales"})}/>
              <MenuItem url="/sales_purchase_table" label='Purchase' icon={<GoPlus />} onClickIcon={() => navigate('/sales_purchase', {state: "Purchase"})}/>
              {showSubElements.setup && (
                <>
                </>
              )}
            </>
          )}
          <div className='flex justify-between bg-[#EAFBFCFF] cursor-pointer text-base p-2 border border-solid border-[#009196FF]'>
            <span className='flex items-center gap-2'>
              <MdLibraryBooks />
              {'  '}Sales
            </span>
            {<MdNavigateNext />}
          </div>
          <div className='flex justify-between bg-[#EAFBFCFF] cursor-pointer text-base p-2 border border-solid border-[#009196FF]'>
            <span className='flex items-center gap-2'>
              <MdLibraryBooks />
              {'  '}Purchase
            </span>
            <span className=''>
              {<MdNavigateNext />}
            </span>
          </div>
        </div>
      </div>
      ) : (
        <div className="w-[35px] h-screen border transition-[width] duration-[0.3s] ease-[ease] pt-2.5 pb-0 px-0 border-solid border-[black]">
          <div className='relative h-32'>
            <span onClick={() => { setIsSidebar(true) }}
              className='absolute flex items-center justify-center bg-white z-[2] text-[1.9rem] rounded-[50%] left-[60%] top-[33%] cursor-pointer'
            >
              <FaCircleArrowRight />
            </span>
          </div>
        </div>
      )
  );
};

export default Sidebar;
