import { useEffect, useRef, useState, useMemo } from 'react';
import { Popup } from '../popup/Popup';
import { selectListProps } from '../../interface/global';
import { useFormik } from 'formik';
import FormikInputField from './FormikInputField';
import Button from './button/Button';
import { getNestedValue } from '../../helper/helper';

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
  selectMultiple = false,
  rightAlignCells = [],
}: DropDownPopupProps) => {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const [focusedRowData, setFocusedRowData] = useState<any>(tableData[0]);
  const tableRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const selectedMultipleRowData = useRef<any[]>([]);

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

  function makeRecordVisibility(recordIndex: number) {
    tableRefs.current[recordIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }

  useEffect(() => {
    document.getElementById('searchBar')?.focus();
    setFocusedRowData(filteredData[focusedRowIndex]);
  }, [focusedRowIndex, filteredData]);

  useEffect(() => {
    setFocusedRowIndex(0);
  }, [filteredData]);

  useEffect(() => {
    document.body.classList.add('!overflow-hidden');
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.id === 'searchBar' || target.tagName === 'SELECT' || target.tagName === 'BUTTON') return;
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
      const rowIdx = focusedRowIndex < filteredData.length - 1 ? focusedRowIndex + 1 : focusedRowIndex;
      makeRecordVisibility(rowIdx);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedRowIndex((prevIndex) => prevIndex <= 0 ? filteredData.length - 1 : prevIndex - 1);
      const rowIdx = focusedRowIndex <= -2 ? filteredData.length - 1 : focusedRowIndex - 2;
      makeRecordVisibility(rowIdx);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (!selectMultiple) {
        if (!filteredData.length) return;
        handleSelect(focusedRowData);
        closeList();
      } else {
        const focusedElement = document.activeElement;
        if (focusedElement?.tagName !== 'BUTTON') {
          document.getElementById(`multipleSelectCheckbox${focusedRowIndex}`)?.click();
        } else {
          handleSelect(selectedMultipleRowData.current);
          closeList();
        }
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeList();
    } else if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
      document.getElementById('searchBar')?.focus();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      document.getElementById('confirmSelectData')?.focus();
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.setFieldValue('category', e.target.value);
    setSelectedCategory(e.target.value);
    formik.setFieldValue('searchBar', '');
    setFocusedRowIndex(0);
  };

  function handleCheckBoxChange(e: any, rowIndex: number) {
    const isChecked = e.target.checked;
    if (isChecked) {
      const data = filteredData[rowIndex];
      data.rowIndex = rowIndex;
      selectedMultipleRowData.current.push(data);
    } else {
      const data = selectedMultipleRowData.current.filter(d => d.rowIndex !== rowIndex);
      selectedMultipleRowData.current = data;
    }
  }

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
      <div className='flex flex-col gap-3 h-[67vh] justify-between'>
        <div className={`mx-4 h-[77%] overflow-auto border-[1px] border-gray-400 border-solid mt-4 ${!selectMultiple ? '!h-4/5' : ''}`} id='selectListData'>
          <table className='table-auto w-full border-collapse'>
            <thead className='sticky top-0 overflow-auto'>
              <tr>
                {selectMultiple && (
                  <th className='w-fit border-[1px] border-solid bg-[#009196FF] border-gray-400 text-center text-white p-2'></th>
                )}
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
                  onClick={() => { setFocusedRowIndex(rowIndex) }}
                  className={focusedRowIndex === rowIndex ? 'bg-[#EAFBFCFF] border-[2px] focus:outline-0 !rounded-lg border-solid border-black' : ''}
                >
                  {selectMultiple && (
                    <td className='border border-gray-400 px-1'>
                      <input type="checkbox" id={`multipleSelectCheckbox${rowIndex}`} onChange={(e) => { handleCheckBoxChange(e, rowIndex) }} className="form-checkbox h-5 w-full text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500" />
                    </td>
                  )}
                  {headers.map((header: any, colIndex: number) => (
                    <td key={colIndex} className={`border border-gray-400 py-2 px-4 ${rightAlignCells.includes(colIndex) ? 'text-right' : ''}`}>
                      {header.auto ? rowIndex + 1 : getNestedValue(row, header.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectMultiple && (
          <div className='h-[5%] flex justify-end px-4'>
            <Button type='fill' id='confirmSelectData' handleOnClick={() => {
              handleSelect(selectedMultipleRowData.current);
              closeList();
            }}>
              Confirm
            </Button>
          </div>
        )}

        {
          footers?.length && (
            <div className={`h-[18%] left-0 mx-4 ${footerClass} ${!selectMultiple ? '!h-1/5' : ''}`}>
              <div className={`flex gap-1 h-full w-full text-[12px]`}>
                {footers.map((f: any, index: number) => {
                  return (
                    <fieldset key={index} className="border flex-1 rounded-sm h-full border-gray-300 px-1 py-1">
                      <legend className="font-semibold text-gray-700 px-2">
                        {f.label}
                      </legend>
                      <ul className='px-2'>
                        {f.data.map((d: any, index: number) => {
                          if (focusedRowData && focusedRowData[d.key] !== null) {
                            return <li key={index}>
                              <div className="flex">
                                <div className="w-5/12 pr-0 relative after:content-[':'] after:absolute after:-right-1 after:text-black">
                                  {d.label}
                                </div>
                                <div className="w-7/12 text-right flex justify-end">
                                  <span className=" whitespace-nowrap">&nbsp;{focusedRowData && getNestedValue(focusedRowData, d.key)}</span>
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
      </div>
    </Popup>
  );
};
