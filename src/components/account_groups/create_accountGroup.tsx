import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import { CreateAccountGroupProps, FormDataProps } from '../../interface/global';
import { Popup } from '../popup/Popup';
import '../stations/stations.css';
import { sendAPIRequest } from '../../helper/api';

export const CreateGroup: React.FC<CreateAccountGroupProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { head_code } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<any>([]);

  const [parentCode, setParentCode] = useState(data?.parent_code || '');
  const [inputValue, setInputValue] = useState(
    data?.group_details?.group_name || ''
  );
  const [groupData, setGroupData] = useState([]);
  const getGroups = async () => {
    setGroupData(await sendAPIRequest(`/group/sub`));
  };

  useEffect(() => {
    getGroups();
    setInputValue(
      data?.group_details?.group_name ? data?.group_details?.group_name : ''
    );
  }, []);

  useEffect(() => {
    const focusTarget =
      inputRef.current && !isDelete
        ? inputRef.current
        : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const validationSchema = Yup.object({
    head_name: Yup.string()
      .required('Head name is required')
      .matches(/[a-zA-Z]/, 'Only Numbers not allowed')
      .matches(
        /^[a-zA-Z0-9\s_-]*$/,
        'Head name can contain alphanumeric characters, "-", "_", and spaces only'
      )
      .max(100, 'Head name cannot exceeds 100 characters'),
  });

  const handleSubmit = async (values: object) => {
    const formData = head_code
      ? { ...values, head_code: head_code, parent_code: parentCode }
      : { ...values, parent_code: parentCode };
    !head_code && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleInputChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setInputValue(value);
    // Filter suggestions based on input value
    const filteredSuggestions = groupData.filter((group: any) => {
      return (
        group.parent_code !== null &&
        group.group_name.toLowerCase().includes(value.toLowerCase())
      );
    });
    setSuggestions(filteredSuggestions);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<FormDataProps>
  ) => {
    const key = e.key;
    switch (key) {
      case 'ArrowDown':
      case 'Enter':
        {
          const nextField =
            e.currentTarget.getAttribute('data-next-field') || '';
          document.getElementById(nextField)?.focus();
          setInputValue(suggestions[selectedIndex]?.group_name);
          e.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
          );
        }
        break;
      case 'ArrowUp':
        {
          const prevField =
            e.currentTarget.getAttribute('data-prev-field') || '';
          document.getElementById(prevField)?.focus();
          e.preventDefault();
          setSelectedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : prevIndex
          );
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
      heading={
        head_code && isDelete
          ? 'Delete Account Group'
          : head_code
            ? 'Update Account Group'
            : 'Create Account Group'
      }
    >
      <Formik
        initialValues={{
          head_name: data?.head_name || '',
          parent_code: data?.group_details?.group_name || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='account-form'>
            <div className='inputs'>
              <Field
                type='text'
                id='head_name'
                name='head_name'
                placeholder='Head name'
                disabled={isDelete && head_code}
                className={`input-field ${formik.touched.head_name && formik.errors.head_name ? 'border-red-600 ' : ''}`}
                innerRef={inputRef}
                data-side-field='parent_code'
                data-next-field='parent_code'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
              />
              <ErrorMessage
                name='head_name'
                component='div'
                className='text-red-600 font-xs ml-[1px]  '
              />
            </div>

            <div className='inputs'>
              <Field
                type='string'
                id='parent_code'
                name='parent_code'
                placeholder='Parent group'
                value={inputValue}
                onChange={handleInputChange}
                disabled={isDelete && head_code}
                className={`input-field ${formik.touched.parent_code && formik.errors.parent_code ? 'border-red-600 ' : ''}`}
                data-side-field='submit_button'
                data-next-field='submit_button'
                data-prev-field='head_name'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
              />
              {!!suggestions.length && (
                <ul className={'suggestion'}>
                  {suggestions.map((group: any, index: number) => (
                    <li
                      key={group.group_code}
                      onClick={() => {
                        setInputValue(group.group_name);
                        setParentCode(group.group_code);
                        setSuggestions([]);
                        document.getElementById('parent_code')?.focus();
                      }}
                      // className='suggestion_list'
                      className={`${index === selectedIndex ? 'selected' : 'suggestion_list'}`}
                      id={`suggestion_${index}`}
                    >
                      {group.group_name}
                    </li>
                  ))}
                </ul>
              )}
              <ErrorMessage
                name='parent_code'
                component='div'
                className='text-red-600 font-xs ml-[1px]  '
              />
            </div>

            <div className='flex justify-between p-4 w-full'>
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
                  onClick={() => head_code && deleteAcc(head_code)}
                  //   onClick={() => station_id}
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
                      document.getElementById('head_name')?.focus();
                      e.preventDefault();
                    }
                  }}
                >
                  {head_code ? 'Update' : 'Add'}
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};
