import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

interface BalanceInfoProps {
  accountInputValue?: string;
}

export const BalanceInfo: React.FC<BalanceInfoProps> = ({
  accountInputValue,
}) => {
  const [selectedBalancingMethod, setSelectedBalancingMethod] = useState('');
  const [selectedOpeningBalType, setSelectedOpeningBalType] = useState('');

  const balancing_method_input = [
    'CURRENT ASSETS',
    'CURRENT LIABILITIES',
    'PROVISIONS',
    'SECURED LOANS',
    'SUNDRY CREDITORS',
    'SUNDRY DEBTORS',
  ];

  const handleInputChange = (e: { target: { value: any; id: any } }) => {
    const value = e.target.value;
    const id = e.target.id;
    console.log('value: ', e, id, value);

    if (e.target.id === 'balancingMethod') {
        setSelectedBalancingMethod(e.target.value);
    }else if (e.target.id === 'openingBalType') {
        setSelectedOpeningBalType(e.target.value);
      }
  };

  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

  const formik = useFormik({
    initialValues: {
      openingBal: '',
      creditDays: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

  return (
    <div className='ledger_balance_info'>
      <div className='balance_prefix'>Balance</div>
      <form onSubmit={formik.handleSubmit} className='balance_inputs'>
        {balancing_method_input.map((input: any) => {
          return (
            input===accountInputValue && (
              <div className='ledger_inputs'>
                <label
                  htmlFor='balancingMethod'
                  className='balance_label_name label_name_css'
                >
                  Balancing Method
                </label>
                <select
                  id='balancingMethod'
                  name='balancingMethod'
                //   className='input_class'
                  value={selectedBalancingMethod}
                  onChange={handleInputChange}
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
                className='opening_bal_inputs'
                onChange={formik.handleChange}
                value={formik.values.openingBal}
              />
              <select
                  id='openingBalType'
                  name='openingBalType'
                  className='opening_bal_inputs'
                  value={selectedOpeningBalType}
                  onChange={handleInputChange}
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
              className='input_class'
              onChange={formik.handleChange}
              value={formik.values.creditDays}
            />
          </div>
        )}
      </form>
    </div>
  );
};
