import { SpSubSectionProps } from '../../interface/global';
import FormikInputField from '../common/FormikInputField';

export const ExtraDetailsSection: React.FC<SpSubSectionProps> = ({
  formik,
}) => {
  return (
    <div className='extra_details'>
      <div className='extra_section_heading'>Extra Details</div>
      <FormikInputField
        label='STPER'
        id='stPer'
        name='stPer'
        formik={formik}
        className='starlabel formik_input'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('accountGroup')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.stPer && formik.errors.stPer}
      />
      <FormikInputField
        label='SURCHARGE'
        id='surCharge'
        name='surCharge'
        formik={formik}
        className='starlabel formik_input'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('accountGroup')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.surCharge && formik.errors.surCharge}
      />
      <FormikInputField
        label='SP No.'
        id='spNo'
        name='spNo'
        formik={formik}
        className='starlabel formik_input'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('accountGroup')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.spNo && formik.errors.spNo}
      />
      <FormikInputField
        label='COLUMN'
        id='column'
        name='column'
        formik={formik}
        className='starlabel formik_input'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('accountGroup')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.column && formik.errors.column}
      />
      <FormikInputField
        label='SHORTNAME'
        id='shortName'
        name='shortName'
        formik={formik}
        className='starlabel formik_input'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('accountGroup')?.focus();
          }
        }}
        showErrorTooltip={formik.touched.shortName && formik.errors.shortName}
      />
      <FormikInputField
        label='SHORTNAME2'
        id='shortName2'
        name='shortName2'
        formik={formik}
        className='starlabel formik_input'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('accountGroup')?.focus();
          }
        }}
        showErrorTooltip={
          !!(formik.touched.shortName2 && formik.errors.shortName2)
        }
      />
    </div>
  );
};
