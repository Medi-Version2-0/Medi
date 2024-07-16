import FormikInputField from '../common/FormikInputField';
interface ContactNumbersProps {
  selectedGroupName: string;
  formik?: any;
}

export const ContactNumbers: React.FC<ContactNumbersProps> = ({
  selectedGroupName,
  formik,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;
    const value = e.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (id === 'phoneNumber') {
      formik.setFieldValue('phoneNumber', filteredValue.slice(0, 15));
    }
  };
  return (
    <>
      {(selectedGroupName.toUpperCase() === 'SUNDRY CREDITORS' ||
        selectedGroupName.toUpperCase() === 'SUNDRY DEBTORS' ||
        selectedGroupName?.toUpperCase() === 'GENERAL GROUP' ||
        selectedGroupName?.toUpperCase() === 'DISTRIBUTORS, C & F') && (
        <div className='relative border border-solid border-gray-400 p-4'>
          <div className='absolute top-[-14px] left-2 px-2 w-max bg-[#f3f3f3]'>
            Contact Numbers
          </div>
          <FormikInputField
            isPopupOpen={false}
            label='Mobile'
            id='phoneNumber'
            name='phoneNumber'
            maxLength={10}
            formik={formik}
            inputClassName='!ml-0 border-l-0'
            labelClassName='mr-4 min-w-[90px]'
            onChange={handleChange}
            className='!gap-0 text-xs text-gray-600'
            isRequired={true}
            children={
              <span className='border border-solid border-gray-400 bg-gray-100 p-1 h-full select-none'>
                +91
              </span>
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                document.getElementById('phone3')?.focus();
                e.preventDefault();
              } else if (e.key === 'ArrowUp') {
                document.getElementById('phone1')?.focus();
                e.preventDefault();
              }
            }}
            showErrorTooltip={
              formik.touched.phoneNumber && formik.errors.phoneNumber
            }
          />
        </div>
      )}
    </>
  );
};
