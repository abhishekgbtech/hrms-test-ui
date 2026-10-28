
"use client";

import React, { useState, useRef, useMemo } from "react";
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { DatePicker } from '../components/ui/DatePicker';
import { team, user as currentUser, Note } from '../data/mockData';
import { Plus, Trash2, UploadCloud, X, FileText, Users, ChevronLeft, Save, CornerDownRight, AlignLeft, Flag, Calendar } from '../components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import type { Page } from '../App';

interface AddProjectProps {
    setCurrentPage: (page: Page) => void;
    onAddProject?: (projectData: any) => void;
    notes?: Note[];
    onAddNote?: (note: Note) => void;
}

// Mock data for available Project Managers and Contributors
const availableUsers = [
    { name: currentUser.name, role: currentUser.designation, avatar: currentUser.avatarUrl },
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

const AddProject: React.FC<AddProjectProps> = ({ setCurrentPage, onAddProject, notes = [], onAddNote }) => {
    // Form State
    const [company, setCompany] = useState('');
    const [client, setClient] = useState('');
    const [projectName, setProjectName] = useState('');
    const [pm, setPm] = useState('');
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [contributors, setContributors] = useState<typeof availableUsers>([]);
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
        // Validation
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
            notes: selectedNotes,
            comment
        };

        if (onAddProject) {
            onAddProject(projectData);
        } else {
            console.log("Submitting Project (Mock):", projectData);
            setCurrentPage('Projects');
        }
    };

    // Helper for Assignee Dropdown
    const AssigneeSelect = ({ value, onChange, placeholder = "Unassigned" }: { value: string, onChange: (val: string) => void, placeholder?: string }) => (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-xs">
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
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentPage('Projects')}>
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create New Project</h1>
                        <p className="text-slate-500 dark:text-slate-400">Define the scope, team, and milestones for your new initiative.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setCurrentPage('Projects')}>Cancel</Button>
                    <Button onClick={handleSubmit}>
                        <Save size={16} className="mr-2" /> Create Project
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>Core information about the project entity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company / Entity <span className="text-red-500">*</span></Label>
                                    <Input id="company" placeholder="e.g. ECOVIS RKCA" value={company} onChange={e => setCompany(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client">Client Name</Label>
                                    <Input id="client" placeholder="e.g. Acme Corp" value={client} onChange={e => setClient(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="projectName">Project Name <span className="text-red-500">*</span></Label>
                                <Input id="projectName" placeholder="e.g. Q4 Financial Audit Automation" value={projectName} onChange={e => setProjectName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="comment">Objectives / Initial Notes</Label>
                                <Textarea 
                                    id="comment" 
                                    placeholder="Add any starting notes, objectives, or constraints..." 
                                    className="min-h-[100px]"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Task Breakdown</CardTitle>
                                    <CardDescription>Define tasks, subtasks and assign members.</CardDescription>
                                </div>
                                <Button size="sm" variant="secondary" onClick={handleAddTask}>
                                    <Plus size={14} className="mr-1"/> Add Task
                                </Button>
                             </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {tasks.map((task, index) => (
                                <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                                    
                                    {/* Main Task Rows */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <Label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Task Title</Label>
                                                <Input 
                                                    placeholder="e.g. Initial Research" 
                                                    value={task.title} 
                                                    onChange={(e) => handleUpdateTask(task.id, 'title', e.target.value)}
                                                    className="bg-white dark:bg-slate-900 font-semibold"
                                                />
                                            </div>
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-6"
                                                onClick={() => handleRemoveTask(task.id)}
                                                disabled={tasks.length === 1}
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
                                                <AssigneeSelect 
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

                                    {/* Subtasks Section */}
                                    <div className="pl-4 ml-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-4 pt-2">
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
                                                    <AssigneeSelect 
                                                        value={subtask.assignee}
                                                        onChange={(val) => handleUpdateSubtask(task.id, subtask.id, 'assignee', val)}
                                                        placeholder="Assignee"
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
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleAddSubtask(task.id)} 
                                            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 h-7 text-xs"
                                        >
                                            <Plus size={14} className="mr-1.5" /> Add Subtask
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Team & Meta */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team & Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                            
                             <div className="space-y-2">
                                <Label>Contributors</Label>
                                <Select onValueChange={handleAddContributor}>
                                    <SelectTrigger>
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

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {contributors.length === 0 && <p className="text-xs text-slate-400 italic">No additional contributors.</p>}
                                    {contributors.map(user => (
                                        <Badge key={user.name} className="pl-1 pr-2 py-1 h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 gap-2">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {user.name}
                                            <button onClick={() => handleRemoveContributor(user.name)} className="ml-1 hover:text-red-500"><X size={12}/></button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Attachments & Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Project Notes Integration */}
                            <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <Label className="text-xs uppercase tracking-wider text-slate-500">Project Notes</Label>
                                {!isCreatingNote ? (
                                    <div className="flex gap-2 mb-2">
                                        <Select onValueChange={handleAddExistingNote}>
                                            <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-800">
                                                <SelectValue placeholder="Select existing note" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {notes.map(note => (
                                                    <SelectItem key={note.id} value={note.id} disabled={selectedNotes.some(sn => sn.id === note.id)}>
                                                        {note.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button size="sm" variant="ghost" onClick={() => setIsCreatingNote(true)} className="h-8 w-8 px-0 border border-slate-200 dark:border-slate-700"><Plus size={14}/></Button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-indigo-100 dark:border-indigo-900/30 space-y-2 mb-2">
                                        <Input placeholder="Title" value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} className="h-7 text-xs bg-white dark:bg-slate-900"/>
                                        <Textarea placeholder="Content" value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} className="min-h-[50px] text-xs bg-white dark:bg-slate-900"/>
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => setIsCreatingNote(false)} className="h-6 text-[10px]">Cancel</Button>
                                            <Button size="sm" onClick={handleCreateProjectNote} className="h-6 text-[10px] bg-indigo-600 text-white hover:bg-indigo-700">Add</Button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex flex-col gap-1">
                                    {selectedNotes.map(note => (
                                        <div key={note.id} className="flex items-center justify-between px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                                            <span className="text-xs truncate max-w-[180px]">{note.title}</span>
                                            <button onClick={() => handleRemoveSelectedNote(note.id)} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

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
                                    <span className="text-sm">Upload files</span>
                                </div>
                            </div>
                            {files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText size={14} className="text-cyan-500"/>
                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                            </div>
                                            <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AddProject;
