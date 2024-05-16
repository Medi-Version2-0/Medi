import { useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import { CreateGroupProps, GroupFormDataProps } from '../../interface/global';
import { Popup } from '../helpers/popup';
import '../stations/stations.css';

export const CreateGroup: React.FC<CreateGroupProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { group_code } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const focusTarget = inputRef.current && !isDelete
        ? inputRef.current
        : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const validationSchema = Yup.object({
    group_name: Yup.string()
      .required('Group name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
      .matches(
        /^[a-zA-Z0-9\s_.-]*$/,
        'Group name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Group name cannot exceeds 100 characters'),
  });

  const handleSubmit = async (values: object) => {
    const formData = group_code ? { ...values, group_code: group_code } : values;
    !group_code && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<GroupFormDataProps>
  ) => {
    const key = e.key;
    switch (key) {
      case 'ArrowDown':
      case 'Enter':
        {
          const nextField =
            e.currentTarget.getAttribute('data-next-field') || '';
          document.getElementById(nextField)?.focus();
          e.preventDefault();
        }
        break;
      case 'ArrowUp':
        {
          const prevField =
            e.currentTarget.getAttribute('data-prev-field') || '';
          document.getElementById(prevField)?.focus();
          e.preventDefault();
        }
        break;
      case 'Tab':
        {
          const sideField =
            e.currentTarget.getAttribute('data-side-field') || '';
          formik && formik.setFieldValue('type', sideField);
          document.getElementById(sideField)?.focus();
          e.preventDefault();
        }
        break;
      default:
        break;
    }
  };

  return (
    <Popup
      togglePopup={togglePopup}
      headding={
        group_code && isDelete
          ? 'Delete Group'
          : group_code
            ? 'Update Group'
            : 'Create Group'
      }
    >
      <Formik
        initialValues={{
          group_name: data?.group_name || '',
          type: data?.type || ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='account-form'>
            <div className='inputs'>
              <Field
                type='text'
                id='group_name'
                name='group_name'
                placeholder='Group name'
                disabled={isDelete && group_code}
                className={`input-field ${formik.touched.group_name && formik.errors.group_name ? 'error-field' : ''}`}
                innerRef={inputRef}
                data-side-field='p_and_l'
                data-next-field='p_and_l'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
              />
              <ErrorMessage
                name='group_name'
                component='div'
                className='error'
              />
            </div>
            <div
              style={{
                marginBottom: '0.6rem',
                display: 'flex',
                height: '2.2rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.8rem',
                borderRadius: '0.4rem',
                border: '1px solid #c1c1c1',
                padding: '0.4rem',
              }}
            >
              <label
                className={`credit-type ${group_code && isDelete ? 'disabled' : ''}`}
              >
                <Field
                  type='radio'
                  name='type'
                  value='p&l'
                  id='p_and_l'
                  checked={formik.values.type === 'p&l'}
                  disabled={group_code && isDelete}
                  data-next-field='submit_button'
                  data-side-field='balance_sheet'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e, formik)
                  }
                />
                P & L
              </label>
              <label
                className={`credit-type ${group_code && isDelete ? 'disabled' : ''}`}
              >
                <Field
                  type='radio'
                  name='type'
                  value='balance sheet'
                  id='balance_sheet'
                  checked={formik.values.type === 'balance sheet'}
                  disabled={group_code && isDelete}
                  data-next-field='submit_button'
                  data-side-field='p_and_l'
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(e, formik)
                  }
                />
                Bl. Sheet
              </label>
            </div>
            
            <div className='modal-actions'>
              <button
                autoFocus
                id='cancel_button'
                className='acc_button'
                onMouseDown={() => togglePopup(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    togglePopup(false);
                  }
                }}
              >
                Cancel
              </button>
              {isDelete ? (
                <button
                  id='del_button'
                  className='account_add_button'
                  onClick={() => group_code && deleteAcc(group_code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </button>
              ) : (
                <button
                  id='submit_button'
                  className='account_add_button'
                  type='submit'
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      document.getElementById('station_name')?.focus();
                      e.preventDefault();
                    }
                  }}
                >
                  {group_code ? 'Update' : 'Add'}
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};
