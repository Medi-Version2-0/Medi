import React from "react";

const CheckboxCellRenderer: React.FC<{ id?: string, value: boolean; onChange: (checked: boolean) => void }> = ({ id, value, onChange }) => {
    return (
        <input
            id={id || ''}
            className='w-full outline-none'
            type="checkbox"
            checked={value}
            onChange={e => onChange(e.target.checked)}
        />
    );
};

export default CheckboxCellRenderer;