import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthUtils = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  const requireAuth = () => {
    if (!loading && !user) {
      navigate("/admin/login");
      return false;
    }
    return true;
  };

  // Redirect to login if not admin
  const requireAdmin = () => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
      return false;
    }
    return true;
  };

  // Check if user can access a specific resource
  const canAccess = () => {
    if (!user) return false;
    
    // Add your custom permission logic here
    // For now, just check if user is admin
    return isAdmin;
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Guest";
    return user.displayName || user.email?.split('@')[0] || "User";
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  return {
    user,
    loading,
    isAdmin,
    requireAuth,
    requireAdmin,
    canAccess,
    getUserDisplayName,
    isAuthenticated,
  };
};
