
import React, { useState } from "react";
import { Calendar, Plus, Gift, FileText, Sparkles } from '../icons';
import { Button } from '../ui/Button';
import type { Page } from '../../App';
import { companyEvents, CompanyEvent, Note, SavedPrompt } from '../../data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { format, isToday } from 'date-fns';
import { cn } from '../../lib/utils';
import { EventDetailsModal } from "../modals/EventDetailsModal";
import { NotesModal } from "../modals/NotesModal";
import { PromptsModal } from "../modals/PromptsModal";

interface QuickActionsProps {
  setCurrentPage: (page: Page) => void;
  notes?: Note[];
  prompts?: SavedPrompt[];
  onAddNote?: (note: Note) => void;
  onAddPrompt?: (prompt: SavedPrompt) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
    setCurrentPage, 
    notes = [], 
    prompts = [], 
    onAddNote = () => {}, 
    onAddPrompt = () => {} 
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CompanyEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);

  // Filter events
  const todayEvents = companyEvents.filter(event => isToday(event.date));
  const upcomingEvents = companyEvents
    .filter(event => !isToday(event.date) && event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const handleEventClick = (event: CompanyEvent) => {
      setSelectedEvent(event);
      setIsEventModalOpen(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
        
        {/* Quick Actions Header & Buttons */}
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full justify-start h-10" onClick={() => setCurrentPage('Work Schedule')}>
                  <Calendar size={16} className="mr-2 text-cyan-600 dark:text-cyan-400" /> Calendar
              </Button>
              <Button variant="secondary" className="w-full justify-start h-10" onClick={() => setCurrentPage('Ticket Generation')}>
                  <Plus size={16} className="mr-2 text-cyan-600 dark:text-cyan-400" /> Ticket
              </Button>
              <Button variant="secondary" className="w-full justify-start h-10" onClick={() => setIsNotesModalOpen(true)}>
                  <FileText size={16} className="mr-2 text-indigo-600 dark:text-indigo-400" /> Notes
              </Button>
              <Button variant="secondary" className="w-full justify-start h-10" onClick={() => setIsPromptsModalOpen(true)}>
                  <Sparkles size={16} className="mr-2 text-purple-600 dark:text-purple-400" /> Prompts
              </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700/50"></div>

        {/* Events Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
               <h3 className="font-semibold text-slate-800 dark:text-slate-100">Events</h3>
               <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                  {todayEvents.length + upcomingEvents.length} Upcoming
               </span>
          </div>

          {/* Today's Special Events */}
          <div className="space-y-3 mb-4">
              {todayEvents.length > 0 ? todayEvents.map(event => (
                  <div 
                    key={event.id} 
                    onClick={() => handleEventClick(event)}
                    className={cn(
                      "p-3 rounded-lg border relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
                      event.type === 'birthday' 
                          ? "bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-100 dark:border-pink-900/30 hover:border-pink-200 dark:hover:border-pink-800" 
                          : "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-900/30 hover:border-cyan-200 dark:hover:border-cyan-800"
                  )}>
                      <div className="flex items-start gap-3 relative z-10">
                           {event.type === 'birthday' && event.user ? (
                               <div className="relative">
                                  <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                      <AvatarImage src={event.user.avatarUrl} />
                                      <AvatarFallback>{event.user.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm">
                                      <Gift size={12} className="text-pink-500" />
                                  </div>
                               </div>
                           ) : (
                               <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                  <Calendar size={18} className="text-cyan-600 dark:text-cyan-400" />
                               </div>
                           )}
                           
                           <div className="flex-1">
                               <p className={cn("text-sm font-bold", event.type === 'birthday' ? "text-pink-900 dark:text-pink-100" : "text-slate-800 dark:text-slate-100")}>
                                   {event.title}
                               </p>
                               <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{event.description}</p>
                           </div>
                      </div>
                  </div>
              )) : (
                   <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-2">No events happening today.</p>
              )}
          </div>

          {/* Upcoming List */}
          {upcomingEvents.length > 0 && (
              <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Coming Up</h4>
                  {upcomingEvents.map(event => (
                      <div 
                        key={event.id} 
                        onClick={() => handleEventClick(event)}
                        className="flex items-center gap-3 group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                          <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg text-center min-w-[3.5rem] border border-slate-200 dark:border-slate-700 group-hover:border-cyan-200 dark:group-hover:border-slate-600 transition-colors">
                              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{format(event.date, 'MMM')}</span>
                              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">{format(event.date, 'dd')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                  {event.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5">
                                  <span className={cn("w-1.5 h-1.5 rounded-full", 
                                      event.type === 'holiday' ? "bg-emerald-400" :
                                      event.type === 'birthday' ? "bg-pink-400" : "bg-blue-400"
                                  )}></span>
                                  {event.type.replace('_', ' ')}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </div>

      <EventDetailsModal 
        event={selectedEvent} 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
      />

      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={notes}
        onAddNote={onAddNote}
      />

      <PromptsModal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
        prompts={prompts}
        onAddPrompt={onAddPrompt}
      />
    </>
  );
};

export default QuickActions;
