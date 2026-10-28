"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import ReactDOM from 'react-dom';

interface AlertDialogContextType {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within an AlertDialog');
  }
  return context;
};

// FIX: Update default onOpenChange to accept a boolean argument, which resolves the "Expected 0 arguments, but got 1" error. The error message pointed to line 27, but the cause was on this line.
export const AlertDialog: React.FC<{ children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; }> = ({ children, open, onOpenChange = (_open: boolean) => {} }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialogContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

// FIX: Changed children type to React.ReactElement<any> to allow accessing props like onClick.
export const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, { children: React.ReactElement<any>; asChild?: boolean; }>(({ children, asChild }, ref) => {
    const { onOpenChange } = useAlertDialog();
    
    const props = {
        // FIX: Used 'as const' to prevent TypeScript from widening the string type, which caused a compatibility issue.
        'aria-haspopup': 'dialog' as const,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
            onOpenChange(true);
            // FIX: Pass the event to the child's onClick handler to allow for event propagation and default behavior prevention.
            if (children.props.onClick && typeof children.props.onClick === 'function') {
                children.props.onClick(e);
            }
        },
    };

    if (asChild) {
        return React.cloneElement(children, props);
    }

    return (
        // FIX: The forwarded ref was not being applied to the button element.
        <button {...props} ref={ref}>
            {children}
        </button>
    );
});
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

export const AlertDialogContent: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => {
    const { isOpen, onOpenChange } = useAlertDialog();
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onOpenChange(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onOpenChange]);
    
    // This effect handles clicks outside the dialog content
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
             if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                onOpenChange(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }

    }, [isOpen, onOpenChange]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div 
                ref={contentRef} 
                className={className} 
                role="alertdialog"
                aria-modal="true"
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

export const AlertDialogHeader: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => <div className={className}>{children}</div>;
export const AlertDialogTitle: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => <h2 className={className}>{children}</h2>;
export const AlertDialogDescription: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => <p className={className}>{children}</p>;
export const AlertDialogFooter: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => <div className={`flex justify-end gap-2 pt-4 ${className}`}>{children}</div>;

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(({ asChild, children, onClick, ...props }, ref) => {
    const { onOpenChange } = useAlertDialog();
    const clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        onOpenChange(false);
    };

    if (asChild && React.isValidElement(children)) {
        // FIX: Cast the child to React.ReactElement<any> to allow passing the ref prop during cloning.
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: clickHandler,
            ...props,
            ref,
        });
    }

    return <button ref={ref} onClick={clickHandler} {...props}>{children}</button>
});
AlertDialogCancel.displayName = 'AlertDialogCancel';

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(({ asChild, children, ...props }, ref) => {
     if (asChild && React.isValidElement(children)) {
        // FIX: Cast the child to React.ReactElement<any> to allow passing the ref prop during cloning.
        return React.cloneElement(children as React.ReactElement<any>, {
            ...props,
            ref,
        });
    }
    return <button ref={ref} {...props}>{children}</button>
});
AlertDialogAction.displayName = 'AlertDialogAction';