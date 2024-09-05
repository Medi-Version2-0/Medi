import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../UserContext';
import userlogo from '../../src/assets/icons/user.png';
import { IoSettingsOutline } from 'react-icons/io5';
import { useControls } from '../ControlRoomContext';
import Button from '../components/common/button/Button';
import { generalSettingFields } from './common/controlRoom/settings';
import { ControlRoomSettings } from './common/controlRoom/ControlRoomSettings';
import { useSelector } from 'react-redux';
import { getAccessToken, saveToken } from '../auth';

export const TopBar = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [companies, setCompanies] = useState<any>([]);
  const { logout, user , selectedCompany } = useUser();
  const { organizations } = useSelector((state: any) => state.global);
  const popupRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { controlRoomSettings } = useControls();
  const apiUrl = process.env.REACT_APP_API_URL;
  const generalSettingsInitialValues = {
    gstRefundBenefit: controlRoomSettings.gstRefundBenefit || false,
    showItemSpecialRate: controlRoomSettings.showItemSpecialRate || false,
    specialSale: controlRoomSettings.specialSale || false,
    displayRackLocation: controlRoomSettings.displayRackLocation,
    rxNonrxGeneral: controlRoomSettings.rxNonrxGeneral || false,
    pricewisePartyList: controlRoomSettings.pricewisePartyList || false,
    salePriceListOptionsAllowed: controlRoomSettings.salePriceListOptionsAllowed || false,
    printPriceToRetailer: controlRoomSettings.printPriceToRetailer || false,
    removeStripOption: controlRoomSettings.removeStripOption || false,
    defaultDownloadPath: controlRoomSettings.defaultDownloadPath || false,
    itemWiseDiscount: controlRoomSettings.itemWiseDiscount || false,
  };
  const { setUser } = useUser();


  useEffect(() => {
    setCompanies(
      organizations.map((organization: any) => ({
        id: organization.id,
        name: organization.name
      }))
    );
  }, [organizations]);

  const settingsPopup = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setPopupVisible(false);
    }
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setPopupVisible(false);
      setDropdownVisible(false);
    }
  };

  const handleCompanySwitch = async(companyId: number) => {
    const response:any = await fetch(apiUrl + `/auth/switch-company`, {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + getAccessToken() ,
      },
      body: JSON.stringify({ organizationId : companyId }),
    })
    const readableData = await response.json();
    saveToken(readableData.access_token)
    setUser(readableData.data);
    window.location.reload();
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className='fixed top-1 right-0 z-10 p-1'>
      <div className='relative flex items-center'>
        <img
          className='h-12 w-12 rounded-full cursor-pointer border-2 border-gray-300 bg-cyan-100'
          src={userlogo}
          alt='profile'
          onClick={togglePopup}
        />
        {isPopupVisible && (
          <div
            ref={popupRef}
            className='absolute top-12 right-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50'
          >
            <h3 className='text-base font-bold mb-2'>Profile Options</h3>
            <ul>
              <li className='mb-1'>
                <p className='text-gray-700'>{user?.email}</p>
              </li>
              <div className='w-full flex flex-col gap-4' ref={dropdownRef} >
                <div className=''>
                  <Button
                    type='fill'
                    className='text-nowrap rounded-none'
                    handleOnClick={() => setDropdownVisible(!isDropdownVisible)}
                  >
                    Switch Company
                  </Button>
                  {isDropdownVisible && (
                    <div className='border border-solid border-[#009196FF] w-full'>
                      <ul>
                        {companies.map((company: any) => (
                          <li key={company.id}>
                            <button
                              type='button'
                              className={`text-center w-full min-w-[10vw] min-h-[5vh] hover:bg-gray-300 ${company.id === selectedCompany && 'bg-gray-200'}`}
                              onClick={() => handleCompanySwitch(company.id)}
                            >
                              {company.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  type='highlight'
                  handleOnClick={() => {
                    settingsPopup(true);
                  }}
                >
                  <IoSettingsOutline />
                </Button>
                {open && (
                  <ControlRoomSettings
                    togglePopup={settingsPopup}
                    heading={'Settings'}
                    fields={generalSettingFields}
                    initialValues={generalSettingsInitialValues}
                  />
                )}
                <button
                  type='button'
                  className='py-1 px-1 w-full inline-flex justify-center items-center border-gray-500 gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-red-500 hover:bg-red-100 hover:text-red-800 disabled:opacity-50 disabled:pointer-events-none dark:hover:bg-red-800/30 dark:hover:text-red-400'
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
