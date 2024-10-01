export const handleKeyDownCommon = (
  event: KeyboardEvent,
  handleDelete?: (row: any) => void,
  handleUpdate?: (row: any) => void,
  togglePopup?: (state: boolean) => void,
  selectedRow?: any,
  setView?: (view: { type: string; data: any }) => void,
  handleSave?: (data?:any) => void,
  dataToSave?: any,
) => {
  switch (event.key) {
    case 'Escape':
      if (togglePopup) togglePopup(false);
      break;
    // case 'n':
    // case 'N':
    //   if (event.ctrlKey) {
    //     if (togglePopup) {
    //       togglePopup(true);  
    //     } else if (setView) {
    //       setView({ type: 'add', data: {} });
    //     }
    //   }
    //   break;
    case 'd':
    case 'D':
      if (event.ctrlKey && selectedRow && handleDelete) {
        handleDelete(selectedRow);
      }
      break;
    case 'e':
    case 'E':
      if (event.ctrlKey && selectedRow) {
        event.preventDefault();
        if (setView) {
          setView({ type: 'add', data: selectedRow });
        } else if (handleUpdate) {
          handleUpdate(selectedRow);
        }
      }
      break;
    // case's':
    // case 'S':
    //   if (event.ctrlKey && handleSave) {
    //     event.preventDefault();
    //     if (dataToSave){
    //      handleSave(dataToSave);
    //      return;
    //     }
    //     handleSave();
    //   }
      // break;
    default:
      break;
  }
};
