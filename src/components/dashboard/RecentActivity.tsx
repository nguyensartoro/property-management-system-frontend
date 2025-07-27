'use client'

import { formatDate } from '@/lib/utils'

interface Activity {
  id: string
  title: string
  description: string
  timestamp: string
  category: 'payment' | 'contract' | 'renter' | 'room' | 'service'
}

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'New Renter',
    description: 'John Smith has signed up as a new renter.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    category: 'renter',
  },
  {
    id: '2',
    title: 'Payment Received',
    description: 'Payment of $950 received from Jane Cooper.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    category: 'payment',
  },
  {
    id: '3',
    title: 'Contract Renewed',
    description: 'Maria Rodriguez renewed her lease for another 12 months.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    category: 'contract',
  },
  {
    id: '4',
    title: 'Room Maintenance',
    description: 'Room 202 has been marked for maintenance.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    category: 'room',
  },
  {
    id: '5',
    title: 'Service Added',
    description: 'New cleaning service added to available services.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    category: 'service',
  },
]

const getCategoryIcon = (category: Activity['category']) => {
  switch (category) {
    case 'payment':
      return '💰'
    case 'contract':
      return '📄'
    case 'renter':
      return '👤'
    case 'room':
      return '🏠'
    case 'service':
      return '🔧'
    default:
      return '📌'
  }
}

const RecentActivity: React.FC = () => {
  return (
    <div>
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="py-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-2xl">{getCategoryIcon(activity.category)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(activity.timestamp, { timeStyle: 'short' })}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivity 