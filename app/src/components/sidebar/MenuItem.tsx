import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';

interface MenuItemProps {
  id?: string;
  label: string;
  url: string;
  className?: string;
  iconClassName?: string;
  icon?: React.ReactElement;
  onClickIcon?: () => void;
}

const MenuItem = ({
  id,
  label,
  url,
  className,
  icon,
  iconClassName,
  onClickIcon,
}: MenuItemProps) => {
  const navigate = useNavigate();
  const { selectedCompany } = useUser();
  const handleClick = () => {
    if (label === 'Sales Account' || label === 'Purchase Account') {
      navigate(`/${selectedCompany}${url}`, { state: label });
    } else {
      navigate(`/${selectedCompany}${url}`);
    }
  };

  const handleIconClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (onClickIcon) {
      onClickIcon();
    }
  };

  return (
    <div
      className={`flex justify-between border bg-[#EAFBFCFF] cursor-pointer text-[0.9rem] pl-10 pr-[11px] py-2.5 border-solid border-[#009196FF] ${className}`}
      onClick={handleClick}
    >
      <span id={id}>{label}</span>
      {icon && (
        <span className={iconClassName} onClick={handleIconClick}>
          {icon}
        </span>
      )}
    </div>
  );
};

export default MenuItem;
