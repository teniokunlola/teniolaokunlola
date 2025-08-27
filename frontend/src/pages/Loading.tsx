import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Loading: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTo = searchParams.get('redirect');

  React.useEffect(() => {
    if (redirectTo) {
      // Show loading for 1.5 seconds to give users a sense of loading
      const timer = setTimeout(() => {
        navigate(redirectTo);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [redirectTo, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
        <p className="text-gray-400">Please wait while we prepare your experience</p>
        {redirectTo && (
          <p className="text-sm text-purple-400 mt-4">
            Redirecting to {redirectTo.replace('/', '')}...
          </p>
          )}
      </div>
    </div>
  );
};

export default Loading;
