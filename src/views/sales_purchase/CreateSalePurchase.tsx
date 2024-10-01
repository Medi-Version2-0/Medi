import { useFormik } from 'formik';
import {
  CreateSalePurchaseProps,
  SalesPurchaseFormData,
} from '../../interface/global';
import { Popup } from '../../components/popup/Popup';
import * as Yup from 'yup';
import Button from '../../components/common/button/Button';
import FormikInputField from '../../components/common/FormikInputField';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import NumberInput from '../../components/common/numberInput/numberInput';
import { TabManager } from '../../components/class/tabManager';
import { createSalePurchaseAccountFieldsChain, deleteSalePurchaseAccountFieldsChain } from '../../constants/focusChain/salePurchaseAccountFocusChain';

export const CreateSalePurchase = ({
  togglePopup,
  data,
  handleConfirmPopup,
  isDelete,
  handleDeleteFromForm,
  type,
  className,
}: CreateSalePurchaseProps) => {
  const { sp_id } = data;
  const tabManager = TabManager.getInstance()


  const validationSchema = Yup.object({
    sptype: Yup.string()
      .max(100, `${type} account name must be 100 characters or less`)
      .matches(/^(?!\d+$).+/, 'Only Numbers not allowed')
      .required(`${type} account name is required`),
    surCharge: Yup.number(),
    shortName: Yup.string()
      .max(20, `Short name must be 20 characters or less`),
  });

  const handleSubmit = async (values: any) => {
    const formData = {
      ...values,
      ...(sp_id && { sp_id }),
    };
    handleConfirmPopup(formData);
    return formData;
  };
  const formik = useFormik<SalesPurchaseFormData>({
    initialValues: {
      sptype: data?.sptype || '',
      igst: data?.igst || '',
      surCharge: data?.surCharge || '',
      shortName: data?.shortName || '',
      shortName2: data?.shortName2 || '',
      openingBal: data?.openingBal || '',
      openingBalType: data?.openingBalType || 'Dr',
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  const handleFieldChange = (option: Option | null) => {
    formik.setFieldValue('openingBalType', option?.value);  
  };

  return (
    <Popup
      togglePopup={togglePopup}
      id={type === 'Sales' ? 'createSaleAccountPopup' : 'createPurchaseAccountPopup'}
      focusChain={isDelete ? deleteSalePurchaseAccountFieldsChain : createSalePurchaseAccountFieldsChain}
      heading={
        sp_id && isDelete
          ? `Delete ${type} Account`
          : sp_id
            ? `Update ${type} Account`
            : `Add ${type} Account`
      }
      className={className}
    >
      <form
        onSubmit={formik.handleSubmit}
        className='flex flex-col gap-3 min-w-[18rem] items-start px-4'
      >
        <FormikInputField
          label='Name'
          id='sptype'
          isUpperCase={true}
          name='sptype'
          formik={formik}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          showErrorTooltip={!!(formik.touched.sptype && formik.errors.sptype)}
        />

        <NumberInput
          label='IGST %'
          id='igst'
          name='igst'
          isDisabled={isDelete && sp_id}
          min={0}
          // max={10000}
          value={formik.values.igst || '' }
          onChange={(value) => formik.setFieldValue('igst', value)}
          onBlur={() => {
            formik.setFieldTouched('igst', true);
          }}
          nextField='surCharge'
          prevField='sptype'
          labelClassName='absolute text-[11px] w-fit text-nowrap -top-2 left-1'
          inputClassName='!text-left !text-[10px] px-1 !h-[25px] w-fit'
        />

        <NumberInput
          label='Cess %'
          id='surCharge'
          name='surCharge'
          isDisabled={isDelete && sp_id}
          min={0}
          // max={10000}
          value={formik.values.surCharge || ''}
          onChange={(value) => formik.setFieldValue('surCharge', value)}
          onBlur={() => {
            formik.setFieldTouched('surCharge', true);
          }}
          nextField='shortName'
          prevField='igst'
          labelClassName='absolute text-[11px] w-fit text-nowrap -top-2 left-1'
          inputClassName='!text-left !text-[10px] px-1 !h-[25px] w-fit'
        />

        <FormikInputField
          label='ShortName'
          id='shortName'
          isUpperCase={true}
          name='shortName'
          formik={formik}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          showErrorTooltip={
            !!(formik.touched.shortName && formik.errors.shortName)
          }
        />
        <FormikInputField
          label='shortName2'
          id='shortName2'
          name='shortName2'
          formik={formik}
          isUpperCase={true}
          className='!gap-0'
          isDisabled={isDelete && sp_id}
          showErrorTooltip={
            !!(formik.touched.shortName2 && formik.errors.shortName2)
          } 
        />
        <div className='flex flex-row gap-2 items-center w-full'>
          <NumberInput
            label={`Opening Balance ₹`}
            id='openingBal'
            name='openingBal'
            placeholder='0.00'
            maxLength={16}
            min={0}
            isDisabled={isDelete && sp_id}
            value={formik.values.openingBal || ''}
            onChange={(value) => formik.setFieldValue('openingBal', value)} 
            onBlur={() => {
              formik.setFieldTouched('openingBal', true);
            }}
            labelClassName='absolute w-fit text-nowrap -top-2 left-1'
            inputClassName='text-left !text-[10px] px-1 !h-[25px] w-fit'
            error={formik.touched.openingBal && formik.errors.openingBal || ''}
          />


          <CustomSelect
            isPopupOpen={false}
            value={
              {
                label: formik.values.openingBalType,
                value: formik.values.openingBalType,
              }
            }
            id='openingBalType'
            isDisabled={isDelete && sp_id}
            onChange={handleFieldChange}
            options={[
              { value: 'Cr', label: 'Cr' },
              { value: 'Dr', label: 'Dr' },
            ]}
            isSearchable={false}
            placeholder='Type'
            disableArrow={false}
            hidePlaceholder={false}
            containerClass='!w-1/3'
            className='!rounded-none !h-6'
            onBlur={() => {
              formik.setFieldTouched('openingBalType', true);
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
          />
        </div>
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
              padding='px-4 py-2'
              btnType='button'
              handleOnClick={handleDeleteFromForm}
            >
              Delete
            </Button>
          ) : (
            <Button
              id='save'
              type='fill'
              padding='px-8 py-2'
              disable={formik.isSubmitting || !formik.isValid}
            >
              {sp_id ? 'Update' : 'Add'}
            </Button>
          )}
        </div>
      </form>
    </Popup>
  );
};
