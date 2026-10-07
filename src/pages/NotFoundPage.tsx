import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface-900 border border-surface-800 rounded-2xl p-8 space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700/80 flex items-center justify-center text-surface-400 mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-surface-100">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
          The requested route does not exist. Navigate back to the SignMate dashboard or home page.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" icon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
