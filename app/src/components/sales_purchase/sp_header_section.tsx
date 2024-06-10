import { SpSubSectionProps } from '../../interface/global';
import FormikInputField from '../common/FormikInputField';

export const Sp_Header_Section: React.FC<SpSubSectionProps> = ({
  type,
  formik,
}) => {
  return (
    <div className='flex gap-4 w-full shadow-[0.313rem_0rem_0.5rem_gray] my-0 p-4'>
      <FormikInputField
        label={`${type} Type`}
        id='spType'
        name='spType'
        formik={formik}
        className='mb-0 sm:justify-between md:justify-start md:gap-[3.45rem]'
        inputContainerClassName='sm: w-[62.5%] md:w-1/3  sm:mr-[1rem] md:mr-0'
        labelClassName='text-base text-[#474747] font-normal leading-none pt-1 pb-0 px-0'
        inputClassName='input_field'
        isRequired={true}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            document.getElementById('igst')?.focus();
          }
          else if ((e.shiftKey && e.key === 'Tab') || e.key === 'ArrowUp') {
            e.preventDefault();
            document.getElementById('spType')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.spType && formik.errors.spType}
      />
    </div>
  );
};
