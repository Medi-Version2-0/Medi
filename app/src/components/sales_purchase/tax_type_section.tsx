import { SpSubSectionProps } from '../../interface/global';
import FormikInputField from '../common/FormikInputField';

export const TaxTypeSection: React.FC<SpSubSectionProps> = ({ formik }) => {
  const handleIGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      formik.setFieldValue(id, value);
      const igstValue = parseFloat(value);
      formik.setFieldValue('cgst', igstValue / 2);
      formik.setFieldValue('sgst', igstValue / 2);
    }
  };

  const resetField = (e: React.MouseEvent<HTMLInputElement>) => {
    const inputElement = e.currentTarget;
    inputElement.setSelectionRange(0, inputElement.value.length);
  };

  return (
    <div className='tax_type_section'>
      <div className='tax_section_heading'>Tax Type</div>

      <FormikInputField
        label='IGST%'
        id='igst'
        name='igst'
        type='text'
        placeholder='0.00'
        formik={formik}
        className='formik_input'
        onChange={handleIGSTChange}
        onClick={resetField}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('phone1')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('openingBalType')?.focus();
            e.preventDefault();
          }
        }}
        showErrorTooltip={formik.touched.igst && formik.errors.igst}
      />

      <FormikInputField
        label='CGST%'
        id='cgst'
        name='cgst'
        type='text'
        placeholder='0.00'
        formik={formik}
        className='formik_input'
        onChange={() => {}}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('phone1')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('openingBalType')?.focus();
            e.preventDefault();
          }
        }}
        showErrorTooltip={formik.touched.cgst && formik.errors.cgst}
      />

      <FormikInputField
        label='SGST%'
        id='sgst'
        name='sgst'
        type='text'
        placeholder='0.00'
        formik={formik}
        className='formik_input'
        onChange={() => {}}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter') {
            document.getElementById('phone1')?.focus();
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            document.getElementById('openingBalType')?.focus();
            e.preventDefault();
          }
        }}
        showErrorTooltip={formik.touched.sgst && formik.errors.sgst}
      />
    </div>
  );
};
