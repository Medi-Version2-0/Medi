import { SpSubSectionProps } from '../../interface/global';
import FormikInputField from '../common/FormikInputField';

export const TaxTypeSection: React.FC<SpSubSectionProps> = ({ formik }) => {
  const handleIGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      formik.setFieldValue(id, value);
      const igstValue = parseFloat(value);
      if(!isNaN(igstValue)){
        formik.setFieldValue('cgst', igstValue / 2);
        formik.setFieldValue('sgst', igstValue / 2);
      }
      else {
        formik.setFieldValue('igst', '0.00');
        formik.setFieldValue('cgst', '0.00');
        formik.setFieldValue('sgst', '0.00');
      }
    }
  };

  const resetField = (e: React.MouseEvent<HTMLInputElement>) => {
    const inputElement = e.currentTarget;
    inputElement.setSelectionRange(0, inputElement.value.length);
  };

  return (
    <div className='relative border sm:w-full md:w-2/5 h-full p-4 border-solid border-[gray]'>
      <div className='absolute top-[-0.8rem] inline-block text-base text-black px-1 py-0 left-1 bg-[#f3f3f3]'>Tax Type</div>

      <FormikInputField
        label='IGST%'
        id='igst'
        name='igst'
        type='text'
        placeholder='0.00'
        formik={formik}
        isRequired={true}
        labelClassName='text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field text-right'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onChange={handleIGSTChange}
        onClick={resetField}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('cgst')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('spType')?.focus();
          }
        }}
      />

      <FormikInputField
        label='CGST%'
        id='cgst'
        name='cgst'
        type='text'
        placeholder='0.00'
        formik={formik}
        isRequired={true}
        labelClassName='text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field text-right'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onChange={() => {}}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('sgst')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('igst')?.focus();
          }
        }}
      />

      <FormikInputField
        label='SGST%'
        id='sgst'
        name='sgst'
        type='text'
        placeholder='0.00'
        formik={formik}
        isRequired={true}
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field text-right'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onChange={() => {}}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('stPer')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('cgst')?.focus();
          }
        }}
      />
    </div>
  );
};
