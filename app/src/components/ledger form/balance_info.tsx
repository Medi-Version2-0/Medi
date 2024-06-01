import React from 'react';
interface BalanceInfoProps {
  accountInputValue?: string;
  formik?: any;
}

export const BalanceInfo: React.FC<BalanceInfoProps> = ({
  accountInputValue,
  formik,
}) => {
  const handleOpeningBalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      formik.setFieldValue('openingBal', value);
    }
  };

  const handleCreditDaysInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      formik.setFieldValue('creditDays', value);
    }
  };

  const resetField = (e: React.MouseEvent<HTMLInputElement>) => {
    const { id } = e.currentTarget;
    formik.setFieldValue(id, '');
  };

  return (
    <div className='ledger_balance_info'>
      <div className='balance_prefix'>Balance</div>
      <form onSubmit={formik.handleSubmit} className='balance_inputs'>
        <div className='ledger_inputs'>
          <div className='opening_bal_input'>
            <label
              htmlFor='openingBal'
              className='balance_label_name label_name_css openingBal'
            >
              Opening Balance
            </label>{'  '}₹
            <input
              type='text'
              id='openingBal'
              name='openingBal'
              placeholder='0.00'
              className='opening_bal_inputs'
              onChange={handleOpeningBalInput}
              value={formik.values.openingBal}
              onClick={resetField}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('openingBalType')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document
                    .getElementById(
                      accountInputValue?.toUpperCase() === 'CURRENT ASSETS' ||
                        accountInputValue?.toUpperCase() === 'CURRENT LIABILITIES' ||
                        accountInputValue?.toUpperCase() === 'PROVISIONS' ||
                        accountInputValue?.toUpperCase() === 'SECURED LOANS' ||
                        accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
                        accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS'
                        ? 'balancingMethod'
                        : 'parentLedger'
                    )
                    ?.focus();
                  e.preventDefault();
                }
              }}
            />
            <select
              id='openingBalType'
              name='openingBalType'
              className='opening_bal_inputs'
              onChange={formik.handleChange}
              value={formik.values.openingBalType}
              onBlur={formik.handleBlur}
              onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document
                    .getElementById(
                      accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
                        accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS'
                        ? 'creditDays'
                        : 'submit_all'
                    )
                    ?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('openingBal')?.focus();
                  e.preventDefault();
                }
              }}
            >
              <option value='CR'>CR</option>
              <option value='DR'>DR</option>
            </select>
          </div>
        </div>
        {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
          accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <>
          <div className='ledger_inputs'>
            <label
              htmlFor='creditLimit'
              className='balance_label_name label_name_css'
            >
              Credit Limit
            </label>
            <input
              type='text'
              id='creditLimit'
              name='creditLimit'
              placeholder='0'
              className='input_class'
              onChange={formik.handleChange}
              value={formik.values.creditLimit}
            />
          </div>
          <div className='ledger_inputs'>
            <label
              htmlFor='creditDays'
              className='balance_label_name label_name_css'
            >
              Credit Days
            </label>
            <input
              type='text'
              id='creditDays'
              name='creditDays'
              placeholder='0'
              className='input_class'
              maxLength={3}
              onChange={handleCreditDaysInput}
              onClick={resetField}
              value={formik.values.creditDays}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('phone1')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('openingBalType')?.focus();
                  e.preventDefault();
                }
              }}
            />
          </div>
          </>
        )}
      </form>
    </div>
  );
};
