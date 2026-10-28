
"use client";

import React, { useState } from "react";
import { UserProfileDropdown } from "../ui/UserProfileDropdown";
import { ContactInfoModal } from "../modals/ContactInfoModal";
import { UserTasksModal } from "../modals/UserTasksModal";
import { AddTaskModal } from "../modals/AddTaskModal";
import { ManageTeamModal } from "../modals/ManageTeamModal";
import { ProjectSettingsModal } from "../modals/ProjectSettingsModal";
import { Mail, Phone, ExternalLink, Edit, CheckSquare, Share2, Move, Trash2 } from "../icons";
import { projects, Task } from "../../data/mockData";
import { handleContactAction } from "../../lib/utils";

interface MemberProfileDropdownProps {
    user: {
        name: string;
        handle?: string;
        avatarUrl: string;
        email: string;
        phone: string;
        role?: string;
    };
    triggerType?: 'full' | 'avatar-only';
    children?: React.ReactNode; 
    project?: typeof projects[0]; // Optional project context for "Edit permissions"
    avatarClassName?: string;
    tasks?: Task[]; // Global tasks list
}

export const MemberProfileDropdown: React.FC<MemberProfileDropdownProps> = ({ user, triggerType = 'avatar-only', children, project, avatarClassName, tasks }) => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isTasksOpen, setIsTasksOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);

    // Handlers for actions
    const handleEmail = () => {
        handleContactAction('email', user.email, () => {
            // Using alert here because the dropdown closes immediately, 
            // so a tooltip inside the dropdown wouldn't be seen.
            alert(`Email copied to clipboard: ${user.email}`);
        });
    };

    const handleCall = () => {
        handleContactAction('phone', user.phone, () => {
            alert(`Phone number copied to clipboard: ${user.phone}`);
        });
    };

    const handleProfile = () => {
        // Opens the detailed contact info modal as a profile view
        setIsContactOpen(true);
    };

    const handleEditPermissions = () => {
        if (project) {
            setIsProjectSettingsOpen(true);
        } else {
            alert("Please access this option from within a specific project view to edit project permissions.");
        }
    };

    const handleViewTasks = () => {
        setIsTasksOpen(true);
    };

    const handleAssignTask = () => {
        setIsTasksOpen(false); // Close task list
        setIsAddTaskOpen(true); // Open add task modal
    };

    const handleShareProfile = () => {
        const dummyUrl = `https://portal.ecovis.com/u/${user.name.toLowerCase().replace(/\s/g, '')}`;
        navigator.clipboard.writeText(dummyUrl);
        alert(`Profile link copied to clipboard: ${dummyUrl}`);
    };

    const handleMoveTeam = () => {
        setIsTeamOpen(true);
    };

    const handleRemoveProject = () => {
        if(confirm(`Are you sure you want to remove ${user.name} from this project?`)) {
            console.log(`${user.name} has been removed from the project.`);
        }
    };

    const handleNewTaskAdded = (task: any) => {
        console.log("New task added for user:", task);
    };

    const actions = [
        { icon: Mail, label: 'Email', onClick: handleEmail },
        { icon: Phone, label: 'Call', onClick: handleCall },
        { icon: ExternalLink, label: 'Profile', onClick: handleProfile },
    ];

    const menuItems = [
        { icon: Edit, label: 'Edit permissions', hasArrow: true, onClick: handleEditPermissions },
        { icon: CheckSquare, label: 'View tasks', onClick: handleViewTasks },
        { icon: Share2, label: 'Share profile', onClick: handleShareProfile },
        { icon: Move, label: 'Move to team', hasArrow: true, onClick: handleMoveTeam },
        { icon: Trash2, label: 'Remove from project', isDestructive: true, onClick: handleRemoveProject },
    ];

    return (
        <>
            <UserProfileDropdown
                user={{
                    name: user.name,
                    handle: user.handle || user.role || 'Member',
                    avatarUrl: user.avatarUrl
                }}
                actions={actions}
                menuItems={menuItems}
                triggerType={triggerType}
                avatarClassName={avatarClassName}
            />
            
            {/* Modals managed by this dropdown */}
            <ContactInfoModal 
                isOpen={isContactOpen} 
                onClose={() => setIsContactOpen(false)}
                user={user}
            />

            <UserTasksModal 
                isOpen={isTasksOpen}
                onClose={() => setIsTasksOpen(false)}
                user={user}
                onAssignNewTask={handleAssignTask}
                tasks={tasks} // Pass tasks prop here
            />

            <AddTaskModal 
                isOpen={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                onAddTask={handleNewTaskAdded}
                initialAssignee={user.name}
            />

            <ManageTeamModal 
                isOpen={isTeamOpen}
                onClose={() => setIsTeamOpen(false)}
                user={user}
            />

            {project && (
                <ProjectSettingsModal 
                    isOpen={isProjectSettingsOpen}
                    onClose={() => setIsProjectSettingsOpen(false)}
                    project={project}
                />
            )}
        </>
    );
};
