import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';

interface ActionCellProps {
    data: any;
    onEdit: (data: any) => void;
    onDelete?: (data: any) => void;
    disabled?: boolean;
}

const ActionCell: React.FC<ActionCellProps> = ({
    data,
    onEdit,
    onDelete,
    disabled = false
}) => {
    return (
        <div className='table_edit_buttons'>
            <FaEdit
                style={{ cursor: 'pointer', fontSize: '1.1rem' }}
                onClick={() => !disabled && onEdit(data)}
            />
            {onDelete && <MdDeleteForever
                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => !disabled && onDelete(data)}
            />
            }
        </div>
    );
};

export default ActionCell;
