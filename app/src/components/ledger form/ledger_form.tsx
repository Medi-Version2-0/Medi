import React, { KeyboardEvent, useEffect, useState } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import { FaEdit } from 'react-icons/fa';
// import { MdDeleteForever } from 'react-icons/md';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import * as Yup from 'yup';
// import '../stations/stations.css';
// import Confirm_Alert_Popup from '../helpers/Confirm_Alert_Popup';
import Sidebar from '../sidebar/sidebar';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';
// import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { useFormik } from 'formik';
// import './groups.css';
import './ledger_form.css';

// const initialValue = {
//   group_code: '',
//   group_name: '',
//   type: '',
//   parent_code: '',
//   isPredefinedGroup: true,
// };

export const Ledger = () => {
  const [stationSuggestions, setStationSuggestions] = useState<any>([]);
  // const [inputValue, setInputValue] = useState('');
  const [stationData, setStationData] = useState([]);
  const electronAPI = (window as any).electronAPI;
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const [err, setErr] = useState('');
  //   const [open, setOpen] = useState<boolean>(false);
  //   const [formData, setFormData] = useState<GroupFormData>(initialValue);
  //   const [selectedRow, setSelectedRow] = useState<any>(null);
  //   const [tableData, setTableData] = useState<GroupFormData | any>(null);
  //   const editing = useRef(false);
  //   const [popupState, setPopupState] = useState({
  //     isModalOpen: false,
  //     isAlertOpen: false,
  //     message: '',
  //   });

  //   const typeMapping = {
  //     p_and_l: 'p&l',
  //     balance_sheet: 'balance sheet',
  //   };

  //   const extractKeys = (mappings: any) => {
  //     const value = Object.keys(mappings);
  //     value[0] = 'p&l';
  //     value[1] = 'balance sheet';
  //     return value;
  //   };

  //   const types = extractKeys(typeMapping);

  //   const lookupValue = (mappings: any, key: string | number) => {
  //     return mappings[key];
  //   };

  //   const handleAlertCloseModal = () => {
  //     setPopupState({ ...popupState, isAlertOpen: false });
  //   };

  //   const handleClosePopup = () => {
  //     setPopupState({ ...popupState, isModalOpen: false });
  //   };

  //   const handleConfirmPopup = () => {
  //     setPopupState({ ...popupState, isModalOpen: false });
  //     if (formData.group_name) {
  //       formData.group_name =
  //         formData.group_name.charAt(0).toUpperCase() +
  //         formData.group_name.slice(1);
  //     }
  //     if (formData !== initialValue) {
  //       if (formData.group_code) {
  //         electronAPI.updateGroup(formData.group_code, formData);
  //       } else {
  //         electronAPI.addGroup(formData);
  //       }
  //       togglePopup(false);
  //       getGroups();
  //     }
  //   };
  //   const electronAPI = (window as any).electronAPI;
  //   const isDelete = useRef(false);

  //   const togglePopup = (isOpen: boolean) => {
  //     if (!isOpen) {
  //       setFormData(initialValue);
  //       isDelete.current = false;
  //     }
  //     setOpen(isOpen);
  //   };

  //   const getGroups = () => {
  //     setTableData(electronAPI.getAllGroups('', '', '', '', ''));
  //   };

  //   const deleteAcc = (group_code: string) => {
  //     electronAPI.deleteGroup(group_code);
  //     isDelete.current = false;
  //     togglePopup(false);
  //     getGroups();
  //   };

  //   const handleDelete = (oldData: GroupFormData) => {
  //     isDelete.current = true;
  //     setFormData(oldData);
  //     togglePopup(true);
  //     setSelectedRow(null);
  //   };

  //   const handleUpdate = (oldData: GroupFormData) => {
  //     setFormData(oldData);
  //     isDelete.current = false;
  //     editing.current = true;
  //     togglePopup(true);
  //     setSelectedRow(null);
  //   };

  //   const handelFormSubmit = (values: GroupFormData) => {
  //     const mode = values.group_code ? 'update' : 'create';
  //     if (values.group_name) {
  //       values.group_name =
  //         values.group_name.charAt(0).toUpperCase() + values.group_name.slice(1);
  //     }
  //     // values.isPredefinedGroup = false;
  //     // values.parent_code = null;
  //     if (values !== initialValue) {
  //       setPopupState({
  //         ...popupState,
  //         isModalOpen: true,
  //         message: `Are you sure you want to ${mode} this group?`,
  //       });
  //       setFormData(values);
  //     }
  //   };

  //   const handleCellEditingStopped = (e: {
  //     data?: any;
  //     column?: any;
  //     oldValue?: any;
  //     valueChanged?: any;
  //     node?: any;
  //     newValue?: any;
  //   }) => {
  //     if (e?.data?.isPredefinedGroup === false) {
  //       editing.current = false;
  //       const { data, column, oldValue, valueChanged, node } = e;
  //       let { newValue } = e;
  //       if (!valueChanged) return;
  //       const field = column.colId;
  //       switch (field) {
  //         case 'group_name':
  //           {
  //             if (!newValue || /^\d+$/.test(newValue) || newValue.length > 100) {
  //               setPopupState({
  //                 ...popupState,
  //                 isAlertOpen: true,
  //                 message: !newValue
  //                   ? 'Group Name is required'
  //                   : /^\d+$/.test(newValue)
  //                     ? 'Only Numbers not allowed'
  //                     : 'Group name cannot exceed 100 characters',
  //               });
  //               node.setDataValue(field, oldValue);
  //               return;
  //             }
  //             newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
  //           }
  //           break;
  //         case 'cst_sale':
  //           {
  //             if (newValue) newValue = newValue.toLowerCase();
  //             if (!['yes', 'no'].includes(newValue)) {
  //               return node.setDataValue(field, oldValue);
  //             }
  //           }
  //           break;
  //         default:
  //           break;
  //       }
  //       electronAPI.updateGroup(data.group_code, { [field]: newValue });
  //       getGroups();
  //     } else {
  //       const { column, oldValue, node } = e;
  //       const field = column.colId;
  //       setPopupState({
  //         ...popupState,
  //         isAlertOpen: true,
  //         message: 'Predefined Groups are not editable',
  //       });
  //       node.setDataValue(field, oldValue);
  //       return;
  //     }
  //   };

  //   const onCellClicked = (params: { data: any }) => {
  //     setSelectedRow(selectedRow !== null ? null : params.data);
  //   };

  //   const cellEditingStarted = () => {
  //     editing.current = true;
  //   };

  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     switch (event.key) {
  //       case 'Escape':
  //         togglePopup(false);
  //         break;
  //       case 'n':
  //       case 'N':
  //         if (event.ctrlKey) {
  //           togglePopup(true);
  //         }
  //         break;
  //       case 'd':
  //       case 'D':
  //         if (
  //           event.ctrlKey &&
  //           selectedRow &&
  //           selectedRow.isPredefinedGroup === false
  //         ) {
  //           handleDelete(selectedRow);
  //         } else if (
  //           event.ctrlKey &&
  //           selectedRow &&
  //           selectedRow.isPredefinedGroup === true
  //         ) {
  //           setPopupState({
  //             ...popupState,
  //             isAlertOpen: true,
  //             message: 'Predefined Groups should not be deleted',
  //           });
  //         }
  //         break;
  //       case 'e':
  //       case 'E':
  //         if (
  //           event.ctrlKey &&
  //           selectedRow &&
  //           selectedRow.isPredefinedGroup === false
  //         ) {
  //           handleUpdate(selectedRow);
  //         } else if (
  //           event.ctrlKey &&
  //           selectedRow &&
  //           selectedRow.isPredefinedGroup === true
  //         ) {
  //           setPopupState({
  //             ...popupState,
  //             isAlertOpen: true,
  //             message: 'Predefined Groups are not editable',
  //           });
  //         }
  //         break;
  //       default:
  //         break;
  //     }
  //   };

  //   useEffect(() => {
  //     document.addEventListener('keydown', handleKeyDown);
  //     return () => {
  //       document.removeEventListener('keydown', handleKeyDown);
  //     };
  //   }, [selectedRow]);

  //   useEffect(() => {
  //     getGroups();
  //   }, []);

  //   const colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined[] =
  //     [
  //       {
  //         headerName: 'Group Name',
  //         field: 'group_name',
  //         flex: 1,
  //         filter: true,
  //         editable: true,
  //         headerClass: 'custom-header',
  //         suppressMovable: true,
  //       },
  //       {
  //         headerName: 'PL/Balance Sheet',
  //         field: 'type',
  //         filter: true,
  //         editable: true,
  //         cellEditor: 'agSelectCellEditor',
  //         cellEditorParams: {
  //           values: types,
  //         },
  //         valueFormatter: (params: { value: string | number }) =>
  //           lookupValue(typeMapping, params.value),
  //         flex: 1,
  //         headerClass: 'custom-header',
  //         suppressMovable: true,
  //       },
  //       {
  //         headerName: 'Actions',
  //         headerClass: 'custom-header-class custom-header',
  //         sortable: false,
  //         suppressMovable: true,
  //         flex: 1,
  //         cellStyle: {
  //           display: 'flex',
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //         },
  //         cellRenderer: (params: { data: GroupFormData }) => (
  //           <div className='table_edit_buttons'>
  //             <FaEdit
  //               style={{ cursor: 'pointer', fontSize: '1.1rem' }}
  //               onClick={() => {
  //                 if (params.data.isPredefinedGroup === false) {
  //                   handleUpdate(params.data);
  //                 } else if (params.data.isPredefinedGroup === true) {
  //                   setPopupState({
  //                     ...popupState,
  //                     isAlertOpen: true,
  //                     message: 'Predefined Groups are not editable',
  //                   });
  //                 }
  //               }}
  //             />

  //             <MdDeleteForever
  //               style={{ cursor: 'pointer', fontSize: '1.2rem' }}
  //               onClick={() => {
  //                 if (params.data.isPredefinedGroup === false) {
  //                   handleDelete(params.data);
  //                 } else if (params.data.isPredefinedGroup === true) {
  //                   setPopupState({
  //                     ...popupState,
  //                     isAlertOpen: true,
  //                     message: 'Predefined Groups should not be deleted',
  //                   });
  //                 }
  //               }}
  //             />
  //           </div>
  //         ),
  //       },
  //     ];

  const getStations = () => {
    setStationData(electronAPI.getAllStations('', 'station_name', '', '', ''));
  };

  useEffect(() => {
    getStations();
    // setInputValue(data?.station_state ? data.station_state : "")
  }, []);

  const handleInputChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    console.log('value: ', value);
    // setInputValue(value);
    // Filter suggestions based on input value
    const filteredSuggestions = stationData.filter((station: any) => {
      console.log('stations inside filter ===> ', station);
      return station.station_name.toLowerCase().includes(value.toLowerCase());
    });

    console.log('filtered suggestinos ====> ', filteredSuggestions);
    setStationSuggestions(filteredSuggestions);
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (stationSuggestions.length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // setInputValue(stationSuggestions[selectedIndex].station_name);
        setStationSuggestions([]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // setSelectedIndex(selectedIndex-1);
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        // Scroll the list up if the selected index goes beyond the viewable area
        if (selectedIndex > 0) {
          document
            .getElementById(`suggestion_${selectedIndex - 1}`)
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // setSelectedIndex(selectedIndex+1);
        setSelectedIndex((prevIndex) =>
          prevIndex < stationSuggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
        // Scroll the list down if the selected index goes beyond the viewable area
        if (selectedIndex < stationSuggestions.length - 1) {
          document
            .getElementById(`suggestion_${selectedIndex + 1}`)
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
        }
      }
    }
  };

  //   const isStation = (value: string) => {
  //     const validStation = stationSuggestions.map((station:any) => station.station_name === value);
  //     return validStation;
  //   };

  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
    // stationName: Yup.string()
    // .required("Station Name is required")
    // .test('isValidStation', 'Invalid station', (value) => {
    //     // Replace this with your actual validation logic
    //     const isStationValid = value && isStation(value);
    //     return isStationValid;
    //   }),
  });

  // const validateInputs = (e: { target: { value: any; id: any } }) => {
  //   const { value, id } = e.target;

  //   setErr('');

  //   const isStation = stationSuggestions.some(
  //     (station: any) => station.station_name === value
  //   );

  //   if (id === 'station_state') {
  //     if (!value) {
  //       setErr('Station State is required');
  //     } else if (value && isStation === false) {
  //       setErr('Invalid Station State');
  //     }
  //   }
  // };

  const formik1 = useFormik({
    initialValues: {
      partyName: '',
      accountGroup: '',
      stationName: '',
      mailTo: '',
      address: '',
      country: '',
      state: '',
      city: '',
      pinCode: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

  return (
    <>
      <div className='ledger_content'>
        <div className='ledger_sidebar'>
          <Sidebar isGroup={true} isSubGroup={false} />
        </div>
        <div className='ledger_container'>
          <div id='ledger_main'>
            <h1 id='ledger_header'>Create Party</h1>
            <button
              id='ledger_button'
              className='ledger_button'
              //   onClick={() => togglePopup(true)}
            >
              Back
            </button>
          </div>

          <div className='middle_form'>
            <div className='ledger_general_info'>
              <div className='general_info_prefix'>General Info</div>
              <form
                onSubmit={formik1.handleSubmit}
                className='general_info_inputs'
              >
                <div className='ledger_inputs'>
                  <label
                    htmlFor='partyName'
                    className='label_name label_name_css'
                  >
                    Party Name
                  </label>
                  <div className='input_with_error'>
                    <input
                      type='text'
                      id='partyName'
                      name='partyName'
                      className='input_class'
                      onChange={formik1.handleChange}
                      onBlur={formik1.handleBlur}
                      value={formik1.values.partyName}
                    />
                    {formik1.touched.partyName && formik1.errors.partyName && (
                      <>
                        <FaExclamationCircle
                          data-tooltip-id='partyNameError'
                          className='error_icon'
                        />
                        <ReactTooltip
                          id='partyNameError'
                          place='bottom'
                          className='custom-tooltip'
                        >
                          {formik1.errors.partyName}
                        </ReactTooltip>
                      </>
                    )}
                  </div>
                </div>
                <div className='ledger_inputs'>
                  <div className='acc_group_input'>
                    <label
                      htmlFor='accountGroup'
                      className='label_name label_name_css'
                    >
                      Account Group
                    </label>
                    <input
                      type='text'
                      id='accountGroup'
                      name='accountGroup'
                      onChange={formik1.handleChange}
                      value={formik1.values.accountGroup}
                    />
                  </div>
                  <div className='stations_input'>
                    <label htmlFor='stationName' className='label_name_css'>
                      Station
                    </label>
                    <input
                      type='text'
                      id='stationName'
                      name='stationName'
                      onChange={handleInputChange}
                        value={formik1.values.stationName}
                      // onBlur={validateInputs}
                      // value={inputValue}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (stationSuggestions.length !== 0) {
                          handleOnKeyDown(e);
                        } else {
                          //   handleKeyDown(e);
                        }
                      }}
                    />
                    {/* {(formik1.touched.stationName &&
                      formik1.errors.stationName) ||
                      (!!err && (
                        <>
                          <FaExclamationCircle
                            data-tooltip-id='stationNameError'
                            className='error_icon'
                          />
                          <ReactTooltip
                            id='stationNameError'
                            place='bottom'
                            className='custom-tooltip'
                          >
                            {!!err && err}
                          </ReactTooltip>
                        </>
                      ))} */}
                    {!!stationSuggestions.length && (
                      <ul className={'station_suggestion'}>
                        {stationSuggestions.map(
                          (station: any, index: number) => (
                            <li
                              key={station.station_id}
                              onClick={() => {
                                // setInputValue(station.station_name);
                                setStationSuggestions([]);
                                document
                                  .getElementById('station_state')
                                  ?.focus();
                              }}
                              // className='suggestion_list'
                              className={`${index === selectedIndex ? 'station_selected' : 'station_suggestion_list'}`}
                              id={`suggestion_${index}`}
                            >
                              {station.station_name}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                <div className='ledger_inputs'>
                  <label htmlFor='mailTo' className='label_name label_name_css'>
                    Mail to
                  </label>
                  <input
                    type='text'
                    id='mailTo'
                    name='mailTo'
                    className='input_class'
                    onChange={formik1.handleChange}
                    value={formik1.values.mailTo}
                  />
                </div>
                <div className='ledger_inputs'>
                  <label
                    htmlFor='address'
                    className='label_name label_name_css'
                  >
                    Address
                  </label>
                  <input
                    type='text'
                    id='address'
                    name='address'
                    className='input_class'
                    onChange={formik1.handleChange}
                    value={formik1.values.address}
                  />
                </div>
                <div className='ledger_inputs country_div'>
                  <div className='country'>
                    <label
                      htmlFor='country'
                      className='label_name label_name_css'
                    >
                      Country
                    </label>
                    <input
                      type='text'
                      id='country'
                      name='country'
                      onChange={formik1.handleChange}
                      value={formik1.values.country}
                    />
                  </div>
                  <div className='state'>
                    <label htmlFor='state' className='label_name_css'>
                      State
                    </label>
                    <input
                      type='text'
                      id='state'
                      name='state'
                      className='state_input'
                      onChange={formik1.handleChange}
                      value={formik1.values.state}
                    />
                  </div>
                  <div className='city'>
                    <label htmlFor='city' className='label_name_css'>
                      City
                    </label>
                    <input
                      type='text'
                      id='city'
                      name='city'
                      className='state_input'
                      onChange={formik1.handleChange}
                      value={formik1.values.city}
                    />
                  </div>
                </div>
                <div className='ledger_inputs'>
                  <label
                    htmlFor='pinCode'
                    className='label_name label_name_css'
                  >
                    Pincode
                  </label>
                  <input
                    type='text'
                    id='pinCode'
                    name='pinCode'
                    className='input_class'
                    onChange={formik1.handleChange}
                    value={formik1.values.pinCode}
                  />
                </div>
              </form>
            </div>

            <div className='ledger_general_details'>
              <div className='ledger_balance_info'>
                <div className='balance_prefix'>Balance</div>
                <form
                  onSubmit={formik1.handleSubmit}
                  className='balance_inputs'
                >
                  <div className='ledger_inputs'>
                    <label
                      htmlFor='balancingMethod'
                      className='balance_label_name label_name_css'
                    >
                      Balancing Method
                    </label>
                    <input
                      type='text'
                      id='balancingMethod'
                      name='balancingMethod'
                      className='input_class'
                      onChange={formik1.handleChange}
                      //   value={formik1.values.balancingMethod}
                    />
                  </div>
                  <div className='ledger_inputs'>
                    <div className='opening_bal_input'>
                      <label
                        htmlFor='openingBal'
                        className='balance_label_name label_name_css openingBal'
                      >
                        Opening Balance
                      </label>
                      <span className='opening_bal_prefix'>₹</span>
                      <input
                        type='text'
                        id='openingBal'
                        name='openingBal'
                        className='opening_bal_inputs'
                        onChange={formik1.handleChange}
                        // value={formik1.values.openingBal}
                      />
                      <input
                        type='text'
                        id='openingBalType'
                        name='openingBalType'
                        className='opening_bal_inputs'
                        onChange={formik1.handleChange}
                        // value={formik1.values.openingBalType}
                      />
                    </div>
                  </div>
                  <div className='ledger_inputs'>
                    <label
                      htmlFor='creditDays'
                      className='balance_label_name label_name_css'
                    >
                      Credit Days
                    </label>
                    <input
                      type='text'
                      id='creditDays'
                      name='creditDays'
                      className='input_class'
                      onChange={formik1.handleChange}
                      //   value={formik1.values.creditDays}
                    />
                  </div>
                </form>
              </div>
              <div className='ledger_contacts_info'>
                <div className='contacts_prefix'>Contact Numbers</div>
                <form
                  onSubmit={formik1.handleSubmit}
                  className='contact_inputs'
                >
                  <div className='contact_ledger_inputs'>
                    <label
                      htmlFor='phone1'
                      className='contacts_label_name label_name_css'
                    >
                      Phone No.(Office)
                    </label>
                    <span className='mobile_prefix'>+91</span>
                    <input
                      type='tel'
                      id='phone1'
                      name='phone1'
                      pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
                      className='contacts_input_class'
                      onChange={formik1.handleChange}
                      //   value={formik1.values.phone1}
                    />
                  </div>
                  <div className='contact_ledger_inputs'>
                    {/* <div className='opening_bal_input'> */}
                    <label
                      htmlFor='phone2'
                      className='contacts_label_name label_name_css'
                    >
                      Mobile 1
                    </label>
                    <span className='mobile_prefix'>+91</span>
                    <input
                      type='tel'
                      id='phone2'
                      name='phone2'
                      className='contacts_input_class'
                      onChange={formik1.handleChange}
                      // value={formik1.values.phone2}
                    />
                    {/* <input
                        type='text'
                        id='openingBalType'
                        name='openingBalType'
                        className='opening_bal_inputs'
                        onChange={formik1.handleChange} */}
                    {/* // value={formik1.values.openingBalType}
                      /> */}
                    {/* </div> */}
                  </div>
                  <div className='contact_ledger_inputs'>
                    <label
                      htmlFor='phone3'
                      className='contacts_label_name label_name_css'
                    >
                      Whatsapp no.
                    </label>
                    <span className='mobile_prefix'>+91</span>
                    <input
                      type='tel'
                      id='phone3'
                      name='phone3'
                      className='contacts_input_class'
                      onChange={formik1.handleChange}
                      //   value={formik1.values.phone3}
                    />
                    <button className='add_contact_btn'>+</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* 
          <div id='account_table' className='ag-theme-quartz'>
            {
              <AgGridReact
                rowData={tableData}
                columnDefs={colDefs}
                defaultColDef={{
                  floatingFilter: true,
                }}
                onCellClicked={onCellClicked}
                onCellEditingStarted={cellEditingStarted}
                onCellEditingStopped={handleCellEditingStopped}
              />
            }
          </div>
          {(popupState.isModalOpen || popupState.isAlertOpen) && (
            <Confirm_Alert_Popup
              onClose={handleClosePopup}
              onConfirm={
                popupState.isAlertOpen
                  ? handleAlertCloseModal
                  : handleConfirmPopup
              }
              message={popupState.message}
              isAlert={popupState.isAlertOpen}
            />
          )}
          {open && (
            <CreateGroup
              togglePopup={togglePopup}
              data={formData}
              handelFormSubmit={handelFormSubmit}
              isDelete={isDelete.current}
              deleteAcc={deleteAcc}
            />
          )} */}
        </div>
      </div>
    </>
  );
};
