
"use client";

import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Calendar, CheckCircle2, AlertTriangle, Sparkles, Loader2 } from "../icons";
import { tasks, calendarEvents, notifications, user } from "../../data/mockData";
import { format } from "date-fns";

interface AiBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiBriefingModal: React.FC<AiBriefingModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !briefing) {
      generateBriefing();
    }
  }, [isOpen]);

  const generateBriefing = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare context data
      const today = new Date();
      const pendingTasks = tasks.filter(t => t.status !== 'completed').map(t => 
        `- ${t.title} (Priority: ${t.priority}, Due: ${format(t.dueDate, 'MMM dd')})`
      ).join('\n');
      
      const todaysEvents = calendarEvents.filter(e => e.date === format(today, 'yyyy-MM-dd')).map(e => 
        `- ${e.title} at ${e.time}`
      ).join('\n');

      const unreadNotifs = notifications.filter(n => !n.read).map(n => 
        `- From ${n.sender.name}: ${n.message}`
      ).join('\n');

      const prompt = `
        You are an elite Executive Assistant for ${user.name}. 
        Current Date: ${format(today, 'PPPP')}.
        
        Data:
        TASKS:
        ${pendingTasks || "No pending tasks."}
        
        EVENTS TODAY:
        ${todaysEvents || "No events scheduled today."}
        
        NOTIFICATIONS:
        ${unreadNotifs || "No new notifications."}

        Please generate a concise, professional, and motivating "Daily Briefing" in Markdown format. 
        Structure it with:
        1. A warm, brief greeting.
        2. "Top Priorities" (Identify 1-2 most critical items based on 'High' priority or deadlines).
        3. "Agenda Snapshot" (Brief mention of meetings).
        4. "Action Required" (Mention unread messages if important).
        5. A short motivating closing sentence.
        
        Keep it under 200 words. Use formatting like bolding for emphasis.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setBriefing(response.text || '');
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the AI service. Please try again later.");
      // Fallback for demo purposes if API fails or key is missing
      setBriefing(`**Good morning, ${user.name.split(' ')[0]}!**\n\nI couldn't reach the AI brain right now, but here is a quick look:\n\nYou have **${tasks.filter(t => t.status !== 'completed').length} active tasks** and **${calendarEvents.filter(e => e.date === format(new Date(), 'yyyy-MM-dd')).length} meetings** today.\n\nHave a productive day!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <Sparkles className="text-purple-500" size={24} />
            AI Daily Briefing
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 px-2 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400 relative z-10" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                Analyzing schedule and priorities...
              </p>
            </div>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                   {/* We render simple markdown-like formatting by splitting newlines for this prototype */}
                   {briefing.split('\n').map((line, i) => {
                       if (line.startsWith('**') || line.startsWith('#')) {
                           return <p key={i} className="font-bold text-slate-800 dark:text-slate-100 mb-2 mt-4" dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/#/g, '')}} />
                       }
                       if (line.startsWith('-')) {
                           return <li key={i} className="ml-4 text-slate-600 dark:text-slate-300 mb-1" dangerouslySetInnerHTML={{__html: line.replace('-', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
                       }
                       return <p key={i} className="text-slate-600 dark:text-slate-300 mb-2 leading-relaxed" dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
                   })}
                </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={generateBriefing} disabled={loading}>
             Regenerate
          </Button>
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
