import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import Sidebar from '../sidebar/sidebar';
import './ledger_form.css';
import { GeneralInfo } from './general_info';
import { BalanceInfo } from './balance_info';
import { useEffect, useRef, useState } from 'react';
import { ContactsInfo } from './contacts_info';
import { BankDetails } from './bank_details';
import { ContactDetails } from './contact_details';
import { LicenceInfo } from './licence_info';
import { TaxDetails } from './tax_details';

const initialValue = {
  btn_1: false,
  btn_2: false,
  btn_3: false,
  btn_4: false,
};

export const Ledger = () => {
  const [valueFromGeneral, setValueFromGeneral] = useState('');
  const [showActiveElement, setShowActiveElement] = useState(initialValue);

  const handleValueChange = (value: any) => {
    console.log('inside ledger form value ===> ', value);
    setValueFromGeneral(value);
  };

  const prevClass = useRef('');

  const handleClick = (clickedClass: any) => {
    setShowActiveElement({ ...initialValue, [prevClass.current]: false });

    const currentActiveBtns = document.getElementsByClassName('active');
    if (currentActiveBtns.length > 0) {
      currentActiveBtns[0].classList.remove('active');
    }
    const clickedElements = document.getElementsByClassName(clickedClass);
    if (clickedElements.length > 0) {
      clickedElements[0].classList.add('active');
    }
    setShowActiveElement({ ...initialValue, [clickedClass]: true });
    prevClass.current = clickedClass;
  };

  useEffect(() => {
    handleClick('btn_1');
  }, []);

  return (
    <>
      <div className='ledger_content'>
        <div className='ledger_sidebar'>
          <Sidebar isGroup={true} isSubGroup={false} />
        </div>
        <div className='ledger_container'>
          <div id='ledger_main'>
            <h1 id='ledger_header'>Create Party</h1>
            <button
              id='ledger_button'
              className='ledger_button'
            >
              Back
            </button>
          </div>

          <div className='middle_form'>
            <GeneralInfo onValueChange={handleValueChange} />
            <div className='ledger_general_details'>
              <BalanceInfo accountInputValue={valueFromGeneral} />
              <ContactsInfo accountInputValue={valueFromGeneral} />
            </div>
          </div>

          {(valueFromGeneral === 'SUNDRY CREDITORS' ||
            valueFromGeneral === 'SUNDRY DEBTORS') && (
            <div className='middle_form_2'>
              <div className='middle_form_2_buttons'>
                <div className='buttons'>
                  <button
                    className='btn btn_1 active'
                    onClick={() => handleClick('btn_1')}
                  >
                    GST/Tax Details
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_2'
                    onClick={() => handleClick('btn_2')}
                  >
                    Licence Info
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_3'
                    onClick={() => handleClick('btn_3')}
                  >
                    Contact Info
                  </button>
                </div>
                <div className='buttons'>
                  <button
                    className='btn btn_4'
                    onClick={() => handleClick('btn_4')}
                  >
                    Bank Details
                  </button>
                </div>
              </div>
              <div className='middle_form_2_content'>
                {showActiveElement.btn_1 && <TaxDetails />}
                {showActiveElement.btn_2 && <LicenceInfo />}
                {showActiveElement.btn_3 && <ContactDetails />}
                {showActiveElement.btn_4 && <BankDetails />}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
