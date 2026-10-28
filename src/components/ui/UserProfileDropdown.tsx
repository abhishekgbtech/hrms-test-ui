
"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Phone,
  ExternalLink,
  Edit,
  Share2,
  Trash2,
  Move,
  CheckSquare,
  ChevronRight,
  IconProps,
  Sun,
  Moon,
  Palette,
} from "../icons";
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Button } from './Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './DropdownMenu';
import type { Theme, PrimaryColor } from '../../App';

// Define the types for the props
interface UserProfile {
  name: string;
  handle: string;
  avatarUrl: string;
}

interface ActionItem {
  icon: React.FC<IconProps>;
  label: string;
  onClick?: () => void;
}

interface MenuItem {
  icon: React.FC<IconProps>;
  label: string;
  onClick?: () => void;
  isDestructive?: boolean;
  hasArrow?: boolean;
}

interface ThemeConfig {
    theme: Theme;
    setTheme: (t: Theme) => void;
    color: PrimaryColor;
    setColor: (c: PrimaryColor) => void;
}

interface UserProfileDropdownProps {
  user: UserProfile;
  actions: ActionItem[];
  menuItems: MenuItem[];
  triggerType?: 'full' | 'avatar-only';
  themeConfig?: ThemeConfig;
  avatarClassName?: string;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, actions, menuItems, triggerType = 'full', themeConfig, avatarClassName }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Animation variants for the dropdown content
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        staggerChildren: 0.05,
      },
    },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  // Animation variants for each menu item
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const colors: { id: PrimaryColor, color: string }[] = [
      { id: 'cyan', color: '#06b6d4' },
      { id: 'blue', color: '#3b82f6' },
      { id: 'purple', color: '#a855f7' },
      { id: 'orange', color: '#f97316' },
      { id: 'emerald', color: '#10b981' },
      { id: 'red', color: '#ef4444' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerType === 'full' ? (
            <button className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 rounded-full">
                <Avatar className={cn("w-9 h-9", avatarClassName)}>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{user.name}</div>
                </div>
            </button>
        ) : (
             <Avatar className={cn("h-8 w-8 border-2 border-white dark:border-slate-900 cursor-pointer", avatarClassName)}>
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72 p-2"
        align="end"
      >
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
        >
            {/* Top section with user info */}
            <DropdownMenuLabel className="flex items-center gap-2 p-2">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.handle}</p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2" />
            
            {/* Quick actions section */}
            <DropdownMenuGroup>
            <div className="grid grid-cols-3 gap-1 p-1">
                {actions.map((action) => (
                <Button
                    key={action.label}
                    variant="ghost"
                    className="flex flex-col h-16 items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                    onClick={action.onClick}
                >
                    <action.icon size={20} />
                    <span className="text-xs">{action.label}</span>
                </Button>
                ))}
            </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-2 mb-1" />

            {/* Theme & Appearance */}
            {themeConfig && (
                <>
                    <DropdownMenuLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1.5 uppercase tracking-wider">Appearance</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-2">
                            <button 
                                onClick={() => themeConfig.setTheme('light')}
                                className={cn("flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all", themeConfig.theme === 'light' ? "bg-white dark:bg-slate-700 shadow-sm text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-400")}
                            >
                                <Sun size={14} /> Light
                            </button>
                            <button 
                                onClick={() => themeConfig.setTheme('dark')}
                                className={cn("flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all", themeConfig.theme === 'dark' ? "bg-white dark:bg-slate-600 shadow-sm text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-400")}
                            >
                                <Moon size={14} /> Dark
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Palette size={14} /> Accent
                            </span>
                            <div className="flex gap-2">
                                {colors.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={(e) => { e.preventDefault(); themeConfig.setColor(c.id); }}
                                        className={cn(
                                            "w-5 h-5 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900",
                                            themeConfig.color === c.id ? "ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500 scale-110" : ""
                                        )}
                                        style={{ backgroundColor: c.color }}
                                        title={c.id}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DropdownMenuSeparator className="mx-2 mb-1" />
                </>
            )}

            {/* Main menu items section */}
            <DropdownMenuGroup>
            {menuItems.map((item) => (
                <motion.div variants={itemVariants} key={item.label}>
                <DropdownMenuItem
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                    'flex items-center justify-between p-2 text-sm relative cursor-pointer',
                    item.isDestructive && 'text-red-600 dark:text-red-400 focus:text-white focus:bg-red-600 dark:focus:bg-red-500'
                    )}
                    onClick={item.onClick}
                >
                    {hoveredItem === item.label && (
                        <motion.div
                        layoutId="dropdown-hover-bg"
                        className={cn(
                            "absolute inset-0 rounded-md -z-10",
                            item.isDestructive ? "bg-red-500/10" : "bg-slate-100 dark:bg-slate-800"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        />
                    )}
                    <div className="flex items-center gap-2">
                    <item.icon size={16} />
                    <span>{item.label}</span>
                    </div>
                    {item.hasArrow && <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />}
                </DropdownMenuItem>
                </motion.div>
            ))}
            </DropdownMenuGroup>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
