
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { MapPin, Clock, Calendar, AlignLeft, Check, Mail, Phone } from "../icons";
import { CompanyEvent } from "../../data/mockData";
import { format } from "date-fns";
import { Badge } from "../ui/Badge";
import { handleContactAction } from "../../lib/utils";

interface EventDetailsModalProps {
    event: CompanyEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, isOpen, onClose }) => {
    const [isRsvp, setIsRsvp] = useState(false);
    const [copiedState, setCopiedState] = useState<'email' | 'phone' | null>(null);

    if (!event) return null;

    const handleRsvp = () => {
        setIsRsvp(!isRsvp);
    }

    const onContactClick = (type: 'email' | 'phone', value: string) => {
        handleContactAction(type, value, () => {
            setCopiedState(type);
            setTimeout(() => setCopiedState(null), 2000);
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-row items-start justify-between">
                    <div className="pr-8">
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1">{event.title}</DialogTitle>
                        <Badge variant="secondary" className="capitalize font-normal text-slate-600 bg-slate-200/60 dark:bg-slate-800 dark:text-slate-300">{event.type.replace('_', ' ')}</Badge>
                    </div>
                </DialogHeader>
                
                <div className="p-6 space-y-6">
                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider gap-1.5">
                                <Calendar size={14} /> Date
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{format(event.date, 'PPPP')}</p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider gap-1.5">
                                <Clock size={14} /> Time
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{event.time || 'All Day'}</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider gap-1.5">
                            <MapPin size={14} /> Location
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{event.location || 'No location specified'}</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider gap-1.5">
                            <AlignLeft size={14} /> Description
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border border-slate-100 dark:border-slate-800/50">
                            {event.description || "No description available for this event."}
                        </p>
                    </div>

                    {/* Celebrant Info (Birthday Only) */}
                    {event.user && (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-transparent dark:from-pink-900/10 border-l-4 border-pink-300 dark:border-pink-700 rounded-r-lg">
                            <div className="flex items-center gap-3">
                                <img src={event.user.avatarUrl} alt={event.user.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                                <div>
                                    <p className="text-xs text-pink-600 dark:text-pink-400 font-bold uppercase tracking-wide">Celebrant</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{event.user.name}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {event.user?.email && (
                                    <button
                                        onClick={() => onContactClick('email', event.user?.email || '')}
                                        className="p-2 bg-white dark:bg-slate-800 text-pink-500 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors shadow-sm border border-pink-100 dark:border-pink-900/30 relative group"
                                        title="Copy Email"
                                    >
                                        {copiedState === 'email' ? <Check size={16} /> : <Mail size={16} />}
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block z-50 shadow-lg">
                                            {copiedState === 'email' ? 'Copied!' : event.user.email}
                                        </span>
                                    </button>
                                )}
                                {event.user?.phone && (
                                    <button
                                        onClick={() => onContactClick('phone', event.user?.phone || '')}
                                        className="p-2 bg-white dark:bg-slate-800 text-pink-500 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors shadow-sm border border-pink-100 dark:border-pink-900/30 relative group"
                                        title="Copy Phone"
                                    >
                                        {copiedState === 'phone' ? <Check size={16} /> : <Phone size={16} />}
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block z-50 shadow-lg">
                                            {copiedState === 'phone' ? 'Copied!' : event.user.phone}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button 
                        onClick={handleRsvp} 
                        className={isRsvp ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-cyan-600 hover:bg-cyan-700 text-white"}
                        disabled={event.type === 'holiday'}
                    >
                        {isRsvp ? (
                            <>
                                <Check size={16} className="mr-2" /> Joined
                            </>
                        ) : (
                            event.type === 'holiday' ? "Holiday" : "RSVP"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
