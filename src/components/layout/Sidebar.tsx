
"use client";

import React, { useRef, useEffect } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { Home, Calendar, Check, FileText, Sliders, Users, Mail, MessageSquare, Folder, Briefcase, Ticket, Shield, Network, Layers } from '../icons';
import type { Page } from '../../App';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, currentPage, setCurrentPage }) => {
  const { canAccessTeamProjects, canCreateProjects, profile } = useAuth();

  const canAccessAdminPanel = () => {
    return (profile?.access_level ?? 0) >= 2;
  };

  const canAccessSeedEmployees = () => {
    return (profile?.access_level ?? 0) >= 3;
  };

  const allNavLinks: { page: Page; icon: React.ReactNode; requiresAccess?: () => boolean }[] = [
    { page: 'Dashboard', icon: <Home size={20} /> },
    { page: 'Projects', icon: <Briefcase size={20} /> },
    { page: 'Service Management', icon: <Layers size={20} /> },
    { page: 'Work Schedule', icon: <Calendar size={20} /> },
    { page: 'My Tasks', icon: <Check size={20} /> },
    { page: 'Team Projects', icon: <Users size={20} />, requiresAccess: canAccessTeamProjects },
    { page: 'Folders', icon: <Folder size={20} /> },
    { page: 'Ticket Generation', icon: <Ticket size={20} /> },
    { page: 'Org Hierarchy', icon: <Network size={20} /> },
    { page: 'Admin Panel', icon: <Shield size={20} />, requiresAccess: canAccessAdminPanel },
    { page: 'Seed Employees', icon: <Users size={20} />, requiresAccess: canAccessSeedEmployees },
  ];

  const navLinks = allNavLinks.filter(link => !link.requiresAccess || link.requiresAccess());
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  return (
    <>
      {/* Sidebar backdrop (mobile) */}
      <div 
        className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-auto no-scrollbar w-64 lg:w-20 lg:hover:w-64 shrink-0 bg-cyan-900 dark:bg-slate-900 border-r border-cyan-800 dark:border-slate-800 p-4 transition-all duration-300 ease-in-out group ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient cx="21.152%" cy="86.063%" fx="21.152%" fy="86.063%" r="79.941%" id="logo-grad">
                                <stop stopColor="#FECACA" offset="0%"></stop> {/* Light Red */}
                                <stop stopColor="#EF4444" offset="25.871%"></stop> {/* Red-500 */}
                                <stop stopColor="#991B1B" offset="100%"></stop> {/* Red-800 */}
                            </radialGradient>
                        </defs>
                        <rect fill="none" width="32" height="32" rx="16"></rect>
                        <path d="M18.277.16C26.035 1.267 32 7.938 32 16c0 8.837-7.163 16-16 16S0 24.837 0 16C0 10.327 3.928 3.822 9.498.16L16 14.598l2.277-14.438z" fill="url(#logo-grad)"></path>
                    </svg>
                </div>
                <div className="ml-3">
                    <span className="text-lg font-semibold text-white lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">ECOVIS</span>
                </div>
            </div>
          <button ref={trigger} className="lg:hidden text-cyan-200 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)} aria-controls="sidebar" aria-expanded={sidebarOpen}>
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z"></path></svg>
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1">
          <h3 className="text-xs uppercase text-cyan-200/50 font-semibold pl-3 lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">Menu</h3>
          <ul className="mt-3 space-y-1.5">
            {navLinks.map(({ page, icon }) => (
              <li key={page}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                  className={`flex items-center p-3 rounded-lg transition-colors ${ 
                      currentPage === page 
                        ? 'bg-cyan-800 dark:bg-slate-800 text-white shadow-sm' 
                        : 'text-cyan-100 dark:text-slate-400 hover:bg-cyan-800/50 dark:hover:bg-slate-800 hover:text-white' 
                  }`}
                >
                  {icon}
                  <span className="ml-4 text-sm font-medium lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">{page}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
