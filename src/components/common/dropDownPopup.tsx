import { useEffect, useMemo, useRef, useState } from 'react';
import { Popup } from '../popup/Popup';
import { dropDownPopupProps } from '../../interface/global';

interface DropDownPopupProps extends dropDownPopupProps {
  dataKeys: {
    [key: string]: string;
  };
}

export const DropDownPopup = ({
  heading,
  className,
  setOpenDataPopup,
  headers,
  tableData,
  setCurrentSavedData,
  dataKeys
}: DropDownPopupProps) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const [focusedRowData, setFocusedRowData] = useState<any>(tableData[0]);
  const tableRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredTableData = useMemo(() => {
    if (!searchValue) {
      return tableData;
    }
    if (searchFilter === 'all') {
      return tableData.filter((d: any) => {
        const keys = headers.map((p: any) => p.key)
        for (let i = 0; i < keys.length; i++) {
          if (d[keys[i]]?.toString().toLowerCase().includes(searchValue.toLowerCase().trim())) return true;
        }
      })
    }
    return tableData.filter((d: any) => `${d[searchFilter]}`.toLowerCase().includes(searchValue.toLowerCase().trim()))
  }, [searchValue, searchFilter])

  useEffect(() => {
    document.body.classList.add("!overflow-hidden");
    setSearchFilter('all')
    return () => {
      document.body.classList.remove("!overflow-hidden");
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT')
        event.preventDefault();
      const focusRow = tableRefs.current[focusedRowIndex]
      focusRow ? focusRow.focus() : tableRefs.current[0]?.focus()
      const parentElement = target.parentElement
      if (parentElement?.getAttribute('tabindex') === '-1') {
        const rowIndex = +parentElement.children[0].innerHTML - 1;
        setFocusedRowIndex(() => rowIndex);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [focusedRowIndex])

  useEffect(() => {
    document.getElementById('dropDownPopup')?.addEventListener('keydown', handleKeyDown);
    return () => {
      document.getElementById('dropDownPopup')?.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedRowData, heading, tableData.length]);

  const handleKeyDown = (event: KeyboardEvent) => {
    const l = tableRefs.current.filter(tr => tr !== null).length;
    if (event.key === 'ArrowDown') {
      setFocusedRowIndex((prevIndex) => {
        if (prevIndex > l - 1) {
          return 0
        }
        return prevIndex === l - 1 ? 0 : prevIndex + 1
      });
    } else if (event.key === 'ArrowUp') {
      setFocusedRowIndex((prevIndex) => {
        if (prevIndex < 0) {
          return 0
        }
        return prevIndex === 0 ? l - 1 : prevIndex - 1
      });
    } else if (event.key === 'Enter') {
      const key = dataKeys[heading];
      if (key) {
        setCurrentSavedData((prevData: any) => ({
          ...{
            ...prevData,
            [key]: focusedRowData,
          }
        }));
      }
      setOpenDataPopup(false);
    }
    else if (event.key === 'Escape') {
      setOpenDataPopup(false);
    } else if (event.key === 'Tab') {
      tableRefs.current[0]?.focus()
      event.preventDefault()
    } else if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 48 && event.keyCode <= 57)) {
      document.getElementById('inputSearchRow')?.focus()
    }
  };

  useEffect(() => {
    if (filteredTableData.length <= 1)
      setFocusedRowData(filteredTableData[0]);
  }, [filteredTableData])

  useEffect(() => {
    tableRefs.current[focusedRowIndex]?.focus();
    setFocusedRowData(filteredTableData[focusedRowIndex]);
  }, [focusedRowIndex]);

  return (
    <Popup
      heading={heading}
      childClass='!max-h-fit w-full min-w-[50vw]'
      className={className}
      isSuggestionPopup={true}
      id='dropDownPopup'
    >

      <div className='flex ms-4'>
        <input type="text" id='inputSearchRow' onBlur={() => {
          setFocusedRowIndex(0)
        }} value={searchValue} placeholder='Search here..' onChange={(e) => setSearchValue(e.target.value)} className='border text-[16px] px-2' />
        <select onChange={(e) => setSearchFilter(e.target.value)} value={searchFilter}>
          {headers.map((h: any, idx: number) => <option key={idx} value={h.value}>{h.key}</option>)}
          <option value={'all'}>all</option>
        </select>
      </div>

      <div className='mx-4 h-fit max-h-[40rem] overflow-auto border-[1px] border-gray-400 border-solid my-4'>
        <table className='table-auto w-full border-collapse'>
          <thead className='sticky top-0 overflow-auto'>
            <tr>
              {headers.map((header: any, index: number) => (
                <th
                  key={index}
                  className='w-fit border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2'
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTableData?.map((row: any, rowIndex: number) => (
              <tr
                key={rowIndex}
                ref={(el) => (tableRefs.current[rowIndex] = el)}
                tabIndex={-1}
                className={focusedRowIndex === rowIndex ? 'bg-[#EAFBFCFF] border-[2px] focus:outline-0 !rounded-lg border-solid border-black' : ''}
              >
                {headers.map((header: any, colIndex: number) => (
                  <td key={colIndex} className='border border-gray-400 p-2'>
                    {row[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Popup>
  );
};