'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Renter {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  roomNumber?: string
  moveInDate: string
}

const mockRenters: Renter[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    status: 'active',
    roomNumber: '101',
    moveInDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    phone: '(555) 987-6543',
    status: 'active',
    roomNumber: '102',
    moveInDate: '2023-03-10',
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    phone: '(555) 234-5678',
    status: 'active',
    roomNumber: '103',
    moveInDate: '2022-11-05',
  },
  {
    id: '4',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    phone: '(555) 876-5432',
    status: 'inactive',
    moveInDate: '2022-05-20',
  },
  {
    id: '5',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    phone: '(555) 345-6789',
    status: 'active',
    roomNumber: '202',
    moveInDate: '2023-02-28',
  },
]

export default function RentersDataTable() {
  const [renters] = useState<Renter[]>(mockRenters)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search renters..."
              className="form-input pl-8"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <select className="form-input">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              <th>Name</th>
              <th>Contact</th>
              <th>Room #</th>
              <th>Move-in Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renters.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No renters found.
                </td>
              </tr>
            ) : (
              renters.map(renter => (
                <tr key={renter.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="font-medium">{renter.name}</td>
                  <td>
                    <div>{renter.email}</div>
                    <div className="text-sm text-gray-500">{renter.phone}</div>
                  </td>
                  <td>{renter.roomNumber || '-'}</td>
                  <td>{new Date(renter.moveInDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status-${renter.status} px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      {renter.status.charAt(0).toUpperCase() + renter.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <Link
                      href={`/dashboard/renters/${renter.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/renters/${renter.id}/edit`}
                      className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => alert(`Delete renter ${renter.name}`)}
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
          Showing {renters.length} of {renters.length} renters
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