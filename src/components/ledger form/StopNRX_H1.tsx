import { useMemo } from 'react';
import { Option } from '../../interface/global';
import { TabManager } from '../class/tabManager';
import CustomSelect from '../custom_select/CustomSelect';
interface ContactNumbersProps {
  formik?: any;
}

export const NRXAndH1: React.FC<ContactNumbersProps> = ({
  formik,
}) => {
  const tabManager = TabManager.getInstance()
  const options = useMemo<{value:boolean , label: string}[]>(()=>{
    return [
      { value: false, label: 'No' },
      { value: true, label: 'Yes' },
    ]
  },[])

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };
  
  return (
    <>
      <div className='relative border border-solid border-gray-400 p-4'>
        <div className='absolute top-[-14px] left-2 px-2 w-max bg-[#f3f3f3]'>
          NRX & H1 item
        </div>
        <div className='flex gap-5 justify-between'>
          <CustomSelect
            isPopupOpen={false}
            label='STOP SALE OF NRX ITEM'
            labelClass='whitespace-nowrap'
            value={
              {
                label: formik.values.stopNrx ? 'Yes' : 'No',
                value: formik.values.stopNrx,
              }
            }
            id='stopNrx'
            name='stopNrx'
            onChange={handleFieldChange}
            options={options}
            isSearchable={false}
            disableArrow={false}
            hidePlaceholder={false}
            containerClass='!w-1/2'
            className='!rounded-none !h-6'
            onBlur={() => {
              formik.setFieldTouched('stopNrx', true);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                if (!dropdown) {
                  e.preventDefault()
                  e.stopPropagation()
                  tabManager.focusManager()
                }
              }
            }}
          />
          <CustomSelect
            isPopupOpen={false}
            label='STOP SALE OF H1 ITEM'
            labelClass='whitespace-nowrap'
            value={
              {
                label: formik.values.stopH1 ? 'Yes' : 'No',
                value: formik.values.stopH1,
              }
            }
            id='stopH1'
            name='stopH1'
            onChange={handleFieldChange}
            options={options}
            isSearchable={false}
            disableArrow={false}
            hidePlaceholder={false}
            containerClass='!w-1/2'
            className='!rounded-none !h-6'
            onBlur={() => {
              formik.setFieldTouched('stopH1', true);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
              const dropdown = document.querySelector('.custom-select__menu');
              if (e.key === 'Enter') {
                if (!dropdown) {
                  e.preventDefault()
                  e.stopPropagation()
                  tabManager.focusManager()
                }
              }
            }}
          />
        </div>
      </div>
    </>
  );
};
