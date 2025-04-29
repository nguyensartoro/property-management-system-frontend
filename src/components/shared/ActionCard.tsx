import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

type CardAction = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'primary';
};

export interface ActionCardProps {
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: CardAction[];
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-secondary-900 mb-4">Confirm Deletion</h3>
        <p className="text-secondary-700 mb-6">
          Are you sure you want to delete this {itemName}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-md text-secondary-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  actions = [],
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const defaultActions = [
    ...(onView
      ? [
          {
            icon: <Eye size={18} />,
            label: 'View',
            onClick: onView,
            variant: 'default' as const,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            icon: <Edit size={18} />,
            label: 'Edit',
            onClick: onEdit,
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            icon: <Trash2 size={18} />,
            label: 'Delete',
            onClick: () => setShowDeleteConfirm(true),
            variant: 'danger' as const,
          },
        ]
      : []),
    ...actions,
  ];

  const titleString = typeof title === 'string' ? title : 'Item';

  return (
    <>
      <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all ${className}`}>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center group-hover:bg-primary-50 transition-colors">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary-500">{icon}</span>}
            <div>
              <span className="font-medium text-secondary-900">{title}</span>
              {subtitle && <p className="text-xs text-secondary-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center">
            {defaultActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`p-1.5 transition-colors ${
                  action.variant === 'danger'
                    ? 'text-secondary-500 hover:text-danger-500'
                    : action.variant === 'primary'
                    ? 'text-secondary-500 hover:text-primary-500'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                aria-label={action.label}
                title={action.label}
              >
                {action.icon}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>

      <DeleteConfirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete && onDelete()}
        itemName={typeof title === 'string' ? title : titleString}
      />
    </>
  );
};

export default ActionCard; 