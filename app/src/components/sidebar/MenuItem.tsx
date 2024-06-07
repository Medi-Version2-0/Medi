import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuItemProps {
    label: string;
    url: string;
    className?: string;
    iconClassName?: string;
    icon?: React.ReactElement;
    onClickIcon?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, url, className, icon, iconClassName, onClickIcon }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if(label === 'Sales' || label === 'Purchase'){
            navigate(url, {state: label});
        } else{
            navigate(url);
        }
    };

    const handleIconClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        if (onClickIcon) {
            onClickIcon();
        }
    };

    return (
        <div className={`flex justify-between border bg-[#EAFBFCFF] cursor-pointer text-[0.9rem] pl-10 pr-[11px] py-2.5 border-solid border-[#009196FF] ${className}`} onClick={handleClick}>
            <span>{label}</span>
            {icon && (
                <span className={iconClassName} onClick={handleIconClick}>
                    {icon}
                </span>
            )}
        </div>
    );
};

export default MenuItem;
