import React from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <ClientLayout>
      <div className="mt-16 min-h-[70vh] flex items-center justify-center bg-background text-foreground px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl"
        >
          <div className="text-7xl sm:text-8xl font-bold text-purple-600 dark:text-purple-400">404</div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold">Page not found</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            The page you’re looking for doesn’t exist or was moved.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </ClientLayout>
  );
};

export default NotFound;


