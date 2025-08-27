import React, { useState } from 'react';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/api/firebaseConfig';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '@/components/ui/toast';
import { validateAndSanitizeEmail } from '@/lib/security';
import { motion } from 'framer-motion';
import { useUIStore, useThemeSync } from '@/store';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Theme management to match Login page
  const { theme, toggleTheme } = useUIStore();
  useThemeSync();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const emailValidation = validateAndSanitizeEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || 'Please enter a valid email address');
        toast.error(emailValidation.error || 'Please enter a valid email address');
        return;
      }

      // Best-effort existence check, but do not block on it
      try {
        const methods = await fetchSignInMethodsForEmail(auth, emailValidation.value);
        if (!methods || methods.length === 0) {
          // Proceed anyway; Firebase will definitively tell us if user doesn't exist
          // This avoids false negatives from provider/method mismatches
          console.debug('No sign-in methods found for email; proceeding to attempt reset');
        }
      } catch (checkErr) {
        console.debug('fetchSignInMethodsForEmail failed; proceeding to attempt reset', checkErr);
      }

      await sendPasswordResetEmail(auth, emailValidation.value);
      const msg = 'Password reset email sent. Check your inbox and spam.';
      setMessage(msg);
      setEmail('');
      toast.success('Reset email sent', { description: msg });
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        const errMsg = 'No account found with that email address.';
        setError(errMsg);
        toast.error('Account not found', { description: errMsg });
        return;
      }
      const errMsg = err?.message || 'Failed to send reset email.';
      setError(errMsg);
      toast.error('Could not send reset email', { description: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating particles - same style as Login */}
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
            scale: [1, 1, 1],
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

      {/* Main container */}
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
            Reset Password
          </motion.h1>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Enter your email to receive a password reset link
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div 
          className="bg-card border border-border rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <button
            onClick={() => navigate('/admin/login')}
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <label className="block text-sm font-medium text-card-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                  disabled={loading}
                  className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            {message && (
              <motion.div 
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm font-medium text-green-600 dark:text-green-400">{message}</div>
              </motion.div>
            )}
            {error && (
              <motion.div 
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm font-medium text-red-600 dark:text-red-400">{error}</div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          <div className="text-muted-foreground text-sm">
            Remembered it? <Link to="/admin/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">Back to login</Link>
          </div>
          <motion.div 
            className="flex items-center justify-center gap-2 mt-4"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span className="text-muted-foreground text-xs">Powered by Firebase Authentication</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;


