
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Mail, Phone, Copy, Check } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { handleContactAction } from "../../lib/utils";

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({ isOpen, onClose, user }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleAction = (text: string, field: 'email' | 'phone') => {
    handleContactAction(field, text, () => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center space-y-2 pt-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {user.name}
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Contact Information</p>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                value={user.email} 
                readOnly 
                className="pl-9 pr-12 bg-slate-50 dark:bg-slate-800"
              />
              <button 
                onClick={() => handleAction(user.email, 'email')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors"
                title="Copy Email"
              >
                {copiedField === 'email' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                value={user.phone} 
                readOnly 
                className="pl-9 pr-12 bg-slate-50 dark:bg-slate-800"
              />
              <button 
                onClick={() => handleAction(user.phone, 'phone')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors"
                title="Copy Phone"
              >
                {copiedField === 'phone' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
