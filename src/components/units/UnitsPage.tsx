import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { units } from '../../data/mockData';
import UnitsList from './UnitsList';
import AddUnitModal from './AddUnitModal';
import StatusBadge from '../shared/StatusBadge';

const UnitsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || unit.status === filterStatus;
    const matchesType = filterType === 'All' || unit.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return a.roomNumber.localeCompare(b.roomNumber);
  });

  const unitStatusCount = {
    All: units.length,
    Occupied: units.filter(unit => unit.status === 'Occupied').length,
    Available: units.filter(unit => unit.status === 'Available').length,
    Reserved: units.filter(unit => unit.status === 'Reserved').length,
    Maintenance: units.filter(unit => unit.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Units Management</h2>
          <p className="text-secondary-500">Manage all your rental units</p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add New Unit</span>
        </button>
      </div>
      
      <div className="dashboard-card">
        <div className="flex flex-wrap gap-4 mb-6">
          {Object.entries(unitStatusCount).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors 
                ${filterStatus === status 
                  ? 'bg-primary-100 text-primary-600 border border-primary-200' 
                  : 'bg-white border border-gray-200 text-secondary-500 hover:bg-gray-50'}`}
            >
              {status !== 'All' && (
                <StatusBadge status={status as any} size="sm" />
              )}
              {status === 'All' && <span>{status}</span>}
              <span className="ml-2">{count}</span>
            </button>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-secondary-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="room-number">Room Number</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        <UnitsList units={sortedUnits} />
      </div>
      
      <AddUnitModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default UnitsPage;