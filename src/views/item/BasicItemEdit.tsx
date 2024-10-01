import React, { useEffect, useState } from 'react';
import { ItemGroupFormData, Option, CompanyFormData, SalesPurchaseFormData, ItemFormInfoType } from '../../interface/global';
import { useControls } from '../../ControlRoomContext';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { Container } from '../../components/common/commonFormFields';
import { useTabs } from '../../TabsContext';
import { Company } from '../company';
import { sendAPIRequest } from '../../helper/api';
const root = process.env.REACT_APP_API_URL;

interface BasicItemEditProps { formik: ItemFormInfoType }

const BasicItemEdit = ({ formik }: BasicItemEditProps) => {
  const [focused, setFocused] = useState('');
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: {} })
  const [options, setOptions] = useState<{ companiesOptions: Option[]; salesOptions: Option[]; purchaseOptions: Option[]; groupOptions: Option[]; }>({ companiesOptions: [], salesOptions: [], purchaseOptions: [], groupOptions: [] });
  const [tableData, setTableData] = useState<{ companies: CompanyFormData[] | any; sales: SalesPurchaseFormData[] | any; purchases: SalesPurchaseFormData[] | any; itemGroups: ItemGroupFormData[] | any; }>({ companies: [], sales: [], purchases: [], itemGroups: [] });
  const { controlRoomSettings } = useControls();
  const { openTab } = useTabs();

  useEffect(() => {
    fetchData();
  }, [])

  useEffect(() => {
    if (!!tableData.companies || !!tableData.sales || !!tableData.purchases || !!tableData.itemGroups) {
      setCompanyOptions();
      setSalesOptions();
      setPurchaseOptions();
      setItemGroupsOptions();
    }
  }, [tableData.companies, tableData.sales, tableData.purchases, tableData.itemGroups])

  const fetchData = async () => {
    const companies = await sendAPIRequest<CompanyFormData[]>('/company');
    const sales = await sendAPIRequest<any[]>('/saleAccount');
    const purchases = await sendAPIRequest<any[]>('/purchaseAccount');
    const itemGroups = await sendAPIRequest<any[]>('/itemGroup');
    setTableData({ companies: companies, sales: sales, purchases: purchases, itemGroups: itemGroups });
  }

  const setCompanyOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      company: tableData.companies,
      companiesOptions: tableData.companies.map((company: CompanyFormData) => ({
        value: company.company_id,
        label: company.companyName,
      })),
    }));
  }

  const setSalesOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      salesOptions: tableData.sales.map((sales: SalesPurchaseFormData) => ({
        value: sales.sp_id,
        label: sales.sptype,
      })),
    }));
  }

  const setPurchaseOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      purchaseOptions: tableData.purchases.map((purchase: SalesPurchaseFormData) => ({
        value: purchase.sp_id,
        label: purchase.sptype,
      })),
    }));
  }
  const setItemGroupsOptions = () => {
    setOptions((prevOption) => ({
      ...prevOption,
      groupOptions: tableData.itemGroups.map((group: ItemGroupFormData) => ({
        value: group.group_code,
        label: group.group_name,
      })),
    }));
  }

  const handleFieldChange = (option: Option | null, id: string) => {
    formik.setFieldValue(id, option?.value);
  };

  const handleFieldValue = (name: string, id: number) => {
    if (name === 'compId') {
      const selectedCompany = tableData.companies.find((company: any) => company.company_id === id);
      if (selectedCompany) {
        formik.setFieldValue('purAccId', selectedCompany?.purchaseId);
        formik.setFieldValue('saleAccId', selectedCompany?.salesId);
        selectedCompany?.isDiscountPercent === 'Yes' ? formik.setFieldValue('discountPer', selectedCompany?.discPercent) : formik.setFieldValue('discountPer', 0);
        formik.setFieldValue('shortName', selectedCompany?.shortName);
      }
    }
  }

  const handleFocusShift = (field: string) => {
    document.getElementById(field)?.focus();
    setFocused(field);
  }

  const handleCompanyList = () => {
    setPopupList({
      isOpen: true,
      data: {
        heading: 'Select Company',
        headers: [{ label: 'Company', key: 'companyName' }, { label: 'Station', key: 'Station.station_name' }],
        newItem: () => openTab('Company', <Company type='add' />),
        autoClose: true,
        apiRoute: '/company',
        searchFrom: 'companyName',
        handleSelect: (rowData: any) => {
          handleFieldChange({ label: rowData.companyName, value: rowData.company_id }, 'compId');
          handleFieldValue('compId', rowData.company_id);
          controlRoomSettings.packaging ? handleFocusShift('packing') : (controlRoomSettings.batchWiseManufacturingCode ? handleFocusShift('shortName') : handleFocusShift('service'));
        },
        onEsc: () => {
          setPopupList({ isOpen: false, data: {} });
          controlRoomSettings.packaging ? document.getElementById('packing')?.focus() : (controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : 'service')
        },
      }
    })
  }

  const basicInfoFields = [
    { label: 'Item Name', id: 'name', name: 'name', isRequired: true, type: 'text', nextField: 'compId', autoFocus: true },
    {
      label: 'Company',
      id: 'compId',
      name: 'compId',
      isRequired: true,
      type: 'name',
      onClick: handleCompanyList,
      options: options.companiesOptions,
      nextField: controlRoomSettings.packaging ? 'packing' : controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : 'service',
      prevField: 'name',
    },
    ...controlRoomSettings.packaging ? [{ label: 'Packing', id: 'packing', name: 'packing', type: 'text', nextField: 'shortName', prevField: 'compId' }] : [],
  ];

  const container1Fields = [
    ...controlRoomSettings.batchWiseManufacturingCode ? [{ label: 'MFG. Code', id: 'shortName', name: 'shortName', type: 'text', prevField: controlRoomSettings.packaging ? 'packing' : 'compId', nextField: 'service' }] : [],
    {
      label: 'Type',
      id: 'service',
      name: 'service',
      type: 'select',
      options: controlRoomSettings.allowItemAsService
        ? [{ label: 'Goods', value: 'Goods' }, { label: 'Services', value: 'Services' }]
        : [{ label: 'Goods', value: 'Goods' }],
      nextField: 'hsnCode',
      prevField: controlRoomSettings.batchWiseManufacturingCode ? 'shortName' : controlRoomSettings.packaging ? 'packing' : 'compId',
    },
    { label: 'HSN/SAC', id: 'hsnCode', name: 'hsnCode', type: 'text', isRequired: true, nextField: 'itemGroupCode', prevField: 'service' },
    { label: 'Item Group', id: 'itemGroupCode', name: 'itemGroupCode', type: 'select', nextField: 'scheduleDrug', prevField: 'hsnCode', options: options.groupOptions },
    {
      label: 'Schedule Drug',
      id: 'scheduleDrug',
      name: 'scheduleDrug',
      type: 'select',
      options: [{ label: 'Non-H1', value: 'NON-H1' }, { label: 'Schedule H1', value: 'H1' }],
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
        options: [{ label: 'RX', value: 'RX' }, { label: 'Non-RX', value: 'NON-RX' }],
      }] : [],
  ];

  const container2Fields = [
    { label: 'Sales Account', id: 'saleAccId', name: 'saleAccId', type: 'select', options: options.salesOptions, prevField: controlRoomSettings.rxNonrx ? 'prescriptionType' : 'scheduleDrug', nextField: 'purAccId' },
    { label: 'Purchase Account', id: 'purAccId', name: 'purAccId', type: 'select', options: options.purchaseOptions, prevField: 'saleAccId', nextField: 'discountPer' },
    { label: 'Cash Discount %', id: 'discountPer', name: 'cashDiscountPer', type: 'number', nextField: 'marginPercentage', prevField: 'purAccId' },
    { label: 'Margin %', id: 'marginPercentage', name: 'marginPercentage', type: 'number', nextField: 'minQty', prevField: 'discountPer' },
    { label: 'Min. Quantity', id: 'minQty', name: 'minQty', nextField: 'maxQty', type: 'number', prevField: 'marginPercentage' },
    { label: 'Max. Quantity', id: 'maxQty', name: 'maxQty', prevField: 'minQty', type: 'number', nextField: controlRoomSettings.rackNumber ? 'rackNumber' : controlRoomSettings.dpcoAct ? 'dpcoact' : 'upload' },
  ];

  const container3Fields = [
    ...controlRoomSettings.rackNumber ? [{ label: 'Rack No.', id: 'rackNumber', name: 'rackNumber', type: 'text', nextField: 'dpcoact', prevField: 'maxQty' }] : [],
    ...controlRoomSettings.dpcoAct
      ? [{
        label: 'DPCO Act.',
        id: 'dpcoact',
        name: 'dpcoact',
        type: 'select',
        nextField: 'upload',
        prevField: controlRoomSettings.rackNumber ? 'rackNumber' : 'maxQty',
        options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
      }] : [],
    { label: 'Upload Img.', id: 'upload', name: 'upload', type: 'file', nextField: (formik.isValid) ? 'submit_all' : 'name', prevField: controlRoomSettings.dpcoAct ? 'dpcoact' : controlRoomSettings.rackNumber ? 'rackNumber' : 'maxQty' },
  ];
  return (
    <div className='flex flex-col w-full gap-14 my-4'>
      <Container title='Basic Info' fields={basicInfoFields} formik={formik} focused={focused} setFocused={setFocused} className={'!grid-cols-3 !gap-6'} labelClassName={'!min-w-[150px]'} />
      <div className='flex flex-row gap-8'>
        <Container title='Item Info' fields={container1Fields} formik={formik} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[150px]'} />
        <Container title='Cost Details' fields={container2Fields} formik={formik} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[150px]'} />
        <Container title='Misc.' fields={container3Fields} formik={formik} focused={focused} setFocused={setFocused} className={'!flex flex-col !gap-6'} labelClassName={'!min-w-[150px]'} />
      </div>

      {popupList.isOpen && <SelectList
        tableData={[]}
        heading={popupList.data.heading}
        closeList={() => setPopupList({ isOpen: false, data: {} })}
        headers={popupList.data.headers}
        footers={popupList.data.footers}
        apiRoute={popupList.data.apiRoute}
        handleSelect={(rowData) => { popupList.data.handleSelect(rowData) }}
        handleNewItem={popupList.data?.newItem}
        searchFrom={popupList.data.searchFrom}
        autoClose={popupList.data.autoClose}
        onEsc={popupList.data.onEsc}
        extraQueryParams={popupList.data.extraQueryParams || {}}
      />}

    </div>
  );
};

export default BasicItemEdit;
