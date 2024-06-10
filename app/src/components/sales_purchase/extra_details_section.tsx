import { SpSubSectionProps } from '../../interface/global';
import FormikInputField from '../common/FormikInputField';

export const ExtraDetailsSection: React.FC<SpSubSectionProps> = ({
  formik,
}) => {
  return (
    <div className='relative border sm:w-full md:w-3/5 h-full p-4 border-solid border-[gray]'>
      <div className='absolute top-[-0.8rem] inline-block text-base text-black px-1 py-0 left-1 bg-[#f3f3f3]'>Extra Details</div>
      <FormikInputField
        label='StPer'
        id='stPer'
        name='stPer'
        formik={formik}
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('surCharge')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('sgst')?.focus();
          }
        }}
      />
      <FormikInputField
        label='SurCharge'
        id='surCharge'
        name='surCharge'
        formik={formik}
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('spNo')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('stPer')?.focus();
          }
        }}
      />
      <FormikInputField
        label='Sp No.'
        id='spNo'
        name='spNo'
        formik={formik}
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('column')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('surCharge')?.focus();
          }
        }}
      />
      <FormikInputField
        label='Column'
        id='column'
        name='column'
        formik={formik}
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('shortName')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('spNo')?.focus();
          }
        }}
      />
      <FormikInputField
        label='ShortName'
        id='shortName'
        name='shortName'
        formik={formik}
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('shortName2')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('column')?.focus();
          }
        }}
      />
      <FormikInputField
        label='ShortName2'
        id='shortName2'
        name='shortName2'
        formik={formik}
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field'
        className='justify-between'
        inputContainerClassName='w-2/3'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('submit_all')?.focus();
          } else if ((e.key === 'ArrowUp') || (e.shiftKey && e.key === 'Tab')) {
            e.preventDefault();
            document.getElementById('shortName')?.focus();
          }
        }}
      />
    </div>
  );
};
