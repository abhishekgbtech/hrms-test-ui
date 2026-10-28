
"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from '../lib/utils';
import { FileText, Folder as FolderIcon, FolderOpen as FolderOpenIcon, Search, FileSpreadsheet, ImageIcon, Video, Headphones, FileArchive } from '../components/icons';
import { consultingFolderStructure } from '../data/mockData';
import type { FolderNode, FileMetadata } from '../data/mockData';
import FileUpload, { FileWithPreview } from '../components/folders/FileUpload';
import { Input } from "../components/ui/Input";

// --- HELPER FUNCTIONS ---
const findNodeById = (nodes: FolderNode[], id: string): FolderNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

const findFirstNode = (nodes: FolderNode[]): FolderNode | null => {
    if (nodes.length > 0) return nodes[0];
    return null;
}

const updateNodeInTree = (nodes: FolderNode[], id: string, updates: Partial<FolderNode>): FolderNode[] => {
    return nodes.map(node => {
        if (node.id === id) {
            return { ...node, ...updates };
        }
        if (node.children) {
            return { ...node, children: updateNodeInTree(node.children, id, updates) };
        }
        return node;
    });
};

const getAllFolderIds = (nodes: FolderNode[]): string[] => {
    const ids: string[] = [];
    const traverse = (items: FolderNode[]) => {
        items.forEach(item => {
            if (item.children) {
                ids.push(item.id);
                traverse(item.children);
            }
        });
    };
    traverse(nodes);
    return ids;
};

// Search Helper: Returns flattened list of all files with their location
type SearchResult = {
    file: FileMetadata;
    folderId: string;
    folderName: string;
    path: string[];
}

const flattenFiles = (nodes: FolderNode[], path: string[] = []): SearchResult[] => {
    let results: SearchResult[] = [];
    nodes.forEach(node => {
        const currentPath = [...path, node.name];
        if (node.files) {
            node.files.forEach(file => {
                results.push({
                    file,
                    folderId: node.id,
                    folderName: node.name,
                    path: currentPath
                });
            });
        }
        if (node.children) {
            results = [...results, ...flattenFiles(node.children, currentPath)];
        }
    });
    return results;
};

const getPathToNode = (nodes: FolderNode[], targetId: string, currentPath: string[] = []): string[] | null => {
    for (const node of nodes) {
        if (node.id === targetId) return [...currentPath, node.id];
        if (node.children) {
            const path = getPathToNode(node.children, targetId, [...currentPath, node.id]);
            if (path) return path;
        }
    }
    return null;
}

const getFileIcon = (name: string, type: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    
    if (type.includes('image') || ['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) return <ImageIcon className="h-4 w-4 text-purple-500" />;
    if (type.includes('pdf') || ext === 'pdf') return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes('sheet') || type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    if (type.includes('video') || ['mp4', 'mov'].includes(ext || '')) return <Video className="h-4 w-4 text-pink-500" />;
    if (type.includes('audio') || ['mp3', 'wav'].includes(ext || '')) return <Headphones className="h-4 w-4 text-yellow-500" />;
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="h-4 w-4 text-orange-500" />;
    
    return <FileText className="h-4 w-4 text-slate-500" />;
}

// --- TREE VIEW COMPONENTS ---
interface TreeItemProps {
    node: FolderNode;
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
    expandedIds: string[];
    onToggleExpand: (id: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, selectedNodeId, onSelectNode, expandedIds, onToggleExpand }) => {
    const isExpanded = expandedIds.includes(node.id);
    const isSelected = selectedNodeId === node.id;

    if (node.children) { // It's a Folder with sub-items
        return (
            <div>
                <div
                    className={cn(
                        "flex items-center gap-1.5 rounded-md text-sm px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors",
                        isSelected && "bg-slate-100 dark:bg-slate-800/50 text-cyan-700 dark:text-cyan-400"
                    )}
                    onClick={() => { onSelectNode(node.id); onToggleExpand(node.id); }}
                >
                    {isExpanded ? <FolderOpenIcon className={cn("h-4 w-4", isSelected ? "text-cyan-500" : "text-cyan-600")} /> : <FolderIcon className={cn("h-4 w-4", isSelected ? "text-cyan-500" : "text-slate-500")} />}
                    <span className="font-medium truncate">{node.name}</span>
                </div>
                {isExpanded && (
                    <div className="pl-3.5 relative">
                        <div className="absolute left-[13px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="space-y-0.5 pt-1">
                            {node.children.map(child => (
                                <TreeItem 
                                    key={child.id} 
                                    node={child}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={onSelectNode}
                                    expandedIds={expandedIds}
                                    onToggleExpand={onToggleExpand}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // It's a File/Note (leaf node) in the tree
    return (
         <button
            className={cn(
                "flex w-full text-left items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
                isSelected ? "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            )}
            onClick={() => onSelectNode(node.id)}
        >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{node.name}</span>
        </button>
    );
};


// --- TAGGING GUIDE COMPONENT ---
const TaggingGuide: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm h-full">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3">Tagging System Guide</h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4">
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Note Format</h4>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-xs whitespace-pre-wrap">
                        [Date] [Type] - [Topic] - [Context]
                    </pre>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Status Tags</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li><code className="text-xs">#draft</code> - Work in progress</li>
                        <li><code className="text-xs">#final</code> - Completed</li>
                        <li><code className="text-xs">#active</code> - Ongoing</li>
                        <li><code className="text-xs">#archived</code> - Reference only</li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Content Tags</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li><code className="text-xs">#meeting-notes</code></li>
                        <li><code className="text-xs">#strategy</code></li>
                        <li><code className="text-xs">#financials</code></li>
                        <li><code className="text-xs">#metrics</code></li>
                        <li><code className="text-xs">#insights</code></li>
                        <li><code className="text-xs">#decisions</code></li>
                        <li><code className="text-xs">#action-items</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all",
            active 
                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
        )}
    >
        {children}
    </button>
);


// --- MAIN FOLDERS COMPONENT ---
export default function Folders() {
    const [folderStructure, setFolderStructure] = useState(consultingFolderStructure);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'note' | 'files'>('note');
    
    // Global Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Local Tree Search State
    const [treeSearchQuery, setTreeSearchQuery] = useState("");

    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        return findNodeById(folderStructure, selectedNodeId);
    }, [selectedNodeId, folderStructure]);
    
    const allFiles = useMemo(() => flattenFiles(folderStructure), [folderStructure]);
    
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return allFiles.filter(item => 
            item.file.name.toLowerCase().includes(q) || 
            item.file.type.toLowerCase().includes(q)
        );
    }, [searchQuery, allFiles]);

    // Filter the folder structure based on the tree search query
    const filteredFolderStructure = useMemo(() => {
        if (!treeSearchQuery.trim()) return folderStructure;

        const q = treeSearchQuery.toLowerCase();
        const filterNodes = (nodes: FolderNode[]): FolderNode[] => {
            return nodes.reduce((acc: FolderNode[], node) => {
                // Check if current node matches
                const matches = node.name.toLowerCase().includes(q);
                // Check children
                const filteredChildren = node.children ? filterNodes(node.children) : [];
                
                // Keep node if it matches OR if it has matching children
                if (matches || filteredChildren.length > 0) {
                    acc.push({
                        ...node,
                        children: filteredChildren.length > 0 ? filteredChildren : node.children
                    });
                }
                return acc;
            }, []);
        };

        return filterNodes(folderStructure);
    }, [folderStructure, treeSearchQuery]);

    // Auto-expand tree when searching
    useEffect(() => {
        if (treeSearchQuery.trim()) {
            const ids = getAllFolderIds(filteredFolderStructure);
            setExpandedIds(ids);
        }
    }, [treeSearchQuery, filteredFolderStructure]);

    useEffect(() => {
        const firstNode = findFirstNode(consultingFolderStructure);
        if (firstNode) {
            setSelectedNodeId(firstNode.id);
        }
        setExpandedIds(getAllFolderIds(consultingFolderStructure));
    }, []);
    
    const handleToggleExpand = (id: string) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectNode = (id: string) => {
        setSelectedNodeId(id);
    }

    const handleFilesChange = useCallback((updatedFiles: FileWithPreview[]) => {
        if (!selectedNodeId) return;

        const newFileMetadata: FileMetadata[] = updatedFiles.map(f => ({
            id: f.id,
            name: (f.file as File).name,
            size: (f.file as File).size,
            type: (f.file as File).type,
            url: f.preview || ''
        }));
        
        setFolderStructure(prev => updateNodeInTree(prev, selectedNodeId, { files: newFileMetadata }));
    }, [selectedNodeId]);

    const handleSearchResultClick = (result: SearchResult) => {
        // 1. Expand tree to this folder
        const pathIds = getPathToNode(folderStructure, result.folderId);
        if (pathIds) {
            setExpandedIds(prev => [...new Set([...prev, ...pathIds])]);
        }
        
        // 2. Select the folder
        setSelectedNodeId(result.folderId);
        
        // 3. Switch to Files tab
        setActiveTab('files');
        
        // 4. Reset search to close dropdown/view
        setSearchQuery("");
        setIsSearching(false);
    };

    return (
        <div className="space-y-6 min-h-[calc(100vh-100px)] flex flex-col">
            {/* Header with Global Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Project Files & Notes</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage documents, meeting notes, and resources.</p>
                </div>
                <div className="relative w-full sm:w-96 z-20">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input 
                            placeholder="Search for files across all folders..." 
                            className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-cyan-500 w-full"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsSearching(!!e.target.value);
                            }}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => { setSearchQuery(""); setIsSearching(false); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="sr-only">Clear</span>
                                &times;
                            </button>
                        )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {isSearching && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[400px] overflow-y-auto">
                            {searchResults.length > 0 ? (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Found {searchResults.length} files
                                    </div>
                                    {searchResults.map((result, idx) => (
                                        <div 
                                            key={`${result.file.id}-${idx}`}
                                            onClick={() => handleSearchResultClick(result)}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer group transition-colors"
                                        >
                                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                                {getFileIcon(result.file.name, result.file.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate">
                                                    {result.file.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                                    <FolderIcon className="h-3 w-3" />
                                                    {result.path.join(' / ')}
                                                </p>
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                {(result.file.size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p>No files found matching "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Panel: Tree View */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm overflow-y-auto max-h-[calc(100vh-200px)] flex flex-col">
                     {/* Local Folder Filter */}
                     <div className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-700/50">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                            <input 
                                type="text" 
                                placeholder="Filter folders..."
                                value={treeSearchQuery}
                                onChange={(e) => setTreeSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                            />
                        </div>
                     </div>

                     <div className="space-y-0.5 flex-1">
                        {filteredFolderStructure.length > 0 ? (
                            filteredFolderStructure.map(node => (
                                <TreeItem 
                                    key={node.id} 
                                    node={node}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={handleSelectNode}
                                    expandedIds={expandedIds}
                                    onToggleExpand={handleToggleExpand}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No folders match your filter.
                            </div>
                        )}
                     </div>
                </div>

                {/* Right Panel: Content */}
                <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                    <div className="xl:col-span-2 bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                        {selectedNode ? (
                            <>
                                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                            {selectedNode.children ? <FolderOpenIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" /> : <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedNode.name}</h2>
                                            {selectedNode.children && <p className="text-xs text-slate-500 dark:text-slate-400">{selectedNode.files?.length || 0} files inside</p>}
                                        </div>
                                    </div>
                                </div>
                                 <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg self-start mb-4 flex gap-1">
                                    <TabButton active={activeTab === 'note'} onClick={() => setActiveTab('note')}>Note</TabButton>
                                    <TabButton active={activeTab === 'files'} onClick={() => setActiveTab('files')}>Files ({selectedNode.files?.length || 0})</TabButton>
                                </div>
                                <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                                   {activeTab === 'note' && (
                                        <div className="prose dark:prose-invert max-w-none">
                                            {selectedNode.content ? (
                                                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    {selectedNode.content}
                                                </pre>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                                    <FileText className="h-12 w-12 mb-2 opacity-20" />
                                                    <p>No notes available for this item.</p>
                                                    <button className="mt-4 text-sm text-cyan-600 hover:underline">Create a note</button>
                                                </div>
                                            )}
                                        </div>
                                   )}
                                   {activeTab === 'files' && (
                                        <FileUpload 
                                            initialFiles={selectedNode.files || []}
                                            onFilesChange={handleFilesChange}
                                        />
                                   )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                               <FolderIcon className="h-16 w-16 mb-4 text-slate-200 dark:text-slate-700" />
                               <p className="text-lg font-medium">No Folder Selected</p>
                               <p className="text-sm opacity-70">Select an item from the tree view to manage contents.</p>
                            </div>
                        )}
                    </div>
                    <div className="xl:col-span-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <TaggingGuide />
                    </div>
                </div>
            </div>
        </div>
    );
}
