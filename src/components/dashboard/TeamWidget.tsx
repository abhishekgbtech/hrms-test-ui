
import React from "react";
import { team, Task } from '../../data/mockData';
import { Plus } from '../icons';
import { Button } from '../ui/Button';
import type { Page } from '../../App';
import { MemberProfileDropdown } from "./MemberProfileDropdown";

const statusInfo: { [key: string]: { text: string; color: string; } } = {
  available: { text: 'Available', color: 'bg-emerald-500' },
  'in-meeting': { text: 'In a meeting', color: 'bg-amber-500' },
  'on-leave': { text: 'On leave', color: 'bg-slate-500' },
};

const TeamMember: React.FC<{ member: typeof team[0], tasks?: Task[] }> = ({ member, tasks }) => {
  const status = statusInfo[member.status];
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center space-x-3">
        <div className="relative cursor-pointer">
            <MemberProfileDropdown user={member} triggerType="avatar-only" tasks={tasks} />
            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${status.color} ring-2 ring-white dark:ring-slate-800 pointer-events-none`}></span>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{member.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{status.text}</p>
        </div>
      </div>
    </div>
  );
};

interface TeamWidgetProps {
  setCurrentPage: (page: Page) => void;
  tasks?: Task[];
}

const TeamWidget: React.FC<TeamWidgetProps> = ({ setCurrentPage, tasks }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Team Availability</h3>
        <Button variant="secondary" size="sm" onClick={() => setCurrentPage('Team Projects')}>
            <Plus size={16} className="mr-1" /> View Team
        </Button>
      </div>
      <div className="space-y-4">
        {team.map(member => <TeamMember key={member.name} member={member} tasks={tasks} />)}
      </div>
    </div>
  );
};

export default TeamWidget;
