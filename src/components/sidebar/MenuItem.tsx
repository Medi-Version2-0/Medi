import React from 'react';

interface MenuItemProps {
  id?: string;
  label: string;
  url: string;
  className?: string;
  iconClassName?: string;
  icon?: React.ReactElement;
  onClickIcon?: () => void;
  onClick?: () => void;
  isDisabled?: boolean;
}

const MenuItem = ({
  id,
  label,
  className,
  icon,
  iconClassName,
  onClickIcon,
  onClick,
  isDisabled = false,
}: MenuItemProps) => {
  if (isDisabled) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } 
  };

  const handleIconClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (onClickIcon) {
      onClickIcon();
    } else {
      handleClick();
    }
  };

  return (
    <div
      className={`flex justify-between border bg-[#EAFBFCFF] cursor-pointer text-[0.9rem] pl-10 pr-[11px] py-2.5 border-solid border-[#009196FF] items-center ${className}`}
      onClick={handleClick}
    >
      <span id={id}>{label}</span>
      {icon && (
        <span className={`cursor-pointer ${iconClassName}`} onClick={handleIconClick}>
          {icon}
        </span>
      )}
    </div>
  );
};

export default MenuItem;
