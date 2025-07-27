'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
  trendPeriod: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  trendPeriod,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className="mt-2 flex items-center">
        {trend === 'up' ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : trend === 'down' ? (
          <TrendingDown className="h-4 w-4 text-red-500" />
        ) : null}
        <p
          className={`ml-1 text-xs ${
            trend === 'up'
              ? 'text-green-500'
              : trend === 'down'
              ? 'text-red-500'
              : 'text-gray-500'
          }`}
        >
          {trendValue} {trendPeriod}
        </p>
      </div>
    </div>
  )
}

export default StatsCard 