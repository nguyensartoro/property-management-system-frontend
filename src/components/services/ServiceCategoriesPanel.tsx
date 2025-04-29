import React, { useState } from 'react';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { useToastHook } from '../../utils/useToast';

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
}

interface ServiceCategoriesPanelProps {
  expanded: boolean;
  onClose: () => void;
}

const ServiceCategoriesPanel: React.FC<ServiceCategoriesPanelProps> = ({ 
  expanded, 
  onClose 
}) => {
  const toast = useToastHook();
  const [categories, setCategories] = useState<ServiceCategory[]>([
    { id: '1', name: 'Utilities', description: 'Basic utilities like water, electricity, and gas' },
    { id: '2', name: 'Maintenance', description: 'Property upkeep and repairs' },
    { id: '3', name: 'Amenities', description: 'Additional services like internet, cable TV' },
    { id: '4', name: 'Cleaning', description: 'Cleaning and housekeeping services' }
  ]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Error', { description: 'Category name is required' });
      return;
    }

    const newId = `category-${Date.now()}`;
    setCategories([...categories, { id: newId, ...newCategory }]);
    setNewCategory({ name: '', description: '' });
    setIsAddMode(false);
    toast.success('Category Added', { description: `${newCategory.name} has been added` });
  };

  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (!categoryToDelete) return;

    setCategories(categories.filter(cat => cat.id !== id));
    toast.success('Category Deleted', { description: `${categoryToDelete.name} has been removed` });
  };

  const handleUpdateCategory = (id: string, updatedData: { name: string, description: string }) => {
    if (!updatedData.name.trim()) {
      toast.error('Error', { description: 'Category name is required' });
      return;
    }

    setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updatedData } : cat));
    setEditingCategory(null);
    toast.success('Category Updated', { description: `${updatedData.name} has been updated` });
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-30
      ${expanded ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Service Categories</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto h-full pb-20">
        {/* Categories list */}
        <div className="space-y-3 mb-6">
          {categories.map((category) => (
            <div key={category.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              {editingCategory === category.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Category name"
                  />
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                    placeholder="Description (optional)"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setNewCategory({ name: '', description: '' });
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateCategory(category.id, newCategory)}
                      className="px-3 py-1 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-secondary-900 dark:text-white">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-secondary-500 dark:text-gray-400 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category.id);
                          setNewCategory({ 
                            name: category.name, 
                            description: category.description || '' 
                          });
                        }}
                        className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                        aria-label="Edit category"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        aria-label="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new category form */}
        {isAddMode ? (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-medium text-secondary-900 dark:text-white mb-3">Add New Category</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                placeholder="Category name"
              />
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-white"
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsAddMode(false);
                    setNewCategory({ name: '', description: '' });
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-3 py-2 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddMode(true)}
            className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-secondary-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceCategoriesPanel; 