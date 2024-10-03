import { useEffect, useRef, useState } from 'react';
import { Popup } from '../../popup/Popup';
// import { getNestedValue } from '../../../helper/helper';
import { tab } from '@testing-library/user-event/dist/tab';
import  NumberInput  from "../../common/numberInput/numberInput"
import useApi from '../../../hooks/useApi';

interface SelectListTableProps {
  heading: string;
  closeList: () => void;
  className?: string;
  headers: { label: string; key: string; auto?: boolean; isInput?: boolean }[];
  tableData: any[];
  onValueChange?: (rowIndex: number, colIndex: number, value: string) => void; // Update this to handle both row and column indices
  focusedColumn?: number;
  onSave: (updatedData: any[]) => void;
  setSavedData:any;
  setSaveUpdatedData:any;
  isUpdateMode?: boolean; 
  setIsUpdateMode?: any;
  batchData?:any;
}

export const SelectListTableWithInput: React.FC<SelectListTableProps> = ({
  heading,
  className,
  closeList,
  headers,
  tableData,
  onValueChange,
  focusedColumn,
  onSave,
  setSavedData,
  setSaveUpdatedData,
  isUpdateMode = false,
  setIsUpdateMode,
  batchData,
}) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const tableRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const initialTableData = isUpdateMode ? tableData : tableData.map(row => {
    const emptyRow: any = {};
    headers.forEach(header => {
      emptyRow[header.key] = header.isInput ? '' : row[header.key];
    });
    return emptyRow;
  });

  const [updatedTableData, setUpdatedTableData] = useState<any[]>(initialTableData);

  useEffect(() => { 
    if (focusedRowIndex === 0 && focusedColumn === 1) {
      document.getElementById(`inputField-0-1`)?.focus();
    }
  }, [])

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    const updatedData = [...updatedTableData];
    const headerKey = headers[colIndex].key;
    setUpdatedTableData(updatedData);
  };


//   const handleKeyDown = (event: KeyboardEvent) => {
//     if (event.key === 'Enter') {
//         event.preventDefault();
//         const nextColumnIndex = (focusedColumn !== undefined && focusedColumn < headers.length - 1) ? focusedColumn + 1 : focusedColumn;
//         const nextInputId = `inputField-${focusedRowIndex+1}-${nextColumnIndex}`;
//         const nextInput = document.getElementById(nextInputId);
        
//         if (nextInput) {
//             nextInput.focus();
//         } else if (focusedRowIndex === tableData.length - 1) {
//           onSave(updatedTableData);
//           setIsUpdateMode(false);
//           closeList();
//         }
//     }
//     else if(event.key === 'Escape'){
//       event.preventDefault();
//       const data = isUpdateMode ? updatedTableData : updatedTableData.map(row => {
//         const emptyRow: any = {};
//         headers.forEach(header => {
//           emptyRow[header.key] = header.isInput ? '' : row[header.key];
//         });
//         return emptyRow;
//       });
//       console.log("updated table data in esc ===> ", data)
      
//       onSave(data);
//       closeList();
//     }
// };


// const handleKeyDown = async (event: KeyboardEvent) => {
//   if (event.key === 'Enter' || event.key === 'Tab') {
//     if (event.key === 'Enter') event.preventDefault();

//     if (focusedColumn !== undefined) {
//       const nextColumnIndex = (focusedColumn < headers.length - 1) ? focusedColumn + 1 : 0;
//       const nextRowIndex = (nextColumnIndex === 0) ? focusedRowIndex + 1 : focusedRowIndex;

//       if (nextRowIndex < updatedTableData.length) {
//         const nextInputId = `inputField-${nextRowIndex}-${nextColumnIndex+ 1}`;
//         const nextInput = document.getElementById(nextInputId);

        
//         // if (nextInput) {
//         //   console.log("3------------------", nextInputId)
//         //   nextInput.focus();
//         //   setFocusedRowIndex(nextRowIndex); // Update the focused row index
//         // }
//       } else {
//         console.log("4------------------",isUpdateMode, updatedTableData)
//         // If we are at the last row, save the data and close
//         // onSave(updatedTableData);
//         if(isUpdateMode){
//           // setSaveUpdatedData(updatedTableData)
//         }else{
//           setSavedData(updatedTableData);
//         }

        
//         setIsUpdateMode(false); 
//         closeList();
//       }
//     }
//   } else if (event.key === 'Escape') {
//     // event.preventDefault();
//     // const data = isUpdateMode ? updatedTableData : updatedTableData.map(row => {
//     //   console.log("5------------------",)
//     //   const emptyRow: any = {};
//     //   headers.forEach(header => {
//     //     emptyRow[header.key] = header.isInput ? '' : row[header.key];
//     //   });
//     //   return emptyRow;
//     // });
//     const data = updatedTableData.map(row => {
//       const emptyRow: any = {};
//       headers.forEach(header => {
//         emptyRow[header.key] = header.isInput ? '' : row[header.key];
//       });
//       return emptyRow;
//     });
//     if(isUpdateMode){
//       setUpdatedTableData(updatedTableData)
//     }else{
//       setSavedData(data);
//     }
//     console.log("updated table data in esc ===> ", data);
//     // onSave(data);
//     closeList();
//   }
// };

const handleKeyDown = (event: KeyboardEvent) => {
  const isEnter = event.key === 'Enter';
  const isTab = event.key === 'Tab';
  
  if (isEnter || isTab) {
    if (event.key === 'Enter') event.preventDefault();
  
    const nextColumnIndex = focusedColumn !== undefined ? (focusedColumn + 1) % headers.length : 0;
    const nextRowIndex = nextColumnIndex === 0 ? focusedRowIndex + 1 : focusedRowIndex;

    if (nextRowIndex >= updatedTableData.length) {
      if (isUpdateMode) {
        setSaveUpdatedData([...updatedTableData]); // Use a new array reference
      } else {
        setSavedData([...updatedTableData]); // Use a new array reference
      }
      setIsUpdateMode(false);
      closeList();
    } else {
      const nextInputId = `inputField-${nextRowIndex}-${nextColumnIndex}`;
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
      setFocusedRowIndex(nextRowIndex);
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();

    const data = isUpdateMode ? updatedTableData : updatedTableData.map(row => {
      const emptyRow: any = {};
      headers.forEach(header => {
        emptyRow[header.key] = header.isInput ? '' : row[header.key];
      });
      return emptyRow;
    });

    if (isUpdateMode) {
      setUpdatedTableData([...updatedTableData]); 
    } else {
      setSavedData([...data]); 
    }

    onSave({...batchData, data}); // Make sure onSave handles state updates correctly
    closeList(); // Ensure the list is being properly closed
  }
};



  useEffect(() => {
    document.getElementById('dropDownPopup')?.addEventListener('keydown', handleKeyDown);
    return () => {
      document.getElementById('dropDownPopup')?.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedRowIndex, updatedTableData]);

  return (
    <Popup
            heading={`${heading}`}
            childClass='h-fit w-full min-w-[50vw] !max-h-[100vh] overflow-scroll'
            className={className}
            isSuggestionPopup={true}
            id='dropDownPopup'
            onClose={closeList}
        >
        <div className="w-full relative">
          <div

            className='mx-4 h-[50vh] overflow-auto border-[1px] border-gray-400 border-solid my-4 outline-none'
            id='selectListData'
            // tabIndex={0}
          >
            <table className='table-auto w-full border-collapse'>
              <thead className='sticky top-0'>
                <tr>
                  {headers.map((header: any, index: number) => (
                    <th
                      key={index}
                      className='w-fit bg-[#009196FF] text-center text-white p-2'
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {updatedTableData.map((row: any, rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    ref={(el) => (tableRefs.current[rowIndex] = el)}
                    tabIndex={-1}
                    id={`row-${rowIndex}`}
                    onClick={() => setFocusedRowIndex(rowIndex)}
                    className={
                      focusedRowIndex === rowIndex
                        ? 'bg-[#EAFBFCFF] border-t-2 border-b-2 focus:outline-0 !rounded-lg border-solid border-black'
                        : ''
                    }
                  >
                    {headers.map((header: any, colIndex: number) => (
                      <td
                        key={colIndex}
                        className={`border-[1px] border-gray-400 p-2`}
                      > 
                        {header.isInput ? (
                          // <input
                          //   type="number"
                          //   id={`inputField-${rowIndex}-${colIndex}`}
                          //   className="w-full px-2 py-[6px] text-[12px] font-medium rounded-sm"
                          //   value={row[header.key]}
                          //   onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                          // />
                          <NumberInput
                          id={`inputField-${rowIndex}-${colIndex}`}
                          name={header.key}
                          value={row[header.key]}
                          onChange={(value: any) => handleInputChange(rowIndex, colIndex, value)}
                          autoFocus={focusedRowIndex === rowIndex && focusedColumn === colIndex}
                          nextField={`inputField-${rowIndex + 1}-${colIndex}`}
                          prevField={`inputField-${rowIndex - 1}-${colIndex}`}
                        />
                        ) : header.auto ? (rowIndex + 1) : ( row[header.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </Popup>
  );
};
