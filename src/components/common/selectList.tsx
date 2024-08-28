import { useEffect, useRef, useState, useMemo } from 'react';
import { Popup } from '../popup/Popup';
import { selectListProps } from '../../interface/global';
import { useFormik } from 'formik';
import FormikInputField from './FormikInputField';

interface DropDownPopupProps extends selectListProps {
  dataKeys?: {
    [key: string]: string;
  };
}

export const SelectList = ({
  heading,
  className,
  closeList,
  headers,
  footers,
  footerClass,
  tableData,
  handleSelect,
}: DropDownPopupProps) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const [focusedRowData, setFocusedRowData] = useState<any>(tableData[0]);
  const tableRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const formik = useFormik({
    initialValues: {
      searchBar: '',
      category: ''
    },
    onSubmit: () => {
      // Handle form submission if needed
    }
  });

  const filteredData = useMemo(() => {
    if (selectedCategory) {
      return tableData.filter((row) => {
        const cellValue = row[selectedCategory]?.toLocaleString();
        return cellValue?.toLowerCase()?.includes(formik.values.searchBar.toLowerCase());
      });
    } else {
      return tableData.filter((row) => {
        return headers.some((header) => {
          const cellValue = row[header.key]?.toLocaleString();
          return cellValue?.toLowerCase()?.includes(formik.values.searchBar.toLowerCase());
        });
      });
    }
  }, [formik.values.searchBar, selectedCategory, tableData, headers]);

  function makeRecordVisibility(recordIndex:number){
    const container = document.getElementById(`selectListData`)!;
    tableRefs.current[recordIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
    if (recordIndex === 0) {
      container.scrollTo({
        top:-42,
        behavior:'smooth'
      })
    }
    if(recordIndex === -2) {
      container.scrollTo({
        top: filteredData.length*41,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    document.getElementById('searchBar')?.focus();
    setFocusedRowData(filteredData[focusedRowIndex]);
  }, [focusedRowIndex,filteredData]);

  useEffect(()=>{
    setFocusedRowIndex(0);    
  },[filteredData]);

  useEffect(()=>{
    if(focusedRowIndex===0){
      makeRecordVisibility(0);
    }
    if(focusedRowIndex===filteredData.length) {
      makeRecordVisibility(filteredData.length - 1);
    }
  },[focusedRowIndex])

  useEffect(() => {
    document.body.classList.add('!overflow-hidden');
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.id === 'searchBar' || target.tagName === 'SELECT') return;
      const parentElement = target.parentElement;
      if (parentElement?.getAttribute('tabindex') !== '-1') {
        event.preventDefault();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('!overflow-hidden');
    };
  }, []);

  useEffect(() => {
    document.getElementById('dropDownPopup')?.addEventListener('keydown', handleKeyDown);
    return () => {
      document.getElementById('dropDownPopup')?.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedRowData, heading, filteredData.length]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedRowIndex((prevIndex) => prevIndex >= filteredData.length - 1 ? 0 : prevIndex + 1);
      makeRecordVisibility(focusedRowIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedRowIndex((prevIndex) => prevIndex <= 0 ? filteredData.length - 1 : prevIndex - 1);
      makeRecordVisibility(focusedRowIndex - 2);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (!filteredData.length) return;
      handleSelect(focusedRowData);
      closeList();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeList();
    } else if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
      document.getElementById('searchBar')?.focus();
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue('category', e.target.value);
    setSelectedCategory(e.target.value);
    formik.setFieldValue('searchBar', '');
    setFocusedRowIndex(0);
  };

  return (
    <Popup
      heading={heading}
      childClass='!h-[80vh] w-full min-w-[50vw] !max-h-full'
      className={className}
      isSuggestionPopup={true}
      id='dropDownPopup'
    >
       <div className='flex mx-4 mt-4'>
        <form onSubmit={formik.handleSubmit} className='flex w-full gap-5'>
          <div className="w-1/3 h-fit">
            <FormikInputField
              id='searchBar'
              name='searchBar'
              formik={formik}
              placeholder='Search...'
              autoFocus
              className='h-fit'
              inputClassName='px-2 py-[12px] text-[12px] font-medium rounded-sm'
            />
          </div>
          <select
            value={formik.values.category}
            name='category'
            onChange={handleCategoryChange}
            className='mr-4 p-2 border border-gray-400 rounded bg-white'
          >
            <option value=''>All</option>
            {headers.map((header, index) => (
              <option key={index} value={header.key}>
                {header.label}
              </option>
            ))}
          </select>
        </form>
      </div>
      <div className='flex flex-col h-[67vh] justify-between'>
        <div className='mx-4 h-4/5 overflow-auto border-[1px] border-gray-400 border-solid my-4' id='selectListData'>
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
              {filteredData.map((row: any, rowIndex: number) => (
                <tr
                  key={rowIndex}
                  ref={(el) => (tableRefs.current[rowIndex] = el)}
                  tabIndex={-1}
                  id={`row-${rowIndex}`}
                  onClick = {()=>{setFocusedRowIndex(rowIndex)}}
                  className={focusedRowIndex === rowIndex ? 'bg-[#EAFBFCFF] border-[2px] focus:outline-0 !rounded-lg border-solid border-black': ''}
                >
                  {headers.map((header: any, colIndex: number) => (
                    <td key={colIndex} className='border border-gray-400 p-2'>
                      {header.auto ? rowIndex + 1 : row[header.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {
          footers?.length && (
              <div className={`h-1/5 left-0 mx-4 ${footerClass}`}>
                  <div className={`flex gap-1 h-full w-full text-[12px]`}>
                      {footers.map((f: any,index:number) => {
                        return (
                          <fieldset key={index} className="border flex-1 rounded-sm h-full border-gray-300 px-1 py-1">
                            <legend className="font-semibold text-gray-700 px-2">
                              {f.label}
                            </legend>
                            <ul className='px-2'>
                              {f.data.map((d: any, index: number) => {
                                if (focusedRowData && focusedRowData[d.key]) {
                                  return <li key={index}>
                                    <div className="flex">
                                      <div className="w-5/12 pr-0 relative after:content-[':'] after:absolute after:-right-1 after:text-black">
                                        {d.label}
                                      </div>
                                      <div className="w-7/12 text-right flex justify-end">
                                        <span className=" whitespace-nowrap">&nbsp;{focusedRowData && focusedRowData[d.key]}</span>
                                      </div>
                                    </div>
                                  </li>
                                }
                              })}
                            </ul>
                          </fieldset>
                        )
                      })}
                  </div>
                </div>
          )
        }
      
        {/* {footers?.length && <div className={`h-1/5 left-0 mx-4 ${footerClass}`}>
        <div className='grid grid-cols-3 h-full w-full border-solid border-2'>
          {footers.map((footer: any, index: number) => (
            <div key={index} className='flex gap-4'>
              <span>{footer.label}:</span>
              <span>{focusedRowData && focusedRowData[footer.key]}</span>
            </div>
          ))}
        </div>
        
        </div>} */}
      </div>
    </Popup>
  );
};
