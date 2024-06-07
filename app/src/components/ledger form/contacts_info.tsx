import FormikInputField from '../common/FormikInputField';
interface ContactsInfoProps {
  accountInputValue?: string;
  formik?: any;
}

export const ContactsInfo: React.FC<ContactsInfoProps> = ({
  accountInputValue,
  formik,
}) => {
  return (
    <>
      {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
        accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
        <div className='ledger_contacts_info'>
          <div className='contacts_prefix'>Contact Numbers</div>
          <div className='contact_inputs'>
            <div className='contact_ledger_inputs starlabel'>
              <FormikInputField
                label='Mobile 1'
                id='phoneNumber'
                name='phoneNumber'
                maxLength={10}
                formik={formik}
                children={<span className='mobile_prefix'>+91</span>}
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
          </div>
        </div>
      )}
    </>
  );
};
