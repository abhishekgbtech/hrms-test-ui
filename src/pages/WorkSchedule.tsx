"use client";

import React, { useState } from "react";
import Calendar from '../components/calendar/Calendar';
import { Button } from '../components/ui/Button';
import { Plus, History, Clock } from '../components/icons';
import type { Task } from '../data/mockData';
import { RegularizeAttendanceModal } from "../components/modals/RegularizeAttendanceModal";
import { RequestHistoryModal } from "../components/modals/RequestHistoryModal";
import { RequestLeaveModal } from "../components/modals/RequestLeaveModal";

const LeaveBalanceCard: React.FC<{ type: string; balance: string; color: string }> = ({ type, balance, color }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{type}</span>
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
        </div>
        <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{balance}</p>
        <p className="text-xs text-slate-400">days remaining</p>
    </div>
);

interface WorkScheduleProps {
    tasks?: Task[];
}

const WorkSchedule: React.FC<WorkScheduleProps> = ({ tasks = [] }) => {
    const [isRegularizeOpen, setIsRegularizeOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
                <Calendar tasks={tasks} />
            </div>
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Leave Balance</h3>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => setIsHistoryOpen(true)}>
                            <History size={16} className="mr-1.5" /> History
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <LeaveBalanceCard type="Paid Leave" balance="29.25" color="bg-cyan-500" />
                        <LeaveBalanceCard type="Earned Leave" balance="3" color="bg-emerald-500" />
                        <LeaveBalanceCard type="Sick Leave" balance="3" color="bg-amber-500" />
                        <LeaveBalanceCard type="Unpaid Leave" balance="0" color="bg-slate-500" />
                    </div>
                    
                    <div className="mt-4 space-y-3">
                        <Button variant="outline" className="w-full justify-start text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600" onClick={() => setIsRegularizeOpen(true)}>
                            <Clock size={16} className="mr-2 text-orange-500" /> Regularize Attendance
                        </Button>
                        <Button className="w-full justify-start" onClick={() => setIsLeaveRequestOpen(true)}>
                            <Plus size={16} className="mr-2" /> Request Leave
                        </Button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800/50 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                     <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Attendance History</h3>
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {/* Mock data for attendance */}
                        <div className="text-sm flex justify-between items-center p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                            <div>
                                <p className="font-medium text-slate-700 dark:text-slate-200">Nov 13, 2025</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">09:05 AM - 05:58 PM</p>
                            </div>
                            <span className="font-semibold text-green-600 dark:text-green-400">8h 53m</span>
                        </div>
                         <div className="text-sm flex justify-between items-center p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                            <div>
                                <p className="font-medium text-slate-700 dark:text-slate-200">Nov 12, 2025</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">09:01 AM - 06:15 PM</p>
                            </div>
                            <span className="font-semibold text-green-600 dark:text-green-400">9h 14m</span>
                        </div>
                         <div className="text-sm flex justify-between items-center p-2 rounded-md bg-red-100 dark:bg-red-900/40">
                            <div>
                                <p className="font-medium text-red-700 dark:text-red-300">Nov 11, 2025</p>
                                <p className="text-xs text-red-500 dark:text-red-400">Absent</p>
                            </div>
                             <span className="font-semibold text-red-600 dark:text-red-400">-</span>
                        </div>
                     </div>
                </div>
            </div>

            {/* Modals */}
            <RegularizeAttendanceModal isOpen={isRegularizeOpen} onClose={() => setIsRegularizeOpen(false)} />
            <RequestHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
            <RequestLeaveModal isOpen={isLeaveRequestOpen} onClose={() => setIsLeaveRequestOpen(false)} />
        </div>
    );
};

export default WorkSchedule;