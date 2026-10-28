
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from './Sidebar';
import Header from './Header';
import type { Page, Theme, PrimaryColor } from '../../App';
import { AddTaskModal } from '../modals/AddTaskModal';
import FloatingNav from '../ui/FloatingNav';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
  // New props for task management
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (open: boolean) => void;
  onAddTask: (task: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, 
    currentPage, 
    setCurrentPage, 
    theme, 
    setTheme,
    primaryColor,
    setPrimaryColor,
    isAddTaskOpen,
    setIsAddTaskOpen,
    onAddTask
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPage]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header 
            setSidebarOpen={setSidebarOpen} 
            theme={theme} 
            setTheme={setTheme} 
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
        />
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <FloatingNav onAddClick={() => setIsAddTaskOpen(true)} />

      <AddTaskModal 
          isOpen={isAddTaskOpen} 
          onClose={() => setIsAddTaskOpen(false)} 
          onAddTask={onAddTask}
      />
    </div>
  );
};

export default Layout;
