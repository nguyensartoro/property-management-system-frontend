'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Contract {
  id: string
  type: 'long-term' | 'short-term'
  roomNumber: string
  renterName: string
  startDate: string
  endDate: string
  amount: number
  status: 'active' | 'expired' | 'terminated' | 'pending'
}

const mockContracts: Contract[] = [
  {
    id: '1',
    type: 'long-term',
    roomNumber: '101',
    renterName: 'John Smith',
    startDate: '2023-01-15',
    endDate: '2024-01-14',
    amount: 500,
    status: 'active',
  },
  {
    id: '2',
    type: 'long-term',
    roomNumber: '102',
    renterName: 'Jane Cooper',
    startDate: '2023-03-10',
    endDate: '2024-03-09',
    amount: 750,
    status: 'active',
  },
  {
    id: '3',
    type: 'long-term',
    roomNumber: '103',
    renterName: 'Maria Rodriguez',
    startDate: '2022-11-05',
    endDate: '2023-11-04',
    amount: 850,
    status: 'active',
  },
  {
    id: '4',
    type: 'short-term',
    roomNumber: '201',
    renterName: 'Alex Johnson',
    startDate: '2023-06-01',
    endDate: '2023-06-15',
    amount: 1200,
    status: 'pending',
  },
  {
    id: '5',
    type: 'long-term',
    roomNumber: '202',
    renterName: 'Emily Chen',
    startDate: '2022-08-15',
    endDate: '2023-08-14',
    amount: 550,
    status: 'expired',
  },
]

export default function ContractsDataTable() {
  const [contracts] = useState<Contract[]>(mockContracts)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contracts..."
              className="form-input pl-8"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <select className="form-input">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
            <option value="pending">Pending</option>
          </select>
          <select className="form-input">
            <option value="all">All Types</option>
            <option value="long-term">Long Term</option>
            <option value="short-term">Short Term</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Renter</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No contracts found.
                </td>
              </tr>
            ) : (
              contracts.map(contract => (
                <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td>{contract.roomNumber}</td>
                  <td>{contract.renterName}</td>
                  <td className="capitalize">{contract.type.replace('-', ' ')}</td>
                  <td>{formatDate(contract.startDate)}</td>
                  <td>{formatDate(contract.endDate)}</td>
                  <td>${contract.amount}/month</td>
                  <td>
                    <span
                      className={`status-${contract.status === 'active' ? 'active' : 
                                           contract.status === 'pending' ? 'reserved' : 
                                           contract.status === 'expired' ? 'maintenance' : 
                                           'inactive'} 
                                 px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <Link
                      href={`/dashboard/contracts/${contract.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/contracts/${contract.id}/edit`}
                      className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => alert(`Terminate contract for ${contract.renterName}`)}
                    >
                      Terminate
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
          Showing {contracts.length} of {contracts.length} contracts
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