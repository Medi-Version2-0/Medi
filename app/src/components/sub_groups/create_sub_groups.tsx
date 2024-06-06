import { 
  // KeyboardEvent, 
  useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  CreateSubGroupProps,
  Option,
  SubGroupFormDataProps,
} from '../../interface/global';
import { Popup } from '../helpers/popup';
import '../stations/stations.css';
import CustomSelect from '../custom_select/CustomSelect';

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
  const [, setErr] = useState('');
  const parentGroupVal = useRef('');
  const typeVal = useRef('');
  const electronAPI = (window as any).electronAPI;
  const formikRef = useRef<FormikProps<SubGroupFormDataProps>>(null);
  const [parentGrpOptions, setParentGrpOptions]=useState<Option[]>([]);

  useEffect(() => {
    const focusTarget =
      inputRef.current && !isDelete
        ? inputRef.current
        : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getGroups = () => {
    const grpList=electronAPI.getAllGroups('', '', '', '', '');
    setGroupData(electronAPI.getAllGroups('', '', '', '', ''));
    setParentGrpOptions(
      grpList.map((grp: any) => ({
        value: grp.group_name,
        label: grp.group_name.toLowerCase(),
      }))
    );
  };


  const handleParentChange = (option: Option | null) => {
    setInputValue(option?.value || '');
    formikRef.current?.setFieldValue('parent_group', option?.value);
    setErr("");
  };

  useEffect(() => {
    getGroups();
    setInputValue(data?.parent_group ? data.parent_group : '');
  }, []);

  // const validateInputs = () => {
  //   const { value, id } = (document.getElementById('parent_group') as HTMLInputElement);
  //   setErr('');

  //   const isGroup = groupData.some((group: any) => group.group_name === value);

  //   if (id === 'parent_group') {
  //     if (!value) {
  //       setErr('Parent Group is required');
  //     } else if (value && isGroup === false) {
  //       setErr('Invalid Parent group');
  //     } else if (value && isGroup === true) {
  //       parentGroupVal.current = value;
  //     }
  //   }
  // };

  useEffect(
    () => {
      if (parentGroupVal.current !== '') {
        const value = parentGroupVal.current;
        const filteredSuggestions = groupData.filter((group: any) => {
          return (
            group.parent_code === null &&
            group.group_name?.toLowerCase().includes(value.toLowerCase())
          );
        });
        filteredSuggestions.map((suggestion: any) => {
          if (value === suggestion.group_name) {
            typeVal.current = suggestion.type;
          }
        });
        if (formikRef.current) {
          formikRef.current.setFieldValue('type', typeVal.current);
          const id = typeVal.current === 'P&L' ? 'p_and_l' : 'balance_sheet';
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
    parent_group: Yup.string().required('Parent Group is required'),
    type: Yup.string().required("Type is required")

  });

  

  const handleSubmit = async (values: object) => {
    // validateInputs();
    // if (err) {
    //   return;
    // }
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
    const shiftPressed = e.shiftKey;

    switch (key) {
      case 'ArrowDown':
      case 'Enter':
        {
          const nextField =
            e.currentTarget.getAttribute('data-next-field') || '';
          document.getElementById(nextField)?.focus();
          if (e.currentTarget.type == 'radio') {
            const value = e.currentTarget.value;
            formik && formik.setFieldValue('type', value);
          }
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
          if (shiftPressed) {
            const prevField =
              e.currentTarget.getAttribute('data-prev-field') || '';
            document.getElementById(prevField)?.focus();
            e.preventDefault();
          } else {
            const sideField =
              e.currentTarget.getAttribute('data-side-field') || '';
            const value = (document.getElementById(sideField) as HTMLInputElement)?.value;
            document.getElementById(sideField)?.focus();
            formik && formik.setFieldValue('type', value);
            e.preventDefault();
          }
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
              {parentGrpOptions.length >0 && (
                <CustomSelect
                value={formik.values.parent_group==='' ? null : { label: formik.values.parent_group, value: formik.values.parent_group }}
                onChange={handleParentChange}
                options={parentGrpOptions}
                isSearchable={true}
                placeholder="Station state"
                disableArrow={true}
                hidePlaceholder={false}
                className={`${(formik.touched.parent_group && formik.errors.parent_group) ? 'error-field' : ''}`}
              />
              )}
            </div>
            <div style={{
              width: '90%',
              margin: '0rem auto',
              marginTop: '0.6rem',
            }}>
              <div
                style={{
                  display: 'flex',
                  height: '2.8rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.8rem',
                  borderRadius: '0.4rem',
                  border: '1px solid #c1c1c1',
                }}
              >
                <label
                  className={`credit-type ${group_code && isDelete ? 'disabled' : ''}`}
                >
                  <Field
                    type='radio'
                    name='type'
                    value='P&L'
                    id='p_and_l'
                    checked={formik.values.type === 'P&L'}
                    disabled={group_code && isDelete}
                    data-next-field='submit_button'
                    data-prev-field='parent_group'
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
                    value='Balance Sheet'
                    id='balance_sheet'
                    checked={formik.values.type === 'Balance Sheet'}
                    disabled={group_code && isDelete}
                    data-next-field='submit_button'
                    data-prev-field='parent_group'
                    data-side-field='p_and_l'
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyDown(e, formik)
                    }
                  />
                  Bl. Sheet
                </label>
              </div>
              <ErrorMessage
                name='type'
                component='div'
                className='error'
              />
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
                  type='submit'
                  id='submit_button'
                  className='account_add_button'
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
