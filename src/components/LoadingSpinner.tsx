import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-12 w-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-purple-600 border-t-transparent ${sizeClasses[size]}`}></div>
    </div>
  );
};
