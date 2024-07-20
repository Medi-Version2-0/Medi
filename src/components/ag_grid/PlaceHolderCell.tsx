import React from 'react';

interface PlaceholderCellRendererProps {
    value: any;
    rowIndex: number;
    column: any;
    startEditingCell: (params: { rowIndex: number; colKey: string }) => void;
    placeholderText?: string;
    className?: string;
}

const PlaceholderCellRenderer: React.FC<PlaceholderCellRendererProps> = ({
    value,
    rowIndex,
    column,
    startEditingCell,
    placeholderText = '',
    className = '',
}) => {
    const hasValue = !!value;
    console.log(placeholderText);
    if (!hasValue && rowIndex === 0) {
        return (
            <span
                onClick={() => startEditingCell({ rowIndex, colKey: column.field })}
                className={`text-gray-400 italic font-bold w-full text-wrap leading-4 text-center ${className}`}
            >
                {placeholderText}
            </span>
        );
    }
    return value;
};

export default PlaceholderCellRenderer;
