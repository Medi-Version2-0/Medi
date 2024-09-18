import '../../../index.css';
import useToastManager from '../../../helper/toastManager';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const   CustomToggleSwitch = ({ field, form, label, index, formik }: any) => {
  const { successToast } = useToastManager();
  const {controlRoomSettings} = useSelector((state:any)=>state.global)

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    const id = e.currentTarget.id;
    let numericInput = input.replace(/[^0-9.]/g, '');
    const decimalCount = (numericInput.match(/\./g) || []).length;
    if (decimalCount > 1) {
      numericInput = numericInput.replace(/\.(?=.*\.)/, '');
    }
    formik.setFieldValue(id, numericInput);
  };

  const handleSalesPriceLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    const id = e.currentTarget.id;
    const numericInput = input.replace(/[^0-9.]/g, '');
    if (parseInt(numericInput, 10) > 5) {
      successToast('Maximum limit is 5');
      formik.setFieldValue(id, '');
    } else {
      formik.setFieldValue(id, numericInput);
    }
  };

  const handleToggleChange = () => {
    const newValue = !field.value;
    form.setFieldValue(field.name, newValue);
    if (field.name === 'dpcoAct' && !newValue) {
      form.setFieldValue('dpcoDiscount', 0);
    }
    if (field.name === 'multiPriceList' && !newValue) {
      form.setFieldValue('salesPriceLimit', 0);
    }
    if (field.name === 'decimalValue' && !newValue) {
      form.setFieldValue('decimalValueCount',2);
    }
  };

  const handleDecimalValueChange = (value: number) => {
    formik.setFieldValue('decimalValueCount', value);
  };
  useEffect(() => {
    if(field.name === 'decimalValue'){
      formik.setFieldValue('decimalValueCount', controlRoomSettings.decimalValueCount, 2);
    }
  }, [])
  

  return (
    <div
      className={`flex flex-col w-full ${index !== 0 ? 'border-t-0' : ''}`}
    >
      <div className={`flex flex-row justify-between items-center border-[1px] border-solid border-[#009196FF] pr-4 ${field.name === 'dpcoAct' && formik.values.dpcoAct && 'border-b-0'} ${field.name === 'multiPriceList' && formik.values.multiPriceList && 'border-b-0'}`}>
        <span className='ml-[0.7rem] w-[70%] p-2 border-r-[1px] border-solid border-[#009196FF]'>
          {label}
        </span>
        {field.name === 'numberOfCopiesInInvoice' ? (
          <label className='w-[12rem] h-[1.3rem]'>
            <input
              id='numberOfCopiesInInvoice'
              name='numberOfCopiesInInvoice'
              type='text'
              value={formik.values.numberOfCopiesInInvoice}
              className='input-class w-full h-full text-right border-none outline-none pr-4'
              onChange={handleDiscountChange}
              required
            />
          </label>
        ) : (
          <label className='relative inline-block w-[3rem] h-[1.3rem]'>
            <input
              type='checkbox'
              {...field}
              name={field.name}
              checked={field.value}
              onChange={handleToggleChange}
              className='opacity-0 w-0 h-0 p-2'
            />
            <span className='slider round rounded-[34px] before:rounded-[50%]'></span>
          </label>
        )}
      </div>
      {field.name === 'dpcoAct' && formik.values.dpcoAct && (
        <div className='flex flex-row justify-between items-center border-[1px] border-t-0 border-solid border-[#009196FF] pr-4 bg-[#EAFBFC]'>
          <span className='ml-[0.7rem] w-[70%] p-2 border-r-[1px] border-solid border-[#009196FF]'>
            Discount
          </span>
          <label className='w-[12vw] h-[1.3rem]'>
            <input
              id='dpcoDiscount'
              name='dpcoDiscount'
              type='text'
              value={formik.values.dpcoDiscount}
              placeholder='Enter discount'
              className='input-class w-full h-full text-right border-none outline-none px-2 bg-[#EAFBFC]'
              onChange={handleDiscountChange}
              required
            />
          </label>
        </div>
      )}
      {field.name === 'multiPriceList' && formik.values.multiPriceList && (
        <div className={`flex flex-row justify-between items-center border-[1px] border-solid border-[#009196FF] bg-[#EAFBFC] pr-4 border-t-0`}>
          <span className='ml-[0.7rem] w-[70%] p-2 border-r-[1px] border-solid border-[#009196FF]'>
            Number of sale price list required
          </span>
          <label className='w-[12vw] h-[1.3rem]'>
            <input
              id='salesPriceLimit'
              name='salesPriceLimit'
              type='text'
              value={formik.values.salesPriceLimit}
              placeholder='Enter SalesPrice Limit'
              className='input-class w-full h-full text-right border-none outline-none px-2 bg-[#EAFBFC]'
              onChange={handleSalesPriceLimitChange}
              required
            />
          </label>
        </div>
      )}
      {field.name === 'decimalValue' && formik.values.decimalValue && (
        <div className={`flex flex-col border-[1px] border-solid border-[#009196FF] bg-[#EAFBFC] pr-4 border-t-0`}>
          <div className='flex flex-row justify-between items-center'>
            <span className='ml-[0.7rem] w-[70%] p-2 border-r-[1px] border-solid border-[#009196FF]'>
              How many Numbers you want after decimal
            </span>
          <div className='flex flex-row justify-start items-center p-2'>
            <label className='flex items-center mr-4'>
              <input
                type='radio'
                name='decimalValueCount'
                value={2}
                checked={formik.values.decimalValueCount === 2}
                onChange={() => handleDecimalValueChange(2)}
                className='mr-2'
              />
              <span>2</span>
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                name='decimalValueCount'
                value={4}
                checked={formik.values.decimalValueCount === 4}
                onChange={() => handleDecimalValueChange(4)}
                className='mr-2'
              />
              <span>4</span>
            </label>
          </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomToggleSwitch;
