"use client";

import React, { useState, createContext, useContext, ReactNode } from "react";
import { cn } from '../../lib/utils';

const TooltipContext = createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

const TooltipInternal: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    return (
        <TooltipContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-flex">{children}</div>
        </TooltipContext.Provider>
    );
};
export { TooltipInternal as Tooltip };

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ children, asChild, ...props }, ref) => {
    const { setOpen } = useContext(TooltipContext);
    const triggerProps = {
        ...props,
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
    };
    
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ...triggerProps,
            ref,
        });
    }

    return React.createElement('span', { ref, ...triggerProps }, children);
});
TooltipTrigger.displayName = 'TooltipTrigger';

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open } = useContext(TooltipContext);
    if (!open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 px-3 py-1.5 text-sm font-medium text-white dark:text-slate-950 bg-slate-900 dark:bg-slate-50 rounded-md shadow-sm",
                "bottom-full left-1/2 -translate-x-1/2 mb-2",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TooltipContent.displayName = 'TooltipContent';