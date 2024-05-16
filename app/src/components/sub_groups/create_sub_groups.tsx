import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  CreateSubGroupProps,
  SubGroupFormDataProps,
} from '../../interface/global';
import { Popup } from '../helpers/popup';
import '../stations/stations.css';

export const CreateSubGroup: React.FC<CreateSubGroupProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { group_code } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [groupData, setGroupData] = useState([]);
  const [suggestions, setSuggestions] = useState<any>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [err, setErr] = useState('');
  const parentGroupVal = useRef('');
  const typeVal = useRef('');
  const electronAPI = (window as any).electronAPI;
  const formikRef = useRef<FormikProps<SubGroupFormDataProps>>(null)

  useEffect(() => {
    const focusTarget =
      inputRef.current && !isDelete
        ? inputRef.current
        : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getGroups = () => {
    setGroupData(electronAPI.getAllGroups('', '', '', '', ''));
  };

  useEffect(() => {
    getGroups();
    setInputValue(data?.parent_group ? data.parent_group : '');
  }, []);

  const handleInputChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setInputValue(value);
    // Filter suggestions based on input value
    const filteredSuggestions = groupData.filter((group: any) => {
      return (
        group.parent_code === null &&
        group.group_name.toLowerCase().includes(value.toLowerCase())
      );
    });
    setSuggestions(filteredSuggestions);
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setInputValue(suggestions[selectedIndex]?.group_name);
        parentGroupVal.current = suggestions[selectedIndex]?.group_name;
        setSuggestions([]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // setSelectedIndex(selectedIndex-1);
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        // Scroll the list up if the selected index goes beyond the viewable area
        if (selectedIndex > 0) {
          document
            .getElementById(`suggestion_${selectedIndex - 1}`)
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // setSelectedIndex(selectedIndex+1);
        setSelectedIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
        // Scroll the list down if the selected index goes beyond the viewable area
        if (selectedIndex < suggestions.length - 1) {
          document
            .getElementById(`suggestion_${selectedIndex + 1}`)
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
        }
      }
    }
  };

  const validateInputs = (e: { target: { value: any; id: any } }) => {
    const { value, id } = e.target;
    // setErr({...err, [id]: ''});
    setErr('');

    const isGroup = groupData.some((group: any) => group.group_name === value);

    if (id === 'parent_group') {
      if (!value) {
        setErr('Parent Group is required');
      } else if (value && isGroup === false) {
        setErr('Invalid Parent group');
      } else if (value && isGroup === true) {
        parentGroupVal.current = value;
      }
    }
  };

  useEffect(
    () => {
      if (parentGroupVal.current !== '') {
        const value = parentGroupVal.current;
        const filteredSuggestions = groupData.filter((group: any) => {
          return (
            group.parent_code === null &&
            group.group_name.toLowerCase().includes(value.toLowerCase())
          );
        });
        filteredSuggestions.map((suggestion: any) => {
          if (value === suggestion.group_name) {
            typeVal.current = suggestion.type;
          }
        });
        if (formikRef.current) {
          formikRef.current.setFieldValue('type', typeVal.current);
        const id = typeVal.current === 'p&l' ? 'p_and_l' : 'balance_sheet';
        document.getElementById(id)?.focus();
        }
      }
    },
    [parentGroupVal.current]
  );

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
    const formData = group_code
      ? { ...values, group_code: group_code, parent_group: inputValue }
      : inputValue
        ? { ...values, parent_group: inputValue }
        : values;
    !group_code && document.getElementById('account_button')?.focus();
    handelFormSubmit(formData);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<SubGroupFormDataProps>
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
            : 'Create Sub-Group'
      }
    >
      <Formik
      innerRef={formikRef}
        initialValues={{
          group_name: data?.group_name || '',
          parent_group: data?.parent_group || '',
          type: data?.type || '',
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
                data-side-field='parent_group'
                data-next-field='parent_group'
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
            <div className='inputs'>
              <Field
                type='text'
                id='parent_group'
                name='parent_group'
                placeholder='Parent Group'
                value={inputValue}
                onBlur={validateInputs}
                onChange={handleInputChange}
                disabled={isDelete && group_code}
                className={`input-field ${(formik.touched.parent_group && formik.errors.parent_group) || !!err ? 'error-field' : ''}`}
                data-side-field='p_and_l'
                data-next-field='p_and_l'
                data-prev-field='group_name'
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (suggestions.length !== 0) {
                    handleOnKeyDown(e);
                  } else {
                    handleKeyDown(e);
                  }
                }}
              />
              {/* {inputValue && !!suggestions.length && ( */}
              {!!suggestions.length && (
                <ul className={'suggestion'}>
                  {suggestions.map((group: any, index: number) => (
                    <li
                      key={group.group_code}
                      onClick={() => {
                        setInputValue(group.group_name);
                        setSuggestions([]);
                        document.getElementById('parent_group')?.focus();
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
                name='parent_group'
                component='div'
                className='error'
              />
              {!!err && <span className='err'>{err}</span>}
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
                  // value={typeVal.current === 'p&l'}
                  id='p_and_l'
                  checked={formik.values.type === 'p&l'}
                  // checked={formik.values.type === 'p&l' || typeVal.current === 'p&l'}
                  // checked={formik.values.type === 'p&l' ||formik.values.type === typeVal.current}
                  disabled={group_code && isDelete}
                  data-next-field='submit_button'
                  data-side-field='parent_group'
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
                  // value={typeVal.current === 'balance sheet'}
                  id='balance_sheet'
                  checked={formik.values.type === 'balance sheet'}
                  // checked={formik.values.type === 'balance sheet' || typeVal.current === 'balance sheet'}
                  // checked={formik.values.type === 'balance sheet' || formik.values.type === typeVal.current}
                  // checked={formik.values.type === 'balance sheet' || !!formik.values.parent_group && formik.values.type === typeVal.current}
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
                      document.getElementById('group_name')?.focus();
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
