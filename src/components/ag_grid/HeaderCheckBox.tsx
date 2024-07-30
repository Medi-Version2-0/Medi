import React from "react";

const HeaderCheckbox: React.FC<{ isChecked: boolean; headerName: string; onChange: (checked: boolean) => void }> = ({ isChecked, headerName, onChange }) => {
    return (
        <div className='flex gap-1 items-center'>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={e => onChange(e.target.checked)}
            />
            {headerName}
        </div>
    );
};

export default HeaderCheckbox;