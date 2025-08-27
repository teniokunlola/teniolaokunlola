import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw,
  AlertCircle,
  Settings,
  Database,
  Activity
} from 'lucide-react';

// Admin Page Header Component
export const AdminPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="mb-8"
  >
    <div className="bg-gradient-to-r from-purple-900/20 via-purple-800/20 to-purple-900/20 border border-purple-500/20 rounded-xl p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

// Admin Stats Card Component
export const AdminStatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
}> = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group"
  >
    <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border/20 hover:border-purple-500/40 transition-all duration-300 h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 ${color} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 mt-3">
            <Badge 
              variant="secondary" 
              className={`${
                trend.isPositive 
                  ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                  : 'bg-red-500/20 text-red-500 border-red-500/30'
              }`}
            >
              {trend.value}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Admin Action Button Component
export const AdminActionButton: React.FC<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}> = ({ 
  variant = 'primary', 
  size = 'default', 
  icon: Icon, 
  children, 
  onClick, 
  disabled, 
  loading,
  className = ''
}) => {
  const baseClasses = "inline-flex items-center gap-2 font-medium transition-all duration-300";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25",
    secondary: "bg-gradient-to-r from-muted to-muted/80 hover:from-muted/80 hover:to-muted text-foreground",
    outline: "border border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-purple-500/10"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg",
    default: "px-4 py-2 rounded-lg",
    lg: "px-6 py-3 text-lg rounded-lg"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant={variant === 'primary' ? 'default' : 'outline'}
        size={size}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-4 h-4" />
          </motion.div>
        ) : (
          <Icon className="w-4 h-4" />
        )}
        {children}
      </Button>
    </motion.div>
  );
};

// Admin Data Table Component
export const AdminDataTable: React.FC<{
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}> = ({ headers, children, loading, emptyMessage = "No data found" }) => (
      <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border/20">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-foreground">Data Table</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full"
            >
              <Activity className="w-6 h-6 text-white" />
            </motion.div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="text-left py-3 px-4 font-semibold text-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {children}
            </tbody>
          </table>
          {!children && (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

// Admin Form Section Component
export const AdminFormSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={`mb-6 ${className}`}
  >
    <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

// Admin Status Badge Component
export const AdminStatusBadge: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  children: React.ReactNode;
}> = ({ status, children }) => {
  const statusConfig = {
    success: 'bg-green-500/20 text-green-500 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-500 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    pending: 'bg-purple-500/20 text-purple-500 border-purple-500/30'
  };

  return (
    <Badge variant="secondary" className={`${statusConfig[status]} border`}>
      {children}
    </Badge>
  );
};

// Admin Loading State Component
export const AdminLoadingState: React.FC<{
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ message = "Loading...", size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`inline-flex items-center justify-center mb-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full ${sizeClasses[size]}`}
        >
          <Activity className={`text-white ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}`} />
        </motion.div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Admin Error State Component
export const AdminErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-red-600 to-red-700 rounded-full">
        <AlertCircle className="w-8 h-8 text-white" />
      </div>
      <p className="text-red-500 mb-4">{message}</p>
      {onRetry && (
        <AdminActionButton
          variant="outline"
          icon={RefreshCw}
          onClick={onRetry}
        >
          Try Again
        </AdminActionButton>
      )}
    </div>
  </div>
);

// Admin Empty State Component
export const AdminEmptyState: React.FC<{
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}> = ({ message, icon: Icon, action }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-muted to-muted/80 rounded-full">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && action}
    </div>
  </div>
);
