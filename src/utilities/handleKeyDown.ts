export const handleKeyDownCommon = (
  event: KeyboardEvent,
  handleDelete: (row: any) => void,
  handleUpdate?: (row: any) => void,
  togglePopup?: (state: boolean) => void,
  selectedRow?: any,
  setView?: (view: { type: string; data: any }) => void
) => {
  switch (event.key) {
    case 'Escape':
      if (togglePopup) togglePopup(false);
      break;
    case 'n':
    case 'N':
      if (event.ctrlKey) {
        if (togglePopup) {
          togglePopup(true);  
        } else if (setView) {
          setView({ type: 'add', data: {} });
        }
      }
      break;
    case 'd':
    case 'D':
      if (event.ctrlKey && selectedRow) {
        handleDelete(selectedRow);
      }
      break;
    case 'b':
    case 'B':
      if (event.ctrlKey && selectedRow) {
        if (setView) {
          setView({ type: 'add', data: selectedRow });
        } else if (handleUpdate) {
          handleUpdate(selectedRow);
        }
      }
      break;
    default:
      break;
  }
};
