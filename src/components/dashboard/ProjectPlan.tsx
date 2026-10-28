
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
} from "../icons";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { Variants } from "framer-motion";

// Type definitions
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tools?: string[]; // Optional array of MCP server tools
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}

interface ProjectPlanProps {
  tasks?: Task[];
}

const ProjectPlan: React.FC<ProjectPlanProps> = ({ tasks: propTasks }) => {
  // Use propTasks if available, defaulting to empty array to avoid undefined errors.
  const [tasks, setTasks] = useState<Task[]>(propTasks || []);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});

  // Update local state when props change
  useEffect(() => {
    if (propTasks) {
        setTasks(propTasks);
        // Auto-expand first task if present
        if(propTasks.length > 0) {
            setExpandedTasks([propTasks[0].id]);
        }
    }
  }, [propTasks]);
  
  // Add support for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Toggle subtask expansion
  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle task status
  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          // Toggle the status
          const statuses = ["completed", "in-progress", "pending", "need-help", "failed"];
          // Simple rotation for demo
          const currentIdx = statuses.indexOf(task.status);
          const newStatus = statuses[(currentIdx + 1) % statuses.length];

          // If task is now completed, mark all subtasks as completed
          const updatedSubtasks = task.subtasks.map((subtask) => ({
            ...subtask,
            status: newStatus === "completed" ? "completed" : subtask.status,
          }));

          return {
            ...task,
            status: newStatus,
            subtasks: updatedSubtasks,
          };
        }
        return task;
      }),
    );
  };

  // Toggle subtask status
  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              const newStatus =
                subtask.status === "completed" ? "pending" : "completed";
              return { ...subtask, status: newStatus };
            }
            return subtask;
          });

          // Calculate if task should be auto-completed when all subtasks are done
          const allSubtasksCompleted = updatedSubtasks.every(
            (s) => s.status === "completed",
          );

          return {
            ...task,
            subtasks: updatedSubtasks,
            status: allSubtasksCompleted ? "completed" : task.status,
          };
        }
        return task;
      }),
    );
  };

    const taskVariants: Variants = {
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -5 },
        visible: {
            opacity: 1, y: 0, transition: prefersReducedMotion
                ? { type: "tween", duration: 0.2 }
                : { type: "spring", stiffness: 500, damping: 30 }
        },
        exit: { opacity: 0, y: prefersReducedMotion ? 0 : -5, transition: { duration: 0.15 } }
    };
    const subtaskListVariants: Variants = {
        hidden: { opacity: 0, height: 0, overflow: "hidden" },
        visible: { height: "auto", opacity: 1, overflow: "visible", transition: { duration: 0.25, staggerChildren: prefersReducedMotion ? 0 : 0.05, when: "beforeChildren", ease: [0.2, 0.65, 0.3, 0.9] as const } },
        exit: { height: 0, opacity: 0, overflow: "hidden", transition: { duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] as const } }
    };
    const subtaskVariants: Variants = {
        hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
        visible: {
            opacity: 1, x: 0, transition: prefersReducedMotion
                ? { type: "tween", duration: 0.2 }
                : { type: "spring", stiffness: 500, damping: 25 }
        },
        exit: { opacity: 0, x: prefersReducedMotion ? 0 : -10, transition: { duration: 0.15 } }
    };
    const subtaskDetailsVariants: Variants = {
        hidden: { opacity: 0, height: 0, overflow: "hidden" },
        visible: { opacity: 1, height: "auto", overflow: "visible", transition: { duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] as const } }
    };
    const statusBadgeVariants: Variants = {
        initial: { scale: 1 },
        animate: { scale: prefersReducedMotion ? 1 : [1, 1.08, 1], transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] as const } }
    };

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 h-full overflow-auto p-2">
      <motion.div 
        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg border shadow-inner overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] } }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            <ul className="space-y-1 overflow-hidden">
              {tasks.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No tasks in plan.</p>
              ) : tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";

                return (
                  <motion.li key={task.id} className={` ${index !== 0 ? "mt-1 pt-2" : ""} `} initial="hidden" animate="visible" variants={taskVariants}>
                    <motion.div className="group flex items-center px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50" >
                      <motion.div className="mr-2 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
                        <AnimatePresence mode="wait">
                          <motion.div key={task.status} initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8, rotate: 10 }} transition={{ duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}>
                            {task.status === "completed" ? ( <CheckCircle2 className="h-4 w-4 text-emerald-500" /> ) : task.status === "in-progress" ? ( <CircleDotDashed className="h-4 w-4 text-cyan-500" /> ) : task.status === "need-help" ? ( <CircleAlert className="h-4 w-4 text-amber-500" /> ) : task.status === "failed" ? ( <CircleX className="h-4 w-4 text-red-500" /> ) : ( <Circle className="text-slate-400 dark:text-slate-500 h-4 w-4" /> )}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      <motion.div className="flex min-w-0 flex-grow cursor-pointer items-center justify-between" onClick={() => toggleTaskExpansion(task.id)}>
                        <div className="mr-2 flex-1 truncate">
                          <span className={`${isCompleted ? "text-slate-400 dark:text-slate-500 line-through" : ""}`}>
                            {task.title}
                          </span>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                           <motion.span className={`rounded px-1.5 py-0.5 text-xs capitalize ${ task.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : task.status === "in-progress" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300" : task.status === "need-help" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" : task.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400" }`} variants={statusBadgeVariants} initial="initial" animate="animate" key={task.status}>
                            {task.status.replace('-', ' ')}
                          </motion.span>
                        </div>
                      </motion.div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div className="relative overflow-hidden" variants={subtaskListVariants} initial="hidden" animate="visible" exit="hidden" layout>
                          <div className="absolute top-0 bottom-0 left-[18px] border-l-2 border-dashed border-slate-200 dark:border-slate-700" />
                          <ul className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];
                              return (
                                <motion.li key={subtask.id} className="group flex flex-col py-0.5 pl-6" onClick={() => toggleSubtaskExpansion(task.id, subtask.id)} variants={subtaskVariants} initial="hidden" animate="visible" exit="exit" layout >
                                  <motion.div className="flex flex-1 items-center rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50" layout>
                                    <motion.div className="mr-2 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSubtaskStatus(task.id, subtask.id); }} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} layout >
                                      <AnimatePresence mode="wait">
                                        <motion.div key={subtask.status} initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8, rotate: 10 }} transition={{ duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }} >
                                          {subtask.status === "completed" ? ( <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> ) : subtask.status === "in-progress" ? ( <CircleDotDashed className="h-3.5 w-3.5 text-cyan-500" /> ) : subtask.status === "need-help" ? ( <CircleAlert className="h-3.5 w-3.5 text-amber-500" /> ) : subtask.status === "failed" ? ( <CircleX className="h-3.5 w-3.5 text-red-500" /> ) : ( <Circle className="text-slate-400 dark:text-slate-500 h-3.5 w-3.5" /> )}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>
                                    <span className={`cursor-pointer text-sm ${subtask.status === "completed" ? "text-slate-400 dark:text-slate-500 line-through" : ""}`} > {subtask.title} </span>
                                  </motion.div>
                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div className="text-slate-500 dark:text-slate-400 mt-1 ml-1.5 border-l border-dashed border-slate-200 dark:border-slate-700 pl-5 text-xs overflow-hidden" variants={subtaskDetailsVariants} initial="hidden" animate="visible" exit="hidden" layout >
                                        <p className="py-1">{subtask.description}</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}

export default ProjectPlan;
