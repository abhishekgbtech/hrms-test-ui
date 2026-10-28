
import React from "react";
import { Menu, Settings, LogOut, Mail, Phone, ExternalLink, Edit, Share2, Trash2, Move, CheckSquare } from '../icons';
import type { Theme, PrimaryColor } from '../../App';
import { Notifications } from '../ui/Notifications';
import { UserProfileDropdown } from '../ui/UserProfileDropdown';
import { handleContactAction } from "../../lib/utils";
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, theme, setTheme, primaryColor, setPrimaryColor }) => {
    const { profile, signOut } = useAuth();

    const handleAction = (type: 'email' | 'phone', value: string) => {
        handleContactAction(type, value, () => {
            alert(`${type === 'email' ? 'Email' : 'Phone number'} copied to clipboard: ${value}`);
        });
    };

    const userActions = [
      {
          icon: Mail,
          label: 'Email',
          onClick: () => profile?.email && handleAction('email', profile.email)
      },
      {
          icon: Phone,
          label: 'Call',
          onClick: () => profile?.phone && handleAction('phone', profile.phone)
      },
      {
          icon: ExternalLink,
          label: 'Profile',
          onClick: () => console.log('Navigating to profile...')
      },
    ];

    const menuItems = [
      { icon: Edit, label: 'Edit workspace', hasArrow: true },
      { icon: CheckSquare, label: 'Task Preferences' },
      { icon: Share2, label: 'Share workspace' },
      { icon: Move, label: 'Move to folder', hasArrow: true },
      { icon: LogOut, label: 'Sign Out', isDestructive: true, onClick: signOut },
    ];

    const dropdownUser = {
        name: profile?.full_name || 'User',
        handle: profile?.email || '',
        avatarUrl: profile?.profile_picture_url || ''
    }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Header: Left side */}
          <div className="flex items-center space-x-4">
            <button
              className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen((prev) => !prev);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu size={24} />
            </button>
            <div>
                <h1 className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 font-bold">
                    {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                    Here's what's happening today.
                </p>
            </div>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <Notifications />
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            
            <UserProfileDropdown 
                user={dropdownUser} 
                actions={userActions} 
                menuItems={menuItems}
                themeConfig={{
                    theme,
                    setTheme,
                    color: primaryColor,
                    setColor: setPrimaryColor
                }}
            />

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
