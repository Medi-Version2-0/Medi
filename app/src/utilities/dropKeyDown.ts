interface HandleSelectKeyDownParams {
  e: React.KeyboardEvent<HTMLSelectElement>;
  focusedSetter?: (field: string) => void;
}

const onDropKeyDown = ({ e, focusedSetter }: HandleSelectKeyDownParams) => {
  const key = e.key;
  const shiftPressed = e.shiftKey;
  const dropdown = document.querySelector('.custom-select__menu');
  !dropdown && e.preventDefault();

  if ((key === 'Enter' || key === 'Tab') && !shiftPressed) {

    const nextField = e.currentTarget.getAttribute('data-next-field') || '';
    document.getElementById(nextField)?.focus();
    focusedSetter && focusedSetter(nextField);

  } else if (key === 'Tab' && shiftPressed) {

    const prevField = e.currentTarget.getAttribute('data-prev-field') || '';
    document.getElementById(prevField)?.focus();
    focusedSetter && focusedSetter(prevField);
    
  }
};

export default onDropKeyDown;
