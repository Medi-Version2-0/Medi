import { useRef } from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import {
  CreateSubGroupProps,
  Option,
  SubGroupFormDataProps,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import Button from '../../components/common/button/Button';
import FormikInputField from '../../components/common/FormikInputField';
import { subgroupValidationSchema } from './validation_schema';
import { TabManager } from '../../components/class/tabManager';
import { createSubGroupFieldsChain, deleteSubGroupFieldsChain } from '../../constants/focusChain/subGroupFocusChain';

export const CreateSubGroup: React.FC<CreateSubGroupProps> = ({
  togglePopup,
  data,
  handleConfirmPopup,
  isDelete,
  handleDeleteFromForm,
  className,
  groupList,
}) => {
  const { group_code } = data;
  const formikRef = useRef<FormikProps<SubGroupFormDataProps>>(null);
  const parentGrpOptions: Option[] = groupList.map((grp: any) => ({
    value: grp.group_code,
    label: grp.group_name.toUpperCase(),
  }))
  const tabManager = TabManager.getInstance()

  const handleParentChange = (option: Option | null) => {
    formikRef.current?.setFieldValue('parent_code', option?.value);
  };

  const handleSubmit = async (values: object) => {
    const formData = {
      ...values,
      ...(group_code && { group_code }),
    };
    handleConfirmPopup(formData);
  };

  return (
    <Popup
      togglePopup={togglePopup}
      id='createSubGroupPopup'
      focusChain={isDelete ? deleteSubGroupFieldsChain : createSubGroupFieldsChain}
      heading={
        group_code && isDelete
          ? 'Delete Sub-Group'
          : group_code
            ? 'Update Sub-Group'
            : 'Create Sub-Group'
      }
      className={className}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          group_name: data?.group_name || '',
          parent_code: data?.parent_code || '',
        }}
        validationSchema={subgroupValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className='flex flex-col gap-3 min-w-[18rem] items-center px-4 '>
            <FormikInputField
              label='Sub Group Name'
              id='group_name'
              name='group_name'
              isUpperCase={true}
              formik={formik}
              className='!gap-0'
              isDisabled={isDelete && group_code}
              showErrorTooltip={
                !!(formik.touched.group_name && formik.errors.group_name)
              }
            />

            <div className='flex flex-col w-full'>
              {parentGrpOptions.length > 0 && (
                <Field name='parent_code' className=''>
                  {() => (
                    <CustomSelect
                      label='Parent Group'
                      id='parent_code'
                      name='parent_code'
                      disableArrow={false}
                      value={
                        formik.values.parent_code === ''
                          ? null
                          : {
                              label:
                                parentGrpOptions.find(
                                  (e) => e.value === formik.values.parent_code
                                )?.label || '',
                              value: formik.values.parent_code,
                            }
                      }
                      onChange={handleParentChange}
                      options={parentGrpOptions}
                      isSearchable={true}
                      isDisabled={isDelete && group_code}
                      hidePlaceholder={false}
                      labelClass='absolute !max-h-4 whitespace-nowrap z-10 top-0 !bg-white h-[17px] px-1 left-[6px]'
                      className='!h-8 rounded-sm text-xs'
                      error={formik.errors.parent_code}
                      isTouched={formik.touched.parent_code}
                      onBlur={() => {
                        formik.setFieldTouched('parent_code', true);
                      }}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLSelectElement>
                      ) => {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (e.key === 'Enter') {
                          if (!dropdown) {
                            e.preventDefault();
                            e.stopPropagation();
                            tabManager.focusManager()
                          }
                        }
                      }}
                      showErrorTooltip={true}
                    />
                  )}
                </Field>
              )}
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
              {isDelete ? (
                <Button
                  id='del_button'
                  type='fill'
                  btnType='button'
                  handleOnClick={handleDeleteFromForm}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  id='save'
                  type='fill'
                  disable={!formik.isValid || formik.isSubmitting}  // disable if form is submitting i.e., prevent multiple submissions
                  autoFocus
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
