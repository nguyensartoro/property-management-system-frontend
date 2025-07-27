'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Room {
  id: string
  number: string
  floor: string
  type: string
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  capacity: number
  price: number
}

const mockRooms: Room[] = [
  { id: '1', number: '101', floor: '1', type: 'Single', status: 'available', capacity: 1, price: 500 },
  { id: '2', number: '102', floor: '1', type: 'Double', status: 'occupied', capacity: 2, price: 750 },
  { id: '3', number: '103', floor: '1', type: 'Studio', status: 'reserved', capacity: 2, price: 850 },
  { id: '4', number: '201', floor: '2', type: 'Suite', status: 'maintenance', capacity: 3, price: 1200 },
  { id: '5', number: '202', floor: '2', type: 'Single', status: 'available', capacity: 1, price: 550 },
]

export default function RoomsDataTable() {
  const [rooms] = useState<Room[]>(mockRooms)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search rooms..."
              className="form-input pl-8"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <select className="form-input">
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-2 py-1 border rounded" title="Grid view">
            📊
          </button>
          <button className="px-2 py-1 border rounded" title="List view">
            📋
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Room #</th>
              <th>Floor</th>
              <th>Type</th>
              <th>Status</th>
              <th>Capacity</th>
              <th>Price</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No rooms found.
                </td>
              </tr>
            ) : (
              rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td>{room.number}</td>
                  <td>{room.floor}</td>
                  <td>{room.type}</td>
                  <td>
                    <span className={`status-${room.status} px-2 py-1 rounded-full text-xs font-medium`}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                  </td>
                  <td>{room.capacity}</td>
                  <td>${room.price}/month</td>
                  <td className="text-right space-x-2">
                    <Link 
                      href={`/dashboard/rooms/${room.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <Link 
                      href={`/dashboard/rooms/${room.id}/edit`}
                      className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => alert(`Delete room ${room.number}`)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {rooms.length} of {rooms.length} rooms
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
} 