
"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { Badge } from "../ui/Badge";

interface RequestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock History Data
const historyData = [
    { id: 1, date: 'Oct 28, 2025', type: 'Regularization', status: 'Approved', details: 'Forgot punch in' },
    { id: 2, date: 'Oct 15, 2025', type: 'Leave (Sick)', status: 'Approved', details: 'Viral fever' },
    { id: 3, date: 'Sep 30, 2025', type: 'Regularization', status: 'Rejected', details: 'System error' },
    { id: 4, date: 'Sep 10, 2025', type: 'Leave (Casual)', status: 'Approved', details: 'Personal work' },
];

export const RequestHistoryModal: React.FC<RequestHistoryModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Request History
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
            <div className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {historyData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.date}</TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400 max-w-[150px] truncate">{item.details}</TableCell>
                                <TableCell>
                                    <Badge className={
                                        item.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' :
                                        item.status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
