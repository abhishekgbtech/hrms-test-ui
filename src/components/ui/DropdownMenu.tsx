"use client";

import React, { useState, createContext, useContext, useRef, useEffect, ReactNode } from "react";
import ReactDOM from 'react-dom';
import { cn } from '../../lib/utils';
import { Check } from '../icons';
import { AnimatePresence, motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

const DropdownMenu: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { asChild?: boolean }>(
  ({ children, asChild, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useContext(DropdownMenuContext);

    const handleRef = (node: HTMLElement | null) => {
      // @ts-ignore
      triggerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        // @ts-ignore
        ref.current = node;
      }
    };
    
    const triggerProps = {
        ...props,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            setOpen(!open);
            props.onClick?.(e);
        },
        ref: handleRef,
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, triggerProps);
    }
    
    return <button {...(triggerProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";


const DropdownMenuContent = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { align?: 'start' | 'end' }>(
  ({ className, children, align = 'start', ...props }, ref) => {
    const { open, setOpen, triggerRef } = useContext(DropdownMenuContext);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const updatePosition = () => {
            if (open && triggerRef.current && menuRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const menuRect = menuRef.current.getBoundingClientRect();
                
                let top = triggerRect.bottom + window.scrollY + 8;
                let left = triggerRect.left + window.scrollX;

                if (align === 'end') {
                    left = triggerRect.right + window.scrollX - menuRect.width;
                }
                
                // Boundary checks
                if (left < 8) {
                    left = 8;
                }
                if ((left + menuRect.width) > window.innerWidth - 8) {
                    left = window.innerWidth - menuRect.width - 8;
                }
                if ((top + menuRect.height) > window.innerHeight - 8 && (triggerRect.top > menuRect.height)) {
                    top = triggerRect.top + window.scrollY - menuRect.height - 8;
                }
                
                setPosition({ top, left });
            }
        };
        
        // must run this after the component has been rendered to get correct menuRect
        requestAnimationFrame(updatePosition);
        
        if(open) {
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }
    }, [open, align, triggerRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                open &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, setOpen, triggerRef]);

    if (typeof document === 'undefined') return null;

    return ReactDOM.createPortal(
      <AnimatePresence>
        {open && (
            <motion.div
                ref={menuRef}
                style={{
                    position: 'absolute',
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                }}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={cn(
                    "z-[100] min-w-[8rem] overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-lg",
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";


const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
>(({ className, children, checked, onCheckedChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
      className
    )}
    onClick={() => onCheckedChange?.(!checked)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Check size={16} />}
    </span>
    {children}
  </div>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100', className)} {...props} />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-1 py-1 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 z-10',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(({ className, ...props }, ref) => (
  <hr ref={ref} className={cn('-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-700', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
};