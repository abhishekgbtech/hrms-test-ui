
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Label } from "../ui/Label";
import { Note } from "../../data/mockData";
import { FileText, Plus, Search, Tag, X } from "../icons";
import { format } from "date-fns";
import { Badge } from "../ui/Badge";

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onAddNote: (note: Note) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, notes, onAddNote }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      content,
      date: new Date(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    onAddNote(newNote);
    setView('list');
    setTitle("");
    setContent("");
    setTags("");
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row justify-between items-center">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <FileText className="text-cyan-600 dark:text-cyan-400" size={20} />
            {view === 'create' ? 'Create Note' : 'My Notes'}
          </DialogTitle>
          {view === 'list' && (
             <Button size="sm" onClick={() => setView('create')} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus size={16} className="mr-1.5" /> New Note
             </Button>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-black/10">
            {view === 'list' ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input 
                            placeholder="Search notes..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredNotes.length > 0 ? filteredNotes.map(note => (
                            <div key={note.id} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1" title={note.title}>{note.title}</h3>
                                    <span className="text-[10px] text-slate-400 shrink-0">{format(note.date, 'MMM dd')}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                                    {note.content}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {note.tags?.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">#{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center py-10 text-slate-400">
                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>No notes found.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input 
                            placeholder="Note Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea 
                            placeholder="Write something..." 
                            className="min-h-[150px] resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tags (comma separated)</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input 
                                placeholder="work, ideas, todo" 
                                className="pl-9"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          {view === 'create' ? (
              <div className="flex justify-end gap-2 w-full">
                  <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
                  <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white">Save Note</Button>
              </div>
          ) : (
              <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto ml-auto">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
