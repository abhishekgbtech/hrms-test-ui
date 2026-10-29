import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  CheckSquare,
  Plus,
  Send,
  Building2,
  Briefcase,
  Layers,
  ChevronDown,
  RotateCcw,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  ServiceTaskInstance,
  TaskStatus,
  serviceManagementStore,
  ServiceTimesheetEntry
} from '../../services/serviceManagementData';
import { employeesData } from '../../data/employeesData';

interface TaskDetailDrawerProps {
  task: ServiceTaskInstance | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentActor: { id: string; name: string; entity: string };
  onTaskUpdated?: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
  currentActor,
  onTaskUpdated
}) => {
  const [title, setTitle] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [logHours, setLogHours] = useState('2.0');
  const [logNotes, setLogNotes] = useState('');
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<ServiceTaskInstance | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.taskTitle);
      setNewSubtaskTitle('');
      setNewComment('');
      setIsLogTimeOpen(false);
      setShowUndoToast(false);
    }
  }, [task?.id]);

  // Handle Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  // Flash saved notification
  const triggerSaved = () => {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
    onTaskUpdated?.();
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.taskTitle) {
      setUndoSnapshot({ ...task });
      setShowUndoToast(true);
      serviceManagementStore.updateTaskInstance(task.id, { taskTitle: title.trim() }, currentActor);
      triggerSaved();
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    setUndoSnapshot({ ...task });
    setShowUndoToast(true);
    serviceManagementStore.changeTaskStatus(task.id, newStatus, currentActor);
    triggerSaved();
  };

  const handleToggleSubtask = (subtaskId: string, currentDone: boolean) => {
    setUndoSnapshot({ ...task });
    setShowUndoToast(true);
    serviceManagementStore.updateSubtask(task.id, subtaskId, !currentDone, currentActor);
    triggerSaved();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    serviceManagementStore.addSubtask(task.id, newSubtaskTitle.trim(), task.assignedTo, currentActor);
    setNewSubtaskTitle('');
    triggerSaved();
  };

  const handleReassign = (newAssignee: string) => {
    if (newAssignee === task.assignedTo) return;
    setUndoSnapshot({ ...task });
    setShowUndoToast(true);
    serviceManagementStore.reassignTask(task.id, newAssignee, currentActor);
    triggerSaved();
  };

  const handleDueDateChange = (newDateStr: string) => {
    if (!newDateStr) return;
    setUndoSnapshot({ ...task });
    setShowUndoToast(true);
    serviceManagementStore.updateTaskInstance(task.id, { dueDate: `${newDateStr}T18:00:00.000Z` }, currentActor);
    triggerSaved();
  };

  const handleToggleComplete = () => {
    setUndoSnapshot({ ...task });
    setShowUndoToast(true);
    const targetStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    serviceManagementStore.changeTaskStatus(task.id, targetStatus, currentActor);
    triggerSaved();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const commentHistory = {
      id: `comm-${Date.now()}`,
      user: currentActor.name,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      action: 'commented' as const,
      details: newComment.trim(),
      timestamp: new Date()
    };
    serviceManagementStore.updateTaskInstance(
      task.id,
      { history: [commentHistory, ...(task.history || [])] },
      currentActor
    );
    setNewComment('');
    triggerSaved();
  };

  const handleLogTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = parseFloat(logHours) || 0;
    if (hrs <= 0) return;

    serviceManagementStore.logTimesheet(
      {
        engagementId: task.engagementId,
        clientId: task.clientId,
        clientName: task.clientName,
        serviceId: task.serviceId,
        serviceTitle: task.serviceTitle,
        taskInstanceId: task.id,
        taskTitle: task.taskTitle,
        userId: currentActor.id,
        userName: currentActor.name,
        userLegalEntityId: task.assignedLegalEntityId,
        userLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
        isCrossEntityCollaboration: task.isCrossEntity,
        date: new Date().toISOString().split('T')[0],
        hours: hrs,
        isBillable: true,
        hourlyRate: 3000,
        description: logNotes.trim() || `Worked on ${task.taskTitle}`
      },
      currentActor
    );

    setIsLogTimeOpen(false);
    setLogNotes('');
    setLogHours('2.0');
    triggerSaved();
  };

  const handleUndo = () => {
    if (undoSnapshot) {
      serviceManagementStore.updateTaskInstance(
        task.id,
        {
          taskTitle: undoSnapshot.taskTitle,
          status: undoSnapshot.status,
          assignedTo: undoSnapshot.assignedTo,
          dueDate: undoSnapshot.dueDate,
          subtasks: undoSnapshot.subtasks,
          progress: undoSnapshot.progress
        },
        currentActor
      );
      setShowUndoToast(false);
      setUndoSnapshot(null);
      triggerSaved();
    }
  };

  const formattedDueDate = task.dueDate ? task.dueDate.split('T')[0] : '';
  const isDone = task.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Window */}
      <div
        ref={drawerRef}
        className="relative z-50 w-full max-w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-200 ease-out"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          {/* Navigation Prev/Next Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={onNavigatePrev}
              title="Previous task"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                hasPrev
                  ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={onNavigateNext}
              title="Next task"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                hasNext
                  ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight size={16} />
            </button>

            {/* Saved Indicator */}
            {savedIndicator && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 ml-2 animate-fade-in">
                <Check size={13} /> Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              {task.periodKey}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Editable Title */}
          <div>
            <textarea
              rows={2}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Task Title..."
              className="w-full bg-transparent text-base font-semibold text-white placeholder-slate-500 resize-none border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors p-1"
            />
          </div>

          {/* Status Segmented Control */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
              {(['pending', 'in-progress', 'review', 'completed'] as TaskStatus[]).map(st => {
                const active = task.status === st;
                const labels: Record<TaskStatus, string> = {
                  'pending': 'Pending',
                  'in-progress': 'In Progress',
                  'review': 'In Review',
                  'completed': 'Done',
                  'blocked': 'Blocked'
                };
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 rounded-md font-medium transition-all text-center ${
                      active
                        ? st === 'completed'
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : st === 'in-progress'
                          ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                          : st === 'review'
                          ? 'bg-purple-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-700 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {labels[st]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            {/* Assignee */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Assignee</span>
              <div className="relative">
                <select
                  value={task.assignedTo}
                  onChange={e => handleReassign(e.target.value)}
                  className="w-full appearance-none bg-slate-900 border border-slate-700/80 rounded-md py-1 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                >
                  <option value="Unassigned">Unassigned</option>
                  {employeesData.slice(0, 13).map(emp => (
                    <option key={emp.employee_id} value={emp.full_name}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Due Date</span>
              <input
                type="date"
                value={formattedDueDate}
                onChange={e => handleDueDateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-md py-1 px-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
              />
            </div>

            {/* Service */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Service</span>
              <div className="font-medium text-slate-200 truncate" title={task.serviceTitle}>
                {task.serviceTitle}
              </div>
            </div>

            {/* Party */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Client / Entity</span>
              <div className="font-medium text-slate-200 truncate" title={task.clientName}>
                {task.clientName}
              </div>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Subtasks checklist ({task.subtasks?.filter(st => st.done || st.status === 'completed').length || 0} / {task.subtasks?.length || 0})
              </label>
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="text-[11px] text-cyan-400 font-medium">
                  {task.progress}% done
                </span>
              )}
            </div>

            {/* Subtasks items */}
            <div className="space-y-1.5 mb-2.5">
              {task.subtasks && task.subtasks.length > 0 ? (
                task.subtasks.map(st => {
                  const done = st.done || st.status === 'completed';
                  return (
                    <div
                      key={st.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors ${
                        done
                          ? 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                          : 'bg-slate-950/80 border-slate-800 text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => handleToggleSubtask(st.id, done)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs flex-1 ${done ? 'line-through' : ''}`}>
                        {st.title}
                      </span>
                      {st.assignee && (
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {st.assignee.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic py-1">No subtasks defined yet.</p>
              )}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-1.5">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Add a subtask and press Enter..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium"
              >
                Add
              </button>
            </form>
          </div>

          {/* Hours Section (Log Time flow) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Clock size={14} className="text-cyan-400" />
                Hours Logged
              </div>
              <button
                type="button"
                onClick={() => setIsLogTimeOpen(!isLogTimeOpen)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                {isLogTimeOpen ? 'Cancel' : '+ Log Hours'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Actual: <strong className="text-white">{task.actualHours || 0}h</strong></span>
              <span className="text-slate-400">Budgeted: <strong className="text-slate-300">{task.estimatedHours || 0}h</strong></span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((task.actualHours || 0) / (task.estimatedHours || 1)) * 100))}%`
                }}
              />
            </div>

            {/* Inline Log Time Form */}
            {isLogTimeOpen && (
              <form onSubmit={handleLogTimeSubmit} className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
                <div className="flex gap-2">
                  <div className="w-24">
                    <label className="text-[10px] text-slate-500 block mb-0.5">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={logHours}
                      onChange={e => setLogHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block mb-0.5">Work Description</label>
                    <input
                      type="text"
                      value={logNotes}
                      onChange={e => setLogNotes(e.target.value)}
                      placeholder="Summary of work performed..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium cursor-pointer"
                  >
                    Submit Timesheet
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Activity Feed & Comment Box */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Activity & Comments
            </label>

            {/* Post comment */}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Leave an internal note..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Send size={12} /> Post
              </button>
            </form>

            {/* Timeline */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {task.history && task.history.length > 0 ? (
                task.history.map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-cyan-400 font-semibold shrink-0 mt-0.5">
                      {h.user?.slice(0, 1) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-950/50 rounded-lg p-2 border border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="font-semibold text-slate-300">{h.user}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{h.details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No recent activity.</p>
              )}
            </div>
          </div>

          {/* Collapsed Technical Details Accordion */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>Technical Details</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showTechDetails ? 'rotate-180' : ''}`}
              />
            </button>
            {showTechDetails && (
              <div className="p-3.5 bg-slate-950/95 space-y-2 text-[11px] font-mono text-slate-400 border-t border-slate-800">
                <div>
                  <span className="text-slate-600 block">Idempotency Key:</span>
                  <span className="text-cyan-400 select-all">{task.idempotencyKey}</span>
                </div>
                <div>
                  <span className="text-slate-600 block">Cross-Entity Collaboration:</span>
                  <span className={task.isCrossEntity ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                    {task.isCrossEntity ? 'Yes (Inter-entity resource)' : 'No (Local Entity)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block">Servicing Legal Entity ID:</span>
                  <span className="text-slate-300">{task.assignedLegalEntityId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Undo Toast Notification */}
        {showUndoToast && (
          <div className="absolute bottom-16 left-4 right-4 bg-slate-800 text-white border border-slate-700 px-3.5 py-2 rounded-lg shadow-xl flex items-center justify-between text-xs z-30">
            <span>Change applied</span>
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <RotateCcw size={12} /> Undo
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleToggleComplete}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer ${
              isDone
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <CheckCircle2 size={14} />
            {isDone ? 'Reopen Task' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};
