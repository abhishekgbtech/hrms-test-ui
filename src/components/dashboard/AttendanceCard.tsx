
"use client";

import React, { useState, useEffect } from "react";
import { LogIn, LogOut, Clock, AlertTriangle, Plus, Trash2, CheckCircle2, Edit2 } from '../icons';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/Dialog';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { projects, Task } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFullName } from '../../lib/userUtils';

const TARGET_HOURS = 8.5; // 8 hours 30 minutes
const TARGET_SECONDS = TARGET_HOURS * 3600;

interface TimesheetEntry {
  id: number;
  client: string;
  project: string;
  task: string;
  hours: string;
  description: string;
  isCustomTask: boolean; // Flag to toggle between dropdown and input
  isAutoFilled?: boolean; // Flag for tasks synced from system
}

interface AttendanceCardProps {
    tasks?: Task[];
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ tasks = [] }) => {
  const { profile } = useAuth();
  const currentUserName = getUserFullName(profile);

  // Initialize state from localStorage to persist across refreshes
  const [punchedIn, setPunchedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('attendance_date');
      const today = new Date().toDateString();
      // Only restore state if it's from today
      if (savedDate === today) {
        return localStorage.getItem('attendance_punchedIn') === 'true';
      }
    }
    return false;
  });

  const [punchInTime, setPunchInTime] = useState<Date | null>(() => {
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('attendance_date');
      const today = new Date().toDateString();
      if (savedDate === today) {
        const saved = localStorage.getItem('attendance_punchInTime');
        return saved ? new Date(saved) : null;
      }
    }
    return null;
  });
  
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('attendance_date');
      const today = new Date().toDateString();
      if (savedDate === today) {
        const saved = localStorage.getItem('attendance_accumulatedSeconds');
        return saved ? parseInt(saved, 10) : 0;
      }
    }
    return 0;
  });
  
  const [displayTime, setDisplayTime] = useState('00:00:00');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [timesheet, setTimesheet] = useState<TimesheetEntry[]>([
    { id: Date.now(), client: '', project: '', task: '', hours: '', description: '', isCustomTask: false }
  ]);

  // Persist state changes to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('attendance_date', today);
    localStorage.setItem('attendance_punchedIn', String(punchedIn));
    
    if (punchInTime) {
      localStorage.setItem('attendance_punchInTime', punchInTime.toISOString());
    } else {
      localStorage.removeItem('attendance_punchInTime');
    }
    
    localStorage.setItem('attendance_accumulatedSeconds', String(accumulatedSeconds));
  }, [punchedIn, punchInTime, accumulatedSeconds]);

  // Helper to format seconds into HH:MM:SS
  const formatSeconds = (totalSeconds: number) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Timer Effect
  useEffect(() => {
    let interval: number;

    const updateTimer = () => {
      let currentSessionSeconds = 0;
      if (punchedIn && punchInTime) {
        const now = new Date();
        currentSessionSeconds = Math.floor((now.getTime() - punchInTime.getTime()) / 1000);
      }
      
      const total = accumulatedSeconds + currentSessionSeconds;
      setDisplayTime(formatSeconds(total));
    };

    // Update immediately
    updateTimer();

    if (punchedIn) {
      interval = window.setInterval(updateTimer, 1000);
    }

    return () => clearInterval(interval);
  }, [punchedIn, punchInTime, accumulatedSeconds]);

  const handlePunchIn = () => {
    setPunchedIn(true);
    setPunchInTime(new Date());
  };

  const handlePunchOutClick = () => {
    // --- SMART PRE-FILL LOGIC ---
    // 1. Find relevant tasks from today
    const activeTasks = tasks.filter(t =>
        (t.status === 'in-progress' || t.status === 'completed') &&
        t.assignedTo === currentUserName
    );

    let initialEntries: TimesheetEntry[] = [];

    if (activeTasks.length > 0) {
        initialEntries = activeTasks.map(task => {
            // Find company name based on project
            const relatedProject = projects.find(p => p.name === task.projectName);
            
            return {
                id: Date.now() + Math.random(), // Unique ID
                client: relatedProject ? relatedProject.company : 'Internal',
                project: task.projectName,
                task: task.title,
                hours: '', // User to fill
                description: task.status === 'completed' ? 'Task Completed' : '',
                isCustomTask: false,
                isAutoFilled: true
            };
        });
    } else {
        // Default empty row if no tasks
        initialEntries = [{ id: Date.now(), client: '', project: '', task: '', hours: '', description: '', isCustomTask: false }];
    }

    setTimesheet(initialEntries);
    setShowModal(true);
  };

  const confirmPunchOut = () => {
    if (punchInTime) {
      const now = new Date();
      const sessionSeconds = Math.floor((now.getTime() - punchInTime.getTime()) / 1000);
      setAccumulatedSeconds(prev => prev + sessionSeconds);
    }
    
    setPunchedIn(false);
    setPunchInTime(null);
    setShowModal(false);
    setNote(''); // Reset note for next time
    setTimesheet([{ id: Date.now(), client: '', project: '', task: '', hours: '', description: '', isCustomTask: false }]); // Reset timesheet
    
    // In a real app, submit 'note', 'timesheet' and 'timestamp' to backend here
    console.log("Punched out with note:", note, "Timesheet:", timesheet);
  };

  // Calculate total time including current session for the modal logic
  const getCurrentTotalSeconds = () => {
    let currentSession = 0;
    if (punchInTime) {
        currentSession = Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000);
    }
    return accumulatedSeconds + currentSession;
  };

  // Timesheet Handlers
  const addTimesheetRow = () => {
    setTimesheet([...timesheet, { id: Date.now(), client: '', project: '', task: '', hours: '', description: '', isCustomTask: false }]);
  };

  const removeTimesheetRow = (id: number) => {
    if (timesheet.length > 1) {
        setTimesheet(timesheet.filter(row => row.id !== id));
    }
  };

  const updateTimesheetRow = (id: number, field: keyof TimesheetEntry, value: any) => {
    setTimesheet(timesheet.map(row => {
        if (row.id === id) {
            const updated = { ...row, [field]: value };
            
            // Logic 1: Auto-fill client if project is selected
            if (field === 'project') {
                const selectedProject = projects.find(p => p.name === value);
                if (selectedProject) {
                    updated.client = selectedProject.company;
                } else if (value === 'No Project') {
                    updated.client = 'Internal';
                }
                // Reset task selection when project changes
                updated.task = '';
                updated.isCustomTask = false;
            }

            // Logic 2: Handle "Custom Task" selection from dropdown
            if (field === 'task' && value === 'custom_entry_trigger') {
                updated.isCustomTask = true;
                updated.task = '';
                return updated;
            }

            return updated;
        }
        return row;
    }));
  };

  const toggleCustomTaskInput = (id: number) => {
      setTimesheet(timesheet.map(row => {
          if (row.id === id) {
              return { ...row, isCustomTask: !row.isCustomTask, task: '' };
          }
          return row;
      }));
  }

  const currentTotal = getCurrentTotalSeconds();
  const isEarlyLeaving = currentTotal < TARGET_SECONDS;
  const uniqueClients = Array.from(new Set(projects.map(p => p.company)));

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Attendance</h3>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-2">
          {/* Timer Display */}
          <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full transition-colors ${punchedIn ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Clock size={32} />
              </div>
              <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {punchedIn ? 'Currently Working' : 'Total Hours Today'}
                  </p>
                  <p className="text-3xl font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                    {displayTime}
                  </p>
              </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
                onClick={handlePunchIn}
                disabled={punchedIn}
                className={`h-12 text-base shadow-md transition-all ${
                    punchedIn 
                    ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-600' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:scale-[1.02]'
                }`}
            >
                <LogIn size={20} className="mr-2"/>
                Punch In
            </Button>

            <Button 
                onClick={handlePunchOutClick}
                disabled={!punchedIn}
                className={`h-12 text-base shadow-md transition-all ${
                    !punchedIn 
                    ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-600' 
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 hover:scale-[1.02]'
                }`}
            >
                <LogOut size={20} className="mr-2"/>
                Punch Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Punch Out Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Punch Out & Timesheet</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 px-1 py-2">
            {/* Header Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                   <span className="text-slate-600 dark:text-slate-400">Total time today:</span>
                   <span className="font-mono font-bold text-xl text-slate-800 dark:text-slate-100">{formatSeconds(currentTotal)}</span>
                </div>
                {isEarlyLeaving && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-3 items-center text-amber-800 dark:text-amber-200 text-sm">
                     <AlertTriangle className="h-5 w-5 shrink-0" />
                     <p>Early departure (Target: 8h 30m).</p>
                  </div>
                )}
            </div>

            {/* Timesheet Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Daily Timesheet</h3>
                    <Button size="sm" variant="ghost" onClick={addTimesheetRow} className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400">
                        <Plus size={14} className="mr-1" /> Add Row
                    </Button>
                </div>
                
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <div className="col-span-2 sm:col-span-3">Client</div>
                        <div className="col-span-3">Project</div>
                        <div className="col-span-3 sm:col-span-3">Task</div>
                        <div className="col-span-1">Hrs</div>
                        <div className="col-span-2">Desc</div>
                        <div className="col-span-1 text-center">Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="max-h-[350px] overflow-y-auto">
                        {timesheet.map((row, index) => {
                            // Filter available tasks based on selected project
                            const availableTasks = tasks.filter(t =>
                                t.assignedTo === currentUserName && 
                                t.projectName === row.project
                            );

                            return (
                                <div key={row.id} className={`grid grid-cols-12 gap-2 p-2 items-start border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/30'} ${row.isAutoFilled ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                    {/* Client Select */}
                                    <div className="col-span-2 sm:col-span-3">
                                        <Select value={row.client || undefined} onValueChange={(v) => updateTimesheetRow(row.id, 'client', v)}>
                                            <SelectTrigger className="h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                <SelectValue placeholder="Client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Internal">Internal</SelectItem>
                                                {uniqueClients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Project Select */}
                                    <div className="col-span-3">
                                        <Select value={row.project || undefined} onValueChange={(v) => updateTimesheetRow(row.id, 'project', v)}>
                                            <SelectTrigger className="h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                <SelectValue placeholder="Project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="No Project">No Project</SelectItem>
                                                {projects
                                                    .filter(p => !row.client || row.client === 'Internal' ? false : p.company === row.client)
                                                    .map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Task Selection (Switchable) */}
                                    <div className="col-span-3 sm:col-span-3 relative">
                                        {row.isCustomTask ? (
                                            <div className="flex gap-1">
                                                <Input 
                                                    className="h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-1"
                                                    placeholder="Enter task name"
                                                    value={row.task}
                                                    onChange={(e) => updateTimesheetRow(row.id, 'task', e.target.value)}
                                                    autoFocus
                                                />
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => toggleCustomTaskInput(row.id)} title="Pick from list">
                                                    <Trash2 size={14} /> 
                                                </Button>
                                            </div>
                                        ) : (
                                            <Select value={row.task || undefined} onValueChange={(v) => updateTimesheetRow(row.id, 'task', v)}>
                                                <SelectTrigger className="h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        {row.isAutoFilled && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                                                        <span className="truncate">{row.task || "Select Task"}</span>
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTasks.length > 0 ? (
                                                        <>
                                                            <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Tasks</div>
                                                            {availableTasks.map(t => (
                                                                <SelectItem key={t.id} value={t.title}>
                                                                    <div className="flex items-center justify-between w-full gap-2">
                                                                        <span>{t.title}</span>
                                                                        {t.status === 'completed' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded">Done</span>}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <div className="px-2 py-2 text-xs text-slate-400 italic text-center">No assigned tasks found</div>
                                                    )}
                                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                                    <SelectItem value="custom_entry_trigger">
                                                        <span className="text-cyan-600 font-medium flex items-center gap-2"><Edit2 size={12}/> Enter Custom / Unplanned Task...</span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Hours Input */}
                                    <div className="col-span-1">
                                        <Input 
                                            className={`h-8 text-xs border-slate-200 dark:border-slate-700 ${row.isAutoFilled && !row.hours ? 'ring-1 ring-cyan-500/50 bg-cyan-50/50' : 'bg-white dark:bg-slate-800'} px-1 text-center`}
                                            placeholder="0"
                                            value={row.hours}
                                            onChange={(e) => updateTimesheetRow(row.id, 'hours', e.target.value)}
                                        />
                                    </div>

                                    {/* Description Input */}
                                    <div className="col-span-2">
                                        <Input 
                                            className="h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            placeholder="Details"
                                            value={row.description}
                                            onChange={(e) => updateTimesheetRow(row.id, 'description', e.target.value)}
                                        />
                                    </div>

                                    {/* Delete Action */}
                                    <div className="col-span-1 flex justify-center">
                                        <button 
                                            onClick={() => removeTimesheetRow(row.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">
                Additional Notes {isEarlyLeaving ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
              </Label>
              <Textarea 
                id="note" 
                placeholder={isEarlyLeaving ? "Reason for early departure..." : "Any other general comments..."}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={confirmPunchOut}
              variant={isEarlyLeaving ? "default" : "destructive"}
            >
              Confirm Punch Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendanceCard;
