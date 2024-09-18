import { useEffect, useState } from 'react';
import { Popup } from '../../components/popup/Popup';
import { useFormik } from 'formik';
import FormikInputField from '../../components/common/FormikInputField';
import * as Yup from 'yup';
import CustomSelect from '../../components/custom_select/CustomSelect';
import { Option } from '../../interface/global';
import Button from '../../components/common/button/Button';
import { SelectList } from '../../components/common/customSelectList/customSelectList';
import { challanHeaderForSaleBill, itemHeaderForSaleBill } from '../../constants/saleChallan';

export const PendingChallanPopup = ({ heading, className, challanItemsByPartyId, setBillTableData, isEditing, setPendingChallansPopup, partyId }: any) => {
  const [focused, setFocused] = useState('');
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({ isOpen: false, data: {} })

  const validationSchema = Yup.object({
    itemsSelected: Yup.number().nullable()
      .test('is-valid', 'Items must be less than the pending Challans or greater than 0', (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{0,2})?$/.test(value.toString()) && value > 0;
      })
      .min(1, 'Items must be greater than 0')
      .max(challanItemsByPartyId.length, 'Items must be less than total challans'),
  });

  const pendingChallansFormik: any = useFormik({
    initialValues: {
      selectItem: '',
      itemsSelected: '',
    },
    validationSchema,
    onSubmit: (values: any) => {
      if (values.selectItem === 'Select All') {
        setBillTableData(challanItemsByPartyId);
      } else if (values.selectItem === 'No of Items') {
        setBillTableData(challanItemsByPartyId.slice(0, +values.itemsSelected));
      } else if (values.selectItem === 'Leave') {
        setBillTableData([]);
      }
      closePopup();
    },
  });

  useEffect(() => {
    setFocused('selectItem');
  }, []);

  const handleSelectChallansByItems = (selectedData: any, key: any) => {
    const selectedIds = new Set(selectedData?.map((data: any) => data[key]));
    const finalData = challanItemsByPartyId.filter((challans: any) => selectedIds.has(challans[key]));
    isEditing.current = false;
    setBillTableData(finalData);
    closePopup();
    document.getElementById(`cell-${finalData.length}-0`)?.focus();
  };

  const setInputValues = () => {
    const { selectItem } = pendingChallansFormik.values;
    if (selectItem === 'No of Items') {
      pendingChallansFormik.setFieldValue('itemsSelected', challanItemsByPartyId.length);
    } else if (selectItem === 'Select By *') {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Items',
          headers: [...itemHeaderForSaleBill],
          apiRoute: `/invoiceBill/lineItems/${partyId}`,
          searchFrom: 'name',
          handleSelect: (selectedData: any) => handleSelectChallansByItems(selectedData, 'id'),
          autoClose: true
        }
      })
    } else if (selectItem === 'Select by CH. NO.') {
      setPopupList({
        isOpen: true,
        data: {
          heading: 'Select Challan',
          headers: [...challanHeaderForSaleBill],
          apiRoute: `/invoiceBill/challans/${partyId}`,
          searchFrom: 'challanNumber',
          handleSelect: (selectedData: any) => handleSelectChallansByItems(selectedData, 'challanNumber'),
          autoClose: true
        }
      })
    } else {
      pendingChallansFormik.setFieldValue('itemsSelected', '');
    }
  }
  useEffect(() => {
    setInputValues();
  }, [pendingChallansFormik.values.selectItem])

  useEffect(() => {
    document.body.classList.add('!overflow-hidden');
    return () => document.body.classList.remove('!overflow-hidden');
  }, [challanItemsByPartyId]);

  const totalChallanAmt = challanItemsByPartyId.reduce((acc: number, curr: { amt: number }) => acc + curr.amt, 0);

  const handleFieldChange = (option: Option | null, id: string) => {
    pendingChallansFormik.setFieldValue(id, option?.value);
  };

  const closePopup = () => {
    setPendingChallansPopup(false);
  };

  return (
    <Popup heading={heading} childClass="!h-[25vh] w-full min-w-[50vw] !max-h-full" className={className} id="">
      <div className="flex mx-4 mt-4">
        {challanItemsByPartyId.length > 0 && (
          <div className="w-full h-fit border-2 border-solid border-gray-400 p-2">
            <div className="flex flex-col gap-5">
              <div className="flex gap-5 items-center justify-center">
                <span>Items in Challans: {challanItemsByPartyId.length}</span>
                <span>Total Challan Amount: {totalChallanAmt}</span>
              </div>
              <form onSubmit={pendingChallansFormik.handleSubmit} className="flex w-full px-2 justify-between">
                <div className="flex w-[45%]">
                  <CustomSelect
                    isPopupOpen={false}
                    label='Select Item'
                    id='selectItem'
                    labelClass='min-w-[120px]'
                    isFocused={focused === 'selectItem'}
                    value={pendingChallansFormik.values.selectItem === '' ? null : { label: pendingChallansFormik.values.selectItem, value: pendingChallansFormik.values.selectItem }}
                    onChange={handleFieldChange}
                    options={[
                      { value: 'Select All', label: 'Select All' },
                      { value: 'No of Items', label: 'No of Items' },
                      { value: 'Select By *', label: 'Select By *' },
                      { value: 'Select by CH. NO.', label: 'Select by CH. NO.' },
                      { value: 'Leave', label: 'Leave' },
                    ]}
                    isSearchable={false}
                    disableArrow={false}
                    hidePlaceholder={false}
                    className='!h-6 rounded-sm'
                    isRequired={false}
                    error={pendingChallansFormik.errors.selectItem}
                    isTouched={pendingChallansFormik.touched.selectItem}
                    onBlur={() => {
                      pendingChallansFormik.setFieldTouched('selectItem', true);
                      setFocused('');
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                      const dropdown = document.querySelector('.custom-select__menu');
                      if (e.key === 'Enter') {
                        !dropdown && e.preventDefault();
                        if (pendingChallansFormik.values.selectItem === 'Select All' || pendingChallansFormik.values.selectItem === 'Leave') {
                          document.getElementById('submit_pendingChallan')?.focus();
                        }
                        document.getElementById('itemsSelected')?.focus();
                      }
                    }}
                  />
                </div>

                {pendingChallansFormik.values.selectItem === 'No of Items' && (
                  <div className="flex w-[40%] items-center">
                    <FormikInputField
                      isPopupOpen={false}
                      label="Items"
                      id="itemsSelected"
                      name="itemsSelected"
                      isRequired={true}
                      formik={pendingChallansFormik}
                      className="h-fit !mb-0"
                      labelClassName="text-[16px] min-w-[70px]"
                      inputClassName="w-[150px] px-2 py-[6px] text-[10px] rounded-sm"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('submit_pendingChallan')?.focus();
                        }
                      }}
                      showErrorTooltip={!!(pendingChallansFormik.touched.itemsSelected && pendingChallansFormik.errors.itemsSelected)}
                    />
                  </div>
                )}
              </form>
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
                selectMultiple={true}
              />}
              <div className='w-full flex justify-end p-2'>
                <Button
                  type='fill'
                  padding='px-4 py-2'
                  id='submit_pendingChallan'
                  btnType='button'
                  disable={!(pendingChallansFormik.isValid)}
                  handleOnClick={() => pendingChallansFormik.handleSubmit()}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Popup>
  );
};
