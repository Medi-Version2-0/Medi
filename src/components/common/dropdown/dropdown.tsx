import Tippy from '@tippyjs/react';
import './dropdown.css';
import { useState, useRef, useEffect } from 'react';

interface ItemInterface {
    label: string;
    click: () => void;
    key: string;
}

interface DropdownTippyProps {
    items: ItemInterface[];
    children: React.ReactNode;
    placement?: any;
    interactive?: boolean;
    boxClass?: string;
    itemClass?: string;
}

const DropdownTippy = ({
    items,
    children,
    placement = 'bottom',
    interactive = true,
    boxClass,
    itemClass = 'px-[6px]'
}: DropdownTippyProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            dropdownRef.current.focus();
            setSelectedItemIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLocaleLowerCase() === 'm' && !isOpen) {
                setIsOpen(true);
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);

        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [isOpen]);


    useEffect(() => {
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key) {
                const index = items.findIndex(item => item.key === event.key.toLocaleLowerCase());
                if (index !== -1) {
                    items[index].click();
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);

        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [items]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                if (selectedItemIndex > 0) {
                    setSelectedItemIndex(selectedItemIndex - 1);
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (selectedItemIndex < items.length - 1) {
                    setSelectedItemIndex(selectedItemIndex + 1);
                }
                break;
            case 'Enter':
                event.preventDefault();
                if (items[selectedItemIndex]) {
                    items[selectedItemIndex].click();
                    setIsOpen(false);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const renderContent = () => {
        return (
            <div
                className="dropdown-content"
                ref={dropdownRef}
                onKeyDown={handleKeyDown}
                tabIndex={0}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`${index === selectedItemIndex ? 'bg-[#009196FF] text-white' : ''} ${itemClass}`}
                        onClick={() => {
                            item.click();
                            setIsOpen(false);
                        }}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Tippy
            content={renderContent()}
            interactive={interactive}
            visible={isOpen}
            onClickOutside={() => setIsOpen(false)}
            placement={placement}
            className={`shadow-md ${boxClass}`}
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className='cursor-pointer'
                onKeyDown={(e) => e.preventDefault()}
            >
                {children}
            </div>
        </Tippy>
    );
};

export default DropdownTippy;
