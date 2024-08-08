import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    tableRefs.current[focusedRowIndex]?.focus();
    setFocusedRowData(tableData[focusedRowIndex]);
  }, [focusedRowIndex, tableData]);

  useEffect(() => {
    document.body.classList.add("!overflow-hidden");
    const handleClickOutside = (event: Event) => {
      event.preventDefault();
      tableRefs.current[0]?.click()
      const target = event.target as HTMLElement
      const parentElement = target.parentElement
      if (parentElement?.getAttribute('tabindex') === '-1') {
        const key = dataKeys[heading]
        const rowIndex = +parentElement.children[0].innerHTML - 1;
        setFocusedRowIndex(() => rowIndex);
        setCurrentSavedData((prevData: any) => ({
          ...{
            ...prevData,
            [key]: focusedRowData,
          }
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove("!overflow-hidden");
    };
  }, [])

  useEffect(() => {
    document.getElementById('dropDownPopup')?.addEventListener('keydown', handleKeyDown);
    return () => {
      document.getElementById('dropDownPopup')?.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedRowData, heading, tableData.length]);

  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault()
    if (event.key === 'ArrowDown') {
      setFocusedRowIndex((prevIndex) => prevIndex === tableData.length - 1 ? 0 : prevIndex + 1);
    } else if (event.key === 'ArrowUp') {
      setFocusedRowIndex((prevIndex) => prevIndex === 0 ? tableData.length - 1 : prevIndex - 1);
    } else if (event.key === 'Enter') {
      const key = dataKeys[heading];
      if (key) {
        setCurrentSavedData((prevData: any) => ({
          ...prevData,
          [key]: focusedRowData,
        }));
      }
      setOpenDataPopup(false);
    }
    else if (event.key === 'Escape') {
      setOpenDataPopup(false);
    }
  };

  return (
    <Popup
      heading={heading}
      childClass='!max-h-fit w-full min-w-[50vw]'
      className={className}
      isSuggestionPopup={true}
      id='dropDownPopup'
    >
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
            {tableData.map((row: any, rowIndex: number) => (
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