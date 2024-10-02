import { FormikProps } from 'formik';
import { FieldConfig, Option } from '../../interface/global';
import CustomSelect from '../custom_select/CustomSelect';
import FormikInputField from './FormikInputField';
import { TabManager } from '../class/tabManager';

interface PopupFormProps {
    fields: Array<FieldConfig>;
    formik: {
        handleBlur: (e: React.FocusEvent<any>) => void;
        handleChange: (e: React.ChangeEvent<any>) => void;
        values: { [key: string]: any; };
        touched: { [key: string]: boolean; };
        errors: { [key: string]: string; };
        setFieldValue: (field: string, value: any) => void;
        setFieldTouched: (field: string, value: any) => void;
    };
    setFocused: (field: string) => void;
    focused?: string;
}

export const PopupFormContainer = <FormValues,>({ fields, formik, setFocused, focused }: PopupFormProps) => {

    const tabManager = TabManager.getInstance()
    const handleOptionSelections = (field: FieldConfig, option: Option | null) => {
        formik.setFieldValue(field.name, option ? option.value : null);
    };

    return (
        <div className={`flex flex-col gap-3 min-w-[18rem] items-start px-4 text-base text-gray-700`}>
            {fields.map((field) =>
                field.type === 'select' && field.options ? (
                    <div key={field.id} className={`flex flex-col w-full`}>
                        <CustomSelect
                            key={field.id}
                            label={field.label}
                            id={field.id}
                            name={field.name}
                            value={field.options.find((option) => option.value === formik.values[field.name]) || null}
                            onChange={(option: Option | null) => handleOptionSelections(field, option)}
                            options={field.options}
                            autoFocus={field.autoFocus}
                            isSearchable={field.isSearchable}
                            disableArrow={field.disableArrow}
                            hidePlaceholder={field.hidePlaceholder}
                            className={`!h-8 rounded-sm text-xs`}
                            isFocused={focused === field.id}
                            isRequired={field.isRequired}
                            isDisabled={field?.disabled || false}
                            isTouched={formik.touched[field.name as keyof typeof formik.touched]}
                            error={formik.errors[field.name as keyof typeof formik.errors]}
                            onFocus={() => field.onFocus && field.onFocus()}
                            placeholder='Select...'
                            showErrorTooltip={!!(formik.touched[field.name as keyof typeof formik.touched] && formik.errors[field.name as keyof typeof formik.errors])}
                            onBlur={() => {
                                formik.setFieldTouched(field.name, true);
                                setFocused('');
                            }}
                            onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
                                if (e.key === 'Enter') {
                                    const dropdown = document.querySelector('.custom-select__menu');
                                    if (!dropdown) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        tabManager.focusManager()
                                    }
                                }
                            }}
                        />
                    </div>
                ) : (
                    <FormikInputField
                        key={field.id}
                        label={field.label}
                        id={field.id}
                        name={field.name}
                        formik={formik}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        isTitleCase={field.isTitleCase}
                        className='!gap-0'
                        isUpperCase={true}
                        isRequired={field.isRequired}
                        nextField={field.nextField}
                        prevField={field.prevField}
                        sideField={field.sideField}
                        type={field.type}
                        showErrorTooltip={!!(formik.touched[field.name as keyof typeof formik.touched] && formik.errors[field.name as keyof typeof formik.errors])}
                        isDisabled={field?.disabled || false}
                        autoFocus={field.autoFocus}
                    />
                )
            )}
        </div>
    )
};