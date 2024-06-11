import { FormikProps } from "formik";

type FormikPropsType = FormikProps<any>;

interface HandleKeyDownParams {
  e: React.KeyboardEvent<HTMLInputElement>;
  formik?: FormikPropsType;
  focusedSetter?: (field: string) => void;
  radioField?: {
    typeField?: string;
    sideField?: string;
  };
}

const onKeyDown = ({ e, formik, focusedSetter, radioField }: HandleKeyDownParams) => {
  const key = e.key;
  const shiftPressed = e.shiftKey;

  switch (key) {
    case 'ArrowDown':
    case 'Enter':
      {
        const nextField = e.currentTarget.getAttribute('data-next-field') || '';
        document.getElementById(nextField)?.focus();
        focusedSetter && focusedSetter(nextField);
        if (radioField?.typeField) {
          const value = e.currentTarget.value;
          formik && formik.setFieldValue(radioField.typeField, value);
        }
        e.preventDefault();
      }
      break;
    case 'ArrowUp':
      {
        const prevField = e.currentTarget.getAttribute('data-prev-field') || '';
        document.getElementById(prevField)?.focus();
        focusedSetter && focusedSetter(prevField);
        e.preventDefault();
      }
      break;
    case 'Tab':
      {
        if (shiftPressed) {
          const prevField = e.currentTarget.getAttribute('data-prev-field') || '';
          document.getElementById(prevField)?.focus();
          focusedSetter && focusedSetter(prevField);
          e.preventDefault();
        } else {
          const sideField = e.currentTarget.getAttribute('data-side-field') || '';
          document.getElementById(sideField)?.focus();
          if (radioField?.typeField) {
            const value = (document.getElementById(sideField) as HTMLInputElement)?.value;
            formik && formik.setFieldValue(radioField.typeField, value);
          }
          focusedSetter && focusedSetter(sideField);
          e.preventDefault();
        }
      }
      break;
    default:
      break;
  }
};

export default onKeyDown;
