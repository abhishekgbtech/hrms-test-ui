"use client";

import React, { useState } from "react";
import { BellRing, X, Clock, Check, Bell } from "../icons";
import { notifications as initialNotifications } from '../../data/mockData';
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Button } from "./Button";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";

interface Notification {
    id: string
    sender: {
        name: string
        initials: string
        avatarUrl: string;
    }
    message: string
    time: string
    read: boolean
}

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    }

    const unreadCount = notifications.filter((notification) => !notification.read).length

    return (
        <>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <button className="relative flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-slate-900">
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                         <span className="sr-only">Open notifications</span>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] right-[-3rem] sm:right-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-0">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BellRing className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                                <h3 className="dark:text-white font-bold text-slate-800">Notifications</h3>
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                        <p className="dark:text-slate-400 text-slate-500 text-sm mt-1">
                            You have {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}.
                        </p>
                    </div>

                    <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                                    notification.read ? "hover:bg-slate-50 dark:hover:bg-slate-700/60" : "bg-cyan-50 dark:bg-cyan-900/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60",
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                                    <AvatarImage src={notification.sender.avatarUrl} alt={notification.sender.name} />
                                    <AvatarFallback>{notification.sender.initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-semibold", notification.read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white")}>
                                        {notification.sender.name}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {notification.time}
                                    </div>
                                </div>
                                {!notification.read && (
                                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shrink-0 mt-1.5"></div>
                                )}
                            </div>
                        ))}
                         {notifications.length === 0 && (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                No new notifications
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                                setShowAllNotifications(true)
                                setIsPopoverOpen(false)
                                document.body.classList.add("overflow-hidden")
                            }}
                        >
                           View All Notifications
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <div
                className={cn(
                    "fixed inset-0 bg-black/50 dark:bg-black/70 z-[60] transition-opacity duration-300",
                    showAllNotifications ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
                onClick={() => {
                    setShowAllNotifications(false);
                    document.body.classList.remove("overflow-hidden");
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        "fixed top-0 right-0 h-full shadow-lg transition-transform duration-300 ease-in-out transform w-full max-w-md",
                        "bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800",
                        showAllNotifications ? "translate-x-0" : "translate-x-full",
                    )}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BellRing className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                                <h2 className="text-lg font-semibold dark:text-white">All Notifications</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setShowAllNotifications(false)
                                    document.body.classList.remove("overflow-hidden")
                                }}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <X className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                    <BellRing className="h-12 w-12 mb-2 text-slate-300 dark:text-slate-700" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                                            notification.read
                                                ? "hover:bg-slate-50 dark:hover:bg-slate-800"
                                                : "bg-cyan-50 dark:bg-cyan-900/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60",
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                                            <AvatarImage src={notification.sender.avatarUrl} alt={notification.sender.name} />
                                            <AvatarFallback>{notification.sender.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className={cn("text-sm font-semibold", notification.read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white")}>
                                                {notification.sender.name}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {notification.time}
                                            </div>
                                            {notification.read && (
                                                <div className="flex items-center mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Read
                                                </div>
                                            )}
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shrink-0 mt-1.5"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        {unreadCount > 0 && 
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                                <Button
                                    className="w-full"
                                    onClick={markAllAsRead}
                                >
                                    Mark All as Read
                                </Button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}