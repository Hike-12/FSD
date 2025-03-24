import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
}