import React from 'react';
import { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-[#f59e0b] text-[#92400e]';
      case 'In Progress':
        return 'bg-[#3b82f6] text-[#1d4ed8]';
      case 'Completed':
        return 'bg-[#10b981] text-[#166534]';
      case 'Cancelled':
        return 'bg-[#ef4444] text-[#b91c1c]';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-[0.55rem] py-[0.2rem] rounded-full capitalize ${getStatusStyles()}`}
      style={{ fontSize: '0.875rem' }}
    >
      {status}
    </span>
  );
};
