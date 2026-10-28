
"use client";

import React, { useState, createContext, useContext, useMemo } from "react";
import { getDay, getDaysInMonth, format, isToday as isTodayDateFns } from 'date-fns';
import { calendarEvents } from '../../data/mockData';
import type { Task } from '../../data/mockData';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight } from '../icons';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarContextType {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    tasks: Task[];
}

const CalendarContext = createContext<CalendarContextType>({
    currentDate: new Date(),
    setCurrentDate: () => {},
    tasks: [],
});

const CalendarHeader = () => {
    const { currentDate, setCurrentDate } = useContext(CalendarContext);
    
    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-baseline space-x-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{format(currentDate, 'MMMM')}</h2>
                <p className="font-semibold text-slate-500 dark:text-slate-400">{format(currentDate, 'yyyy')}</p>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="secondary" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft size={20} />
                </Button>
                <Button variant="secondary" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="secondary" size="icon" onClick={handleNextMonth}>
                    <ChevronRight size={20} />
                </Button>
            </div>
        </div>
    );
};

const CalendarBody = () => {
    const { currentDate, tasks } = useContext(CalendarContext);
    const firstDayOfMonth = getDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const daysInMonth = getDaysInMonth(currentDate);

    const eventsByDate = useMemo(() => {
        const eventsMap: { [key: number]: { title: string; type: string }[] } = {};
        
        // Map standard calendar events
        calendarEvents.forEach(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            if (eventDate.getFullYear() === currentDate.getFullYear() && eventDate.getMonth() === currentDate.getMonth()) {
                const day = eventDate.getDate();
                if (!eventsMap[day]) {
                    eventsMap[day] = [];
                }
                eventsMap[day].push({ title: event.title, type: event.type });
            }
        });

        // Map Tasks as events based on fixed due date
        tasks.forEach(task => {
            const taskDate = new Date(task.dueDate);
            // Only show tasks that are not completed
            if (task.status !== 'completed' && 
                taskDate.getFullYear() === currentDate.getFullYear() && 
                taskDate.getMonth() === currentDate.getMonth()) {
                const day = taskDate.getDate();
                if (!eventsMap[day]) {
                    eventsMap[day] = [];
                }
                eventsMap[day].push({ title: `Due: ${task.title}`, type: 'task-deadline' });
            }
        });

        return eventsMap;
    }, [currentDate, tasks]);

    const getEventColor = (type: string) => {
        switch(type) {
            case 'meeting': return 'bg-cyan-600';
            case 'task-deadline': return 'bg-purple-600'; // Distinct color for task deadlines
            default: return 'bg-amber-600';
        }
    };

    return (
        <div className="grid grid-cols-7">
            {weekdays.map(day => (
                <div key={day} className="text-center py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">{day}</div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="border-r border-b border-slate-200 dark:border-slate-700 h-20 sm:h-24 md:h-28"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, day) => {
                 const dayNumber = day + 1;
                 const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
                 const isToday = isTodayDateFns(date);
                 const events = eventsByDate[dayNumber] || [];
                 const hasEvents = events.length > 0;

                 return (
                    <div key={day} className={`relative border-r border-b border-slate-200 dark:border-slate-700 h-20 sm:h-24 md:h-28 p-1 sm:p-2 overflow-y-auto no-scrollbar ${hasEvents && !isToday ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                        <div className={`text-xs sm:text-sm text-right font-semibold ${isToday ? 'bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' : 'text-slate-700 dark:text-slate-200'}`}>{dayNumber}</div>
                        <div className="mt-1 space-y-1">
                            {events.slice(0, 3).map((event, i) => (
                                <div key={i} className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded-md text-white truncate ${getEventColor(event.type)}`}>
                                    {event.title}
                                </div>
                            ))}
                             {events.length > 3 && (
                                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">+ {events.length - 3} more</div>
                            )}
                        </div>
                    </div>
                 )
            })}
        </div>
    );
};

interface CalendarProps {
    tasks?: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ tasks = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <CalendarContext.Provider value={{ currentDate, setCurrentDate, tasks }}>
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <CalendarHeader />
                <CalendarBody />
            </div>
        </CalendarContext.Provider>
    );
};

export default Calendar;
