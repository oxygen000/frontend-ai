import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  size?: ModalSize;
  className?: string;
  children?: React.ReactNode;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actions,
  children,
  size = "md",
  className = "",
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (
      closeOnOverlayClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  // Get modal size class
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-lg";
      case "lg":
        return "max-w-2xl";
      case "xl":
        return "max-w-4xl";
      default:
        return "max-w-lg";
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 transition-opacity"
      onClick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`${getSizeClass()} w-full bg-white rounded-lg shadow-xl overflow-hidden transform transition-all ${className}`}
      >
        {title && (
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="overflow-auto max-h-[calc(100vh-200px)]">
          {description && (
            <div className="px-6 pt-5 pb-3">
              {typeof description === 'string' ? (
                <p className="text-gray-600">{description}</p>
              ) : (
                description
              )}
            </div>
          )}

          {children}

          {actions && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
