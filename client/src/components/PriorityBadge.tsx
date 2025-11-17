import React from 'react';
import { TaskPriority } from '../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'Low':
        return 'border-[#86efac] text-[#166534]';
      case 'Medium':
        return 'border-[#fcd34d] text-[#92400e]';
      case 'High':
        return 'border-[#fb923c] text-[#9a3412]';
      case 'Urgent':
        return 'border-[#f87171] text-[#b91c1c]';
      default:
        return 'border-gray-300 text-gray-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-[0.55rem] py-[0.2rem] rounded-full capitalize border-2 bg-white ${getPriorityStyles()}`}
      style={{ fontSize: '0.875rem' }}
    >
      {priority}
    </span>
  );
};
