import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Confirm_Alert_Popup from '../../components/popup/Confirm_Alert_Popup';
import Button from '../../components/common/button/Button';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import FormikInputField from '../../components/common/FormikInputField';
import { Option } from '../../interface/global';
import CustomSelect from '../../components/custom_select/CustomSelect';
import titleCase from '../../utilities/titleCase';
import './discount.css';
import { useSelector } from 'react-redux'
import { discountValidationSchema } from './validation_schema';
import { useGetSetData } from '../../hooks/useGetSetData';
import { getAndSetPartywiseDiscount } from '../../store/action/globalAction';
import { useControls } from '../../ControlRoomContext';
import useApi from '../../hooks/useApi';

export const CreateDiscount = ({
  setView,
  data,
  discountTypeOptions,
}: any) => {
  const { sendAPIRequest } = useApi();
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [partyOptions, setPartyOptions] = useState<Option[]>([]);
  const [focused, setFocused] = useState('');
  const { controlRoomSettings } = useControls();
  const { company: companiesData, party: parties } = useSelector((state: any) => state.global)
  const [popupState, setPopupState] = useState({
    isModalOpen: false,
    isAlertOpen: false,
    message: '',
  });
  const getAndSetPartywiseDiscountHandler = useGetSetData(getAndSetPartywiseDiscount);
  const settingPopupState = (isModal: boolean, message: string) => {
    setPopupState({
      ...popupState,
      [isModal ? 'isModalOpen' : 'isAlertOpen']: true,
      message: message,
    });
  };
  useEffect(() => {
    setCompanyOptions(
      companiesData.map((company: any) => ({
        value: company.company_id,
        label: titleCase(company.companyName),
      }))
    );

    setPartyOptions(
      parties.map((party: any) => ({
      value: party.party_id,
      label: titleCase(party.partyName),
      }))
    );
    setFocused('partyId');
  }, [companiesData, parties]);

  const formik: any = useFormik({
    initialValues: {
      companyId: data?.companyId || '',
      discountType: data?.discountType || '',
      partyId: data?.partyId || '',
      discount: data?.discount || 0,
    },
    validationSchema: discountValidationSchema,
    onSubmit: async (values) => {
      try{

      const allData = { ...values, discount: Number(values.discount) };

      if (data.discount_id) {
        if (allData.discountType === 'allCompanies') {
          allData.companyId = null;
        }
        await sendAPIRequest(
          `/partyWiseDiscount/${data.discount_id}`,
          {
            method: 'PUT',
            body: allData,

          }
          )
        } else {
          await sendAPIRequest(`/partyWiseDiscount`, {
            method: 'POST',
            body: allData,
          });
        }

        settingPopupState(false, `Partywise discount ${!!data.discount_id ? 'updated' : 'created'} successfully`)
        getAndSetPartywiseDiscountHandler();
      }catch(error: any){
        if (!error?.isErrorHandled && error.response.status === 409) {
          settingPopupState(false, `${error.response.data} please check in tabledata`)
        }
      }
    },
  });


  const handleAlertCloseModal = () => {
    setPopupState({ ...popupState, isAlertOpen: false });
    setView({ type: '', data: {} });
  };

  const handleClosePopup = () => {
    setPopupState({ ...popupState, isModalOpen: false });
  };

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const handleDiscountTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    if (value === 'dpcoact' && controlRoomSettings.dpcoAct){
      formik.setValues({
        ...formik.values,
        discountType: value,
        discount: controlRoomSettings.dpcoDiscount
      });
      setFocused('companyId')
      return
    }
    if (value === 'allCompanies'){
      formik.setValues({
        ...formik.values,
        discountType: value,
        companyId: null
      });
      setFocused('discount')
      return
    }
    formik.setFieldValue('discountType', value);
    setFocused('companyId');
  };

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between px-8 py-1'>
        <h1 className='font-bold'>
          {!!data.discount_id
            ? 'Update part-wise discount'
            : 'Create party-wise discount'}
        </h1>
        <Button
          type='highlight'
          id='company_button'
          handleOnClick={() => {
            setView({ type: '', data: {} });
          }}
        >
          Back
        </Button>
      </div>
      <form onSubmit={formik.handleSubmit} className='flex flex-col w-full'>
        <div className='flex flex-row px-4 mx-4 py-2 gap-2'>
          <div className='relative border w-full h-full pt-4 border-solid border-gray-400'>
            <div className='absolute top-[-14px] left-2  px-2 w-max bg-[#f3f3f3]'>
              Party-wise discount
            </div>
            <div className='flex flex-col gap-2 w-full px-4 py-2 text-xs leading-3 text-gray-600'>
              <div className='flex items-center m-[1px] gap-11 w-full'>
                <div className='flex flex-col gap-3'>
                  <CustomSelect
                    isPopupOpen={false}
                    label='Party'
                    id='partyId'
                    name='partyId'
                    labelClass='min-w-[110px]'
                    isFocused={focused === 'partyId'}
                    value={
                      formik.values.partyId === ''
                        ? null
                        : {
                            label: partyOptions.find(
                              (e) => e.value === formik.values.partyId
                            )?.label,
                            value: formik.values.partyId,
                          }
                    }
                    onChange={handleFieldChange}
                    options={partyOptions}
                    isSearchable={true}
                    placeholder='Party Name'
                    disableArrow={true}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={true}
                    error={formik.errors.partyId}
                    isTouched={formik.touched.partyId}
                    showErrorTooltip={true}
                    onBlur={() => {
                      formik.setFieldTouched('partyId', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        const dropdown = document.querySelector(
                          '.custom-select__menu'
                        );
                        if (!dropdown) {
                          e.preventDefault();
                        }
                        document.getElementById('1')?.focus();
                      }
                      if (e.shiftKey && e.key === 'Tab') {
                        document.getElementById('partyId')?.focus();
                        e.preventDefault();
                      }
                    }}
                  />

                  <div className='flex flex-row gap-2 w-full text-xs leading-3 text-gray-600 items-start justify-between'>
                    <label className='text-gray-600 '>
                      Discount Type <span className='text-[#FF1008]'>*</span>
                    </label>
                    <div className='ms-7 flex flex-col gap-3'>
                      {discountTypeOptions.map((option: any) => (
                        <label key={option.value} className='flex items-center'>
                          <input
                            type='radio'
                            name='discountType'
                            id={option.id}
                            value={option.value}
                            checked={
                              formik.values.discountType === option.value
                            }
                            onChange={handleDiscountTypeChange}
                            className='mr-2'
                            onKeyDown={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              const shiftPressed = e.shiftKey;
                              if (e.key === 'Enter') {
                                const value = e.currentTarget.value;
                                formik.setFieldValue('discountType', value);
                                if (option.id === 1) {
                                  document.getElementById('discount')?.focus();
                                } else {
                                  document.getElementById('companyId')?.focus();
                                }
                              } else if (e.key === 'Tab' && !shiftPressed) {
                                if (option.id < 3) {
                                  const value = (
                                    document.getElementById(
                                      option.id
                                    ) as HTMLInputElement
                                  )?.value;
                                  formik &&
                                    formik.setFieldValue(option.id, value);
                                  document
                                    .getElementById(`${option.id + 1}`)
                                    ?.focus();
                                } else {
                                  document.getElementById('companyId')?.focus();
                                }
                              } else if (e.key === 'Tab' && shiftPressed) {
                                if (option.id > 0) {
                                  document
                                    .getElementById(`${option.id - 1}`)
                                    ?.focus();
                                } else {
                                  document.getElementById('partyId')?.focus();
                                }
                              }
                            }}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {formik.values.discountType && (
                    <CustomSelect
                      isPopupOpen={false}
                      label='Company'
                      id='companyId'
                      name='companyId'
                      labelClass='min-w-[110px]'
                      isFocused={focused === 'companyId'}
                      value={
                        formik.values.companyId === ''
                          ? null
                          : {
                              label:
                                formik.values.discountType === 'allCompanies'
                                  ? 'All'
                                  : companyOptions.find(
                                      (e) => e.value === formik.values.companyId
                                    )?.label,
                              value: formik.values.companyId,
                            }
                      }
                      onChange={handleFieldChange}
                      options={
                        formik.values.discountType === 'allCompanies'
                          ? [{ value: 0, label: 'All' }]
                          : companyOptions
                      }
                      isSearchable={true}
                      placeholder='Company Name'
                      disableArrow={true}
                      hidePlaceholder={false}
                      className='!h-6 rounded-sm'
                      isRequired={true}
                      error={formik.errors.companyId}
                      isTouched={formik.touched.companyId}
                      onBlur={() => {
                        formik.setFieldTouched('companyId', true);
                        setFocused('');
                      }}
                      isDisabled={formik.values.discountType === 'allCompanies'}
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          const dropdown = document.querySelector(
                            '.custom-select__menu'
                          );
                          if (!dropdown) {
                            e.preventDefault();
                          }
                          document.getElementById('discount')?.focus();
                        }
                        if (e.shiftKey && e.key === 'Tab') {
                          document.getElementById('discountType2')?.focus();
                          e.preventDefault();
                        }
                      }}
                      showErrorTooltip={true}
                    />
                  )}

                  <FormikInputField
                    isPopupOpen={false}
                    label='Discount'
                    id='discount'
                    type='number'
                    name='discount'
                    formik={formik}
                    className='!mb-0'
                    labelClassName='min-w-[110px]'
                    isRequired={true}
                    sideField='discount'
                    nextField='submit_discount'
                    prevField='companyId'
                    showErrorTooltip={
                      formik.touched.discount && !!formik.errors.discount
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='w-full px-8 py-2'>
          <Button
            type='fill'
            padding='px-4 py-2'
            id='submit_discount'
            btnType='submit'
            disable={!(formik.isValid && formik.dirty)}
            handleOnKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                document.getElementById('discount')?.focus();
              }
            }}
          >
            {!!data.discount_id ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
      {(popupState.isModalOpen || popupState.isAlertOpen) && (
        <Confirm_Alert_Popup
          onClose={handleClosePopup}
          onConfirm={handleAlertCloseModal}
          message={popupState.message}
          isAlert={popupState.isAlertOpen}
        />
      )}
    </div>
  );
};
