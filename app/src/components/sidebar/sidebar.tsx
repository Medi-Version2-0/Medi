import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css';
import { CiSearch } from 'react-icons/ci';
import { MdLibraryBooks, MdNavigateNext } from 'react-icons/md';
import { IoChevronDownSharp } from 'react-icons/io5';
import { GoPlus } from "react-icons/go";
import { FaCircleArrowRight } from "react-icons/fa6";
import { FaCircleArrowLeft } from "react-icons/fa6";

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
    (<div className='sidebar'>
      <div className='sidebar_header_content'>
        <div className='sidebar_header'>Medi App</div>
        <span className='left' onClick={()=>{
          setIsSidebar(false);
        }}><FaCircleArrowLeft /></span>
        <div className='sidebar_search'>
          <input type='text' className='searchbar' placeholder='Search...' />
          <span className='search_icon'>
            <CiSearch />
          </span>
        </div>
      </div>

      <div className='sidebar_content'>
        <div
          className='sidebar_element'
          onClick={() => toggleSubElements('master')}
        >
          <span className='sidebar_element_icon'>
            <MdLibraryBooks />
            {'  '}Master
          </span>
          <span className='sub_menu_arrow'>
            {showSubElements.master ? (
              <IoChevronDownSharp />
            ) : (
              <MdNavigateNext />
            )}
          </span>
        </div>
        {showSubElements.master && (
          <>
            <div
              className='sidebar_sub_element'
              onClick={() => toggleSubElements('setup')}
            >
              <span>Setup</span>
              <span className='sub_menu_arrow'>
                {showSubElements.setup ? (
                  <IoChevronDownSharp />
                ) : (
                  <MdNavigateNext />
                )}
              </span>
            </div>
            {showSubElements.setup && (
              <>
                <div
                  className='sidebar_sub_3_element'
                >
                  <span onClick={() => {
                    return navigate(`/ledger_table`);
                  }}>Ledger</span>
                  <span className='sub_menu_arrow' onClick={() => {
                    return navigate(`/ledger`);
                  }}>
                    <GoPlus />
                  </span>
                </div>
                <div
                  className='sidebar_sub_2_element'
                  onClick={() => {
                    return navigate(`/groups`);
                  }}
                >
                  Groups
                </div>
                <div
                  className='sidebar_sub_2_element'
                  onClick={() => {
                    return navigate(`/subgroups`);
                  }}
                >
                  Sub Groups
                </div>
                <div
                  className='sidebar_sub_2_element'
                  onClick={() => {
                    return navigate(`/stations`);
                  }}
                >
                  Stations
                </div>
              </>
            )}
            <div className='sidebar_sub_element'>Sub-element 2</div>
          </>
        )}
        <div className='sidebar_element'>
          <span className='sidebar_element_icon'>
            <MdLibraryBooks />
            {'  '}Sales
          </span>
          <span className='sub_menu_arrow'>
            {<MdNavigateNext />}
          </span>
        </div>
        <div className='sidebar_element'>
          <span className='sidebar_element_icon'>
            <MdLibraryBooks />
            {'  '}Purchase
          </span>
          <span className='sub_menu_arrow'>
            {<MdNavigateNext />}
          </span>
        </div>
      </div>
    </div>)
    : <div className='empty-div'>
        <span className='left right' onClick={()=>{
          setIsSidebar(true);
        }}><FaCircleArrowRight /></span>
    </div>
  );
};

export default Sidebar;
