import { useFormik } from 'formik';
import React, { KeyboardEvent, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { FaExclamationCircle } from 'react-icons/fa';

interface GeneralInfoProps {
  onValueChange?: any;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({ onValueChange }) => {
  const [stationSuggestions, setStationSuggestions] = useState<any>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<any>([]);
  const [stationInputValue, setStationInputValue] = useState('');
  const [accountInputValue, setAccountInputValue] = useState('');
  const [stationData, setStationData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const electronAPI = (window as any).electronAPI;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedItcAvailOption, setSelectedItcAvailOption] = useState('');
  const [selectedItcAvail2Option, setSelectedItcAvail2Option] = useState('');

  const getStations = () => {
    setStationData(electronAPI.getAllStations('', 'station_name', '', '', ''));
  };

  const getAllGroups = () => {
    setGroupData(electronAPI.getAllGroups('', 'group_name', '', '', ''));
  };

  useEffect(() => {
    getStations();
    getAllGroups();
  }, []);

  const handleInputChange = (e: { target: { value: any; id: any } }) => {
    const value = e.target.value;
    const id = e.target.id;
    console.log('value: ', e, id, value);
    if (e.target.id === 'stationName') {
      setStationInputValue(value);
      const filteredSuggestions = stationData.filter((station: any) => {
        console.log('stations inside filter ===> ', station);
        return station.station_name.toLowerCase().includes(value.toLowerCase());
      });

      console.log('filtered suggestinos ====> ', filteredSuggestions);
      setStationSuggestions(filteredSuggestions);
    } else if (e.target.id === 'accountGroup') {
      setAccountInputValue(value);
      const filteredSuggestions = groupData.filter((group: any) => {
        return group.group_name.toLowerCase().includes(value.toLowerCase());
      });

      console.log(
        'filtered suggestinos inside groups ====> ',
        filteredSuggestions
      );
      setGroupSuggestions(filteredSuggestions);
    } else if (e.target.id === 'fixedAssets') {
      setSelectedOption(e.target.value);
    } else if (e.target.id === 'itcAvail') {
      setSelectedItcAvailOption(e.target.value);
    } else if (e.target.id === 'itcAvail2') {
      setSelectedItcAvail2Option(e.target.value);
    }
  };

  const handleEnterKey = (
    e: KeyboardEvent<HTMLInputElement>,
    suggestions: any[],
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<any[]>>,
    selectedIndex: number
  ) => {
    e.preventDefault();
    if (suggestions === stationSuggestions) {
      setInputValue(suggestions[selectedIndex].station_name);
      setSuggestions([]);
      console.log(
        'stations value ===> ',
        suggestions[selectedIndex].station_name
      );
    } else if (suggestions === groupSuggestions) {
      setInputValue(suggestions[selectedIndex].group_name);
      onValueChange(suggestions[selectedIndex].group_name);
      setSuggestions([]);
      console.log('group value ===> ', suggestions[selectedIndex].group_name);
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
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
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

  const validationSchema = Yup.object({
    partyName: Yup.string()
      .max(100, 'Party Name must be 50 characters or less')
      .required('Party Name is required'),
  });

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
      parentLedger: '',
      taxType: '',
      fixedAssets: '',
      hsnCode: '',
      taxPercentageType: '',
      itcAvail: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form data', values);
    },
  });

  return (
    <div className='ledger_general_info'>
      <div className='general_info_prefix'>General Info</div>
      <form onSubmit={formik1.handleSubmit} className='general_info_inputs'>
        <div className='ledger_inputs'>
          <label htmlFor='partyName' className='label_name label_name_css'>
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
          <div className='fixed_assets_input'>
            <label htmlFor='accountGroup' className='label_name label_name_css'>
              Account Group
            </label>
            <input
              type='text'
              id='accountGroup'
              name='accountGroup'
              value={accountInputValue}
              onChange={handleInputChange}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                handleOnKeyDown(
                  e,
                  groupSuggestions,
                  setAccountInputValue,
                  setGroupSuggestions,
                  selectedIndex2,
                  setSelectedIndex2
                );
              }}
            />
            {!!groupSuggestions.length && (
              <ul className={'accountGroup_suggestion station_suggestion'}>
                {groupSuggestions.map((group: any, index: number) => (
                  <li
                    key={group.group_code}
                    onClick={() => {
                      setAccountInputValue(group.group_name);
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
            <div className='stations_input'>
              <label htmlFor='stationName' className='label_name_css'>
                Station
              </label>
              <input
                type='text'
                id='stationName'
                name='stationName'
                onChange={handleInputChange}
                value={stationInputValue}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  handleOnKeyDown(
                    e,
                    stationSuggestions,
                    setStationInputValue,
                    setStationSuggestions,
                    selectedIndex,
                    setSelectedIndex
                  );
                }}
              />
              {!!stationSuggestions.length && (
                <ul className={'station_suggestion'}>
                  {stationSuggestions.map((station: any, index: number) => (
                    <li
                      key={station.station_id}
                      onClick={() => {
                        setStationInputValue(station.station_name);
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
              type='text'
              id='mailTo'
              name='mailTo'
              className='input_class'
              onChange={formik1.handleChange}
              value={formik1.values.mailTo}
            />
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
              onChange={formik1.handleChange}
              value={formik1.values.address}
            />
          </div>
        )}
        {(accountInputValue === 'SUNDRY CREDITORS' ||
          accountInputValue === 'SUNDRY DEBTORS') && (
          <div className='ledger_inputs country_div'>
            <div className='country_input'>
              <label htmlFor='country' className='label_name label_name_css'>
                Country
              </label>
              <input
                type='text'
                id='country'
                name='country'
                className='state_input'
                onChange={formik1.handleChange}
                value={formik1.values.country}
              />
            </div>
            <div className='country'>
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
            <div className='country'>
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
              onChange={formik1.handleChange}
              value={formik1.values.pinCode}
            />
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
              onChange={formik1.handleChange}
              value={formik1.values.taxType}
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
                // className='input_class short_input_class'
                // onChange={formik1.handleChange}
                // value={formik1.values.fixedAssets}
                value={selectedOption}
                onChange={handleInputChange}
                onBlur={formik1.handleBlur}
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
                  onChange={formik1.handleChange}
                  value={formik1.values.hsnCode}
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
                onChange={formik1.handleChange}
                value={formik1.values.taxPercentageType}
              />
            </div>
            <div className='hsn_input'>
              <label htmlFor='itcAvail' className='label_name_css'>
                ITC Availability
              </label>
              {/* <input
                type='text'
                id='itcAvail'
                name='itcAvail'
                onChange={formik1.handleChange}
                value={formik1.values.itcAvail}
              /> */}
              <select
                id='itcAvail'
                name='itcAvail'
                // className='input_class short_input_class'
                // onChange={formik1.handleChange}
                // value={formik1.values.fixedAssets}
                value={selectedItcAvailOption}
                onChange={handleInputChange}
                onBlur={formik1.handleBlur}
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
                value={selectedItcAvail2Option}
                onChange={handleInputChange}
                onBlur={formik1.handleBlur}
              >
                <option value='Compulsory'>Compulsory</option>
                <option value='Service Imports'>Service Imports</option>
                <option value='Goods'>Goods</option>
              </select>
            </div>
          </div>
        )}
        <div className='ledger_inputs'>
          <label htmlFor='parentLedger' className='label_name label_name_css'>
            Parent Ledger
          </label>
          <input
            type='text'
            id='parentLedger'
            name='parentLedger'
            className='input_class'
            onChange={formik1.handleChange}
            value={formik1.values.parentLedger}
          />
        </div>
      </form>
    </div>
  );
};