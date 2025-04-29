import React, { useState } from 'react';
import { User, ChevronDown, ChevronUp, Pencil, Trash, MoreHorizontal } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { Unit } from '../../types';
import { renters } from '../../data/mockData';

interface UnitsListProps {
  units: Unit[];
}

const UnitsList: React.FC<UnitsListProps> = ({ units }) => {
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  
  const toggleExpand = (unitId: string) => {
    setExpandedUnitId(expandedUnitId === unitId ? null : unitId);
  };
  
  const getRenterForUnit = (unitId: string) => {
    return renters.find(renter => renter.unitId === unitId);
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Room Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Renter
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {units.map(unit => {
            const renter = getRenterForUnit(unit.id);
            
            return (
              <React.Fragment key={unit.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-secondary-900">#{unit.roomNumber}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-500">{unit.type}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={unit.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {renter ? (
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-3">
                          {renter.avatar ? (
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={renter.avatar}
                              alt={renter.name}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <User size={14} className="text-primary-600" />
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-secondary-900">
                          {renter.name}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">No renter assigned</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-secondary-900">
                      ${unit.price}/month
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-500 hover:text-primary-700">
                        <Pencil size={16} />
                      </button>
                      <button className="text-danger-400 hover:text-danger-500">
                        <Trash size={16} />
                      </button>
                      <button 
                        onClick={() => toggleExpand(unit.id)}
                        className="text-secondary-500 hover:text-secondary-700"
                      >
                        {expandedUnitId === unit.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button className="text-secondary-500 hover:text-secondary-700">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {expandedUnitId === unit.id && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 px-4 py-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-secondary-900 mb-2">Details</h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-secondary-500">Rental Term</p>
                                <p className="text-sm font-medium text-secondary-900">{unit.rentalTerm}</p>
                              </div>
                              <div>
                                <p className="text-xs text-secondary-500">Check-in Date</p>
                                <p className="text-sm font-medium text-secondary-900">
                                  {unit.checkInDate || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-secondary-500">Check-out Date</p>
                                <p className="text-sm font-medium text-secondary-900">
                                  {unit.checkOutDate || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-secondary-500">Services</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {unit.services.map(service => (
                                    <span key={service} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {renter && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-secondary-900 mb-2">Renter Information</h4>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3 mb-3">
                                  {renter.avatar ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={renter.avatar}
                                      alt={renter.name}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                      <User size={18} className="text-primary-600" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-secondary-900">{renter.name}</p>
                                    <p className="text-xs text-secondary-500">ID: {renter.personalId}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-secondary-500">Email</p>
                                    <p className="text-sm text-secondary-900">{renter.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-secondary-500">Phone</p>
                                    <p className="text-sm text-secondary-900">{renter.phone}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-secondary-900 mb-2">Usage Statistics</h4>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 h-[200px] flex items-center justify-center">
                            {unit.status === 'Occupied' ? (
                              <div className="w-full space-y-4">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-secondary-900">Electric Usage</span>
                                    <span className="text-xs font-medium text-secondary-900">{unit.electricUsage} kWh</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-primary-400 h-2 rounded-full" 
                                      style={{ width: `${Math.min(unit.electricUsage || 0, 200) / 2}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-secondary-900">Water Usage</span>
                                    <span className="text-xs font-medium text-secondary-900">{unit.waterUsage} m³</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-primary-400 h-2 rounded-full" 
                                      style={{ width: `${Math.min(unit.waterUsage || 0, 100) / 1}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-secondary-500">No usage data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      
      {units.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-secondary-500">No units match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default UnitsList;