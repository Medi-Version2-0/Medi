import { useEffect, useRef, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  CreateSubGroupProps,
  Option,
  SubGroupFormDataProps,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';

export const CreateSubGroup: React.FC<CreateSubGroupProps> = ({
  togglePopup,
  data,
  handelFormSubmit,
  isDelete,
  deleteAcc,
}) => {
  const { group_code } = data;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const electronAPI = (window as any).electronAPI;
  const formikRef = useRef<FormikProps<SubGroupFormDataProps>>(null);
  const [parentGrpOptions, setParentGrpOptions] = useState<Option[]>([]);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    const focusTarget =
      inputRef.current && !isDelete
        ? inputRef.current
        : document.getElementById('cancel_button');
    focusTarget?.focus();
  }, []);

  const getGroups = () => {
    const grpList = electronAPI.getAllGroups('', '', '', '', '');
    setParentGrpOptions(
      grpList.map((grp: any) => ({
        value: grp.group_name,
        label: grp.group_name,
      }))
    );
  };

  useEffect(() => {
    getGroups();
  }, []);

  const handleParentChange = (option: Option | null) => {
    formikRef.current?.setFieldValue('parent_group', option?.value);
  };

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
    const formData = {
      ...values,
      ...(group_code && { group_code }),
    };
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
          const nextField = e.currentTarget.getAttribute('data-next-field') || '';
          document.getElementById(nextField)?.focus();
          setFocused(nextField);
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
            const prevField = e.currentTarget.getAttribute('data-prev-field') || '';
            setFocused(prevField);
            document.getElementById(prevField)?.focus();
            e.preventDefault();
          } else {
            const sideField = e.currentTarget.getAttribute('data-side-field') || '';
            const value = (document.getElementById(sideField) as HTMLInputElement)?.value;
            setFocused(sideField);
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
      heading={
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
          <Form className='flex flex-col gap-2 min-w-[18rem] items-center px-4 '>
            <div className="flex flex-col w-full " >
              <Field
                type='text'
                id='group_name'
                name='group_name'
                placeholder='Group name'
                disabled={isDelete && group_code}
                className={`w-full p-3 rounded-md text-3  border border-solid  ${formik.touched.group_name && formik.errors.group_name ? 'border-red-600 ' : ''}`}
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
                className="text-red-600 font-xs ml-[1px]  "
              />
            </div>
            <div className="flex flex-col w-full">
              {parentGrpOptions.length > 0 && (
                <Field name="parent_group" className="">
                  {() => (
                    <CustomSelect
                      id="parent_group"
                      name='parent_group'
                      value={formik.values.parent_group === '' ? null : { label: formik.values.parent_group, value: formik.values.parent_group }}
                      onChange={handleParentChange}
                      options={parentGrpOptions}
                      isSearchable={true}
                      placeholder="Parent group"
                      disableArrow={true}
                      hidePlaceholder={false}
                      className="h-12"
                      isFocused={focused === "parent_group"}
                      error={formik.errors.parent_group}
                      isTouched={formik.touched.parent_group}
                      onBlur={() => { formik.setFieldTouched('parent_group', true); setFocused(""); }}
                    />
                  )}
                </Field>
              )}
              <ErrorMessage
                name='parent_group'
                component='div'
                className="text-red-600 font-xs ml-[1px]"
              />
            </div>
            <ErrorMessage name="selectOption" component="div" />
            <div className='flex flex-col justify-center w-full'>
              <div className='flex items-center justify-between w-full gap-2 rounded-md border border-solid border-[#c1c1c1]' >
                <label className={`w-1/2 text-base cursor-pointer text-center p-3 font-bold  ${group_code && isDelete ? 'disabled' : ''}`}>
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
                <label className={`w-1/2 text-base cursor-pointer text-center p-3 font-bold  ${group_code && isDelete ? 'disabled' : ''}`}>
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
                className="text-red-600 font-xs ml-[1px]  "
              />
            </div>
            <div className='flex justify-between p-4 w-full'>
              <Button
                autoFocus={true}
                type='fog'
                id='cancel_button'
                handleOnClick={() => togglePopup(false)}
                handleOnKeyDown={(e) => {
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
                  handleOnClick={() => group_code && deleteAcc(group_code)}
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  id="submit_button"
                  type="fill"
                  autoFocus
                  handleOnKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      document.getElementById('group_name')?.focus();
                      e.preventDefault();
                    }
                  }}
                >
                  {group_code ? 'Update' : 'Add'}
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </Popup>
  );
};
