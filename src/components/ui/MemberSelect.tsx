
"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./Popover";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { team } from "../../data/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { getUserFullName, getUserAvatarUrl } from "../../lib/userUtils";

interface MemberSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  exclude?: string[]; // Names to exclude from the list
  className?: string;
}

export function MemberSelect({ value, onChange, placeholder = "Select member...", exclude = [], className }: MemberSelectProps) {
  const { profile } = useAuth();
  const currentUserName = getUserFullName(profile);
  const currentUserAvatar = getUserAvatarUrl(profile);

  // Combine current user and team for the full directory
  const allMembers = [
    { name: currentUserName, role: profile?.designation || 'Employee', avatarUrl: currentUserAvatar, email: profile?.email || '' },
    ...team
  ];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) || 
                          member.role?.toLowerCase().includes(search.toLowerCase());
    const isExcluded = exclude.includes(member.name);
    return matchesSearch && !isExcluded;
  });

  const selectedMember = allMembers.find((member) => member.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between px-3 font-normal", !value && "text-slate-500", className)}
        >
          {selectedMember ? (
            <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-5 w-5">
                    <AvatarImage src={selectedMember.avatarUrl} />
                    <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{selectedMember.name}</span>
            </div>
          ) : (
            placeholder
          )}
          {/* Using a custom icon or standard chevron */}
          <span className="ml-2 h-4 w-4 shrink-0 opacity-50 text-xs">▼</span> 
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" align="start">
        <div className="flex flex-col max-h-[300px]">
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-3 py-2 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <input
                    className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400"
                    placeholder="Search team..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="overflow-y-auto p-1 space-y-0.5">
                {filteredMembers.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500">No member found.</div>
                ) : (
                    filteredMembers.map((member) => (
                        <div
                            key={member.name}
                            className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                                value === member.name && "bg-slate-100 dark:bg-slate-800"
                            )}
                            onClick={() => {
                                onChange(member.name);
                                setOpen(false);
                                setSearch("");
                            }}
                        >
                            <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={member.avatarUrl} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start leading-none">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{member.name}</span>
                                <span className="text-[10px] text-slate-500">{member.role || 'Member'}</span>
                            </div>
                            {value === member.name && (
                                <span className="ml-auto flex h-4 w-4 items-center justify-center">
                                    <Check className="h-4 w-4 text-cyan-600" />
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
