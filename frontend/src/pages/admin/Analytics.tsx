import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAPI from '@/api/adminAPI';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AdminPageHeader,
  AdminStatsCard,
  AdminLoadingState,
  AdminErrorState
} from '@/components/admin/AdminComponents';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FolderOpen,
  Star,
  Briefcase,
  Mail,
  MessageSquare,
  Activity,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

interface AnalyticsData {
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

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<'week' | 'month' | 'quarter'>('month');

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to load analytics', { error: err });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getGrowthIcon = (growth: string) => {
    const value = parseInt(growth);
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getGrowthColor = (growth: string) => {
    const value = parseInt(growth);
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <AdminLoadingState message="Loading analytics data..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics">
        <AdminErrorState message={error} onRetry={fetchAnalytics} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      <AdminPageHeader
        title="Site Analytics"
        subtitle="Comprehensive overview of your portfolio performance and growth metrics"
        icon={BarChart3}
      >
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
            className="admin-form-input text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </AdminPageHeader>

      {analytics && (
        <div className="space-y-8">
          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <AdminStatsCard
              title="Total Projects"
              value={analytics.overview.total_projects}
              icon={FolderOpen}
              color="bg-gradient-to-r from-purple-600 to-purple-700"
              subtitle="Portfolio projects"
              trend={{
                value: analytics.growth.projects_growth,
                isPositive: parseInt(analytics.growth.projects_growth) > 0
              }}
            />

            <AdminStatsCard
              title="Total Skills"
              value={analytics.overview.total_skills}
              icon={Star}
              color="bg-gradient-to-r from-blue-600 to-blue-700"
              subtitle="Technical skills"
            />

            <AdminStatsCard
              title="Total Experience"
              value={analytics.overview.total_experiences}
              icon={Briefcase}
              color="bg-gradient-to-r from-green-600 to-green-700"
              subtitle="Work experience"
            />

            <AdminStatsCard
              title="Total Contacts"
              value={analytics.overview.total_contacts}
              icon={Mail}
              color="bg-gradient-to-r from-orange-600 to-orange-700"
              subtitle="Contact submissions"
              trend={{
                value: analytics.growth.contacts_growth,
                isPositive: parseInt(analytics.growth.contacts_growth) > 0
              }}
            />

            <AdminStatsCard
              title="Total Testimonials"
              value={analytics.overview.total_testimonials}
              icon={MessageSquare}
              color="bg-gradient-to-r from-red-600 to-red-700"
              subtitle="Client feedback"
            />
          </div>

          {/* Growth Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="font-medium">Projects Growth</span>
                  </div>
                  <div className={`flex items-center gap-2 font-semibold ${getGrowthColor(analytics.growth.projects_growth)}`}>
                    {getGrowthIcon(analytics.growth.projects_growth)}
                    {analytics.growth.projects_growth}%
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="font-medium">Contacts Growth</span>
                  </div>
                  <div className={`flex items-center gap-2 font-semibold ${getGrowthColor(analytics.growth.contacts_growth)}`}>
                    {getGrowthIcon(analytics.growth.contacts_growth)}
                    {analytics.growth.contacts_growth}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-medium">Recent Contacts</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">
                    {analytics.recent_activity.recent_contacts}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="font-medium">Recent Projects</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-500">
                    {analytics.recent_activity.recent_projects}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Performance Insights
              </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full">
                    <Zap className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Portfolio Strength</h3>
                  <p className="text-muted-foreground text-sm">
                    {analytics.overview.total_projects >= 10 ? 'Excellent' : 
                     analytics.overview.total_projects >= 5 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Engagement Level</h3>
                  <p className="text-muted-foreground text-sm">
                    {analytics.overview.total_contacts >= 20 ? 'High' : 
                     analytics.overview.total_contacts >= 10 ? 'Medium' : 'Low'}
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full">
                    <Star className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Skill Coverage</h3>
                  <p className="text-muted-foreground text-sm">
                    {analytics.overview.total_skills >= 15 ? 'Comprehensive' : 
                     analytics.overview.total_skills >= 8 ? 'Good' : 'Basic'}
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 border-gray-500/20">
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => window.location.href = '/admin/projects'}
                  className="p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 text-left"
                >
                  <FolderOpen className="w-6 h-6 text-purple-500 mb-2" />
                  <h4 className="font-semibold text-foreground">Add Project</h4>
                  <p className="text-sm text-muted-foreground">Create new portfolio item</p>
                </button>

                <button
                  onClick={() => window.location.href = '/admin/skills'}
                  className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 text-left"
                >
                  <Star className="w-6 h-6 text-blue-500 mb-2" />
                  <h4 className="font-semibold text-foreground">Update Skills</h4>
                  <p className="text-sm text-muted-foreground">Modify skill proficiency</p>
                </button>

                <button
                  onClick={() => window.location.href = '/admin/messages'}
                  className="p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 text-left"
                >
                  <Mail className="w-6 h-6 text-green-500 mb-2" />
                  <h4 className="font-semibold text-foreground">Check Messages</h4>
                  <p className="text-sm text-muted-foreground">Review contact submissions</p>
                </button>

                <button
                  onClick={() => window.location.href = '/admin/settings'}
                  className="p-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-300 text-left"
                >
                  <Target className="w-6 h-6 text-orange-500 mb-2" />
                  <h4 className="font-semibold text-foreground">Site Settings</h4>
                  <p className="text-sm text-muted-foreground">Configure portfolio</p>
                </button>
              </div>
              </CardContent>
            </Card>
          </div>
        )}
    </AdminLayout>
  );
};

export default Analytics;





