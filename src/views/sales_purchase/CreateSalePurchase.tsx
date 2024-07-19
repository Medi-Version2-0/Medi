import { useEffect, useRef, useState } from 'react';
import { useFormik, FormikProps } from 'formik';
import {
  CreateSalePurchaseProps,
  SalesPurchaseFormProps,
  SalesPurchaseFormData,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import * as Yup from 'yup';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';

export const CreateSalePurchase = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  type,
  className,
}: CreateSalePurchaseProps) => {
  const { sp_id } = data;
  const formikRef = useRef<FormikProps<SalesPurchaseFormProps>>(null);
  const [focused, setFocused] = useState('');

  const validationSchema = Yup.object({
    sptype: Yup.string()
      .max(100, `${type} account name must be 100 characters or less`)
      .required(`${type} account name is required`),
    igst: Yup.number()
      .min(1, 'IGST must be greater than 0')
      .required('IGST is required'),
    surCharge: Yup.number().required('Cess% is required'),
    shortName: Yup.string()
      .max(20, `Short name must be 20 characters or less`)
      .required(`Short name is required`),
  });

  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('sptype')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const handleSubmit = async (values: any) => {
    const formattedigst = parseFloat(values.igst).toFixed(2);
    const formattedsurcharge = parseFloat(values.surCharge).toFixed(2);
    const formData = {
      ...values,
      igst: formattedigst,
      surCharge: formattedsurcharge,
      ...(sp_id && { sp_id }),
    };
    !sp_id && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const formik = useFormik<SalesPurchaseFormData>({
    innerRef: formikRef,
    initialValues: {
      sptype: data?.sptype || '',
      igst: data?.igst || '',
      surCharge: data?.surCharge || '',
      shortName: data?.shortName || '',
      shortName2: data?.shortName2 || '',
      openingBal: data?.openingBal || '',
      openingBalType: data?.openingBal || '',
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<SalesPurchaseFormData>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      formik: formik,
      radioField: radioField,
      focusedSetter: (field: string) => {
        setFocused(field);
      },
    });

  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      formik.setFieldValue(id, value);
    }
    if (id === 'openingBal') {
      if (filteredValue.length <= 12) {
        formik.setFieldValue('openingBal', filteredValue);
      } else {
        formik.setFieldValue('openingBal', filteredValue.slice(0, 12));
      }
    }
  };

  const handleFieldChange = (option: Option | null) => {
    formik.setFieldValue('openingBalType', option?.value);
  };

  const resetField = (e: React.MouseEvent<HTMLInputElement>) => {
    const inputElement = e.currentTarget;
    inputElement.setSelectionRange(0, inputElement.value.length);
  };

  return (
    <Popup
      togglePopup={togglePopup}
      heading={
        sp_id && isDelete
          ? `Delete ${type} Account`
          : sp_id
            ? `Update ${type} Account`
            : `Add ${type} Account`
      }
      className={className}
    >
      <form
        onSubmit={formik.handleSubmit}
        className='flex flex-col gap-3 min-w-[18rem] items-start px-4'
      >
        <FormikInputField
          label='Sp Type'
          id='sptype'
          name='sptype'
          formik={formik}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          nextField='igst'
          prevField='sptype'
          sideField='igst'
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(e, formik)
          }
          showErrorTooltip={!!(formik.touched.sptype && formik.errors.sptype)}
        />
        <FormikInputField
          label='IGST %'
          id='igst'
          name='igst'
          formik={formik}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          nextField='surCharge'
          prevField='sptype'
          sideField='surCharge'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          onClick={resetField}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(e, formik)
          }
          showErrorTooltip={!!(formik.touched.igst && formik.errors.igst)}
        />
        <FormikInputField
          label='Cess %'
          id='surCharge'
          name='surCharge'
          formik={formik}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          nextField='shortName'
          prevField='igst'
          sideField='shortName'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(e, formik)
          }
          showErrorTooltip={
            !!(formik.touched.surCharge && formik.errors.surCharge)
          }
        />
        <FormikInputField
          label='ShortName'
          id='shortName'
          name='shortName'
          formik={formik}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          sideField='shortName2'
          nextField='shortName2'
          prevField='surCharge'
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(e, formik)
          }
          showErrorTooltip={
            !!(formik.touched.shortName && formik.errors.shortName)
          }
        />
        <FormikInputField
          label='shortName2'
          id='shortName2'
          name='shortName2'
          formik={formik}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          sideField='openingBal'
          nextField='openingBal'
          prevField='shortName'
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(e, formik)
          }
          showErrorTooltip={
            !!(formik.touched.shortName2 && formik.errors.shortName2)
          }
        />
        <div className='flex flex-row gap-2 items-center w-full'>
          <FormikInputField
            label={`Opening Balance ₹`}
            id='openingBal'
            name='openingBal'
            formik={formik}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(e, formik)
            }
            className='!mb-0'
            inputClassName='h-9 text-right'
            labelClassName='w-fit text-nowrap'
            sideField='openingBalType'
            prevField='shortName2'
            nextField='openingBalType'
            maxLength={12}
            placeholder='0.00'
            onClick={resetField}
            showErrorTooltip={
              !!(formik.touched.openingBal && formik.errors.openingBal)
            }
          />
          <CustomSelect
            isPopupOpen={false}
            value={
              formik.values.openingBalType === ''
                ? null
                : {
                    label: formik.values.openingBalType,
                    value: formik.values.openingBalType,
                  }
            }
            id='openingBalType'
            onChange={handleFieldChange}
            isFocused={focused === 'openingBalType'}
            options={[
              { value: 'Cr', label: 'Cr' },
              { value: 'Dr', label: 'Dr' },
            ]}
            isSearchable={false}
            placeholder='Type'
            disableArrow={false}
            hidePlaceholder={false}
            containerClass='!w-1/3'
            className='!rounded-none !h-6'
            onBlur={() => {
              formik.setFieldTouched('openingBalType', true);
              setFocused('');
            }}
            onKeyDown={(
              e: React.KeyboardEvent<HTMLSelectElement>
            ) => {
              const dropdown = document.querySelector(
                '.custom-select__menu'
              );
              if (e.key === 'Enter') {
                !dropdown && e.preventDefault();
                document.getElementById('submit_button')?.focus();
              }
            }}
          />
        </div>
        <div className='flex justify-between my-4 w-full'>
          <Button
            type='fog'
            id='cancel_button'
            handleOnClick={() => togglePopup(false)}
            handleOnKeyDown={(e) => {
              if (e.key === 'Tab') {
                document
                  .getElementById(
                    `${isDelete ? 'del_button' : 'submit_button'}`
                  )
                  ?.focus();
                e.preventDefault();
              }
              if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                e.preventDefault();
              document.getElementById(`${isDelete ? 'cancel_button' : 'sptype'}`)?.focus();
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                togglePopup(false);
              }
            }}
          >
            Cancel
          </Button>
          {isDelete ? (
            <Button
              id='del_button'
              type='fill'
              padding='px-4 py-2'
              handleOnClick={() => sp_id && deleteAcc(sp_id)}
              handleOnKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                }
                if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                  document.getElementById('cancel_button')?.focus();
                }
              }}
            >
              Delete
            </Button>
          ) : (
            <Button
              id='submit_button'
              type='fill'
              padding='px-8 py-2'
              autoFocus={true}
              handleOnKeyDown={(e) => {
                if (e.key === 'Tab' || (!formik.isValid && e.key === 'Enter')) {
                  document.getElementById('sptype')?.focus();
                  e.preventDefault();
                }
                if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'Tab')) {
                  document.getElementById('cancel_button')?.focus();
                }
              }}
            >
              {sp_id ? 'Update' : 'Add'}
            </Button>
          )}
        </div>
      </form>
    </Popup>
  );
};
