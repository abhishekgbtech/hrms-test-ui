
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Label } from "../components/ui/Label";
import { Button } from "../components/ui/Button";
import { X, Send, Eye, Sliders, Search, UploadCloud, Paperclip, MessageSquare, MoreHorizontal, Plus } from "../components/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { cn } from "../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/Dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { getUserFullName, getUserAvatarUrl } from "../lib/userUtils";

// Mock Data for Tickets
const initialTickets = [
    {
        id: "tick_138",
        emailId: "Bharat mishra",
        subject: "Login failure on mobile app",
        date: "2025 Oct 07",
        status: "Accepted",
        handledBy: "Admin",
        priority: "High",
        department: "IT Support",
        hasNewChat: false
    },
    {
        id: "tick_766",
        emailId: "Bharat mishra",
        subject: "Request for new monitor",
        date: "2025 Oct 07",
        status: "Pending",
        handledBy: "IT Hardware",
        priority: "Low",
        department: "Logistics",
        hasNewChat: true
    }
];

// Mock Chat Data
type ChatMessage = {
    id: string;
    sender: string;
    role: 'user' | 'support' | 'system';
    message: string;
    timestamp: string;
    avatar?: string;
};

const mockChatHistory: Record<string, ChatMessage[]> = {
    "tick_138": [
        { id: '1', sender: 'System', role: 'system', message: 'Ticket created successfully. Reference ID: tick_138', timestamp: '10:00 AM' },
        { id: '2', sender: 'Support Team', role: 'support', message: 'Hello Bharat, we are looking into the login issue. Is this happening on iOS or Android?', timestamp: '10:15 AM' },
        { id: '3', sender: 'Bharat mishra', role: 'user', message: 'It is happening on Android version 14.', timestamp: '10:20 AM' },
        { id: '4', sender: 'Support Team', role: 'support', message: 'Thanks for the info. We have escalated this to the mobile dev team.', timestamp: '10:25 AM' },
    ],
    "tick_766": [
        { id: '1', sender: 'System', role: 'system', message: 'Ticket created successfully. Reference ID: tick_766', timestamp: '09:00 AM' },
        { id: '2', sender: 'IT Hardware', role: 'support', message: 'Hi, could you specify the size of the monitor you need?', timestamp: '11:30 AM' },
    ]
};

const TicketGeneration: React.FC = () => {
    const { profile } = useAuth();
    const currentUserName = getUserFullName(profile);
    const currentUserAvatar = getUserAvatarUrl(profile);

    // Form State
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [fileName, setFileName] = useState("No file chosen");

    // Table State
    const [tickets, setTickets] = useState(initialTickets);
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState("10");

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // Chat State
    const [selectedTicket, setSelectedTicket] = useState<typeof initialTickets[0] | null>(null);
    const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName("No file chosen");
        }
    };

    const handleClear = () => {
        setSubject("");
        setDescription("");
        setFileName("No file chosen");
    }

    const handleSubmit = () => {
        if (!subject.trim()) {
            alert("Please enter a subject");
            return;
        }

        const newTicketId = `tick_${Math.floor(100 + Math.random() * 900)}`;
        const newTicket = {
            id: newTicketId,
            emailId: currentUserName,
            subject: subject,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(',', ''),
            status: "Pending",
            handledBy: "Pending",
            priority: "Low",
            department: "General",
            hasNewChat: false
        };

        // Initialize empty chat for new ticket
        mockChatHistory[newTicketId] = [
            { id: Date.now().toString(), sender: 'System', role: 'system', message: `Ticket created successfully. Reference ID: ${newTicketId}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ];

        setTickets([newTicket, ...tickets]);
        handleClear();
        setIsCreateOpen(false);
    }

    // Chat Handlers
    const handleOpenChat = (ticket: typeof initialTickets[0]) => {
        setSelectedTicket(ticket);
        setActiveMessages(mockChatHistory[ticket.id] || []);
        setIsChatOpen(true);
        // Mark as read logic could go here
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedTicket) return;

        const msg: ChatMessage = {
            id: Date.now().toString(),
            sender: currentUserName,
            role: 'user',
            message: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: currentUserAvatar
        };

        const updatedMessages = [...activeMessages, msg];
        setActiveMessages(updatedMessages);
        
        // Update mock store
        mockChatHistory[selectedTicket.id] = updatedMessages;
        
        setNewMessage("");
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeMessages, isChatOpen]);


    // Filtering logic
    const filteredTickets = tickets.filter(ticket => 
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-8 pb-12">
            
            {/* Ticket List Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                 {/* Header Controls */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Welcome, <span className="text-cyan-600 dark:text-cyan-400">{currentUserName}</span>
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage your support requests.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                         <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Status Filter</span>
                            <Sliders size={16} className="text-slate-500"/>
                        </div>
                        <Button 
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20"
                        >
                            <Plus size={16} className="mr-2" />
                            Create Ticket
                        </Button>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Show</span>
                        <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                            <SelectTrigger className="w-[70px] h-9 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-slate-600 dark:text-slate-400">entries</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="pl-2">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search tickets..."
                            className="h-8 w-full sm:w-[200px] border-none bg-transparent focus:ring-0 placeholder:text-slate-400"
                        />
                    </div>
                 </div>

                 {/* Table */}
                 <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/80">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Ticket Id</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Email Id</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Subject</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Date</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Status</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Handled By</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Priority</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider py-4">Department</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider text-center py-4">Chat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="text-slate-700 dark:text-slate-300 font-semibold text-sm">{ticket.id}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400">{ticket.emailId}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 font-medium">{ticket.subject}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">{ticket.date}</TableCell>
                                        <TableCell>
                                            <Badge className={`border-none font-medium rounded-full px-2.5 py-0.5 text-xs ${ticket.status === 'Accepted' || ticket.status === 'Solved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{ticket.handledBy}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${ticket.priority === 'Low' ? 'bg-emerald-500' : ticket.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{ticket.priority}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{ticket.department || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenChat(ticket)}
                                                    className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-500 dark:hover:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                    aria-label="Open chat"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {ticket.hasNewChat && (
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p>No tickets found matching your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </div>

                 {/* Pagination Footer */}
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div>
                        Showing <span className="font-medium text-slate-900 dark:text-slate-200">1</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{filteredTickets.length}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{filteredTickets.length}</span> entries
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">Previous</button>
                        <button className="w-8 h-8 flex items-center justify-center bg-cyan-600 text-white rounded-md text-xs font-bold shadow-sm shadow-cyan-500/30">1</button>
                        <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">Next</button>
                    </div>
                 </div>
            </div>

            {/* Create Ticket Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
                    <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Create Ticket</DialogTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Raise a new support request</p>
                    </DialogHeader>
                    
                    <div className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="subject" className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold ml-1">Subject</Label>
                            <Input 
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Brief summary of the issue"
                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-500 rounded-lg h-10 transition-shadow focus:ring-4 focus:ring-cyan-500/10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold ml-1">Description</Label>
                            <Textarea 
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your issue in detail..."
                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-500 rounded-lg min-h-[120px] resize-none transition-shadow focus:ring-4 focus:ring-cyan-500/10"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <Label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold ml-1 mb-2 block">Attachment</Label>
                            <div className="relative group">
                                <label className={cn(
                                    "flex items-center justify-center gap-4 w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
                                    "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30",
                                    "hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10"
                                )}>
                                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200">
                                        {fileName !== "No file chosen" ? <Paperclip className="text-cyan-500" size={20} /> : <UploadCloud className="text-slate-400 dark:text-slate-500 group-hover:text-cyan-500" size={20} />}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className={cn("text-sm font-medium transition-colors", fileName !== "No file chosen" ? "text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400")}>
                                            {fileName !== "No file chosen" ? fileName : "Click to upload file"}
                                        </span>
                                        {fileName === "No file chosen" && <span className="text-xs text-slate-400 dark:text-slate-500">SVG, PNG, JPG or PDF (max. 10MB)</span>}
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                         <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                         <Button 
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20"
                        >
                            <Send size={16} className="mr-2" /> Submit Ticket
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

             {/* Chat Modal */}
             <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent className="sm:max-w-md h-[80vh] sm:h-[650px] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate max-w-[200px]">{selectedTicket?.subject}</h3>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="font-mono text-slate-500 dark:text-slate-400">{selectedTicket?.id}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                    <span className={cn(
                                        "font-medium",
                                        selectedTicket?.status === 'Accepted' || selectedTicket?.status === 'Solved' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                    )}>{selectedTicket?.status}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <MoreHorizontal size={18} />
                        </Button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/20">
                        {activeMessages.map((msg, idx) => {
                            const isMe = msg.role === 'user';
                            const isSystem = msg.role === 'system';
                            
                            if (isSystem) {
                                return (
                                    <div key={idx} className="flex justify-center my-4">
                                        <span className="text-[10px] uppercase tracking-wide font-medium text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                                            {msg.message}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn("flex max-w-[85%] sm:max-w-[75%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                        <Avatar className="h-8 w-8 shrink-0 mt-1 border-2 border-white dark:border-slate-900 shadow-sm">
                                            {msg.avatar ? (
                                                <AvatarImage src={msg.avatar} />
                                            ) : (
                                                <AvatarFallback className={cn("text-xs text-white", isMe ? "bg-cyan-600" : "bg-indigo-500")}>
                                                    {msg.sender[0]}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className={cn("text-xs font-medium", isMe ? "text-slate-600 dark:text-slate-300 ml-auto" : "text-slate-600 dark:text-slate-300")}>
                                                    {msg.sender}
                                                </span>
                                                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                                            </div>
                                            <div className={cn(
                                                "p-3 text-sm shadow-sm",
                                                isMe 
                                                    ? "bg-cyan-600 text-white rounded-2xl rounded-tr-none" 
                                                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700"
                                            )}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex gap-2">
                             <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <Paperclip size={18} />
                            </Button>
                            <Input 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-cyan-500/20"
                            />
                            <Button 
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-500/20"
                            >
                                <Send size={16} />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
             </Dialog>
        </div>
    );
};

export default TicketGeneration;
