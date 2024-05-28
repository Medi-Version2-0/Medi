import React from 'react';
interface BalanceInfoProps {
  accountInputValue?: string;
  formik?:any;
}

export const BalanceInfo: React.FC<BalanceInfoProps> = ({
  accountInputValue,
  formik
}) => {

  const balancing_method_input = [
    'CURRENT ASSETS',
    'CURRENT LIABILITIES',
    'PROVISIONS',
    'SECURED LOANS',
    'SUNDRY CREDITORS',
    'SUNDRY DEBTORS',
  ];

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
    formik.setFieldValue(id,'');
  };

  return (
    <div className='ledger_balance_info'>
      <div className='balance_prefix'>Balance</div>
      <form onSubmit={formik.handleSubmit} className='balance_inputs'>
        {balancing_method_input.map((input: any, index: number) => {
          return (
            input===accountInputValue && (
              <div className='ledger_inputs' key={index}>
                <label
                  htmlFor='balancingMethod'
                  className='balance_label_name label_name_css'
                >
                  Balancing Method
                </label>
                <select
                  id='balancingMethod'
                  name='balancingMethod'
                  value={formik.values.balancingMethod}
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
                  onBlur={formik.handleBlur}
                >
                  <option value='Bill By Bill'>Bill By Bill</option>
                  <option value='On Account'>On Account</option>
                </select>
              </div>
            )
          );
        })}
          <div className='ledger_inputs'>
            <div className='opening_bal_input'>
              <label
                htmlFor='openingBal'
                className='balance_label_name label_name_css openingBal'
              >
                Opening Balance
              </label>
              <span className='opening_bal_prefix'>₹</span>
              <input
                type='text'
                id='openingBal'
                name='openingBal'
                placeholder='0.00'
                className='opening_bal_inputs'
                onChange={handleOpeningBalInput}
                value={formik.values.openingBal}
                onClick={resetField}
              />
              <select
                  id='openingBalType'
                  name='openingBalType'
                  className='opening_bal_inputs'
                  onChange={formik.handleChange}
                value={formik.values.openingBalType}
                  onBlur={formik.handleBlur}
                >
                  <option value='CR'>CR</option>
                  <option value='DR'>DR</option>
                </select>
            </div>
          </div>
        {(accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS') && (
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
              onChange={handleCreditDaysInput}
              onClick={resetField}
              value={formik.values.creditDays}
            />
          </div>
        )}
      </form>
    </div>
  );
};
