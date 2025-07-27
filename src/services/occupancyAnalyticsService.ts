import { Contract, Room, Property } from '../utils/apiClient';

export interface OccupancyMetrics {
  currentOccupancyRate: number;
  averageOccupancyRate: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyTrend: 'increasing' | 'decreasing' | 'stable';
  turnoverRate: number;
  averageLeaseLength: number;
}

export interface SeasonalPatterns {
  monthlyOccupancy: { month: string; occupancyRate: number; unitsOccupied: number; totalUnits: number }[];
  seasonalTrends: { season: string; avgOccupancy: number; trend: 'peak' | 'low' | 'normal' }[];
  bestPerformingMonths: string[];
  worstPerformingMonths: string[];
  seasonalFactors: number[];
}

export interface OccupancyForecasting {
  predictedOccupancy: { month: string; predicted: number; confidence: number }[];
  demandPrediction: { month: string; expectedDemand: number; marketFactors: string[] }[];
  vacancyRisk: { roomId: string; riskScore: number; factors: string[] }[];
  optimalPricing: { roomId: string; suggestedRent: number; marketRate: number; occupancyImpact: number }[];
}

export interface MarketComparison {
  marketOccupancyRate: number;
  competitorAnalysis: { competitor: string; occupancyRate: number; avgRent: number }[];
  marketPosition: 'above_market' | 'at_market' | 'below_market';
  pricingRecommendations: { roomId: string; currentRent: number; marketRent: number; recommendation: string }[];
}

export class OccupancyAnalyticsService {
  /**
   * Fetch advanced occupancy analytics from backend
   */
  static async fetchOccupancyAnalytics(propertyId?: string, months: number = 12) {
    try {
      const params = new URLSearchParams();
      if (propertyId) params.append('propertyId', propertyId);
      params.append('months', months.toString());

      const response = await fetch(`/api/v1/reports/occupancy-analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch occupancy analytics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching occupancy analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive occupancy metrics
   */
  static calculateOccupancyMetrics(
    contracts: Contract[],
    rooms: Room[],
    properties: Property[]
  ): OccupancyMetrics {
    const totalUnits = rooms.length;
    const activeContracts = contracts.filter(c => 
      c.status === 'ACTIVE' && 
      (!c.endDate || new Date(c.endDate) > new Date())
    );
    
    const occupiedUnits = activeContracts.length;
    const vacantUnits = totalUnits - occupiedUnits;
    const currentOccupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Calculate historical occupancy for trend analysis
    const historicalOccupancy = this.calculateHistoricalOccupancy(contracts, rooms);
    const averageOccupancyRate = historicalOccupancy.length > 0
      ? historicalOccupancy.reduce((sum, h) => sum + h.occupancyRate, 0) / historicalOccupancy.length
      : currentOccupancyRate;

    // Determine trend
    const recentOccupancy = historicalOccupancy.slice(-3);
    const olderOccupancy = historicalOccupancy.slice(-6, -3);
    
    const recentAvg = recentOccupancy.length > 0 
      ? recentOccupancy.reduce((sum, h) => sum + h.occupancyRate, 0) / recentOccupancy.length 
      : currentOccupancyRate;
    const olderAvg = olderOccupancy.length > 0 
      ? olderOccupancy.reduce((sum, h) => sum + h.occupancyRate, 0) / olderOccupancy.length 
      : recentAvg;

    const occupancyTrend = recentAvg > olderAvg * 1.05 ? 'increasing' 
      : recentAvg < olderAvg * 0.95 ? 'decreasing' 
      : 'stable';

    // Calculate turnover rate
    const completedContracts = contracts.filter(c => 
      c.status === 'COMPLETED' || 
      (c.endDate && new Date(c.endDate) < new Date())
    );
    const turnoverRate = totalUnits > 0 ? (completedContracts.length / totalUnits) * 100 : 0;

    // Calculate average lease length
    const leaseLengths = completedContracts
      .filter(c => c.startDate && c.endDate)
      .map(c => {
        const start = new Date(c.startDate!);
        const end = new Date(c.endDate!);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30); // months
      });
    
    const averageLeaseLength = leaseLengths.length > 0
      ? leaseLengths.reduce((sum, length) => sum + length, 0) / leaseLengths.length
      : 12; // default to 12 months

    return {
      currentOccupancyRate,
      averageOccupancyRate,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyTrend,
      turnoverRate,
      averageLeaseLength,
    };
  }

  /**
   * Analyze seasonal occupancy patterns
   */
  static analyzeSeasonalPatterns(
    contracts: Contract[],
    rooms: Room[]
  ): SeasonalPatterns {
    const monthlyData = this.calculateMonthlyOccupancy(contracts, rooms);
    
    // Group by seasons
    const seasonalData = {
      Spring: monthlyData.filter(m => ['03', '04', '05'].includes(m.month.slice(-2))),
      Summer: monthlyData.filter(m => ['06', '07', '08'].includes(m.month.slice(-2))),
      Fall: monthlyData.filter(m => ['09', '10', '11'].includes(m.month.slice(-2))),
      Winter: monthlyData.filter(m => ['12', '01', '02'].includes(m.month.slice(-2))),
    };

    const seasonalTrends = Object.entries(seasonalData).map(([season, data]) => {
      const avgOccupancy = data.length > 0 
        ? data.reduce((sum, d) => sum + d.occupancyRate, 0) / data.length 
        : 0;
      
      const overallAvg = monthlyData.reduce((sum, d) => sum + d.occupancyRate, 0) / monthlyData.length;
      const trend = avgOccupancy > overallAvg * 1.1 ? 'peak' 
        : avgOccupancy < overallAvg * 0.9 ? 'low' 
        : 'normal';

      return { season, avgOccupancy, trend };
    });

    // Find best and worst performing months
    const sortedMonths = [...monthlyData].sort((a, b) => b.occupancyRate - a.occupancyRate);
    const bestPerformingMonths = sortedMonths.slice(0, 3).map(m => m.month);
    const worstPerformingMonths = sortedMonths.slice(-3).map(m => m.month);

    // Calculate seasonal factors
    const overallAvg = monthlyData.reduce((sum, d) => sum + d.occupancyRate, 0) / monthlyData.length;
    const seasonalFactors = monthlyData.map(m => 
      overallAvg > 0 ? m.occupancyRate / overallAvg : 1
    );

    return {
      monthlyOccupancy: monthlyData,
      seasonalTrends,
      bestPerformingMonths,
      worstPerformingMonths,
      seasonalFactors,
    };
  }

  /**
   * Generate occupancy forecasting and predictions
   */
  static generateOccupancyForecasting(
    contracts: Contract[],
    rooms: Room[],
    forecastMonths: number = 12
  ): OccupancyForecasting {
    const historicalData = this.calculateMonthlyOccupancy(contracts, rooms);
    
    // Simple trend-based prediction
    const predictedOccupancy = this.predictOccupancyTrend(historicalData, forecastMonths);
    
    // Demand prediction based on historical patterns
    const demandPrediction = this.predictDemandPatterns(contracts, forecastMonths);
    
    // Vacancy risk assessment
    const vacancyRisk = this.assessVacancyRisk(contracts, rooms);
    
    // Optimal pricing suggestions
    const optimalPricing = this.calculateOptimalPricing(contracts, rooms);

    return {
      predictedOccupancy,
      demandPrediction,
      vacancyRisk,
      optimalPricing,
    };
  }

  /**
   * Compare with market benchmarks
   */
  static analyzeMarketComparison(
    contracts: Contract[],
    rooms: Room[],
    marketData?: { occupancyRate: number; avgRent: number }
  ): MarketComparison {
    const currentOccupancy = this.calculateOccupancyMetrics(contracts, rooms, []).currentOccupancyRate;
    
    // Default market data (would come from external API in production)
    const marketOccupancyRate = marketData?.occupancyRate || 85;
    const marketAvgRent = marketData?.avgRent || 1200;

    // Mock competitor data (would come from market research API)
    const competitorAnalysis = [
      { competitor: 'Property A', occupancyRate: 88, avgRent: 1150 },
      { competitor: 'Property B', occupancyRate: 82, avgRent: 1300 },
      { competitor: 'Property C', occupancyRate: 90, avgRent: 1100 },
    ];

    const marketPosition = currentOccupancy > marketOccupancyRate * 1.05 ? 'above_market'
      : currentOccupancy < marketOccupancyRate * 0.95 ? 'below_market'
      : 'at_market';

    // Generate pricing recommendations
    const pricingRecommendations = rooms.map(room => {
      const roomContract = contracts.find(c => c.roomId === room.id && c.status === 'ACTIVE');
      const currentRent = roomContract?.monthlyRent || 0;
      
      let recommendation = 'Maintain current pricing';
      if (currentOccupancy < marketOccupancyRate * 0.9) {
        recommendation = 'Consider reducing rent to improve occupancy';
      } else if (currentOccupancy > marketOccupancyRate * 1.1) {
        recommendation = 'Opportunity to increase rent';
      }

      return {
        roomId: room.id,
        currentRent,
        marketRent: marketAvgRent,
        recommendation,
      };
    });

    return {
      marketOccupancyRate,
      competitorAnalysis,
      marketPosition,
      pricingRecommendations,
    };
  }

  // Helper methods
  private static calculateHistoricalOccupancy(contracts: Contract[], rooms: Room[]) {
    const monthlyData: { month: string; occupancyRate: number }[] = [];
    const totalUnits = rooms.length;
    
    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().slice(0, 7);
      
      const occupiedUnits = contracts.filter(c => {
        const startDate = c.startDate ? new Date(c.startDate) : null;
        const endDate = c.endDate ? new Date(c.endDate) : null;
        const monthDate = new Date(month + '-01');
        
        return startDate && startDate <= monthDate && 
               (!endDate || endDate >= monthDate);
      }).length;
      
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      monthlyData.push({ month, occupancyRate });
    }
    
    return monthlyData;
  }

  private static calculateMonthlyOccupancy(contracts: Contract[], rooms: Room[]) {
    const totalUnits = rooms.length;
    const monthlyData: { month: string; occupancyRate: number; unitsOccupied: number; totalUnits: number }[] = [];
    
    // Get last 24 months for better seasonal analysis
    for (let i = 23; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().slice(0, 7);
      
      const occupiedUnits = contracts.filter(c => {
        const startDate = c.startDate ? new Date(c.startDate) : null;
        const endDate = c.endDate ? new Date(c.endDate) : null;
        const monthDate = new Date(month + '-01');
        
        return startDate && startDate <= monthDate && 
               (!endDate || endDate >= monthDate);
      }).length;
      
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      monthlyData.push({ 
        month, 
        occupancyRate, 
        unitsOccupied: occupiedUnits, 
        totalUnits 
      });
    }
    
    return monthlyData;
  }

  private static predictOccupancyTrend(
    historicalData: { month: string; occupancyRate: number }[],
    forecastMonths: number
  ) {
    if (historicalData.length < 3) {
      return Array.from({ length: forecastMonths }, (_, i) => {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + i + 1);
        return {
          month: futureDate.toISOString().slice(0, 7),
          predicted: 85, // default
          confidence: 0.5,
        };
      });
    }

    // Simple linear regression
    const n = historicalData.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = historicalData.map(d => d.occupancyRate);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return Array.from({ length: forecastMonths }, (_, i) => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i + 1);
      const predicted = Math.max(0, Math.min(100, slope * (n + i + 1) + intercept));
      const confidence = Math.max(0.3, 1 - (i * 0.1)); // Decreasing confidence over time
      
      return {
        month: futureDate.toISOString().slice(0, 7),
        predicted,
        confidence,
      };
    });
  }

  private static predictDemandPatterns(contracts: Contract[], forecastMonths: number) {
    // Analyze historical move-in patterns
    const moveInPatterns = contracts
      .filter(c => c.startDate)
      .reduce((acc, c) => {
        const month = c.startDate!.slice(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const avgDemand = Object.values(moveInPatterns).reduce((sum, count) => sum + count, 0) / 
                     Math.max(1, Object.keys(moveInPatterns).length);

    return Array.from({ length: forecastMonths }, (_, i) => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i + 1);
      const month = futureDate.toISOString().slice(0, 7);
      
      // Apply seasonal factors (simplified)
      const monthIndex = futureDate.getMonth();
      const seasonalMultiplier = [0.8, 0.9, 1.2, 1.3, 1.4, 1.1, 1.0, 1.1, 1.3, 1.2, 0.9, 0.8][monthIndex];
      
      return {
        month,
        expectedDemand: Math.round(avgDemand * seasonalMultiplier),
        marketFactors: this.getMarketFactors(monthIndex),
      };
    });
  }

  private static assessVacancyRisk(contracts: Contract[], rooms: Room[]) {
    return rooms.map(room => {
      const currentContract = contracts.find(c => c.roomId === room.id && c.status === 'ACTIVE');
      let riskScore = 0;
      const factors: string[] = [];

      if (!currentContract) {
        riskScore += 50;
        factors.push('Currently vacant');
      } else {
        // Check lease expiration
        if (currentContract.endDate) {
          const daysUntilExpiration = Math.ceil(
            (new Date(currentContract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiration < 30) {
            riskScore += 40;
            factors.push('Lease expires soon');
          } else if (daysUntilExpiration < 90) {
            riskScore += 20;
            factors.push('Lease expires in 3 months');
          }
        }

        // Check payment history (simplified)
        riskScore += Math.random() * 20; // Would use actual payment data
        if (riskScore > 30) factors.push('Payment concerns');
      }

      // Market factors
      if (Math.random() > 0.7) {
        riskScore += 15;
        factors.push('High market competition');
      }

      return {
        roomId: room.id,
        riskScore: Math.min(100, riskScore),
        factors,
      };
    });
  }

  private static calculateOptimalPricing(contracts: Contract[], rooms: Room[]) {
    return rooms.map(room => {
      const currentContract = contracts.find(c => c.roomId === room.id && c.status === 'ACTIVE');
      const currentRent = currentContract?.monthlyRent || 0;
      
      // Simplified market rate calculation
      const marketRate = 1200 + (Math.random() - 0.5) * 400;
      
      // Calculate occupancy impact of price changes
      const occupancyImpact = currentRent > marketRate ? -10 : 
                             currentRent < marketRate * 0.9 ? 15 : 0;
      
      const suggestedRent = Math.round(marketRate * 0.95); // Slightly below market for competitiveness

      return {
        roomId: room.id,
        suggestedRent,
        marketRate,
        occupancyImpact,
      };
    });
  }

  private static getMarketFactors(monthIndex: number): string[] {
    const factors = [
      ['Post-holiday slowdown', 'Winter weather'],
      ['Tax season', 'Winter weather'],
      ['Spring market pickup', 'College graduations'],
      ['Spring market peak', 'Job relocations'],
      ['Peak moving season', 'College graduations'],
      ['Summer relocations', 'Family moves'],
      ['Summer peak', 'Vacation season'],
      ['Back-to-school', 'Student housing demand'],
      ['Fall market', 'Job relocations'],
      ['Fall peak', 'Holiday preparations'],
      ['Pre-holiday slowdown', 'Weather concerns'],
      ['Holiday season', 'Year-end moves'],
    ];
    
    return factors[monthIndex] || ['Seasonal patterns'];
  }
}