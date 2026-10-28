
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { DatePicker } from "../ui/DatePicker";

interface RequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ isOpen, onClose }) => {
  const [leaveType, setLeaveType] = useState("planned");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    // Handle submission logic here (e.g., API call)
    console.log("Leave Request Submitted:", {
        type: leaveType,
        from: startDate,
        to: endDate,
        reason
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Request Leave
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-5">
          {/* Leave Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leave Type</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-cyan-500 h-10">
                    <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="planned">Planned Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date</Label>
                <div className="w-full">
                    <DatePicker date={startDate} setDate={setStartDate} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date</Label>
                <div className="w-full">
                    <DatePicker date={endDate} setDate={setEndDate} />
                </div>
              </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</Label>
            <Textarea 
              placeholder="Please provide a reason for your leave request..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none min-h-[100px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="secondary" className="w-full sm:w-auto">Cancel</Button>
          </DialogClose>
          <Button className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm" onClick={handleSubmit}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
