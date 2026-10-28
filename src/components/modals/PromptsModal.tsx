
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Label } from "../ui/Label";
import { SavedPrompt } from "../../data/mockData";
import { Sparkles, Plus, Copy, Check, Search } from "../icons";
import { Badge } from "../ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";

interface PromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: SavedPrompt[];
  onAddPrompt: (prompt: SavedPrompt) => void;
}

export const PromptsModal: React.FC<PromptsModalProps> = ({ isOpen, onClose, prompts, onAddPrompt }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    
    const newPrompt: SavedPrompt = {
      id: `prompt-${Date.now()}`,
      title,
      content,
      category: category as any
    };

    onAddPrompt(newPrompt);
    setView('list');
    setTitle("");
    setContent("");
    setCategory("General");
  };

  const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[550px] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row justify-between items-center">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <Sparkles className="text-purple-500" size={20} />
            {view === 'create' ? 'Create Prompt' : 'Saved Prompts'}
          </DialogTitle>
          {view === 'list' && (
             <Button size="sm" onClick={() => setView('create')} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus size={16} className="mr-1.5" /> New Prompt
             </Button>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-black/10">
            {view === 'list' ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input 
                            placeholder="Search prompts..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>
                    
                    <div className="space-y-3">
                        {filteredPrompts.length > 0 ? filteredPrompts.map(prompt => (
                            <div key={prompt.id} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-purple-200 dark:hover:border-purple-800 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{prompt.title}</h3>
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-slate-200 dark:border-slate-700 text-slate-500">{prompt.category}</Badge>
                                    </div>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-7 w-7 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                        onClick={() => handleCopy(prompt.content, prompt.id)}
                                        title="Copy to clipboard"
                                    >
                                        {copiedId === prompt.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </Button>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-mono leading-relaxed border border-slate-100 dark:border-slate-800">
                                    {prompt.content}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400">
                                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>No prompts found.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input 
                            placeholder="Prompt Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="Coding">Coding</SelectItem>
                                <SelectItem value="Creative">Creative</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea 
                            placeholder="Enter prompt text..." 
                            className="min-h-[150px] font-mono text-sm"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>

        <DialogFooter className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          {view === 'create' ? (
              <div className="flex justify-end gap-2 w-full">
                  <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
                  <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">Save Prompt</Button>
              </div>
          ) : (
              <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto ml-auto">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
