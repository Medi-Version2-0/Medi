import { SpSubSectionProps } from '../../interface/global';
import FormikInputField from '../common/FormikInputField';

export const Sp_Header_Section: React.FC<SpSubSectionProps> = ({
  type,
  formik,
}) => {
  return (
    <div className='flex gap-4 w-full shadow-lg my-0 p-4 text-xs text-gray-600'>
      <FormikInputField
        label={`${type} Type`}
        id='spType'
        name='spType'
        formik={formik}
        labelClassName='text-nowrap'
        className='!w-1/2'
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
