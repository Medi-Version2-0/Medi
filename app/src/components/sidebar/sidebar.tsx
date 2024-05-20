import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css';
import { CiSearch } from 'react-icons/ci';
import { MdLibraryBooks, MdNavigateNext } from 'react-icons/md';
import { IoChevronDownSharp } from 'react-icons/io5';

type SubElementKey = 'master' | 'setup';

interface SidebarProps {
  isGroup?: boolean;
  isSubGroup?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isGroup = false, isSubGroup = false }) => {
  const [showSubElements, setShowSubElements] = useState({
    master: false,
    setup: false,
  });

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
    setShowSubElements(prevState => ({
      ...prevState,
      [element]: !prevState[element],
    }));
  };

  return (
    <div className='sidebar'>
      <div className='sidebar_header_content'>
        <div className='sidebar_header'>Medi App</div>
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
        {/* {(showSubElements.master || (isGroup || isSubGroup)) && ( */}
        {showSubElements.master && (
          <>
            {/* <span className='arrow_icon'>&#8614;</span> */}
            <div
              className='sidebar_sub_element'
              onClick={() => toggleSubElements('setup')}
            >
              <span>Setup</span>
              <span className='sub_menu_arrow'>
                {(showSubElements.setup )? (
                  <IoChevronDownSharp />
                ) : (
                  <MdNavigateNext />
                )}
              </span>
            </div>
            {/* {(showSubElements.setup || ( isGroup || isSubGroup)) && ( */}
            {showSubElements.setup && (
              <>
                {/* <span className='arrow_icon'>&#8614;</span> */}
                <div
                  className='sidebar_sub_2_element'
                  onClick={() => {
                    // handleClick(event);
                    return navigate(`/ledger`);
                  }}
                >
                  Ledger
                </div>
                <div
                  className='sidebar_sub_2_element'
                  onClick={() => {
                    // handleClick(event);
                    return navigate(`/groups`);
                  }}
                >
                  Groups
                </div>
                <div
                  className='sidebar_sub_2_element'
                  onClick={() => {
                    // handleClick(event);
                    return navigate(`/subgroups`);
                  }}
                >
                  Sub Groups
                </div>    
                <div
                  className='sidebar_sub_2_element'
                  onClick={() => {
                    // handleClick(event);
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
            {/* {showSubElements.master ? <IoChevronDownSharp /> : <MdNavigateNext />} */}
            {<MdNavigateNext />}
          </span>
        </div>
        <div className='sidebar_element'>
          <span className='sidebar_element_icon'>
            <MdLibraryBooks />
            {'  '}Purchase
          </span>
          <span className='sub_menu_arrow'>
            {/* {showSubElements.master ? <IoChevronDownSharp /> : <MdNavigateNext />} */}
            {<MdNavigateNext />}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
