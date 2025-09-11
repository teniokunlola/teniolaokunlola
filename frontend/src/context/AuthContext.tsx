import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../api/firebaseConfig';
import { buildApiUrl } from '../api/config';
import { logger } from '../lib/logger';
import { getErrorMessage } from '../types/errors';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Define admin user interface
interface AdminUser {
  id: number;
  firebase_uid: string;
  email: string;
  display_name: string;
  role: {
    id: number;
    name: string;
    description: string;
    permissions: {
      permissions: string[];
    };
  };
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

// Define the shape of the context value
interface AuthContextType {
    user: User | null;
    loading: boolean;
    adminUser: AdminUser | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    hasPermission: (permission: string) => boolean;
    logout: () => Promise<void>;
    error: string | null;
    clearError: () => void;
    refreshAdminUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    adminUser: null,
    isAdmin: false,
    isSuperAdmin: false,
    hasPermission: () => false,
    logout: async () => {},
    error: null,
    clearError: () => {},
    refreshAdminUser: async () => {},
});

// A custom hook to use the auth context easily
export const useAuth = () => {
    return useContext(AuthContext);
};

// The AuthProvider component that will wrap your entire app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

    // Check if user is admin and get admin details
    const isAdmin = !!adminUser && adminUser.is_active;
    const isSuperAdmin = adminUser?.role.name === 'superadmin';

    // Check if user has specific permission
    const hasPermission = (permission: string): boolean => {
        if (!adminUser || !adminUser.is_active) {
            logger.debug('hasPermission check failed - no admin user or inactive', { adminUser, isActive: adminUser?.is_active });
            return false;
        }
        
        const hasPerm = adminUser.role.permissions.permissions.includes(permission);
        logger.debug('Permission check', { permission, hasPerm, allPermissions: adminUser.role.permissions.permissions });
        return hasPerm;
    };

    // Fetch admin user data from backend
    const fetchAdminUser = useCallback(async (firebaseUser: User, retryCount = 0) => {
        try {
            // Debounce: prevent rapid API calls (wait at least 1 second between calls)
            const now = Date.now();
            if (now - lastFetchTime < 1000 && retryCount === 0) {
                logger.debug('Debouncing API call, waiting...');
                return;
            }
            setLastFetchTime(now);

            logger.debug('Fetching admin user for Firebase user', { email: firebaseUser.email });

            // Always get a fresh token after login
            const idToken = await firebaseUser.getIdToken(true);
            logger.debug('Got ID token, making request to current-admin-user/');

            const response = await fetch(buildApiUrl('current-admin-user/'), {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            logger.debug('Admin user response status', { status: response.status });

            if (response.ok) {
                const adminData = await response.json();
                logger.debug('Admin user data received', { adminData });
                setAdminUser(adminData);
                setError(null);
            } else if (response.status === 403 && retryCount < 2) {
                // Handle clock synchronization issue by retrying with a delay
                const errorText = await response.text();
                if (errorText.includes('Token used too early')) {
                    logger.debug('Clock sync issue detected, retrying in 2 seconds...');
                    setTimeout(() => {
                        fetchAdminUser(firebaseUser, retryCount + 1);
                    }, 2000);
                    return;
                }
                throw new Error(errorText);
            } else if (response.status === 404 && retryCount < 1) {
                // Admin user not found in backend - retry once after delay
                logger.debug('Admin user not found, retrying in 1s...');
                setTimeout(() => {
                    fetchAdminUser(firebaseUser, retryCount + 1);
                }, 1000);
            } else if (response.status === 404) {
                // After retries, show error
                setAdminUser(null);
                setError('Admin account not found. Please contact support.');
            } else {
                const errorText = await response.text();
                logger.error('Failed to fetch admin user', { status: response.status, error: errorText });
                setAdminUser(null);
                setError('Failed to fetch admin user.');
            }
        } catch (err) {
            logger.error('Failed to fetch admin user', { error: err });
            setAdminUser(null);
            setError('Failed to fetch admin user.');
        }
    }, [lastFetchTime]);

    // Refresh admin user data
    const refreshAdminUser = async () => {
        if (user) {
            await fetchAdminUser(user);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setAdminUser(null);
            localStorage.removeItem('firebase_user');
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            logger.error('Logout failed', { error: err });
            setError(errorMessage);
        }
    };

    const clearError = () => {
        setError(null);
    };

    // Function to check inactivity and logout after 1 hour 10 minutes
    const checkInactivity = () => {
        const now = Date.now();
        const inactivityLimit = 70 * 60 * 1000; // 1 hour 10 minutes in milliseconds
        if (now - lastActivityTime > inactivityLimit) {
            logger.debug('User inactive for 1 hour 10 minutes, logging out');
            logout();
        }
    };

    useEffect(() => {
        // Set up interval to check inactivity every 5 minutes
        const interval = setInterval(checkInactivity, 5 * 60 * 1000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [lastActivityTime]);

    useEffect(() => {
        // Update last activity time on user interaction
        const updateActivity = () => setLastActivityTime(Date.now());

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
        };
    }, []);

    useEffect(() => {
        // Check for persisted session on app start
        const persistedUser = localStorage.getItem('firebase_user');
        if (persistedUser) {
            try {
                const userData = JSON.parse(persistedUser);
                setLastActivityTime(userData.lastActivityTime || Date.now());
            } catch (error) {
                logger.error('Failed to parse persisted user data:', { error });
                localStorage.removeItem('firebase_user');
            }
        }

        // Set a timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
            if (loading) {
                logger.warn('Authentication loading timeout, setting loading to false');
                setLoading(false);
            }
        }, 10000); // 10 second timeout

        // This listener will fire whenever the user's sign-in state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            logger.debug('Firebase auth state changed', { 
                hasUser: !!currentUser, 
                uid: currentUser?.uid,
                email: currentUser?.email 
            });

            setUser((prevUser) => {
                if (prevUser?.uid !== currentUser?.uid) {
                    return currentUser;
                }
                return prevUser;
            });

            if (currentUser) {
                // Persist user session
                localStorage.setItem('firebase_user', JSON.stringify({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    lastActivityTime: Date.now()
                }));

                // Only fetch admin user data if we don't already have it for this user
                // or if the current user is different from the one we have data for
                if (!adminUser || adminUser.firebase_uid !== currentUser.uid) {
                    try {
                        await fetchAdminUser(currentUser);
                    } catch (error) {
                        logger.error('Failed to fetch admin user:', { error });
                        setAdminUser(null);
                    }
                }
            } else {
                setAdminUser(null);
                localStorage.removeItem('firebase_user');
            }

            // Only set loading to false after Firebase auth state is determined
            setLoading(false);
            clearTimeout(loadingTimeout);
        }, (error) => {
            logger.error('Firebase auth state error:', { error });
            setError(error.message);
            setLoading(false);
            clearTimeout(loadingTimeout);
        });

        // Cleanup the listener on component unmount
        return () => {
            unsubscribe();
            clearTimeout(loadingTimeout);
        };
    }, [adminUser, fetchAdminUser, loading]);

    // The value that will be provided to consumers of the context
    const value: AuthContextType = { 
        user, 
        loading, 
        adminUser,
        isAdmin, 
        isSuperAdmin,
        hasPermission,
        logout, 
        error, 
        clearError,
        refreshAdminUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Only render children when the loading is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
