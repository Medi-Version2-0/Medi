import { useEffect, useMemo, useRef, useState } from "react";
import { itemFooters, itemHeader } from "../../constants/saleChallan";
import { TabManager } from "../../components/class/tabManager";
import { useTabs } from "../../TabsContext";
import Items from "../item";
import { ChallanTable } from "../../components/common/challanTable";
import { SelectList } from "../../components/common/customSelectList/customSelectList";
import { useControls } from "../../ControlRoomContext";


interface RowData {
  id: number;
  columns: {
    [key: string]: string | number | any;
  };
}

interface saleOrderItems{
  itemCode: number,
  Qty: number,
  free: number,
  freeType: string,
  bigQty?: number,
}

interface CreateSaleOrderTableProps{
  selectedParty: any;
  formik: any;
  dataItems: any;
}

export const CreateSaleOrderTable = ({ selectedParty, formik, dataItems }: CreateSaleOrderTableProps) => {
  const finalItemsDataFromTable = useRef<saleOrderItems[]>([]);
  const { decimalValueCount } = useControls().controlRoomSettings;

  const schemeTypeOptions = useMemo(() => {
    return [
      { label: 'Pieces', value: 'pieces' },
      { label: 'Percent', value: '%' },
      { label: 'Rupees', value: 'rupees' },
      { label: 'Rupees / PC', value: 'rupees/pc' },
    ]
  }, [])

  const headers:any[] = [
    { name: 'Item name', key: 'name', width: '40%', type: 'input', props: { inputType: 'text', label: true, handleClick: ({ rowIndex }: any) => { openItem(rowIndex) } } },
    { name: 'Quantity', key: 'Qty', width: '14%', type: 'input', props: { inputType: 'number', max: true , handleChange: (args: any) => { handleInputChange(args) } } },
    { name: 'Scheme', key: 'scheme', width: '14%', type: 'input', props: { inputType: 'number', handleChange: (args: any) => { handleInputChange(args); } } },
    { name: 'Scheme type', key: 'schemeType', width: '20%', type: 'customSelect', props: { options: schemeTypeOptions, handleChange: (args: any) => { handleSelectChange(args); } } },
  ];

  const initialRows: RowData[] = Array.from({ length: 1 }, (_, rowIndex) => ({
    id: rowIndex + 1,
    columns: headers.reduce(
      (acc, header) => ({ ...acc, [header.key]: header.props?.inputType === 'number' ? null : '' }),
      {}
    ),
  }));

  const { openTab } = useTabs();
  const tabManager = TabManager.getInstance();
  const [popupList, setPopupList] = useState<{ isOpen: boolean, data: any }>({
    isOpen: false,
    data: {}
  })
  const [gridData, setGridData] = useState<RowData[]>(initialRows);

  useEffect(() => {
    // if we are updating the sale order then dataItems came from backend here i am setting gridData or manipulating the data to desired as in gridData while creating a new order
    if (dataItems) {
      const newGridData = dataItems.map((item:any,index:number)=>{
        const name = {
          label: item.itemCode.name.toUpperCase(),
          value: item.itemCode.id
        }
        const schemeType = schemeTypeOptions.find((o:any)=> o.value === item.freeType);
        return { id: index + 1,
          columns: {
            ...item,
            Qty: item.Qty.toFixed(decimalValueCount),
            scheme: item.free.toFixed(decimalValueCount),
            name,
            schemeType,
            hideDeleteIcon: item.qtySupplie ? true : false,
            max: item.qtySupplie ? item.Qty : undefined,
          }
        }
      });
      setGridData(newGridData);
    }
  }, [dataItems])

  const openItem = (rowIndex: number) => {
    setPopupList({
      isOpen: true, data: {
        heading: 'Item', headers: [...itemHeader], footers: itemFooters, newItem: () => tabManager.openTab('Items', <Items type='add' />, [], openTab),
        apiRoute: '/item',
        extraQueryParams: {
          ...(selectedParty?.party_id ? { partyId: selectedParty.party_id } : {}),
          sort: 'name'
        },
        searchFrom: 'name',
        handleSelect: (rowData: any) => {
          updateGridData(rowIndex,rowData);
          setPopupList({ isOpen: false, data: {} })
        },
        autoClose: false
      }
    })
  }
  
  function updateGridData(indx:number,data:any){
    const newGridData = gridData.map((d:any,idx:number)=>{
      if(idx !== indx) return d;
      return {...d, columns: {
          ...d.columns,
          name: {
            label: data.name.toUpperCase(),
            value: data.id
          }
        }
      }
    })
    setGridData(newGridData);
  }

  // if row deleted then autofill with initial values
  useEffect(()=>{
    if (!gridData.length) {
      return setGridData(initialRows)
    }
    finalItemsDataFromTable.current = gridData.map((d:any)=>{
      const { columns } = d;
      return {
        ...columns,
        itemCode: columns.name.value,
        Qty: columns.Qty,
        free: columns.scheme,
        freeType: columns.schemeType.value,
      }
    })
    formik.setFieldValue('items',finalItemsDataFromTable.current);
  }, [gridData])

  const handleInputChange = async ({ rowIndex, header, value }: any) => {
    const newGridData = [...gridData];
    newGridData[rowIndex].columns[header] = value;
    setGridData(newGridData);
  };

  const handleSelectChange = ({ selectedOption, rowIndex, header }: any) => {
    if (selectedOption) handleInputChange({ rowIndex, header, value: selectedOption || {} });
  };

  return (
    <div id='challanTable' className="flex flex-col gap-1">
      <ChallanTable
        headers={headers}
        gridData={gridData}
        setGridData={setGridData}
        newRowTrigger={headers.length - 1}
      />

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
}