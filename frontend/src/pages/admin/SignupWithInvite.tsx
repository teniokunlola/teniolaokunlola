import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/api/firebaseConfig';
import { buildApiUrl } from '@/api/config';
import { User, Mail, Key, Hash, Shield, Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore, useThemeSync } from '@/store';
import { 
  validateAndSanitizeEmail, 
  validateAndSanitizePassword, 
  validateAndSanitizeName,
  validateAndSanitizeInviteCode,
  RateLimiter 
} from '@/lib/security';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';
import '@/index.css'

const SignupWithInvite: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [emailLocked, setEmailLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme management
  const { theme, toggleTheme } = useUIStore();
  useThemeSync();
  
  // Rate limiting for signup attempts
  const rateLimiter = React.useMemo(() => new RateLimiter(3, 300000), []); // 3 attempts per 5 minutes

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code') || '';
    if (code) {
      setInviteCode(code);
      validateInviteCode(code);
    }
  }, [location.search]);

  const validateInviteCode = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(buildApiUrl(`validate-invitation/?code=${encodeURIComponent(code)}`));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired invitation code.');
      setEmail(data.email);
      setEmailLocked(true);
      setLoading(false);
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      logger.error('Failed to validate invitation code', { error: e, code });
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check rate limiting
    if (!rateLimiter.isAllowed('signup')) {
      setError('Too many signup attempts. Please wait 5 minutes before trying again.');
      toast.error('Too many signup attempts. Please wait 5 minutes before trying again.');
      return;
    }
    
    // Validate all inputs
    const inviteValidation = validateAndSanitizeInviteCode(inviteCode);
    if (!inviteValidation.isValid) {
      setError(inviteValidation.error || 'Invalid invitation code');
      return;
    }
    
    const emailValidation = validateAndSanitizeEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email address');
      return;
    }
    
    const passwordValidation = validateAndSanitizePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    const displayNameValidation = validateAndSanitizeName(displayName);
    if (!displayNameValidation.isValid) {
      setError(displayNameValidation.error || 'Invalid display name');
      return;
    }
    
    setLoading(true);
    try {
      // Use sanitized data for Firebase auth
      const userCred = await createUserWithEmailAndPassword(
        auth, 
        emailValidation.value, 
        passwordValidation.value
      );
      const firebase_uid = userCred.user.uid;
      
      const res = await fetch(buildApiUrl('accept-invitation/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_code: inviteValidation.value,
          firebase_uid,
          display_name: displayNameValidation.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept invitation.');
      
      // Reset rate limiter on successful signup
      rateLimiter.reset('signup');
      toast.success('Account created! You can now log in.');
      navigate('/admin/login');
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      logger.error('Failed to create account', { error: e, email });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating particles - Same as Login.tsx */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500 dark:bg-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        ></motion.div>
      </div>

      {/* Theme Toggle Button - Top Right */}
      <motion.div
        className="absolute top-6 right-6 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
      >
        <motion.button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle theme"
        >
          <motion.div
            animate={{ rotate: theme === 'dark' ? 0 : 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-purple-500 group-hover:text-purple-400 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-purple-600 group-hover:text-purple-500 transition-colors" />
            )}
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Main signup container */}
      <motion.div 
        className="relative w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-foreground mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Join Admin Team
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Create your admin account with invitation
          </motion.p>
        </motion.div>

        {/* Signup form */}
        <motion.div 
          className="bg-card border border-border rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <motion.div 
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.div 
              className="p-2 bg-purple-500/10 rounded-lg"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.2)" }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground">Admin Account Setup</span>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <label className="block mb-2 font-medium flex items-center gap-2 text-foreground">
                <Hash className="h-4 w-4 text-purple-500" /> Invitation Code
              </label>
              <Input
                value={inviteCode}
                onChange={e => {
                  const value = e.target.value;
                  if (value.length <= 50) { // Invite code length limit
                    setInviteCode(value);
                  }
                }}
                disabled={emailLocked || loading}
                required
                maxLength={50}
                className="bg-background border-border focus:border-purple-500 focus:ring-purple-400"
                placeholder="Enter your invitation code"
              />
              {!emailLocked && (
                <Button 
                  type="button" 
                  className="mt-2 w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800" 
                  onClick={() => validateInviteCode(inviteCode)} 
                  disabled={loading || !inviteCode}
                >
                  Validate Code
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <label className="block mb-2 font-medium flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 text-purple-500" /> Email
              </label>
              <Input 
                value={email} 
                disabled 
                readOnly 
                className="bg-muted border-border text-muted-foreground" 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <label className="block mb-2 font-medium flex items-center gap-2 text-foreground">
                <User className="h-4 w-4 text-purple-500" /> Display Name
              </label>
              <Input
                value={displayName}
                onChange={e => {
                  const value = e.target.value;
                  if (value.length <= 100) { // Display name length limit
                    setDisplayName(value);
                  }
                }}
                disabled={!emailLocked || loading}
                maxLength={100}
                className="bg-background border-border focus:border-purple-500 focus:ring-purple-400"
                placeholder="Enter your display name"
              />
              {!emailLocked && (
                <div className="text-xs text-red-500 mt-1">Please validate your invitation code first.</div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.7 }}
            >
              <label className="block mb-2 font-medium flex items-center gap-2 text-foreground">
                <Key className="h-4 w-4 text-purple-500" /> Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => {
                  const value = e.target.value;
                  if (value.length <= 128) { // Password length limit
                    setPassword(value);
                  }
                }}
                required
                maxLength={128}
                disabled={!emailLocked || loading}
                className="bg-background border-border focus:border-purple-500 focus:ring-purple-400"
                placeholder="Enter your password"
              />
              {!emailLocked && (
                <div className="text-xs text-red-500 mt-1">Please validate your invitation code first.</div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              <label className="block mb-2 font-medium flex items-center gap-2 text-foreground">
                <Key className="h-4 w-4 text-purple-500" /> Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => {
                  const value = e.target.value;
                  if (value.length <= 128) { // Password length limit
                    setConfirmPassword(value);
                  }
                }}
                required
                maxLength={128}
                disabled={!emailLocked || loading}
                className="bg-background border-border focus:border-purple-500 focus:ring-purple-400"
                placeholder="Confirm your password"
              />
              {!emailLocked && (
                <div className="text-xs text-red-500 mt-1">Please validate your invitation code first.</div>
              )}
            </motion.div>

            {error && (
              <motion.div 
                className="text-red-600 text-sm text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.9 }}
            >
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2" 
                disabled={!emailLocked || loading}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
            </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupWithInvite;
