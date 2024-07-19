import { useEffect, useRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import {
  CreateStoreProps,
  StoreFormData,
  StoreFormDataProps,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import Button from '../../components/common/button/Button';
import onKeyDown from '../../utilities/formKeyDown';
import FormikInputField from '../../components/common/FormikInputField';
import { storeValidationSchema } from './validation_schema';

export const CreateStore: React.FC<CreateStoreProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
  className,
}) => {
  const { store_code } = data;
  const formikRef = useRef<FormikProps<StoreFormDataProps>>(null);


  useEffect(() => {
    const focusTarget = !isDelete
      ? document.getElementById('store_name')
      : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(store_code && { store_code }),
    };
    !store_code && document.getElementById('cancel_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<StoreFormData>
  ) => {
    onKeyDown({
      e,
      formik: formik,
    });
  };

  return (
    <Popup
      togglePopup={togglePopup}
      heading={
        store_code && isDelete
          ? 'Delete Store'
          : store_code
            ? 'Update Store'
            : 'Create Store'
      }
      className={className}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          store_name: data?.store_name || '',
          address1: data?.address1 || '',
          address2: data?.address2 || '',
          address3: data?.address3 || '',
        }}
        validationSchema={storeValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-start px-4'>
            <FormikInputField
              label='store Name'
              id='store_name'
              name='store_name'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
              nextField='address1'
              prevField='store_name'
              sideField='address1'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
              showErrorTooltip={
                !!(formik.touched.store_name && formik.errors.store_name)
              }
            />
            <FormikInputField
              label='Address line1'
              id='address1'
              name='address1'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
              nextField='address2'
              prevField='store_name'
              sideField='address2'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
            />
            <FormikInputField
              label='Address line2'
              id='address2'
              name='address2'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
              nextField='address3'
              prevField='address1'
              sideField='address3'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
            />
            <FormikInputField
              label='Address line3'
              id='address3'
              name='address3'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
              nextField='submit_button'
              prevField='address2'
              sideField='cancel_button'
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e)
              }
            />
            <div className='flex justify-between my-4 w-full'>
              <Button
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
                handleOnKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
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
                    document.getElementById('address3')?.focus();
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
                  handleOnClick={() => store_code && deleteAcc(store_code)}
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
                      document.getElementById('store_name')?.focus();
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
                  {store_code ? 'Update' : 'Add'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};
