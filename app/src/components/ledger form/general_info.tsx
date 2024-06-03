import React, { KeyboardEvent, useEffect, useState, useMemo, useRef } from 'react';
import * as Yup from 'yup';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';
import { State } from '../../interface/global';

interface GeneralInfoProps {
  onValueChange?: any;
  formik?: any;
  receiveValidationSchemaGeneralInfo: (schema: Yup.ObjectSchema<any>) => void;
  // passValidationToParent?:any;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({
  onValueChange,
  formik,
  receiveValidationSchemaGeneralInfo,
}) => {
  const [stationSuggestions, setStationSuggestions] = useState<any>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<any>([]);
  const [statesSuggestions, setStatesSuggestions] = useState<any>([]);
  const [accountInputValue, setAccountInputValue] = useState('');
  const [stationData, setStationData] = useState<any[]>([]);
  const [groupData, setGroupData] = useState<any[]>([]);
  const [stateData, setStateData] = useState([]);
  const electronAPI = (window as any).electronAPI;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const [selectedStateIndex, setSelectedStateIndex] = useState(0);
  const [partySuggestions, setPartySuggestions] = useState<any>('');
  const [partySuggestionsData, setPartySuggestionsData] = useState([]);

  const stationRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const partyRef = useRef<HTMLDivElement>(null);

  const getStations = () => {
    setStationData(electronAPI.getAllStations('', 'station_name', '', '', ''));
  };

  const getAllGroups = () => {
    setGroupData(electronAPI.getAllGroups('', 'group_name', '', '', ''));
  };

  const getStates = () => {
    setStateData(electronAPI.getAllStates('', 'state_name', '', '', ''));
  };

  const getPartySuggestions = () => {
    setPartySuggestionsData(
      electronAPI.addSuggestionList('', 'partyName', '', '', '')
    );
  };
  useEffect(() => {
    document.getElementById('partyName')?.focus();
  }, []);

  useEffect(() => {
    document.getElementById('partyName')?.focus();
  }, []);

  useEffect(() => {
    getStates();
    getStations();
    getAllGroups();
    getPartySuggestions();
  }, []); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stationRef.current && !stationRef.current.contains(event.target as Node)) {
        setStationSuggestions([]);
      }
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setGroupSuggestions([]);
      }
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setStatesSuggestions([]);
      }
      if (partyRef.current && !partyRef.current.contains(event.target as Node)) {
        setPartySuggestions('');
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [stationRef, groupRef, stateRef, partyRef]); 
  

  const handleInputChange = (e: { target: { value: any; id: any } }) => {
    const value = e.target.value;
    // const accountValuesForParentLedger = [
    //   'CURRENT ASSETS',
    //   'PURCHASE A/C',
    //   'SUNDRY DEBTORS',
    //   'SALE A/C',
    //   'DUTIES & TAXES',
    // ];
    if (e.target.id === 'stationName') {
      formik.setFieldValue(e.target.id, value);
      const filteredSuggestions = stationData.filter((station: any) => {
        return station.station_name?.toLowerCase().includes(value?.toLowerCase());
      });

      setStationSuggestions(filteredSuggestions);
    } else if (e.target.id === 'accountGroup') {
      setAccountInputValue(value);
      formik.setFieldValue(e.target.id, value);
      // formik.setFieldValue('parentLedger', '');
      const filteredSuggestions = groupData.filter((group: any) => {
        return group.group_name?.toLowerCase().includes(value?.toLowerCase());
      });
      setGroupSuggestions(filteredSuggestions);
    } else if (e.target.id === 'state') {
      const filteredSuggestions = stateData.filter((state: any) => {
        return state.state_name?.toLowerCase().includes(value?.toLowerCase());
      });
      setStatesSuggestions(filteredSuggestions);
    }
  };

  const handleEnterKey = (
    e: KeyboardEvent<HTMLInputElement>,
    suggestions: any[],
    setInputValue: (value: string) => void,
    setSuggestions: React.Dispatch<React.SetStateAction<any[]>>,
    selectedIndex: number
  ) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    if (suggestions === stationSuggestions) {
      setInputValue(suggestions[selectedIndex].station_name);
      formik.setFieldValue(target.id, suggestions[selectedIndex].station_name);
      setSuggestions([]);
    } else if (suggestions === groupSuggestions) {
      setInputValue(suggestions[selectedIndex].group_name);
      formik.setFieldValue(target.id, suggestions[selectedIndex].group_name);      
      onValueChange(suggestions[selectedIndex].group_name);
      setSuggestions([]);
    } else if (suggestions === statesSuggestions) {
      setInputValue(suggestions[selectedIndex].state_name);
      setSuggestions([]);
    } else if (suggestions === partySuggestions) {
      setInputValue(suggestions[selectedIndex].partyName);
      setSuggestions([]);
    }
  };

  const handleArrowUpKey = (
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>,
    selectedIndex: number
  ) => {
    setSelectedIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
    if (selectedIndex > 0) {
      document
        .getElementById(`suggestion_${selectedIndex - 1}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
    }
  };

  const handleArrowDownKey = (
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>,
    selectedIndex: number,
    suggestions: any[]
  ) => {
    setSelectedIndex((prevIndex) =>
      prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
    );
    if (selectedIndex < suggestions.length - 1) {
      document
        .getElementById(`suggestion_${selectedIndex + 1}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
    }
  };

  const handleOnKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    suggestions: any[],
    setInputValue: (value: string) => void,
    setSuggestions: React.Dispatch<React.SetStateAction<any[]>>,
    selectedIndex: number,
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (suggestions.length) {
      switch (e.key) {
        case 'Enter':
          handleEnterKey(
            e,
            suggestions,
            setInputValue,
            setSuggestions,
            selectedIndex
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleArrowUpKey(setSelectedIndex, selectedIndex);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleArrowDownKey(setSelectedIndex, selectedIndex, suggestions);
          break;
        default:
          break;
      }
    }
  };

  const validationSchema = useMemo(
    () =>
      Yup.object({
        partyName: Yup.string()
          .max(100, 'Party Name must be 100 characters or less')
          .required('Party Name is required'),
        accountGroup: Yup.string()
          .required('Account group is required')
          .transform((value) => (value ? value?.toLowerCase() : ''))
          .test(
            'valid-account-group',
            'Invalid Account Group',
            function (value) {
              return groupData
                .map((group) => group.group_name?.toLowerCase())
                .includes(value);
            }
          ),
        country:
          accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS'
            ? Yup.string().required('Country is required')
            : Yup.string(),
        state:
          accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS'
            ? Yup.string()
                .required('State is required')
                .transform((value) => (value ? value?.toLowerCase() : ''))
                .test(
                  'valid-state',
                  'Invalid State',
                  function (value) {
                    return stateData
                      .map((state:State) => state.state_name?.toLowerCase())
                      .includes(value);
                  }
                )
            : Yup.string(),
        stationName:
          accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS'
            ? Yup.string()
                .required('Station is required')
                .transform((value) => (value ? value?.toLowerCase() : ''))
                .test(
                  'valid-station-name',
                  'Invalid Station name',
                  function (value) {
                    return stationData
                      .map((station) => station.station_name?.toLowerCase())
                      .includes(value);
                  }
                )
            : Yup.string(),
        mailTo: Yup.string().email('Invalid email'),
        pinCode:
          accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS'
            ? Yup.string()
                .matches(/^[0-9]+$/, 'PIN code must be a number')
                .matches(/^[1-9]/, 'PIN code must not start with zero')
                .matches(/^[0-9]{6}$/, 'PIN code must be exactly 6 digits')
            : Yup.string(),
        // parentLedger: Yup.string()
        //   .transform((value) => (value ? value?.toLowerCase() : ''))
        //   .test('valid-parentLedger', 'Invalid Parent ledger', function (value) {
        //     return partySuggestionsData
        //       .map((party:any) => party.party_name?.toLowerCase())
        //       .includes(value);
        //   }),
      }),
    [groupData, stationData, accountInputValue,stateData,partySuggestionsData]
  );

  useEffect(() => {
    receiveValidationSchemaGeneralInfo(validationSchema);
  }, [validationSchema, receiveValidationSchemaGeneralInfo]);

  return (
    <div className='ledger_general_info'>
      <div className='general_info_prefix'>General Info</div>
      <form onSubmit={formik.handleSubmit} className='general_info_inputs'>
        <div className='ledger_inputs starlabel'>
          <label htmlFor='partyName' className='label_name label_name_css'>
            Party Name
          </label>
          <div className='input_with_error'>
            <input
              type='text'
              id='partyName'
              name='partyName'
              className='input_class'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.partyName}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('accountGroup')?.focus();
                }
              }}
            />
            {formik.touched.partyName && formik.errors.partyName && (
              <>
                <FaExclamationCircle
                  data-tooltip-id='partyNameError'
                  className='error_icon'
                  style={{ right: '10px' }}
                />
                <ReactTooltip
                  id='partyNameError'
                  place='bottom'
                  className='custom-tooltip'
                >
                  {formik.errors.partyName}
                </ReactTooltip>
              </>
            )}
          </div>
        </div>
        <div className='ledger_inputs'>
          <div className='fixed_assets_input starlabel' ref={groupRef}>
            <label
              htmlFor='accountGroup'
              className='label_name label_name_css starlabel'
            >
              Account Group
            </label>
            <input
              type='text'
              id='accountGroup'
              name='accountGroup'
              value={formik.values.accountGroup.toUpperCase()}
              onChange={(e) => {
                formik.handleChange(e);
                handleInputChange(e);
              }}
              onBlur={formik.handleBlur}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                handleOnKeyDown(
                  e,
                  groupSuggestions,
                  (value) => {
                    formik.setFieldValue('accountGroup', value);
                    setAccountInputValue(value);
                  },
                  setGroupSuggestions,
                  selectedIndex2,
                  setSelectedIndex2
                );
                if (
                  groupSuggestions.length === 0 &&
                  (e.key === 'ArrowDown' || e.key === 'Enter')
                ) {
                  document
                    .getElementById(
                      accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
                        accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS'
                        ? 'stationName'
                        : accountInputValue?.toUpperCase() === 'DUTIES & TAXES'
                          ? 'taxType'
                          : accountInputValue?.toUpperCase() === 'FIXED ASSETS'
                            ? 'fixedAssets'
                            : 'parentLedger'
                    )
                    ?.focus();
                } else if (
                  groupSuggestions.length === 0 &&
                  e.key === 'ArrowUp'
                ) {
                  document.getElementById('partyName')?.focus();
                }
              }}
            />
            {formik.touched.accountGroup && formik.errors.accountGroup && (
              <>
                <FaExclamationCircle
                  data-tooltip-id='accountGroupError'
                  className='error_icon'
                />
                <ReactTooltip
                  id='accountGroupError'
                  place='bottom'
                  className='custom-tooltip'
                >
                  {formik.errors.accountGroup}
                </ReactTooltip>
              </>
            )}
            {!!groupSuggestions.length && (
              <ul className={'accountGroup_suggestion station_suggestion'}>
                {groupSuggestions.map((group: any, index: number) => (
                  <li
                    key={group.group_code}
                    onClick={() => {
                      setAccountInputValue(group.group_name);
                      formik.setFieldValue('accountGroup', group.group_name);
                      onValueChange(group.group_name);
                      setGroupSuggestions([]);
                      document.getElementById('accountGroup')?.focus();
                    }}
                    className={`${index === selectedIndex2 ? 'station_selected' : 'station_suggestion_list'}`}
                    id={`suggestion_${index}`}
                  >
                    {group.group_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
            accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
            <div className='stations_input starlabel' ref={stationRef}>
              <label htmlFor='stationName' className='label_name_css'>
                Station
              </label>
              <input
                type='text'
                id='stationName'
                name='stationName'
                className='state_input'
                onBlur={formik.handleBlur}
                value={formik.values.stationName}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  handleOnKeyDown(
                    e,
                    stationSuggestions,
                    (value) => {
                      formik.setFieldValue('stationName', value);
                    },
                    setStationSuggestions,
                    selectedIndex,
                    setSelectedIndex
                  );
                  if (
                    stationSuggestions.length === 0 &&
                    (e.key === 'ArrowDown' || e.key === 'Enter')
                  ) {
                    document.getElementById('mailTo')?.focus();
                  } else if (
                    stationSuggestions.length === 0 &&
                    e.key === 'ArrowUp'
                  ) {
                    document.getElementById('accountGroup')?.focus();
                  }
                }}
              />
              {formik.touched.stationName && formik.errors.stationName && (
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
                    {formik.errors.stationName}
                  </ReactTooltip>
                </>
              )}
              {!!stationSuggestions.length && (
                <ul className={'station_suggestion'}>
                  {stationSuggestions.map((station: any, index: number) => (
                    <li
                      key={station.station_id}
                      onClick={() => {
                        formik.setFieldValue(
                          'stationName',
                          station.station_name
                        );
                        setStationSuggestions([]);
                        document.getElementById('station_state')?.focus();
                      }}
                      className={`${index === selectedIndex ? 'station_selected' : 'station_suggestion_list'}`}
                      id={`suggestion_${index}`}
                    >
                      {station.station_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {(accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <>
          
          <div className='ledger_inputs'>
            <label htmlFor='vatNumber' className='label_name label_name_css'>
              VAT Number
            </label>
            <input
              type='text'
              id='vatNumber'
              name='vatNumber'
              className='input_class'
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.vatNumber}
            />
          </div>
          <div className='ledger_inputs'>
            <label htmlFor='excessRate' className='label_name label_name_css'>
              Excess Rate
            </label>
            <input
              type='text'
              id='excessRate'
              name='excessRate'
              className='input_class'
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.excessRate}
            />
          </div>
          <div className='ledger_inputs'>
              <label htmlFor='routeNo' className='label_name label_name_css'>
                Route No.
              </label>
              <input
                type='text'
                id='routeNo'
                name='routeNo'
                className='input_class'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.routeNo}
              />
          </div>
          <div className='ledger_inputs'>
              <label htmlFor='party_cash_credit_invoice' className='label_name label_name_css'>
                Party CACR
              </label>
              <select
                id='party_cash_credit_invoice'
                name='party_cash_credit_invoice'
                value={formik.values.party_cash_credit_invoice}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
              >
                <option value='Select'>Select an Option</option>
                <option value='Cash Invoice'>Cash Invoice</option>
                <option value='Credit Invoice'>Credit Invoice</option>
              </select>
          </div>
          <div className='ledger_inputs'>
              <label htmlFor='deductDiscount' className='label_name label_name_css'>
                Deduct Discount
              </label>
              <select
                id='deductDiscount'
                name='deductDiscount'
                value={formik.values.deductDiscount}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
              >
                <option value='Select'>Select an Option</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
          </div>
          <div className='ledger_inputs'>
              <label htmlFor='stopNrx' className='label_name label_name_css'>
                STOP NRX
              </label>
              <select
                id='stopNrx'
                name='stopNrx'
                value={formik.values.stopNrx}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
              >
                <option value='Select'>Select an Option</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
          </div>
          <div className='ledger_inputs'>
              <label htmlFor='stopHi' className='label_name label_name_css'>
                STOP HI
              </label>
              <select
                id='stopHi'
                name='stopHi'
                value={formik.values.stopHi}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
              >
                <option value='Select'>Select an Option</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
          </div>
          <div className='ledger_inputs'>
              <label htmlFor='notPrinpba' className='label_name label_name_css'>
                Not PRINPBA
              </label>
              <input
                type='text'
                id='notPrinpba'
                name='notPrinpba'
                className='input_class'
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.notPrinpba}
              />
          </div>
        </>
        )}
        {accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' && (
          <>
          <div className='ledger_inputs'>
            <label htmlFor='creditPrivilege' className='label_name label_name_css'>
            Credit Privilege
            </label>
            <input
              type='text'
              id='creditPrivilege'
              name='creditPrivilege'
              className='input_class'
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.creditPrivilege}
            />
          </div>
          <div className='ledger_inputs'>
            <label htmlFor='transport' className='label_name label_name_css'>
              Transport
            </label>
            <input
              type='text'
              id='transport'
              name='transport'
              className='input_class'
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.transport}
            />
          </div>
          </>
        )}
        {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
          accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <div className='ledger_inputs'>
            <label htmlFor='mailTo' className='label_name label_name_css'>
              Mail to
            </label>
            <input
              type='email'
              id='mailTo'
              name='mailTo'
              className='input_class'
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.mailTo}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('address')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('stationName')?.focus();
                }
              }}
            />
            {formik.touched.mailTo && formik.errors.mailTo && (
              <>
                <FaExclamationCircle
                  data-tooltip-id='mailToError'
                  className='error_icon'
                />
                <ReactTooltip
                  id='mailToError'
                  place='bottom'
                  className='custom-tooltip'
                >
                  {formik.errors.mailTo}
                </ReactTooltip>
              </>
            )}
          </div>
        )}
        {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
          accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <div className='ledger_inputs'>
            <label htmlFor='address1' className='address_label_name label_name_css'>
              Address
            </label>
            <div className='address_input'>
            <input
              type='text'
              id='address1'
              name='address1'
              className='input_class'
              onChange={formik.handleChange}
              value={formik.values.address1}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('state')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('mailTo')?.focus();
                }
              }}
            />
            <input
              type='text'
              id='address2'
              name='address2'
              className='input_class'
              onChange={formik.handleChange}
              value={formik.values.address2}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('state')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('mailTo')?.focus();
                }
              }}
            />
            <input
              type='text'
              id='address3'
              name='address3'
              className='input_class'
              onChange={formik.handleChange}
              value={formik.values.address3}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  document.getElementById('state')?.focus();
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('mailTo')?.focus();
                }
              }}
            />
            </div>
          </div>
        )}
        {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
          accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
          <div className='ledger_inputs'>
            <div className='country starlabel'>
              <label
                htmlFor='country'
                className='country_label_name label_name_css'
              >
                Country
              </label>
              <input
                type='text'
                id='country'
                name='country'
                className='state_input'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={(formik.values.country = 'India')}
                disabled={true}
              />
            </div>
            <div className='country_div starlabel' ref={stateRef}>
              <label htmlFor='state' className='label_name_css'>
                State
              </label>
              <input
                type='text'
                id='state'
                name='state'
                className='state_input'
                value={formik.values.state}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  handleOnKeyDown(
                    e,
                    statesSuggestions,
                    (value) => {
                      formik.setFieldValue('state', value);
                    },
                    setStatesSuggestions,
                    selectedStateIndex,
                    setSelectedStateIndex
                  );
                  if (
                    statesSuggestions.length === 0 &&
                    (e.key === 'ArrowDown' || e.key === 'Enter')
                  ) {
                    document.getElementById('city')?.focus();
                    e.preventDefault();
                  } else if (
                    statesSuggestions.length === 0 &&
                    e.key === 'ArrowUp'
                  ) {
                    document.getElementById('address')?.focus();
                  }
                }}
              />
              {!!statesSuggestions.length && (
                <ul className={'states_suggestion station_suggestion'}>
                  {statesSuggestions.map((state: any, index: number) => (
                    <li
                      key={state.state_code}
                      onClick={() => {
                        formik.setFieldValue('state', state.state_name);
                        setStatesSuggestions([]);
                        document.getElementById('station_state')?.focus();
                      }}
                      className={`${index === selectedStateIndex ? 'station_selected' : 'station_suggestion_list'}`}
                      id={`suggestion_${index}`}
                    >
                      {state.state_name}
                    </li>
                  ))}
                </ul>
              )}
              {formik.touched.state && formik.errors.state && (
                <>
                  <FaExclamationCircle
                    data-tooltip-id='stateError'
                    className='error_icon'
                  />
                  <ReactTooltip
                    id='stateError'
                    place='bottom'
                    className='custom-tooltip'
                  >
                    {formik.errors.state}
                  </ReactTooltip>
                </>
              )}
            </div>
          </div>
        )}
        {(accountInputValue?.toUpperCase() === 'SUNDRY CREDITORS' ||
          accountInputValue?.toUpperCase() === 'SUNDRY DEBTORS') && (
            <div  className='ledger_inputs'>
            <div className='country'>
              <label htmlFor='city' className='country_label_name label_name_css'>
                City
              </label>
              <input
                type='text'
                id='city'
                name='city'
                className='state_input'
                onChange={formik.handleChange}
                value={formik.values.city}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    document.getElementById('pinCode')?.focus();
                    e.preventDefault();
                  } else if (e.key === 'ArrowUp') {
                    document.getElementById('state')?.focus();
                  }
                }}
              />
            </div>
          <div className='country_div'>
            <label htmlFor='pinCode' className='label_name label_name_css'>
              Pincode
            </label>
            <input
              type='text'
              id='pinCode'
              name='pinCode'
              className='state_input'
              maxLength={6}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.pinCode}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  e.preventDefault();
                } else if (e.key === 'ArrowUp') {
                  document.getElementById('city')?.focus();
                }
              }}
            />
            {formik.touched.pinCode && formik.errors.pinCode && (
              <>
                <FaExclamationCircle
                  data-tooltip-id='pinCodeError'
                  className='error_icon'
                  style={{ left: '190px' }}
                />
                <ReactTooltip
                  id='pinCodeError'
                  place='bottom'
                  className='custom-tooltip'
                >
                  {formik.errors.pinCode}
                </ReactTooltip>
              </>
            )}
          </div>
            </div>
        )}
        <div className='ledger_inputs'>
          <label htmlFor='stateInout' className='label_name label_name_css'>
            State In Out
          </label>
          <div className='input_with_error'>
            <input
              type='text'
              id='stateInout'
              name='stateInout'
              className='input_class'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.stateInout}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
