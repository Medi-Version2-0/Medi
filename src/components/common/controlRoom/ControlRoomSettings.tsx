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

  const handleSubmit = async (values: any) => {
    togglePopup(false);
    updateControls(values);
  };
  return (
    <Popup
      heading={heading}
      childClass='!max-h-fit !min-w-[60%]'
      className={className}
      id={`${heading.replace(/[\s/]/g, '_')}_controlSettings`}
      focusChain={['save' , 'cancel']}
      onClose={()=>togglePopup(false)}
      >
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {(formik) => (
          <Form className='flex flex-col gap-3 items-center px-2'>
            <div className='flex flex-col w-full'>
              {fields.map((field: any, index: number) => (
                <div key={index}>
                  <Field
                    name={field.name}
                    component={CustomToggleSwitch}
                    label={field.label}
                    index={index}
                    formik={formik}
                  />
                </div>
              ))}
            </div>
            <div className='flex justify-end my-4 px-4 gap-6 w-full'>
              <Button
                autoFocus={true}
                type='fog'
                id='cancel'
                handleOnClick={() => togglePopup(false)}
              >
                Cancel
              </Button>
              <Button
                id='save'
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