import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    className?: string;
    zIndex?: string;
}

export default function Modal({ isOpen, onClose, children, className = '', zIndex = 'z-50' }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200`}
            onClick={onClose ? onClose : undefined}
        >
            <div
                className={`transform transition-all animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
