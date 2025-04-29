import React, { useState } from 'react';
import { Plus, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { renters } from '../../data/mockData';
import RentersList from './RentersList';
import AddRenterModal from './AddRenterModal';
import AnimatedList from '../shared/AnimatedList';
import { fadeIn, slideDown } from '../../utils/motion';
import ViewModeSwitcher from '../shared/ViewModeSwitcher';

const RentersPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRenters = renters.filter(renter => {
    const matchesSearch = renter.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          renter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          renter.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Active' && renter.unitId) ||
      (filterStatus === 'Inactive' && !renter.unitId);

    return matchesSearch && matchesStatus;
  });

  const sortedRenters = [...filteredRenters].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    if (sortBy === 'oldest') return a.id.localeCompare(b.id);
    return 0;
  });

  const statusCount = {
    All: renters.length,
    Active: renters.filter(renter => renter.unitId).length,
    Inactive: renters.filter(renter => !renter.unitId).length,
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        variants={slideDown}
      >
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Renters Management</h2>
          <p className="text-secondary-500">Manage all your renters' information</p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add New Renter</span>
        </button>
      </motion.div>
      
      <motion.div className="dashboard-card" variants={slideDown}>
        <AnimatedList className="flex flex-wrap gap-4 mb-6">
          {Object.entries(statusCount).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors 
                ${filterStatus === status 
                  ? 'bg-primary-100 text-primary-600 border border-primary-200' 
                  : 'bg-white border border-gray-200 text-secondary-500 hover:bg-gray-50'}`}
            >
              <span>{status}</span>
              <span className="ml-2">{count}</span>
            </button>
          ))}
        </AnimatedList>
        
        <div className="flex flex-col gap-4 justify-between mb-6 md:flex-row">
          <div className="relative w-full md:w-64">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex gap-2 items-center">
              <Filter size={18} className="text-secondary-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="room">Room Number</option>
                <option value="date">Move-in Date</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center ml-2">
              <ViewModeSwitcher 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>
        
        <RentersList
          renters={sortedRenters}
          viewMode={viewMode}
        />
      </motion.div>
      
      <AddRenterModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </motion.div>
  );
};

export default RentersPage;