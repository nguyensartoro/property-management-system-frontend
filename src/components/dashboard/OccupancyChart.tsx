'use client'

import React from 'react';

const OccupancyChart: React.FC = () => {
  // Mock data for now - would be replaced with real API data
  const totalRooms = 24;
  const occupied = 18;
  const reserved = 3;
  const maintenance = 1;
  const available = totalRooms - occupied - reserved - maintenance;
  
  const percentOccupied = Math.round((occupied / totalRooms) * 100);

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Room Occupancy</h3>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{percentOccupied}%</span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Occupancy Rate</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {occupied}/{totalRooms} rooms occupied
        </div>
      </div>
      
      {/* Simple chart visualization */}
      <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <div className="flex h-full">
          <div 
            className="bg-blue-500 h-full"
            style={{ width: `${(occupied / totalRooms) * 100}%` }}
            title={`Occupied: ${occupied} rooms`}
          />
          <div 
            className="bg-amber-500 h-full"
            style={{ width: `${(reserved / totalRooms) * 100}%` }}
            title={`Reserved: ${reserved} rooms`}
          />
          <div 
            className="bg-red-500 h-full"
            style={{ width: `${(maintenance / totalRooms) * 100}%` }}
            title={`Maintenance: ${maintenance} rooms`}
          />
          <div 
            className="bg-green-500 h-full"
            style={{ width: `${(available / totalRooms) * 100}%` }}
            title={`Available: ${available} rooms`}
          />
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Occupied ({occupied})</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Reserved ({reserved})</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Maintenance ({maintenance})</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Available ({available})</span>
        </div>
      </div>
    </div>
  );
}

export default OccupancyChart; 