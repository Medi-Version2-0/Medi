import { useEffect, useRef, useState } from 'react';
import Button from './button/Button';
import { Popup } from '../popup/Popup';
import { dropDownPopupProps } from '../../interface/global';

export const DropDownPopup = ({ heading, className, setOpenDataPopup, headers, tableData, setCurrentSavedData }: dropDownPopupProps) => {

  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const [focusedRowData, setFocusedRowData] = useState<any[]>(tableData[0]);
  const tableRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  useEffect(() => {
    tableRefs.current[focusedRowIndex]?.focus();
    setFocusedRowData(tableData[focusedRowIndex]);
  }, [focusedRowIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedRowData, heading, tableData.length]);

  useEffect(() => {
    document.body.classList.add("!overflow-hidden");
    return () => {
        document.body.classList.remove("!overflow-hidden");
    };
}, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      setFocusedRowIndex((prevIndex) => prevIndex === tableData.length - 1 ? 0 : prevIndex + 1);
    } else if (event.key === 'ArrowUp') {
      setFocusedRowIndex((prevIndex) => prevIndex === 0 ? tableData.length - 1 : prevIndex - 1);
    } else if (event.key === 'Enter') {
      setCurrentSavedData((prevData: any) => ({
        ...prevData,
        item: heading === 'Items' ? focusedRowData : prevData.item,
        batch: heading === 'Batches' ? focusedRowData : prevData.batch,
      }));
      console.log('Saved data: ', focusedRowData);
      setOpenDataPopup(false);
    }
    else if(event.key === 'Escape'){
      setOpenDataPopup(false);
    }
  };

  return (
    <Popup
      heading={heading}
      childClass='!max-h-fit w-full'
      className={className}
      isSuggestionPopup={true}
    >
      <div className='w-[90%] mx-auto h-fit max-h-[40rem] overflow-auto border-[1px] border-gray-400 border-solid my-4'>
        <table className='table-auto w-full border-collapse'>
          <thead className='sticky top-0 overflow-auto'>
            <tr>
              {headers.map((header: any, index: number) => (
                <th
                  key={index}
                  className='border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2'
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row: any, rowIndex: number) => (
              <tr
                key={rowIndex}
                ref={(el) => (tableRefs.current[rowIndex] = el)}
                tabIndex={-1}
                className={focusedRowIndex === rowIndex ? 'bg-[#EAFBFCFF] border-[1px] border-solid border-[#009196FF]' : ''}
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
