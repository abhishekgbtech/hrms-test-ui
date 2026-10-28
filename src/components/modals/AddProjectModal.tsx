
"use client";

import React, { useState, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { team, Note } from '../../data/mockData';
import { Plus, Trash2, UploadCloud, X, Users, CornerDownRight, AlignLeft, Flag, Calendar, FileText } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFullName, getUserAvatarUrl } from '../../lib/userUtils';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: any) => void;
  // Notes integration
  notes?: Note[]; 
  onAddNote?: (note: Note) => void;
}

// Helper to build available users list
const buildAvailableUsers = (currentUserName: string, currentUserAvatar: string, designation: string) => [
    { name: currentUserName, role: designation, avatar: currentUserAvatar },
    ...[...team].sort((a, b) => a.name.localeCompare(b.name)).map(t => ({ name: t.name, role: t.role, avatar: t.avatarUrl }))
];

interface SubTaskData {
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date | undefined;
}

interface TaskData {
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date | undefined;
    subtasks: SubTaskData[];
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAddProject, notes = [], onAddNote }) => {
    const { profile } = useAuth();
    const currentUserName = getUserFullName(profile);
    const currentUserAvatar = getUserAvatarUrl(profile);
    const availableUsers = buildAvailableUsers(currentUserName, currentUserAvatar, profile?.designation || 'Employee');

    // Form State
    const [company, setCompany] = useState('');
    const [client, setClient] = useState('');
    const [projectName, setProjectName] = useState('');
    const [pm, setPm] = useState('');
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [contributors, setContributors] = useState<ReturnType<typeof buildAvailableUsers>>([]);
    const [comment, setComment] = useState('');
    
    // Notes State
    const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");

    // Task State
    const [tasks, setTasks] = useState<TaskData[]>([
        { id: `t-${Date.now()}`, title: '', description: '', assignee: '', priority: 'medium', dueDate: undefined, subtasks: [] }
    ]);

    // Attachment State
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---

    const handleAddContributor = (userName: string) => {
        const userToAdd = availableUsers.find(u => u.name === userName);
        if (userToAdd && !contributors.find(c => c.name === userName)) {
            setContributors([...contributors, userToAdd]);
        }
    };

    const handleRemoveContributor = (userName: string) => {
        setContributors(contributors.filter(c => c.name !== userName));
    };

    // Notes Handlers
    const handleAddExistingNote = (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        if (note && !selectedNotes.find(sn => sn.id === noteId)) {
            setSelectedNotes([...selectedNotes, note]);
        }
    };

    const handleCreateProjectNote = () => {
        if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
        
        const newNote: Note = {
            id: `proj-note-${Date.now()}`,
            title: newNoteTitle,
            content: newNoteContent,
            date: new Date(),
            tags: ['project-note']
        };

        if (onAddNote) {
            onAddNote(newNote);
        }
        
        setSelectedNotes([...selectedNotes, newNote]);
        setIsCreatingNote(false);
        setNewNoteTitle("");
        setNewNoteContent("");
    };

    const handleRemoveSelectedNote = (noteId: string) => {
        setSelectedNotes(selectedNotes.filter(n => n.id !== noteId));
    };

    // Task Management Handlers
    const handleAddTask = () => {
        setTasks([...tasks, { id: `t-${Date.now()}`, title: '', description: '', assignee: '', priority: 'medium', dueDate: undefined, subtasks: [] }]);
    };

    const handleRemoveTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleUpdateTask = (taskId: string, field: keyof TaskData, value: any) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
    };

    // Subtask Management Handlers
    const handleAddSubtask = (taskId: string) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    subtasks: [...t.subtasks, { id: `st-${Date.now()}-${Math.random()}`, title: '', description: '', assignee: '', priority: 'medium', dueDate: undefined }]
                };
            }
            return t;
        }));
    };

    const handleRemoveSubtask = (taskId: string, subtaskId: string) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    subtasks: t.subtasks.filter(st => st.id !== subtaskId)
                };
            }
            return t;
        }));
    };

    const handleUpdateSubtask = (taskId: string, subtaskId: string, field: keyof SubTaskData, value: any) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, [field]: value } : st)
                };
            }
            return t;
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!projectName || !company || !deadline || !pm) {
            alert("Please fill in the required fields: Project Name, Company, PM, and Deadline.");
            return;
        }

        const projectData = {
            company,
            client,
            projectName,
            pm,
            deadline,
            contributors,
            tasks: tasks.filter(t => t.title.trim() !== ''),
            attachments: files,
            notes: selectedNotes, // Include notes in project data
            comment
        };

        onAddProject(projectData);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setCompany('');
        setClient('');
        setProjectName('');
        setPm('');
        setDeadline(undefined);
        setContributors([]);
        setComment('');
        setTasks([{ id: `t-${Date.now()}`, title: '', description: '', assignee: '', priority: 'medium', dueDate: undefined, subtasks: [] }]);
        setFiles([]);
        setSelectedNotes([]);
        setIsCreatingNote(false);
    };

    // User Select Component
    const UserSelect = ({ value, onChange, placeholder = "Unassigned" }: { value: string, onChange: (val: string) => void, placeholder?: string }) => (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full h-9 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="unassigned" className="text-slate-400 font-medium">Unassigned</SelectItem>
                {availableUsers.map(u => (
                    <SelectItem key={u.name} value={u.name}>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback>{u.name[0]}</AvatarFallback>
                            </Avatar>
                            {u.name}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    const PrioritySelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-xs">
                <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
            </SelectContent>
        </Select>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                    <DialogTitle className="text-xl">Create New Project</DialogTitle>
                </DialogHeader>
                
                <div className="p-6 grid gap-8">
                    
                    {/* Section 1: Core Details */}
                    <div className="grid gap-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            1. Project Identification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company / Entity <span className="text-red-500">*</span></Label>
                                <Input id="company" placeholder="e.g. ECOVIS RKCA" value={company} onChange={e => setCompany(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client">Client Name</Label>
                                <Input id="client" placeholder="e.g. Acme Corp" value={client} onChange={e => setClient(e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="projectName">Project Name <span className="text-red-500">*</span></Label>
                                <Input id="projectName" placeholder="e.g. Q4 Financial Audit Automation" value={projectName} onChange={e => setProjectName(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Section 2: Management & Team */}
                    <div className="grid gap-4">
                         <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            2. Team & Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Project Manager (PM) <span className="text-red-500">*</span></Label>
                                <Select onValueChange={setPm} value={pm}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select PM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map(u => (
                                            <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline <span className="text-red-500">*</span></Label>
                                <DatePicker date={deadline} setDate={setDeadline} />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                                <Label>Contributors</Label>
                                <div className="flex items-center gap-2 mb-2">
                                    <Select onValueChange={handleAddContributor}>
                                        <SelectTrigger className="w-[200px] h-8 text-xs">
                                            <Users size={14} className="mr-2" />
                                            <SelectValue placeholder="Add member..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUsers.map(u => (
                                                <SelectItem key={u.name} value={u.name} disabled={contributors.some(c => c.name === u.name)}>
                                                    {u.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-xs text-slate-400">Add people to assign tasks later</span>
                                </div>
                                <div className="flex flex-wrap gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-md min-h-[60px] bg-slate-50/50 dark:bg-slate-800/20">
                                    {contributors.length === 0 && <span className="text-sm text-slate-400 italic self-center">No contributors added yet.</span>}
                                    {contributors.map(user => (
                                        <Badge key={user.name} className="pl-1 pr-2 py-1 h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {user.name}
                                            <button onClick={() => handleRemoveContributor(user.name)} className="ml-1 hover:text-red-500"><X size={12}/></button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Section 3: Tasks Breakdown */}
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">3. Tasks Breakdown</h3>
                            <Button size="sm" variant="secondary" onClick={handleAddTask}>
                                <Plus size={14} className="mr-1"/> Add Main Task
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {tasks.map((task, taskIndex) => (
                                <div key={task.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Task Title</Label>
                                                <Input 
                                                    placeholder="Main Task Title"
                                                    value={task.title}
                                                    onChange={(e) => handleUpdateTask(task.id, 'title', e.target.value)}
                                                    className="bg-white dark:bg-slate-900 font-semibold"
                                                />
                                            </div>
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                onClick={() => handleRemoveTask(task.id)} 
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-6"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1"><AlignLeft size={12}/> Description</Label>
                                            <Textarea
                                                placeholder="Describe the task..."
                                                value={task.description}
                                                onChange={(e) => handleUpdateTask(task.id, 'description', e.target.value)}
                                                className="bg-white dark:bg-slate-900 min-h-[60px] text-sm resize-y"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1"><Users size={12}/> Assignee</Label>
                                                <UserSelect 
                                                    value={task.assignee} 
                                                    onChange={(val) => handleUpdateTask(task.id, 'assignee', val)} 
                                                    placeholder="Assign Task" 
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1"><Flag size={12}/> Priority</Label>
                                                <PrioritySelect 
                                                    value={task.priority}
                                                    onChange={(val) => handleUpdateTask(task.id, 'priority', val)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1"><Calendar size={12}/> Due Date</Label>
                                                <DatePicker 
                                                    date={task.dueDate} 
                                                    setDate={(date) => handleUpdateTask(task.id, 'dueDate', date)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2 pt-2">
                                        {task.subtasks.map((subtask) => (
                                            <div key={subtask.id} className="p-3 rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3 relative group">
                                                <div className="absolute -left-[22px] top-4 text-slate-300 dark:text-slate-600">
                                                    <CornerDownRight size={16} />
                                                </div>
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1">
                                                        <Input 
                                                            placeholder="Subtask Title" 
                                                            value={subtask.title} 
                                                            onChange={(e) => handleUpdateSubtask(task.id, subtask.id, 'title', e.target.value)}
                                                            className="h-8 text-sm font-medium"
                                                        />
                                                    </div>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveSubtask(task.id, subtask.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                                <Textarea 
                                                    placeholder="Subtask description..."
                                                    value={subtask.description}
                                                    onChange={(e) => handleUpdateSubtask(task.id, subtask.id, 'description', e.target.value)}
                                                    className="min-h-[40px] text-xs resize-y"
                                                />
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    <UserSelect 
                                                        value={subtask.assignee} 
                                                        onChange={(val) => handleUpdateSubtask(task.id, subtask.id, 'assignee', val)} 
                                                        placeholder="Assign Subtask" 
                                                    />
                                                    <PrioritySelect 
                                                        value={subtask.priority}
                                                        onChange={(val) => handleUpdateSubtask(task.id, subtask.id, 'priority', val)}
                                                    />
                                                    <DatePicker 
                                                        date={subtask.dueDate} 
                                                        setDate={(date) => handleUpdateSubtask(task.id, subtask.id, 'dueDate', date)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" onClick={() => handleAddSubtask(task.id)} className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 h-7 text-xs ml-6">
                                            <Plus size={14} className="mr-1.5" /> Add Subtask
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Section 4: Project Notes & Attachments */}
                    <div className="grid gap-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">4. Attachments & Notes</h3>
                        
                        {/* Project Notes Section (New) */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-3">
                                <Label className="flex items-center gap-2"><FileText size={14} className="text-indigo-500" /> Project Notes</Label>
                                {!isCreatingNote && (
                                    <div className="flex gap-2">
                                        <Select onValueChange={handleAddExistingNote}>
                                            <SelectTrigger className="h-8 text-xs w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Add existing note..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {notes.map(note => (
                                                    <SelectItem key={note.id} value={note.id} disabled={selectedNotes.some(sn => sn.id === note.id)}>
                                                        {note.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button size="sm" variant="ghost" onClick={() => setIsCreatingNote(true)} className="h-8 text-xs">
                                            <Plus size={12} className="mr-1" /> Create
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Create New Note Inline Form */}
                            {isCreatingNote && (
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-md border border-indigo-100 dark:border-indigo-900/30 mb-3 space-y-2">
                                    <Input 
                                        placeholder="Note Title" 
                                        value={newNoteTitle} 
                                        onChange={e => setNewNoteTitle(e.target.value)} 
                                        className="h-8 text-sm"
                                    />
                                    <Textarea 
                                        placeholder="Note content..." 
                                        value={newNoteContent} 
                                        onChange={e => setNewNoteContent(e.target.value)}
                                        className="min-h-[60px] text-xs resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setIsCreatingNote(false)}>Cancel</Button>
                                        <Button size="sm" onClick={handleCreateProjectNote} className="bg-indigo-600 hover:bg-indigo-700 text-white">Add Note</Button>
                                    </div>
                                </div>
                            )}

                            {/* Selected Notes List */}
                            <div className="flex flex-wrap gap-2">
                                {selectedNotes.length === 0 && !isCreatingNote && <span className="text-xs text-slate-400 italic">No notes attached.</span>}
                                {selectedNotes.map(note => (
                                    <div key={note.id} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm text-sm">
                                        <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-200">{note.title}</span>
                                        <button onClick={() => handleRemoveSelectedNote(note.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <input 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <UploadCloud size={24} />
                                    <span className="text-sm">Click to upload project files</span>
                                </div>
                            </div>
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="p-1 bg-white dark:bg-slate-700 rounded"><UploadCloud size={12} className="text-cyan-500"/></div>
                                                <span className="truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                            <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Textarea 
                                placeholder="Additional objectives, constraints, or starting comments..." 
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-10">
                    <Button variant="secondary" onClick={onClose} className="mr-2">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[120px]">
                        Create Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
