import React, { KeyboardEvent, useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';

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
  const [selectedPartySuggestionIndex, setSelectedPartySuggestionIndex] =
    useState(0);
  const [partySuggestions, setPartySuggestions] = useState<any>('');
  const [partySuggestionsData, setPartySuggestionsData] = useState([]);
  const [selectedOption, setSelectedOption] = useState();

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
      electronAPI.addSuggestionList('', 'party_name', '', '', '')
    );
  };

  useEffect(() => {
    getStates();
    getStations();
    getAllGroups();
    getPartySuggestions();
  }, []);

  const handleInputChange = (e: { target: { value: any; id: any } }) => {
    const value = e.target.value;
    if (e.target.id === 'stationName') {
      formik.setFieldValue(e.target.id, value);
      const filteredSuggestions = stationData.filter((station: any) => {
        return station.station_name.toLowerCase().includes(value.toLowerCase());
      });

      setStationSuggestions(filteredSuggestions);
    } else if (e.target.id === 'accountGroup') {
      setAccountInputValue(value);
      formik.setFieldValue(e.target.id, value);
      const filteredSuggestions = groupData.filter((group: any) => {
        return group.group_name.toLowerCase().includes(value.toLowerCase());
      });
      setGroupSuggestions(filteredSuggestions);
    } else if (e.target.id === 'state') {
      const filteredSuggestions = stateData.filter((state: any) => {
        return state.state_name.toLowerCase().includes(value.toLowerCase());
      });

      console.log(
        'filtered suggestinos inside groups ====> ',
        filteredSuggestions
      );
      setStatesSuggestions(filteredSuggestions);
    } else if (
      (e.target.id === 'parentLedger' &&
        accountInputValue === 'CURRENT ASSETS') ||
      (e.target.id === 'parentLedger' &&
        accountInputValue === 'PURCHASE A/C') ||
      (e.target.id === 'parentLedger' &&
        accountInputValue === 'SUNDRY DEBTORS') ||
      (e.target.id === 'parentLedger' && accountInputValue === 'SALE A/C') ||
      (e.target.id === 'parentLedger' && accountInputValue === 'DUTIES & TAXES')
    ) {
      setPartySuggestions('');
      const filteredSuggestions = partySuggestionsData.filter((party: any) => {
        console.log('party inside filter ===> ', party);
        return (
          party.account_group === accountInputValue &&
          party.party_name.toLowerCase().includes(value.toLowerCase())
        );
      });
      console.log('filtered suggestinos ====> ', filteredSuggestions);
      setPartySuggestions(filteredSuggestions);
    } else if (e.target.id === 'fixedAssets') {
      console.log('Hello assets >>>>>>>>');
      setSelectedOption(e.target.value);
      formik.setFieldValue(e.target.id, value);
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
      setInputValue(suggestions[selectedIndex].party_name);
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
          .transform((value) => (value ? value.toLowerCase() : ''))
          .test(
            'valid-account-group',
            'Invalid Account Group',
            function (value) {
              return groupData
                .map((group) => group.group_name.toLowerCase())
                .includes(value);
            }
          ),
        country: Yup.string().required('Country is required'),
        state: Yup.string().required('State is required'),
        stationName: Yup.string()
          .required('Station is required')
          .transform((value) => (value ? value.toLowerCase() : ''))
          .test('valid-station-name', 'Invalid Station name', function (value) {
            return stationData
              .map((station) => station.station_name.toLowerCase())
              .includes(value);
          }),
        mailTo: Yup.string().email('Invalid email'),
        pinCode: Yup.string()
          .required('PIN code is required')
          .matches(/^[0-9]+$/, 'PIN code must be a number')
          .matches(/^[1-9]/, 'PIN code must not start with zero')
          .matches(/^[0-9]{6}$/, 'PIN code must be exactly 6 digits'),
      }),
    []
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
          <div className='fixed_assets_input starlabel'>
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
              value={formik.values.accountGroup}
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
                      onValueChange(group.group_name)
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
          {(accountInputValue === 'SUNDRY CREDITORS' ||
            accountInputValue === 'SUNDRY DEBTORS') && (
            <div className='stations_input starlabel'>
              <label htmlFor='stationName' className='label_name_css'>
                Station
              </label>
              <input
                type='text'
                id='stationName'
                name='stationName'
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
        {(accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS') && (
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
        {(accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS') && (
          <div className='ledger_inputs'>
            <label htmlFor='address' className='label_name label_name_css'>
              Address
            </label>
            <input
              type='text'
              id='address'
              name='address'
              className='input_class'
              onChange={formik.handleChange}
              value={formik.values.address}
            />
          </div>
        )}
        {(accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS') && (
          <div className='ledger_inputs country_div'>
            <div className='country_input starlabel'>
              <label
                htmlFor='country'
                className='label_name label_name_css'
                style={{ width: '39%' }}
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
            <div className='country starlabel'>
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
                }}
              />
              {!!statesSuggestions.length && (
                <ul className={'states_suggestion'}>
                  {statesSuggestions.map((state: any, index: number) => (
                    <li
                      key={state.state_code}
                      onClick={() => {
                        formik.setFieldValue('state', state.state_name);
                        setStatesSuggestions([]);
                        document.getElementById('station_state')?.focus();
                      }}
                      className={`${index === selectedIndex ? 'station_selected' : 'state_suggestion_list'}`}
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
            <div className='country'>
              <label htmlFor='city' className='label_name_css'>
                City
              </label>
              <input
                type='text'
                id='city'
                name='city'
                className='states_input'
                onChange={formik.handleChange}
                value={formik.values.city}
              />
            </div>
          </div>
        )}
        {(accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS') && (
          <div className='ledger_inputs'>
            <label htmlFor='pinCode' className='label_name label_name_css'>
              Pincode
            </label>
            <input
              type='text'
              id='pinCode'
              name='pinCode'
              className='input_class'
              maxLength={6}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.pinCode}
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
        )}
        {accountInputValue === 'DUTIES & TAXES' && (
          <div className='ledger_inputs'>
            <label htmlFor='taxType' className='label_name label_name_css'>
              Tax Type
            </label>
            <input
              type='text'
              id='taxType'
              name='taxType'
              className='input_class short_input_class'
              onChange={formik.handleChange}
              value={formik.values.taxType}
            />
          </div>
        )}
        {accountInputValue === 'FIXED ASSETS' && (
          <div className='ledger_inputs'>
            <div className='fixed_assets_input'>
              <label
                htmlFor='fixedAssets'
                className='label_name label_name_css'
              >
                GST Applicable
              </label>
              <select
                id='fixedAssets'
                name='fixedAssets'
                value={formik.values.fixedAssets}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
              >
                <option value='Select'>Select an Option</option>
                <option value='Applicable'>Applicable</option>
                <option value='Not Applicable'>Not Applicable</option>
              </select>
            </div>

            {selectedOption === 'Applicable' && (
              <div className='hsn_input'>
                <label htmlFor='hsnCode' className='label_name_css'>
                  HSN/SAC. Code
                </label>
                <input
                  type='text'
                  id='hsnCode'
                  name='hsnCode'
                  onChange={formik.handleChange}
                  value={formik.values.hsnCode}
                />
              </div>
            )}
          </div>
        )}
        {selectedOption === 'Applicable' && (
          <div className='ledger_inputs'>
            <div className='fixed_assets_input'>
              <label
                htmlFor='taxPercentageType'
                className='label_name label_name_css'
              >
                Tax % Type
              </label>
              <input
                type='text'
                id='taxPercentageType'
                name='taxPercentageType'
                onChange={formik.handleChange}
                value={formik.values.taxPercentageType}
              />
            </div>
            <div className='hsn_input'>
              <label htmlFor='itcAvail' className='label_name_css'>
                ITC Availability
              </label>
              <select
                id='itcAvail'
                name='itcAvail'
                value={formik.values.itcAvail}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
              >
                <option value='Input Goods'>Input Goods</option>
                <option value='Input Services'>Input Services</option>
                <option value='Capital Goods'>Capital Goods</option>
                <option value='None'>None</option>
              </select>
            </div>
          </div>
        )}
        {selectedOption === 'Applicable' && (
          <div className='ledger_inputs'>
            <div className='fixed_assets_input'>
              <label htmlFor='itcAvail2' className='label_name label_name_css'>
                ITC Availability
              </label>
              <select
                id='itcAvail2'
                name='itcAvail2'
                value={formik.values.itcAvail2}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
              >
                <option value='Compulsory'>Compulsory</option>
                <option value='Service Imports'>Service Imports</option>
                <option value='Goods'>Goods</option>
              </select>
            </div>
          </div>
        )}
        <div className='ledger_inputs'>
          {accountInputValue !== 'CURRENT LIABILITIES' &&
            accountInputValue !== 'CURRENT ASSETS' &&
            accountInputValue !== 'PURCHASE A/C' &&
            accountInputValue !== 'SUNDRY DEBTORS' &&
            accountInputValue !== 'SALE A/C' &&
            accountInputValue !== 'DUTIES & TAXES' && (
              <div className='fixed_assets_input'>
                <label
                  htmlFor='parentLedger'
                  className='label_name label_name_css'
                >
                  Parent Ledger
                </label>
                <input
                  type='text'
                  id='parentLedger'
                  name='parentLedger'
                  className='input_class'
                  onChange={formik.handleChange}
                  value={formik.values.parentLedger}
                />
              </div>
            )}
          {accountInputValue === 'CURRENT LIABILITIES' && (
            <div className='fixed_assets_input'>
              <label
                htmlFor='parentLedger'
                className='label_name label_name_css'
              >
                Parent Ledger
              </label>
              <select
                id='parentLedger'
                name='parentLedger'
                value={formik.values.parentLedger}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onBlur={formik.handleBlur}
                className='input_class'
              >
                <option value='Google Pay'>Google Pay</option>
                <option value='Marg Pay'>Marg Pay</option>
                <option value='Paytm'>Paytm</option>
                <option value='PhonePe'>PhonePe</option>
              </select>
            </div>
          )}
          {(accountInputValue === 'CURRENT ASSETS' ||
            accountInputValue === 'PURCHASE A/C' ||
            accountInputValue === 'SUNDRY DEBTORS' ||
            accountInputValue === 'SALE A/C' ||
            accountInputValue === 'DUTIES & TAXES') && (
            <div className='fixed_assets_input'>
              <label
                htmlFor='parentLedger'
                className='label_name label_name_css'
              >
                Parent Ledger
              </label>
              <input
                type='text'
                id='parentLedger'
                name='parentLedger'
                className='input_class'
                value={formik.values.parentLedger}
                onChange={(e) => {
                  formik.handleChange(e);
                  handleInputChange(e);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  handleOnKeyDown(
                    e,
                    partySuggestions,
                    (value) => {
                      formik.setFieldValue('parentLedger', value);
                      setAccountInputValue(value);
                    },
                    setPartySuggestions,
                    selectedPartySuggestionIndex,
                    setSelectedPartySuggestionIndex
                  );
                }}
              />
              {!!partySuggestions.length && (
                <ul className='party_suggestion station_suggestion'>
                  {partySuggestions.map((party: any, index: number) => (
                    <li
                      key={party.party_code}
                      onClick={() => {
                        formik.setFieldValue('parentLedger', party.party_name);
                        setPartySuggestions([]);
                        document.getElementById('parentLedger')?.focus();
                      }}
                      className={`${
                        index === selectedPartySuggestionIndex
                          ? 'station_selected'
                          : 'station_suggestion_list'
                      }`}
                      id={`suggestion_${index}`}
                    >
                      {party.party_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};