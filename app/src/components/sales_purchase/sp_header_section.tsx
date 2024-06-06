import { SpSubSectionProps } from '../../interface/global';
import FormikInputField from '../common/FormikInputField';

export const Sp_Header_Section: React.FC<SpSubSectionProps> = ({
  type,
  formik,
}) => {
  return (
    <div className='sp_separate_section'>
      <FormikInputField
        label={`${type} Type`}
        id='spType'
        name='spType'
        formik={formik}
        className='starlabel formik_input'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('accountGroup')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.spType && formik.errors.spType}
      />
    </div>
  );
};
