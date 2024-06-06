import React, { useMemo, FC } from "react";
import classNames from "classnames";

export const BTN_TYPE = {
  primary: "primary",
  secondary: "secondary",
  default: "default",
};

interface ButtonProps {
  type?: string;
  id?: string;
  handleOnClick?: () => void;
  handleOnKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: FC<React.SVGProps<SVGSVGElement>>;
  iconClass?: string;
  padding?: string;
  btnType?: "button" | "submit" | "reset";
  children: React.ReactNode;
  disable?: boolean;
  autoFocus?: boolean;
}

const Button: FC<ButtonProps> = ({
  type = "",
  id,
  handleOnClick = () => {},
  handleOnKeyDown = () => {},
  className = "",
  icon: IconComponent,
  iconClass,
  padding = "px-5 py-2",
  btnType = "button",
  children,
  disable,
  autoFocus = false,
  ...rest
}) => {
  const styleType = useMemo(() => {
    switch (type) {
      case "ghost":
        return "rounded";
      case "highlight":
        return "bg-[#EAFBFCFF] border-2 border-solid border-[#009196FF] focus:border-yellow-500 focus-visible:border-yellow-500";
      case "fill":
        return "bg-[#009196FF] hover:bg-[#009196FF] font-medium text-white rounded-xl border-none focus:border-yellow-500 focus-visible:border-yellow-500";
      case "fog":
        return "bg-white hover:bg-gray-100 font-medium text-[#171A1FFF] border-2 border-solid border-[#ccc]";
      default:
        return "bg-white border border-solid border-black text-[#009196FF] font-medium";
    }
  }, [type]);

  return (
    <button
      type={"submit" || btnType}
      id={id || ""}
      disabled={disable}
      className={classNames(
        `flex flex-row items-center text-base font-medium justify-center cursor-pointer rounded-md
         ${disable ? "opacity-40 cursor-not-allowed" : "opacity-100"}`,
        padding,
        styleType,
        className
      )}
      onClick={handleOnClick}
      onKeyDown={handleOnKeyDown}
      autoFocus={autoFocus}
      {...rest}
    >
      {IconComponent && <IconComponent className={`mx-1 min-w-fit w-auto ${iconClass}`} />}
      {children}
    </button>
  );
};

export default Button;
