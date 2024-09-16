import React, { useEffect, useState } from 'react';
import { ItemFormValues, ItemFormInfoType } from './create-item';
import CustomSelect from '../../components/custom_select/CustomSelect';
import FormikInputField from '../../components/common/FormikInputField';
import { ItemGroupFormData, Option, CompanyFormData, SalesPurchaseFormData } from '../../interface/global';
import { useControls } from '../../ControlRoomContext';
import { FormikProps } from 'formik';
import onKeyDown from '../../utilities/formKeyDown';
import ImagePreview from '../../components/common/files/ImagePreview';
const root = process.env.REACT_APP_API_URL;
import { useSelector } from 'react-redux'
import { SelectList } from '../../components/common/selectList';

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
  disabled?: boolean;
  autoFocus?: boolean;
};

interface ContainerProps {
  title: string;
  fields: Array<abc>;
  formik: ItemFormInfoType;
  setFocused: (field: string) => void;
  focused?: string;
  setSalePurchase?: (field: any) => void;
  companies?: any;
}

const Container: React.FC<ContainerProps> = ({ title, fields, formik, setFocused, focused, setSalePurchase, companies }) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    formik?: FormikProps<ItemFormValues>,
    radioField?: any
  ) => {
    onKeyDown({
      e,
      formik: formik,
      radioField: radioField,
      focusedSetter: (field: string) => {
        setFocused(field);
      },
    });
  };
  const { company: companiesData, } = useSelector((state: any) => state.global)
  const [newImg, setNewImg] = useState(false);
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      formik.setFieldValue(e.target.name, e.target.files[0]);
      setNewImg(true);
    }
  };

  const handleFieldValue = (name: string, id: number) => {
    if (name === 'compId') {
      const selectedCompany = companies.company.find((company: any) => company.company_id === id);
      if (selectedCompany) {
        setSalePurchase && setSalePurchase({
          saleId: selectedCompany.salesId,
          purchaseId: selectedCompany.purchaseId,
          discPercent: selectedCompany.discPercent,
          isDiscountPercent: selectedCompany.isDiscountPercent,
        });
      }
      formik.setFieldValue('shortName', selectedCompany.shortName);
    }
  }

  const handleOptionSelections = (field: any, option: any) => {
    formik.setFieldValue(field.name, option ? option.value : null);
  }

  function handleCompanyList() {
    const tableData = companiesData.map((c: any, idx: number) => {
      return {
        ...companiesData[idx],
        station_name: c.Station.station_name,
      }
    })
    setPopupList({
      isOpen: true,
      data: {
        heading: 'Select Company',
        headers: [
          { label: 'Company', key: 'companyName' },
          { label: 'Station', key: 'station_name' },
        ],
        tableData,
        handleSelect: (rowData: any) => {
          formik.setFieldValue('compId', rowData.company_id);
          handleFieldValue('compId', rowData.company_id);
          document.getElementById('service')?.focus();
          setFocused('service');
        }
      }
    });
  }
  return (
    <div className='relative border w-full h-full pt-4 border-solid border-gray-400'>
      <div className='absolute top-[-14px] left-2  px-2 w-fit bg-[#f3f3f3]'>
        {title}
      </div>
      <div
        className={`flex  ${title === 'Basic Info' ? 'flex-row' : 'flex-col'} gap-2 w-full px-4 py-2 text-xs leading-3 text-gray-600`}
      >
        {fields.map((field) => {
          return field.type === 'select' && field.options ? (
            <CustomSelect
              key={field.id}
              isPopupOpen={false}
              label={field.label}
              id={field.id}
              name={field.name}
              onFocus={() => {
                if (field.id === 'compId') {
                  handleCompanyList();
                }
              }}
              nextField={field.nextField}
              prevField={field.prevField}
              options={field.options}
              isFocused={focused === field.id}
              value={
                field.options.find(
                  (option) => option.value === formik.values[field.name]
                ) || null
              }
              onChange={(option: Option | null) =>
                handleOptionSelections(field, option)
              }
              placeholder='Select an option...'
              labelClass='min-w-[90px]'
              className='rounded-none'
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
              onBlur={() => {
                formik.setFieldTouched(field.name, true);
                setFocused('');
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                const dropdown = document.querySelector(
                  '.custom-select__menu'
                );
                if (e.key === 'Enter') {
                  !dropdown && e.preventDefault();
                  document.getElementById(field.nextField || 'compId')?.focus();
                  setFocused(field.nextField || 'compId');
                }
              }}
              isDisabled={field?.disabled || false}
            />
          ) : (
            <React.Fragment key={field.id}>
              <FormikInputField
                isPopupOpen={false}
                key={field.id}
                label={field.label}
                id={field.id}
                name={field.name}
                formik={formik}
                className='!mb-0'
                inputClassName={`${title === 'Basic Info' ? 'w-[80%]' : ''}${field.type === 'file' && '!p-[0px]'}`}
                labelClassName='min-w-[90px]'
                isRequired={field.isRequired}
                nextField={field.nextField}
                prevField={field.prevField}
                type={field.type}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e)
                }
                showErrorTooltip={
                  !!(
                    formik.touched[field.name as keyof typeof formik.touched] &&
                    formik.errors[field.name as keyof typeof formik.errors]
                  )
                }
                onChange={field.type === 'file' ? handleFileChange : undefined}
                isDisabled={field?.disabled || false}
                autoFocus={field.autoFocus}
              />
              {field.type === 'file' && !newImg && (formik.values as any)[field.id] && (
                <ImagePreview name={field.id} url={`${root}${(formik.values as any)[field.id]}` || ''} formik={formik} setNewImg={setNewImg} className='w-[200px]' />
              )}
            </React.Fragment>
          )
        })}
      </div>
      {popupList.isOpen && <SelectList
        heading={popupList.data.heading}
        closeList={() => setPopupList({ isOpen: false, data: {} })}
        headers={popupList.data.headers}
        tableData={popupList.data.tableData}
        handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
      />}
    </div>
  );
};

const BasicItemEdit = ({ formik }: BasicItemEditProps) => {
  const { controlRoomSettings } = useControls();
  const [options, setOptions] = useState<{
    companiesOptions: Option[];
    salesOptions: Option[];
    purchaseOptions: Option[];
    groupOptions: Option[];
    company: any;
  }>({
    companiesOptions: [],
    salesOptions: [],
    purchaseOptions: [],
    groupOptions: [],
    company: [],
  });
  const [focused, setFocused] = useState('');
  const [salePurchase, setSalePurchase] = useState<any>('');
  const { company: companies, sales: salesList, purchase: purchaseList, itemGroups } = useSelector((state: any) => state.global)
  useEffect(() => {
    setOptions((prevOption) => ({
      ...prevOption,
      company: companies,
      companiesOptions: companies.map((company: CompanyFormData) => ({
        value: company.company_id,
        label: company.companyName,
      })),
    }));
  }, [companies])

  useEffect(() => {
    setOptions((prevOption) => ({
      ...prevOption,
      salesOptions: salesList.map((sales: SalesPurchaseFormData) => ({
        value: sales.sp_id,
        label: sales.sptype,
      })),
    }));
  }, [salesList])

  useEffect(() => {
    setOptions((prevOption) => ({
      ...prevOption,
      purchaseOptions: purchaseList.map((purchase: SalesPurchaseFormData) => ({
        value: purchase.sp_id,
        label: purchase.sptype,
      })),
    }));
  }, [purchaseList])

  useEffect(() => {
    setOptions((prevOption) => ({
      ...prevOption,
      groupOptions: itemGroups.map((group: ItemGroupFormData) => ({
        value: group.group_code,
        label: group.group_name,
      })),
    }));
  }, [itemGroups])

  useEffect(() => {
    const setForm = () => {
      formik.setFieldValue('purAccId', salePurchase.purchaseId);
      formik.setFieldValue('saleAccId', salePurchase.saleId);
      (salePurchase?.isDiscountPercent === 'Yes') ? formik.setFieldValue('discountPer', salePurchase.discPercent) : formik.setFieldValue('discountPer', 0);
    }
    if (salePurchase.discPercent || salePurchase.saleId && salePurchase.purchaseId) {
      setForm();
    }
  }, [salePurchase]);

  const basicInfoFields = [
    {
      label: 'Item Name',
      id: 'name',
      name: 'name',
      isRequired: true,
      type: 'text',
      nextField: 'compId',
      autoFocus: true
    },
    ...controlRoomSettings.packaging
      ? [{
        label: 'Packing',
        id: 'packing',
        name: 'packing',
        type: 'text',
        nextField: 'shortName',
        prevField: 'compId',
      }]
      : [],
    {
      label: 'Company',
      id: 'compId',
      name: 'compId',
      type: 'select',
      isRequired: true,
      nextField: controlRoomSettings.packaging ? 'packing' : controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : 'service',
      prevField: 'name',
      options: options.companiesOptions,
    },
  ];

  const container1Fields = [
    ...controlRoomSettings.batchWiseManufacturingCode
      ? [{
        label: 'MFG. Code',
        id: 'shortName',
        name: 'shortName',
        type: 'text',
        prevField: controlRoomSettings.packaging ? 'packing' : 'compId',
        nextField: 'service',
      }]
      : [],
    {
      label: 'Type',
      id: 'service',
      name: 'service',
      type: 'select',
      options: controlRoomSettings.allowItemAsService
        ? [
          { label: 'Goods', value: 'Goods' },
          { label: 'Services', value: 'Services' },
        ]
        : [{ label: 'Goods', value: 'Goods' }],
      nextField: 'hsnCode',
      prevField: controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : controlRoomSettings.packaging ? 'packing' : 'compId',
    },
    {
      label: 'HSN/SAC',
      id: 'hsnCode',
      name: 'hsnCode',
      nextField: 'itemGroupCode',
      prevField: 'service',
    },
    {
      label: 'Item Group',
      id: 'itemGroupCode',
      name: 'itemGroupCode',
      type: 'select',
      nextField: 'scheduleDrug',
      prevField: 'hsnCode',
      options: options.groupOptions,
    },
    {
      label: 'Schedule Drug',
      id: 'scheduleDrug',
      name: 'scheduleDrug',
      type: 'select',
      options: [
        { label: 'Non-H1', value: 'NON-H1' },
        { label: 'Schedule H1', value: 'H1' },
      ],
      prevField: 'itemGroupCode',
      nextField: controlRoomSettings.rxNonrx ? 'prescriptionType' : 'saleAccId',
    },
    ...controlRoomSettings.rxNonrx
      ? [{
        label: 'Prescription Type',
        id: 'prescriptionType',
        name: 'prescriptionType',
        type: 'select',
        nextField: 'saleAccId',
        prevField: 'scheduleDrug',
        options: [
          { label: 'RX', value: 'RX' },
          { label: 'Non-RX', value: 'NON-RX' },
        ],
      },]
      : [],
  ];

  const container2Fields = [
    {
      label: 'Sales Account',
      id: 'saleAccId',
      name: 'saleAccId',
      type: 'select',
      options: options.salesOptions,
      prevField: controlRoomSettings.rxNonrx ? 'prescriptionType' : 'scheduleDrug',
      nextField: 'purAccId',
      disabled: (salePurchase?.salePurchase === 'Yes') || false
    },
    {
      label: 'Purchase Account',
      id: 'purAccId',
      name: 'purAccId',
      type: 'select',
      options: options.purchaseOptions,
      prevField: 'saleAccId',
      nextField: 'discountPer',
      disabled: (salePurchase?.salePurchase === 'Yes') || false
    },
    {
      label: 'Cash Discount %',
      id: 'discountPer',
      name: 'cashDiscountPer',
      type: 'number',
      nextField: 'marginPercentage',
      prevField: 'purAccId',
    },
    {
      label: 'Margin %',
      id: 'marginPercentage',
      name: 'marginPercentage',
      type: 'number',
      nextField: 'minQty',
      prevField: 'discountPer',
    },
    {
      label: 'Min. Quantity',
      id: 'minQty',
      name: 'minQty',
      nextField: 'maxQty',
      type: 'number',
      prevField: 'marginPercentage',
    },
    {
      label: 'Max. Quantity',
      id: 'maxQty',
      name: 'maxQty',
      prevField: 'minQty',
      type: 'number',
      nextField: controlRoomSettings.rackNumber ? 'rackNumber' : controlRoomSettings.dpcoAct ? 'dpcoact' : 'upload',
    },
  ];

  const container3Fields = [
    ...controlRoomSettings.rackNumber
      ? [{
        label: 'Rack No.',
        id: 'rackNumber',
        name: 'rackNumber',
        type: 'text',
        nextField: 'dpcoact',
        prevField: 'maxQty',
      }]
      : [],
    ...controlRoomSettings.dpcoAct
      ? [{
        label: 'DPCO Act.',
        id: 'dpcoact',
        name: 'dpcoact',
        type: 'select',
        nextField: 'upload',
        prevField: controlRoomSettings.rackNumber ? 'rackNumber' : 'maxQty',
        options: [
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' },
        ],
      },]
      : [],
    {
      label: 'Upload Img.',
      id: 'upload',
      name: 'upload',
      type: 'file',
      nextField: (formik.isValid) ? 'submit_all' : 'name',
      prevField: controlRoomSettings.dpcoAct ? 'dpcoact' : controlRoomSettings.rackNumber ? 'rackNumber' : 'maxQty',
    },
  ];
  return (
    <div className='flex flex-col gap-14'>
      <Container
        title='Basic Info'
        fields={basicInfoFields as unknown as abc[]}
        formik={formik}
        focused={focused}
        setFocused={setFocused}
        setSalePurchase={setSalePurchase}
        companies={options}
      />
      <div className='flex flex-row gap-4'>
        <Container
          title='Item Info'
          fields={container1Fields as unknown as abc[]}
          formik={formik}
          focused={focused}
          setFocused={setFocused}
        />
        <Container
          title='Cost Details'
          fields={container2Fields as unknown as abc[]}
          formik={formik}
          focused={focused}
          setFocused={setFocused}
        />
        <Container
          title='Misc.'
          fields={container3Fields as unknown as abc[]}
          formik={formik}
          focused={focused}
          setFocused={setFocused}
        />
      </div>
    </div>
  );
};

export default BasicItemEdit;
