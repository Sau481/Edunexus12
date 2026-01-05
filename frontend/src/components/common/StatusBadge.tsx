import { NoteStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: NoteStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'status-pending',
    },
    approved: {
      label: 'Approved',
      className: 'status-approved',
    },
    rejected: {
      label: 'Rejected',
      className: 'status-rejected',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
