import { useEffect, useRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<SalesPurchaseFormData>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      formik: formik,
      radioField: radioField,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formik: FormikProps<SalesPurchaseFormData>
  ) => {
    const { id, value } = e.target;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      formik.setFieldValue(id, value);
    }
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
      <Formik
        innerRef={formikRef}
        initialValues={{
          sptype: data?.sptype || '',
          igst: data?.igst || '0.00',
          surCharge: data?.surCharge || '',
          shortName: data?.shortName || '',
          shortName2: data?.shortName2 || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik: FormikProps<SalesPurchaseFormData>) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-start px-4'>
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
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.sptype && formik.errors.sptype)
              }
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e, formik)
              }
              onClick={resetField}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
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
              sideField='shortName'
              nextField='shortName'
              prevField='igst'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e, formik)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
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
                handleKeyDown(e)
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
              sideField='submit_button'
              nextField='submit_button'
              prevField='shortName'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.shortName2 && formik.errors.shortName2)
              }
            />
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
                    if (
                      e.key === 'ArrowUp' ||
                      (e.shiftKey && e.key === 'Tab')
                    ) {
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
                    if (e.key === 'Tab') {
                      document.getElementById('sptype')?.focus();
                      e.preventDefault();
                    }
                    if (
                      e.key === 'ArrowUp' ||
                      (e.shiftKey && e.key === 'Tab')
                    ) {
                      document.getElementById('cancel_button')?.focus();
                    }
                  }}
                >
                  {sp_id ? 'Update' : 'Add'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};
