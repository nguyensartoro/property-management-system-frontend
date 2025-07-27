'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string
  icon: string
  fee: number
  feeType: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Cleaning Service',
    description: 'Weekly cleaning of common areas and rooms',
    icon: '🧹',
    fee: 50,
    feeType: 'MONTHLY',
  },
  {
    id: '2',
    name: 'Laundry Service',
    description: 'Access to on-site laundry facilities',
    icon: '🧺',
    fee: 20,
    feeType: 'MONTHLY',
  },
  {
    id: '3',
    name: 'Internet',
    description: 'High-speed WiFi throughout the property',
    icon: '📡',
    fee: 25,
    feeType: 'MONTHLY',
  },
  {
    id: '4',
    name: 'Room Setup',
    description: 'Initial room setup and furnishing',
    icon: '🛏️',
    fee: 150,
    feeType: 'ONE_TIME',
  },
  {
    id: '5',
    name: 'Parking',
    description: 'Reserved parking space',
    icon: '🅿️',
    fee: 75,
    feeType: 'MONTHLY',
  },
  {
    id: '6',
    name: 'Maintenance Package',
    description: 'Annual maintenance and repairs',
    icon: '🔧',
    fee: 300,
    feeType: 'YEARLY',
  },
]

export default function ServicesDataTable() {
  const [services] = useState<Service[]>(mockServices)
  
  const getFeeTypeLabel = (feeType: Service['feeType']) => {
    switch (feeType) {
      case 'ONE_TIME':
        return 'One-time'
      case 'MONTHLY':
        return 'Monthly'
      case 'YEARLY':
        return 'Yearly'
      default:
        return feeType
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              className="form-input pl-8"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <select className="form-input">
            <option value="all">All Fee Types</option>
            <option value="ONE_TIME">One-time</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
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
              <th>Service</th>
              <th>Description</th>
              <th>Fee</th>
              <th>Type</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No services found.
                </td>
              </tr>
            ) : (
              services.map(service => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={service.name}>
                      {service.icon}
                    </span>
                    <span className="font-medium">{service.name}</span>
                  </td>
                  <td>{service.description}</td>
                  <td>{formatCurrency(service.fee)}</td>
                  <td>{getFeeTypeLabel(service.feeType)}</td>
                  <td className="text-right space-x-2">
                    <Link
                      href={`/dashboard/services/${service.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/services/${service.id}/edit`}
                      className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => alert(`Delete service ${service.name}`)}
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
          Showing {services.length} of {services.length} services
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