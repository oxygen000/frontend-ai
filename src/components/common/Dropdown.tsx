import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  position?:
    | "bottom-start"
    | "bottom-end"
    | "top-start"
    | "top-end"
    | "left"
    | "right";
  width?: string;
  className?: string;
}

// Dropdown Item Component
const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  selected = false,
  disabled = false,
  className = "",
}) => {
  const baseClass = `flex items-center w-full px-4 py-2 text-left text-sm transition-colors ${
    disabled
      ? "text-gray-400 cursor-not-allowed"
      : "text-gray-700 hover:bg-gray-100 cursor-pointer"
  } ${selected ? "bg-blue-50 text-blue-700" : ""} ${className}`;

  return (
    <button
      type="button"
      className={baseClass}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Dropdown Component
const Dropdown: React.FC<DropdownProps> & {
  Item: typeof DropdownItem;
} = ({
  trigger,
  children,
  position = "bottom-start",
  width = "48",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Setup popper for positioning
  const { styles, attributes, update } = usePopper(
    triggerRef.current,
    dropdownRef.current,
    {
      placement: position,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
        {
          name: "preventOverflow",
          options: {
            padding: 8,
          },
        },
      ],
    }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown when pressing escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Update position when dropdown is opened
  useEffect(() => {
    if (isOpen && update) {
      update();
    }
  }, [isOpen, update]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <>
      <div ref={triggerRef} onClick={toggleDropdown} className="inline-block">
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={styles.popper}
            {...attributes.popper}
            className={`z-50 w-${width} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 ${className}`}
          >
            <div className="py-1">{children}</div>
          </div>,
          document.body
        )}
    </>
  );
};

// Add the DropdownItem component as a property of Dropdown
Dropdown.Item = DropdownItem;

export default Dropdown;
