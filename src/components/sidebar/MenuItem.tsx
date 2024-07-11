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
}

const MenuItem = ({
  id,
  label,
  // url,
  className,
  icon,
  iconClassName,
  onClickIcon,
  onClick,
}: MenuItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
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
