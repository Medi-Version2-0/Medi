import { FormikProps } from 'formik';
import { FieldConfig, Option } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from './FormikInputField';
import { useState } from 'react';
import ImagePreview from './files/ImagePreview';
import NumberInput from './numberInput/numberInput';
import { TabManager } from '../class/tabManager';

const root = process.env.REACT_APP_API_URL;

interface ContainerProps {
  fields: Array<FieldConfig>;
  formik: {
    handleBlur: (e: React.FocusEvent<any>) => void;
    handleChange: (e: React.ChangeEvent<any>) => void;
    values: {
      [key: string]: any;
    };
    touched: {
      [key: string]: boolean;
    };
    errors: {
      [key: string]: string;
    };
    setFieldValue: (field: string, value: any) => void;
    setFieldTouched: (field: string, value: any) => void;
  };
  setFocused: (field: string) => void;
  focused?: string;
  title?:string;
  className?: string;
  labelClassName?: string;
  isSearchable?: boolean;
}

export const Container = <FormValues,>({
  fields,
  formik,
  setFocused,
  focused,
  title,
  className,
  labelClassName,
  isSearchable,
}: ContainerProps) => {

  const [newImg, setNewImg] = useState(false);
  const tabManager = TabManager.getInstance()

  const handleChange = (field: FieldConfig, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    formik.setFieldValue(field.name, event.target.value);
  };

  const handleOptionSelections = (field: FieldConfig, option: Option | null) => {
    formik.setFieldValue(field.name, option ? option.value : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      formik.setFieldValue(e.target.name, e.target.files[0]);
      setNewImg(true);
    }
  };

  return (
    <div className='relative border w-full h-full border-solid border-gray-400 py-6 pl-4'>
      <div className='absolute top-[-14px] left-2  px-2 w-fit bg-[#f3f3f3]'>
         {title}
      </div>
      <div className={`grid grid-cols-3 gap-4 w-full text-base text-gray-700 ${className}`}>
        {fields.map((field) =>
          field.type === 'select' && field.options ? (
            <div key={field.id} className={`w-full`}>
              <CustomSelect
                key={field.id}
                isPopupOpen={false}
                label={field.label}
                id={field.id}
                name={field.name}
                isSearchable={field.isSearchable}
                disableArrow={false}
                options={field.options}
                isFocused={focused === field.id}
                onFocus={() => field.onFocus && field.onFocus()}
                value={
                  field.options.find(
                    (option) => option.value === formik.values[field.name]
                  ) || null
                }
                onChange={(option: Option | null) =>
                  handleOptionSelections(field, option)
                }
                placeholder='Select an option...'
                labelClass={` min-w-[120px] ${labelClassName}`}
                className={`rounded-none mr-4`}
                isTouched={
                  formik.touched[field.name as keyof typeof formik.touched]
                }
                error={formik.errors[field.name as keyof typeof formik.errors]}
                isRequired={field.isRequired}
                showErrorTooltip={
                  !!(
                    formik.touched[field.name as keyof typeof formik.touched] &&
                    formik.errors[field.name as keyof typeof formik.errors]
                  )
                }
                onBlur={() => {
                  formik.setFieldTouched(field.name, true);
                  setFocused('');
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                  if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
                    const dropdown = document.querySelector('.custom-select__menu');
                    if (!dropdown) {
                      e.preventDefault();
                      e.stopPropagation();
                      tabManager.focusManager();
                    }

                  }
                }}
                autoFocus={field.autoFocus}
                isDisabled={field?.disabled || false}
              />
            </div>
          ) :
            field.type === 'textarea' ? (
              <label key={field.id} className={`${field.labelClassName}`}>
                {field.label}
                <textarea
                  id={field.id}
                  value={formik.values[field.name]}
                  onChange={(e: any) =>
                    handleChange(field, e)
                  }
                  rows={4}
                  cols={50}
                  maxLength={100}
                  className={`${field.textFieldClassName} focus:rounded-none focus:!outline-yellow-500 focus:bg-[#EAFBFCFF] text-[12px] px-2`}
                />
              </label>
            ) : 
            field.type === 'number' ? (
                <NumberInput
                label={field.label}
                  name={field.name}
                  key={field.id}
                  id={field.id}
                  placeholder='0.00'
                  maxLength={field.maxLength}
                  min={field.minLength}
                  value={formik.values[field.id]}
                  onChange={(value) => formik.setFieldValue(field.id, value)}
                  onFocus={() => field.onFocus && field.onFocus()}
                  className='!mb-0'
                  labelClassName={`min-w-[120px] text-base text-gray-700 ${labelClassName}`}
                  inputClassName='mr-4 ml-2 text-xs p-1.5'
                  isDisabled={field?.disabled || false}
                  onBlur={field.onBlur}
                  {...(field.max && {max : field.max})}

                />
            ) : (
                <div key={field.id} className='w-full pr-4'>
                  <FormikInputField
                    isPopupOpen={false}
                    key={field.id}
                    label={field.label}
                    id={field.id}
                    name={field.name}
                    formik={formik}
                    onBlur={field.onBlur}
                    isTitleCase={field.isTitleCase}
                    isUpperCase={true}
                    readOnly={field.readOnly}
                    className='!mb-0'
                    inputClassName={`text-xs  ${field.type === 'file' ? 'py-0' : 'py-3.5'}`}
                    labelClassName={`min-w-[120px] text-base text-gray-700 ${labelClassName}`}
                    isRequired={field.isRequired}
                    type={field.type}
                    {...(field.value && { value: field.value })}
                    {...(field.maxLength && {maxLength: field.maxLength})}
                    onClick={()=> field.onClick ? field.onClick() : ''}
                    onChange={field.type === 'file' ? handleFileChange : undefined}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' && field.onClick) {
                            e.preventDefault();
                            e.stopPropagation()
                            document.getElementById(field.id)?.click()
                          }
                      }}
            
                    showErrorTooltip={
                      !!(
                        formik.touched[field.name as keyof typeof formik.touched] &&
                        formik.errors[field.name as keyof typeof formik.errors]
                      )
                    }
                    isDisabled={field?.disabled || false}
                    autoFocus={field.autoFocus}
                  />
                  {field.type === 'file' && !newImg && (formik.values as any)[field.id] && (
                    <ImagePreview name={field.id} url={`${root}${(formik.values as any)[field.id]}` || ''} formik={formik} setNewImg={setNewImg} className='w-[200px]' />
                  )}
                </div>
              )
        )}
      </div>
    </div>
  )
};