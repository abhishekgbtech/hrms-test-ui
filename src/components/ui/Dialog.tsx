"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from '../icons';
import { cn } from '../../lib/utils';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType>({
  open: false,
  onOpenChange: (_open: boolean) => {},
});

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog');
  }
  return context;
};

// Main Dialog component that provides context
export const Dialog: React.FC<{ children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; }> = ({ children, open, onOpenChange = (_open: boolean) => {} }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

// Dialog Trigger component
export const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(({ children, asChild, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialog();

    const triggerProps = {
        ...props,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange(true);
            onClick?.(e);
        },
        ref,
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, triggerProps);
    }

    return <button {...triggerProps}>{children}</button>;
});
DialogTrigger.displayName = 'DialogTrigger';

// Dialog Portal for rendering content in document.body
const DialogPortal: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    
    return mounted ? createPortal(children, document.body) : null;
};

// Dialog Overlay
const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof motion.div>>(({ className, ...props }, ref) => (
    <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn("fixed inset-0 z-[149] bg-black/60 backdrop-blur-sm", className)}
        {...props}
    />
));
DialogOverlay.displayName = "DialogOverlay";

// Dialog Content component
export const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof motion.div> & { children?: React.ReactNode }>(({ children, className, ...props }, ref) => {
    const { open, onOpenChange } = useDialog();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onOpenChange]);
    
    return (
        <AnimatePresence>
            {open && (
                <DialogPortal>
                    <DialogOverlay onClick={() => onOpenChange(false)} />
                    <motion.div
                        ref={ref}
                        role="dialog"
                        aria-modal="true"
                        // Using framer motion for centering to avoid conflicts with CSS transforms
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={cn("fixed left-[50%] top-[50%] z-[150] grid w-full max-w-lg gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg duration-200 rounded-lg", className)}
                        {...props}
                    >
                        {children}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500 dark:ring-offset-slate-950 dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-400"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </motion.div>
                </DialogPortal>
            )}
        </AnimatePresence>
    );
});
DialogContent.displayName = "DialogContent";

// Dialog Header
export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0", className)}
        {...props}
    />
));
DialogHeader.displayName = "DialogHeader";

// Dialog Footer
export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2", className)}
        {...props}
    />
));
DialogFooter.displayName = "DialogFooter";

// Dialog Title
export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

// Dialog Description
export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

// Dialog Close
export const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(({ children, asChild, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
            onOpenChange(false);
        }
    };
    
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ...props,
            onClick: handleClick,
            ref,
        });
    }

    return <button ref={ref} onClick={handleClick} {...props}>{children}</button>;
});
DialogClose.displayName = 'DialogClose';