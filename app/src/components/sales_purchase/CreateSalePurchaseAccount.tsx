import { useEffect, useRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import {
  CreateSalePurchaseProps,
  SalesPurchaseFormProps,
//   Option,
  SalesPurchaseFormData,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import * as Yup from 'yup';
// import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';

export const CreateSalePurchaseAccount: React.FC<CreateSalePurchaseProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  type,
}) => {
  const { sp_id } = data;
  const formikRef = useRef<FormikProps<SalesPurchaseFormProps>>(null);
//   const [focused, setFocused] = useState('');

  const validationSchema = Yup.object({
    spType: Yup.string()
      .max(100, `${type} account name must be 100 characters or less`)
      .required(`${type} account name is required`),
  });

  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('spType')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
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
    //   focusedSetter: (field: string) => {
    //     setFocused(field);
    //   },
    });
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
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          spType: data?.spType || '',
          igst: data?.igst || '0.00',
          surCharge: data?.surCharge || '',
          shortName: data?.shortName || '',
          shortName2: data?.shortName2 || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik: FormikProps<SalesPurchaseFormData>) => (
          <Form className='flex flex-col gap-1 min-w-[18rem] items-start px-4'>
            <FormikInputField
              placeholder='Sp type'
              id='spType'
              name='spType'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && sp_id}
              nextField='igst'
              prevField='spType'
              sideField='igst'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.spType && formik.errors.spType)
              }
            />
            <FormikInputField
              placeholder='IGST %'
              id='igst'
              name='igst'
              formik={formik}
              type='number'
              className='!gap-0'
              isDisabled={isDelete && sp_id}
              nextField='surCharge'
              prevField='spType'
              sideField='surCharge'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={!!(formik.touched.igst && formik.errors.igst)}
            />
            <FormikInputField
              placeholder='Cess %'
              id='surCharge'
              name='surCharge'
              formik={formik}
              type='number'
              className='!gap-0'
              isDisabled={isDelete && sp_id}
              sideField='shortName'
              nextField='shortName'
              prevField='igst'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.surCharge && formik.errors.surCharge)
              }
            />
            <FormikInputField
              placeholder='ShortName'
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
              placeholder='ShortName2'
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
                    // setFocused('shortName2');
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
                      document.getElementById('spType')?.focus();
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
