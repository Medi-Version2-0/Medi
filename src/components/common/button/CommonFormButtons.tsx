import React, { useMemo, FC } from "react";
import classNames from "classnames";

interface ButtonProps {
    id? : string,
    variant?: "submit" | "cancel" | "delete";
    handleOnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleOnKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    children?: React.ReactNode;
    disable?: boolean;
    component?: string;
}

export const CommonBtn: FC<ButtonProps> = ({
    id,
    variant = "submit",
    handleOnClick = () => { },
    handleOnKeyDown = () => { },
    children,
    disable,
    component,
    ...rest
}) => {

    const variantType = useMemo(() => {
        switch (variant) {
            case "cancel":
                return "bg-white hover:bg-gray-100 font-medium text-[#171A1FFF] border-2 border-solid border-[#cbc9c9] focus:border-yellow-500 focus-visible:border-yellow-500";
            case "delete":
                return "bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white border-2 border-solid border-[white] focus:border-yellow-500 focus-visible:border-yellow-500";
            case 'submit':
                return "bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none focus:border-yellow-500 focus-visible:border-yellow-500";
            default:
                return "bg-[#009196FF] hover:bg-[#009196e3] font-medium text-white rounded-md border-none focus:border-yellow-500 focus-visible:border-yellow-500";
        }
    }, [variant]);


    return (
        <button
            type={variant === 'submit' ? 'submit' : 'button'}
            id={id ? id : `${component}_${variant}Btn`}
            disabled={disable}
            className={classNames(
                `flex flex-row items-center text-base font-medium justify-center cursor-pointer rounded-md h-8 !uppercase
                ${disable ? "opacity-60 !cursor-not-allowed" : "opacity-100"} px-6 py-2`,
                variantType,
            )}
            onClick={handleOnClick}
            {...rest}
        >
            {children}
        </button>
    );
};
