import { useRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import {
  CreateStoreProps,
  StoreFormDataProps,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import Button from '../../components/common/button/Button';
import FormikInputField from '../../components/common/FormikInputField';
import { storeValidationSchema } from './validation_schema';
import { createStoreFieldsChain, deleteStoreFieldsChain } from '../../constants/focusChain/storeFocusChain';

export const CreateStore: React.FC<CreateStoreProps> = ({
  togglePopup,
  data,
  handleConfirmPopup,
  handleDeleteFromForm,
  isDelete,
  className,
}) => {
  const { store_code } = data;
  // const formikRef = useRef<FormikProps<StoreFormDataProps>>(null);

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(store_code && { store_code }),
    };
    handleConfirmPopup(formData);
  };

  function closePopup() {
    togglePopup(false);
  }

  return (
    <Popup
      onClose={closePopup}
      togglePopup={togglePopup}
      id='createStorePopup'
      focusChain={isDelete ? deleteStoreFieldsChain : createStoreFieldsChain}
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
        // innerRef={formikRef}
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
              isUpperCase={true}
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
              showErrorTooltip={
                !!(formik.touched.store_name && formik.errors.store_name)
              }
            />
            <FormikInputField
              label='Address line1'
              id='address1'
              isUpperCase={true}
              name='address1'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
            />
            <FormikInputField
              label='Address line2'
              isUpperCase={true}
              id='address2'
              name='address2'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
            />
            <FormikInputField
              label='Address line3'
              isUpperCase={true}
              id='address3'
              name='address3'
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && store_code}
            />
            <div className='flex justify-between my-4 w-full'>
              <Button
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
              >
                Cancel
              </Button>
              {isDelete ? (
                <Button
                  id='del_button'
                  type='fill'
                  btnType='button'
                  padding='px-4 py-2'
                  handleOnClick={handleDeleteFromForm}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  id='save'
                  type='fill'
                  disable={formik.isSubmitting || !formik.isValid}
                  padding='px-8 py-2'
                  autoFocus={true}
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
