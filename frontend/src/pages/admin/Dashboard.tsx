import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import AdminAPI, { type Contact, type Project } from '@/api/adminAPI';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';
import { 
  FolderOpen,
  Star,
  Briefcase,
  Mail,
  MessageSquare,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Edit,
  Zap,
  Award,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  overview: {
    total_projects: number;
    total_skills: number;
    total_experiences: number;
    total_contacts: number;
    total_testimonials: number;
  };
  recent_activity: {
    recent_contacts: number;
    recent_projects: number;
  };
  growth: {
    contacts_growth: string;
    projects_growth: string;
  };
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  permission?: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  const quickActions: QuickAction[] = [
    {
      title: 'Add Project',
      description: 'Create a new project entry',
      icon: Plus,
      href: '/admin/projects',
      color: 'from-purple-600 to-purple-700',
      permission: 'manage_projects'
    },
    {
      title: 'Manage Skills',
      description: 'Update skills and proficiency levels',
      icon: Star,
      href: '/admin/skills',
      color: 'from-blue-600 to-blue-700',
      permission: 'manage_skills'
    },
    {
      title: 'View Messages',
      description: 'Check recent contact form submissions',
      icon: MessageSquare,
      href: '/admin/messages',
      color: 'from-green-600 to-green-700',
      permission: 'view_contacts'
    },
    {
      title: 'Edit Services',
      description: 'Update available services',
      icon: Settings,
      href: '/admin/services',
      color: 'from-orange-600 to-orange-700',
      permission: 'manage_services'
    },
    {
      title: 'Manage Experience',
      description: 'Update work experience entries',
      icon: Briefcase,
      href: '/admin/experience',
      color: 'from-indigo-600 to-indigo-700',
      permission: 'manage_experience'
    },
    {
      title: 'Site Settings',
      description: 'Configure site-wide settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-gray-600 to-gray-700',
      permission: 'manage_settings'
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch analytics data
        const analyticsData = await AdminAPI.getAnalytics();
        setStats(analyticsData);
        
        // Fetch recent contacts (last 5)
        try {
          const contactsData = await AdminAPI.contacts.list();
          setRecentContacts(contactsData.slice(0, 5));
        } catch (err) {
          logger.warn('Could not fetch recent contacts', { error: err });
        }
        
        // Fetch recent projects (last 5)
        try {
          const projectsData = await AdminAPI.projects.list();
          setRecentProjects(projectsData.slice(0, 5));
        } catch (err) {
          logger.warn('Could not fetch recent projects', { error: err });
        }
        
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error('Failed to load dashboard data', { error: err });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIcon = (growth: string) => {
    if (growth.startsWith('+')) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full"
            >
              <Activity className="w-8 h-8 text-white" />
            </motion.div>
            <p className="text-lg text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-red-600 to-red-700 rounded-full">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg text-red-500 mb-2">Error loading dashboard</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-purple-900/20 via-purple-800/20 to-purple-900/20 border border-purple-500/20 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Welcome to Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your portfolio content, monitor analytics, and keep your site updated.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-foreground">{stats.overview.total_projects}</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getGrowthIcon(stats.growth.projects_growth)}
                <span className="text-sm text-muted-foreground">{stats.growth.projects_growth} this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                  <p className="text-2xl font-bold text-foreground">{stats.overview.total_skills}</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                  <p className="text-2xl font-bold text-foreground">{stats.overview.total_contacts}</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getGrowthIcon(stats.growth.contacts_growth)}
                <span className="text-sm text-muted-foreground">{stats.growth.contacts_growth} this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-2xl font-bold text-foreground">{stats.overview.total_experiences}</p>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Testimonials</p>
                  <p className="text-2xl font-bold text-foreground">{stats.overview.total_testimonials}</p>
                </div>
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Award className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Link to={action.href}>
                <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20 hover:border-gray-500/40 transition-all duration-300 h-full cursor-pointer group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-r ${action.color} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentContacts.length > 0 ? (
                <div className="space-y-3">
                  {recentContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatDate(contact.created_at || '')}</p>
                        <Badge variant="secondary" className="mt-1 bg-green-500/20 text-green-500 border-green-500/30">
                          New
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <p>No recent messages</p>
                </div>
              )}
              <div className="mt-4">
                <Link to="/admin/messages">
                  <Button variant="outline" className="w-full border-gray-500/30 text-gray-400 hover:bg-gray-800/20">
                    View All Messages
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-purple-500" />
                Recent Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{project.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatDate(project.created_at || '')}</p>
                        <div className="flex gap-1 mt-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <p>No recent projects</p>
                </div>
              )}
              <div className="mt-4">
                <Link to="/admin/projects">
                  <Button variant="outline" className="w-full border-gray-500/30 text-gray-400 hover:bg-gray-800/20">
                    View All Projects
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </div>
    </AdminLayout>
  );
};

export default Dashboard;
