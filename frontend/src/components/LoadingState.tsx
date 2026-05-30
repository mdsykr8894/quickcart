import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading content, please wait...', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {/* Sleek, simple custom brand spinner using native Tailwind transforms */}
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingState;
