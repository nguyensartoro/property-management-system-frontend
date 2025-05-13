import { gql } from "@apollo/client";

export const GET_ANALYTICS_DATA = gql`
  query GetAnalyticsData($timeRange: String!) {
    analytics(timeRange: $timeRange) {
      monthlyData {
        month
        revenue
        expense
        profit
      }
      statistics {
        totalRooms
        occupiedRooms
        availableRooms
        totalRenters
        monthlyIncome
        overduePayments
      }
      occupancyTrends {
        month
        rate
        growth
      }
      topRooms {
        room
        revenue
        occupancy
      }
    }
  }
`; 