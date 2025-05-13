import React from 'react';
// @ts-expect-error: lucide-react icons are not typed in this version
import Edit from 'lucide-react/dist/esm/icons/edit';
// @ts-expect-error: lucide-react icons are not typed in this version
import View from 'lucide-react/dist/esm/icons/view';

export interface ActionCardProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
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

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmProps) => {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/50">
      <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold text-secondary-900 dark:text-gray-100">Confirm Deletion</h3>
        <p className="mb-6 text-secondary-700 dark:text-gray-300">
          Are you sure you want to delete this {itemName}? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-secondary-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
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
  icon,
  children,
  onView,
  onEdit,
  onDelete,
  className = '',
}: ActionCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const titleString = typeof title === 'string' ? title : 'Item';

  return (
    <>
      <div className={`overflow-hidden bg-white rounded-lg border border-gray-200 transition-all dark:border-gray-700 dark:bg-gray-800 hover:shadow-md ${className}`}>
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 transition-colors dark:border-gray-700 dark:bg-gray-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
          <div className="flex gap-2 items-center">
            {icon && <span>{icon}</span>}
            <span className="font-medium text-secondary-900 dark:text-gray-100">{title}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 items-center min-w-[72px]">
            {/* View Action */}
            <button
              onClick={onView}
              disabled={!onView}
              className={`p-1.5 transition-colors flex items-center justify-center rounded-md
                ${onView ? 'text-secondary-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer' : 'text-secondary-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`}
              aria-label="View"
              title="View"
              type="button"
            >
              <View size={18} />
            </button>
            {/* Edit Action */}
            <button
              onClick={onEdit}
              disabled={!onEdit}
              className={`p-1.5 transition-colors flex items-center justify-center rounded-md
                ${onEdit ? 'text-secondary-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer' : 'text-secondary-300 dark:text-gray-600 cursor-not-allowed opacity-50'}`}
              aria-label="Edit"
              title="Edit"
              type="button"
            >
              <Edit size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 dark:text-gray-200">{children}</div>
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