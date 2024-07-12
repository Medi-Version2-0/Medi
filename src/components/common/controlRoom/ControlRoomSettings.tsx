import React from 'react';
import { Formik, Form, Field } from 'formik';
import { ledgerSettingProps } from '../../../interface/global';
import { Popup } from '../../popup/Popup';
import Button from '../button/Button';
import CustomToggleSwitch from './CustomToggleSwitch';
import { useControls } from '../../../ControlRoomContext';

export const ControlRoomSettings = ({
  togglePopup,
  heading,
  fields,
  initialValues,
  className,
}: ledgerSettingProps) => {
  const { updateControls } = useControls();

  const handleSubmit = async (values: object) => {
    togglePopup(false);
    updateControls(values);
  };
  return (
    <Popup
      togglePopup={togglePopup}
      heading={heading}
      isControlRoomSettings={true}
      className={className}
    >
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-center px-4'>
            <div className='flex flex-col w-full'>
              {fields.map((field: any, index: number) => (
                <div key={index}>
                  <Field
                    name={field.name}
                    component={CustomToggleSwitch}
                    label={field.label}
                    index={index}
                  />
                </div>
              ))}
            </div>
            <div className='flex justify-between my-4 w-full'>
              <Button
                autoFocus={true}
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
              >
                Cancel
              </Button>
              <Button
                id='submit_button'
                type='fill'
                autoFocus
                handleOnClick={formik.handleSubmit}
              >
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};