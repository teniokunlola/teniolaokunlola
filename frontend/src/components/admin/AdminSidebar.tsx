import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Mail,
  Settings,
  User,
  MessageSquare,
  Star,
  BarChart3,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  LogOut,

  Wrench,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore, useThemeSync } from '@/store';
import '@/index.css'

interface SidebarProps {
  className?: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: NavItem[];
}

const AdminSidebar: React.FC<SidebarProps> = ({ className, collapsed, setCollapsed, mobileClose }) => {
  const { hasPermission, logout } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Content Management', 'Communication', 'Admin Management']);

  // Theme management
  useThemeSync();
  const theme = useUIStore(state => state.theme);


  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Content Management',
      href: '#',
      icon: FolderOpen,
      children: [
        {
          name: 'Projects',
          href: '/admin/projects',
          icon: Briefcase,
          permission: 'manage_projects',
        },
        {
          name: 'Experience',
          href: '/admin/experience',
          icon: Briefcase,
          permission: 'manage_experience',
        },
        {
          name: 'Education',
          href: '/admin/education',
          icon: GraduationCap,
          permission: 'manage_education',
        },
        {
          name: 'Skills',
          href: '/admin/skills',
          icon: Star,
          permission: 'manage_skills',
        },
        {
          name: 'Services',
          href: '/admin/services',
          icon: Wrench,
          permission: 'manage_services',
        },
      ],
    },
    {
      name: 'Communication',
      href: '#',
      icon: MessageSquare,
      children: [
        {
          name: 'Messages',
          href: '/admin/messages',
          icon: Mail,
        },
        {
          name: 'Testimonials',
          href: '/admin/testimonials',
          icon: Star,
          permission: 'manage_testimonials',
        },
      ],
    },
    {
      name: 'Admin Management',
      href: '#',
      icon: Users,
      children: [
        {
          name: 'Profile',
          href: '/admin/profile',
          icon: UserCircle,
        },
        {
          name: 'Users',
          href: '/admin/users',
          icon: User,
          permission: 'manage_admin_users',
        },
        {
          name: 'Invitations',
          href: '/admin/invitations',
          icon: Mail,
          permission: 'send_invitations',
        },
      ],
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      permission: 'view_analytics',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      permission: 'manage_settings',
    },
  ];

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.name);
    const canAccess = !item.permission || hasPermission(item.permission);

    if (!canAccess) return null;

    if (hasChildren) {
      return (
        <div key={item.name} className="mb-1">
          <button
            onClick={() => toggleSection(item.name)}
            className={cn(
              'admin-sidebar-item w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200',
              isExpanded && 'text-foreground',
              collapsed && 'justify-center px-2 py-3'
            )}
          >
            <div className={cn(
              'flex items-center gap-3',
              collapsed && 'justify-center'
            )}>
              <item.icon className={cn(
                'transition-all duration-200',
                collapsed ? 'w-5 h-5' : 'w-4 h-4'
              )} />
              {!collapsed && <span>{item.name}</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </button>
          {isExpanded && !collapsed && (
            <div className="ml-6 space-y-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          'admin-sidebar-item block px-3 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'active'
            : 'text-muted-foreground',
          collapsed && 'px-2 py-3 text-center'
        )}
      >
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <item.icon className={cn(
            'transition-all duration-200',
            collapsed ? 'w-5 h-5' : 'w-4 h-4'
          )} />
          {!collapsed && <span>{item.name}</span>}
        </div>
      </Link>
    );
  };

  return (
    <div 
      className={cn(
        'h-full bg-background text-foreground admin-sidebar border-r border-border flex flex-col',
        collapsed && 'collapsed',
        className
      )} 
      data-theme={theme}
      data-collapsed={collapsed}
    >
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border/20 bg-background/50 backdrop-blur-sm flex-shrink-0",
        collapsed && "p-2"
      )}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">Admin</span>
            </div>
          )}
          {mobileClose ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={mobileClose}
              className="p-1 hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "p-1 hover:bg-purple-500/10 hover:text-purple-500 transition-colors",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 p-2 space-y-1 admin-scrollbar bg-background/30 overflow-y-auto",
        collapsed && "p-1 space-y-2"
      )}>
        {navigation.map(item => renderNavItem(item))}
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className={cn(
        "p-4 border-t border-border/20 bg-background/50 backdrop-blur-sm flex-shrink-0",
        collapsed && "p-2"
      )}>
        <div className="space-y-2">
          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "w-full justify-start p-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}>
              <LogOut className={cn(
                "transition-all duration-200",
                collapsed ? "w-5 h-5" : "w-4 h-4"
              )} />
              {!collapsed && <span>Logout</span>}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
