import React, { useEffect, useState } from 'react';
import { ItemFormValues, ItemFormInfoType } from './create-item';
import CustomSelect from '../../components/custom_select/CustomSelect';
import FormikInputField from '../../components/common/FormikInputField';
import { ItemGroupFormData, Option } from '../../interface/global';
import { sendAPIRequest } from '../../helper/api';

interface BasicItemEditProps {
  formik: ItemFormInfoType;
}

type abc = {
  label: string;
  id: string;
  name: keyof ItemFormValues;
  type?: string;
  isRequired?: boolean;
  options?: Option[];
  nextField?: string;
  prevField?: string;
};

interface ContainerProps {
  title: string;
  fields: Array<abc>;
  formik: ItemFormInfoType;
}

const Container: React.FC<ContainerProps> = ({ title, fields, formik }) => {
  return (
    <div className='relative border w-full h-full pt-4 border-solid border-gray-400'>
      <div className='absolute top-[-14px] left-2  px-2 w-fit bg-[#f3f3f3]'>
        {title}
      </div>
      <div
        className={`flex  ${title === 'Basic Info' ? 'flex-row' : 'flex-col'} gap-2 w-full px-4 py-2 text-xs leading-3 text-gray-600`}
      >
        {fields.map((field) =>
          field.type === 'select' && field.options ? (
            <CustomSelect
              key={field.id}
              isPopupOpen={false}
              label={field.label}
              id={field.id}
              name={field.name}
              nextField={field.nextField}
              prevField={field.prevField}
              options={field.options}
              value={
                field.options.find(
                  (option) => option.value === formik.values[field.name]
                ) || null
              }
              onChange={(option: Option | null) =>
                formik.setFieldValue(field.name, option ? option.value : null)
              }
              placeholder='Select an option...'
              isSearchable={
                field.id === 'compId' ||
                field.id === 'itemGroupCode' ||
                field.id === 'saleAccId' ||
                field.id === 'purAccId'
              }
              isTouched={
                formik.touched[field.name as keyof typeof formik.touched]
              }
              error={formik.errors[field.name as keyof typeof formik.errors]}
              isRequired={field.isRequired}
              showErrorTooltip={
                !!(
                  formik.touched[field.name as keyof typeof formik.touched] &&
                  formik.errors[field.name as keyof typeof formik.errors]
                )
              }
            />
          ) : (
            <FormikInputField
              isPopupOpen={false}
              key={field.id}
              label={field.label}
              id={field.id}
              name={field.name}
              formik={formik}
              className='!mb-0'
              inputClassName={`${title === 'Basic Info' ? 'w-[80%]' : ''}`}
              labelClassName='min-w-[90px]'
              isRequired={field.isRequired}
              nextField={field.nextField}
              prevField={field.prevField}
              type={field.type}
              showErrorTooltip={
                !!(
                  formik.touched[field.name as keyof typeof formik.touched] &&
                  formik.errors[field.name as keyof typeof formik.errors]
                )
              }
            />
          )
        )}
      </div>
    </div>
  );
};

const BasicItemEdit = ({ formik }: BasicItemEditProps) => {
  const [options, setOptions] = useState<{
    companiesOptions: Option[];
    salesOptions: Option[];
    purchaseOptions: Option[];
    groupOptions: Option[];
  }>({
    companiesOptions: [],
    salesOptions: [],
    purchaseOptions: [],
    groupOptions: [],
  });

  const fetchAllData = async () => {
    const companies = await sendAPIRequest<any[]>('/company');
    const salesList = await sendAPIRequest<any[]>('/sale');
    const purchaseList = await sendAPIRequest<any[]>('/purchase');
    const groups = await sendAPIRequest<ItemGroupFormData[]>('/itemGroup', {
      method: 'GET',
    });

    setOptions((prevOption) => ({
      ...prevOption,
      companiesOptions: companies.map((company: any) => ({
        value: company.company_id,
        label: company.companyName,
      })),
    }));
    setOptions((prevOption) => ({
      ...prevOption,
      salesOptions: salesList.map((sales: any) => ({
        value: sales.sp_id,
        label: sales.sptype,
      })),
    }));
    setOptions((prevOption) => ({
      ...prevOption,
      purchaseOptions: purchaseList.map((purchase: any) => ({
        value: purchase.sp_id,
        label: purchase.sptype,
      })),
    }));
    setOptions((prevOption) => ({
      ...prevOption,
      groupOptions: groups.map((group: any) => ({
        value: group.group_code,
        label: group.group_name,
      })),
    }));
  };

  useEffect(() => {
    fetchAllData();
    document.getElementById('name')?.focus();
  }, []);

  const basicInfoFields = [
    {
      label: 'Item Name',
      id: 'name',
      name: 'name',
      isRequired: true,
      type: 'text',
      nextField: 'packing',
    },
    {
      label: 'Packing',
      id: 'packing',
      name: 'packing',
      type: 'text',
      nextField: 'service',
      prevField: 'name',
    },
  ];

  const container1Fields = [
    {
      label: 'Service',
      id: 'service',
      name: 'service',
      type: 'select',
      options: [
        { label: 'Goods', value: 'goods' },
        { label: 'Services', value: 'services' },
      ],
    },
    {
      label: 'MFG. Code',
      id: 'shortName',
      name: 'shortName',
      type: 'text',
      nextField: 'hsnCode',
      prevField: 'service',
    },
    {
      label: 'HSN/SAC',
      id: 'hsnCode',
      name: 'hsnCode',
      nextField: 'compId',
      prevField: 'shortName',
    },
    {
      label: 'Company',
      id: 'compId',
      name: 'compId',
      type: 'select',
      nextField: 'itemGroupCode',
      prevField: 'hsnCode',
      options: options.companiesOptions,
    },
    {
      label: 'Item Group',
      id: 'itemGroupCode',
      name: 'itemGroupCode',
      type: 'select',
      nextField: 'scheduleDrug',
      prevField: 'compId',
      options: options.groupOptions,
    },
    {
      label: 'Schedule Drug',
      id: 'scheduleDrug',
      name: 'scheduleDrug',
      type: 'select',
      nextField: 'saleAccId',
      prevField: 'itemGroupCode',
      options: [
        { label: 'Schedule H1', value: 'H1' },
        { label: 'Schedule H', value: 'H' },
      ],
    },
  ];

  const container2Fields = [
    {
      label: 'Sales Account',
      id: 'saleAccId',
      name: 'saleAccId',
      type: 'select',
      options: options.salesOptions,
    },
    {
      label: 'Purchase Account',
      id: 'purAccId',
      name: 'purAccId',
      type: 'select',
      options: options.purchaseOptions,
    },
    {
      label: 'Cash Discount %',
      id: 'discountPer',
      name: 'cashDiscountPer',
      nextField: 'itemDiscPer',
      prevField: 'purAccId',
    },
    {
      label: 'Item Discount %',
      id: 'itemDiscPer',
      name: 'itemDiscPer',
      nextField: 'minQty',
      prevField: 'discountPer',
    },
    {
      label: 'Min. Quantity',
      id: 'minQty',
      name: 'minQty',
      nextField: 'maxQty',
      prevField: 'itemDiscPer',
    },
    {
      label: 'Max. Quantity',
      id: 'maxQty',
      name: 'maxQty',
      nextField: 'selected',
      prevField: 'minQty',
    },
  ];

  const container3Fields = [
    {
      label: 'Selected',
      id: 'selected',
      name: 'selected',
      type: 'select',
      nextField: 'reckNumber',
      prevField: 'maxQty',
      options: [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
      ],
    },
    {
      label: 'Reck No.',
      id: 'reckNumber',
      name: 'reckNumber',
      type: 'text',
      nextField: 'dpcact',
      prevField: 'selected',
    },
    {
      label: 'DP CACT',
      id: 'dpcact',
      name: 'dpcact',
      type: 'text',
      nextField: 'upload',
      prevField: 'reckNumber',
    },
    {
      label: 'Upload',
      id: 'upload',
      name: 'upload',
      type: 'text',
      nextField: 'submit_all',
      prevField: 'dpcact',
    },
  ];

  return (
    <div className='flex flex-col gap-14'>
      <Container
        title='Basic Info'
        fields={basicInfoFields as unknown as abc[]}
        formik={formik}
      />
      <div className='flex flex-row gap-4'>
        <Container
          title='Item Info'
          fields={container1Fields as unknown as abc[]}
          formik={formik}
        />
        <Container
          title='Cost Details'
          fields={container2Fields as unknown as abc[]}
          formik={formik}
        />
        <Container
          title='Misc.'
          fields={container3Fields as unknown as abc[]}
          formik={formik}
        />
      </div>
    </div>
  );
};

export default BasicItemEdit;
