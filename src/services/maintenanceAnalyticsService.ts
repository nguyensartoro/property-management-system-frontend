import { MaintenanceRequest, Expense, Property } from '../utils/apiClient';

export interface MaintenanceMetrics {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  averageResolutionTime: number;
  totalMaintenanceCost: number;
  averageCostPerRequest: number;
  requestTrend: 'increasing' | 'decreasing' | 'stable';
  costTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface MaintenanceCostTracking {
  monthlySpending: { month: string; amount: number; requestCount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number; requestCount: number }[];
  propertyComparison: { propertyId: string; totalCost: number; avgCostPerUnit: number; requestCount: number }[];
  costTrends: { period: string; preventive: number; reactive: number; emergency: number }[];
}

export interface VendorPerformance {
  vendorMetrics: {
    vendorId: string;
    vendorName: string;
    totalJobs: number;
    completedJobs: number;
    averageRating: number;
    averageResponseTime: number;
    averageCost: number;
    onTimePercentage: number;
    qualityScore: number;
  }[];
  topPerformers: string[];
  underPerformers: string[];
  costEfficiencyRanking: { vendorId: string; costEfficiency: number }[];
  reliabilityRanking: { vendorId: string; reliability: number }[];
}

export interface PredictiveAnalytics {
  maintenanceForecasting: {
    month: string;
    predictedRequests: number;
    predictedCost: number;
    confidence: number;
    riskFactors: string[];
  }[];
  equipmentLifecycle: {
    equipmentType: string;
    averageLifespan: number;
    replacementSchedule: { propertyId: string; equipmentId: string; expectedReplacement: string }[];
    maintenanceSchedule: { propertyId: string; equipmentId: string; nextMaintenance: string; type: string }[];
  }[];
  preventiveRecommendations: {
    propertyId: string;
    recommendations: {
      type: string;
      priority: 'high' | 'medium' | 'low';
      estimatedCost: number;
      potentialSavings: number;
      description: string;
    }[];
  }[];
  riskAssessment: {
    propertyId: string;
    riskScore: number;
    riskFactors: string[];
    recommendedActions: string[];
  }[];
}

export interface MaintenanceEfficiency {
  responseTimeMetrics: {
    category: string;
    averageResponseTime: number;
    targetResponseTime: number;
    performance: 'excellent' | 'good' | 'needs_improvement';
  }[];
  resolutionMetrics: {
    category: string;
    averageResolutionTime: number;
    firstTimeFixRate: number;
    escalationRate: number;
  }[];
  costEfficiency: {
    category: string;
    averageCost: number;
    benchmarkCost: number;
    efficiency: 'above_benchmark' | 'at_benchmark' | 'below_benchmark';
  }[];
  tenantSatisfaction: {
    category: string;
    averageRating: number;
    responseRate: number;
    commonComplaints: string[];
  }[];
}

export class MaintenanceAnalyticsService {
  /**
   * Fetch advanced maintenance analytics from backend
   */
  static async fetchMaintenanceAnalytics(propertyId?: string, months: number = 12) {
    try {
      const params = new URLSearchParams();
      if (propertyId) params.append('propertyId', propertyId);
      params.append('months', months.toString());

      const response = await fetch(`/api/v1/reports/maintenance-analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch maintenance analytics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching maintenance analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive maintenance metrics
   */
  static calculateMaintenanceMetrics(
    maintenanceRequests: MaintenanceRequest[],
    maintenanceExpenses: Expense[]
  ): MaintenanceMetrics {
    const totalRequests = maintenanceRequests.length;
    const completedRequests = maintenanceRequests.filter(r => r.status === 'COMPLETED').length;
    const pendingRequests = maintenanceRequests.filter(r => 
      ['PENDING', 'IN_PROGRESS', 'ASSIGNED'].includes(r.status)
    ).length;

    // Calculate average resolution time
    const completedWithDates = maintenanceRequests.filter(r => 
      r.status === 'COMPLETED' && r.createdAt && r.completedAt
    );
    
    const resolutionTimes = completedWithDates.map(r => {
      const created = new Date(r.createdAt!);
      const completed = new Date(r.completedAt!);
      return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
    });

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    // Calculate maintenance costs
    const totalMaintenanceCost = maintenanceExpenses
      .filter(e => e.category === 'MAINTENANCE')
      .reduce((sum, e) => sum + e.amount, 0);

    const averageCostPerRequest = totalRequests > 0 ? totalMaintenanceCost / totalRequests : 0;

    // Calculate trends (simplified - would need historical data)
    const recentRequests = maintenanceRequests.filter(r => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(r.createdAt || '') > thirtyDaysAgo;
    }).length;

    const olderRequests = maintenanceRequests.filter(r => {
      const sixtyDaysAgo = new Date();
      const thirtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const requestDate = new Date(r.createdAt || '');
      return requestDate > sixtyDaysAgo && requestDate <= thirtyDaysAgo;
    }).length;

    const requestTrend = recentRequests > olderRequests * 1.1 ? 'increasing'
      : recentRequests < olderRequests * 0.9 ? 'decreasing'
      : 'stable';

    // Similar calculation for cost trend
    const recentCosts = maintenanceExpenses.filter(e => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(e.date) > thirtyDaysAgo && e.category === 'MAINTENANCE';
    }).reduce((sum, e) => sum + e.amount, 0);

    const olderCosts = maintenanceExpenses.filter(e => {
      const sixtyDaysAgo = new Date();
      const thirtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const expenseDate = new Date(e.date);
      return expenseDate > sixtyDaysAgo && expenseDate <= thirtyDaysAgo && e.category === 'MAINTENANCE';
    }).reduce((sum, e) => sum + e.amount, 0);

    const costTrend = recentCosts > olderCosts * 1.1 ? 'increasing'
      : recentCosts < olderCosts * 0.9 ? 'decreasing'
      : 'stable';

    return {
      totalRequests,
      completedRequests,
      pendingRequests,
      averageResolutionTime,
      totalMaintenanceCost,
      averageCostPerRequest,
      requestTrend,
      costTrend,
    };
  }

  /**
   * Track maintenance costs and spending patterns
   */
  static trackMaintenanceCosts(
    maintenanceRequests: MaintenanceRequest[],
    maintenanceExpenses: Expense[],
    properties: Property[]
  ): MaintenanceCostTracking {
    // Monthly spending analysis
    const monthlySpending = this.calculateMonthlySpending(maintenanceExpenses);

    // Category breakdown
    const categoryBreakdown = this.analyzeCategoryBreakdown(maintenanceRequests, maintenanceExpenses);

    // Property comparison
    const propertyComparison = this.comparePropertyCosts(maintenanceRequests, maintenanceExpenses, properties);

    // Cost trends by type
    const costTrends = this.analyzeCostTrends(maintenanceExpenses);

    return {
      monthlySpending,
      categoryBreakdown,
      propertyComparison,
      costTrends,
    };
  }

  /**
   * Analyze vendor performance metrics
   */
  static analyzeVendorPerformance(
    maintenanceRequests: MaintenanceRequest[]
  ): VendorPerformance {
    // Group requests by vendor (assuming vendorId exists in maintenance requests)
    const vendorGroups = maintenanceRequests.reduce((acc, request) => {
      const vendorId = (request as any).vendorId || 'internal';
      if (!acc[vendorId]) {
        acc[vendorId] = [];
      }
      acc[vendorId].push(request);
      return acc;
    }, {} as Record<string, MaintenanceRequest[]>);

    const vendorMetrics = Object.entries(vendorGroups).map(([vendorId, requests]) => {
      const totalJobs = requests.length;
      const completedJobs = requests.filter(r => r.status === 'COMPLETED').length;
      
      // Calculate average rating (assuming rating exists)
      const ratingsRequests = requests.filter(r => (r as any).rating);
      const averageRating = ratingsRequests.length > 0
        ? ratingsRequests.reduce((sum, r) => sum + ((r as any).rating || 0), 0) / ratingsRequests.length
        : 0;

      // Calculate response time
      const responseTimeRequests = requests.filter(r => r.createdAt && (r as any).assignedAt);
      const responseTimes = responseTimeRequests.map(r => {
        const created = new Date(r.createdAt!);
        const assigned = new Date((r as any).assignedAt);
        return (assigned.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      // Calculate average cost (would need to link with expenses)
      const averageCost = 150 + Math.random() * 300; // Mock data

      // Calculate on-time percentage
      const onTimeJobs = requests.filter(r => {
        if (!r.completedAt || !(r as any).dueDate) return false;
        return new Date(r.completedAt) <= new Date((r as any).dueDate);
      }).length;
      const onTimePercentage = totalJobs > 0 ? (onTimeJobs / totalJobs) * 100 : 0;

      // Quality score (composite metric)
      const qualityScore = (averageRating * 20) + (onTimePercentage * 0.4) + 
                          (completedJobs / totalJobs * 40);

      return {
        vendorId,
        vendorName: this.getVendorName(vendorId),
        totalJobs,
        completedJobs,
        averageRating,
        averageResponseTime,
        averageCost,
        onTimePercentage,
        qualityScore,
      };
    });

    // Rank vendors
    const topPerformers = vendorMetrics
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 3)
      .map(v => v.vendorId);

    const underPerformers = vendorMetrics
      .sort((a, b) => a.qualityScore - b.qualityScore)
      .slice(0, 3)
      .map(v => v.vendorId);

    const costEfficiencyRanking = vendorMetrics
      .map(v => ({
        vendorId: v.vendorId,
        costEfficiency: v.qualityScore / v.averageCost,
      }))
      .sort((a, b) => b.costEfficiency - a.costEfficiency);

    const reliabilityRanking = vendorMetrics
      .map(v => ({
        vendorId: v.vendorId,
        reliability: (v.onTimePercentage + v.averageRating * 20) / 2,
      }))
      .sort((a, b) => b.reliability - a.reliability);

    return {
      vendorMetrics,
      topPerformers,
      underPerformers,
      costEfficiencyRanking,
      reliabilityRanking,
    };
  }

  /**
   * Generate predictive maintenance analytics
   */
  static generatePredictiveAnalytics(
    maintenanceRequests: MaintenanceRequest[],
    maintenanceExpenses: Expense[],
    properties: Property[]
  ): PredictiveAnalytics {
    // Maintenance forecasting
    const maintenanceForecasting = this.forecastMaintenanceNeeds(maintenanceRequests, maintenanceExpenses);

    // Equipment lifecycle analysis
    const equipmentLifecycle = this.analyzeEquipmentLifecycle(maintenanceRequests, properties);

    // Preventive recommendations
    const preventiveRecommendations = this.generatePreventiveRecommendations(
      maintenanceRequests, 
      properties
    );

    // Risk assessment
    const riskAssessment = this.assessMaintenanceRisks(maintenanceRequests, properties);

    return {
      maintenanceForecasting,
      equipmentLifecycle,
      preventiveRecommendations,
      riskAssessment,
    };
  }

  /**
   * Analyze maintenance efficiency metrics
   */
  static analyzeMaintenanceEfficiency(
    maintenanceRequests: MaintenanceRequest[],
    maintenanceExpenses: Expense[]
  ): MaintenanceEfficiency {
    const categories = ['PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'GENERAL'];

    // Response time metrics
    const responseTimeMetrics = categories.map(category => {
      const categoryRequests = maintenanceRequests.filter(r => r.category === category);
      const responseTimes = categoryRequests
        .filter(r => r.createdAt && (r as any).assignedAt)
        .map(r => {
          const created = new Date(r.createdAt!);
          const assigned = new Date((r as any).assignedAt);
          return (assigned.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
        });

      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      const targetResponseTime = this.getTargetResponseTime(category);
      const performance = averageResponseTime <= targetResponseTime * 0.8 ? 'excellent'
        : averageResponseTime <= targetResponseTime ? 'good'
        : 'needs_improvement';

      return {
        category,
        averageResponseTime,
        targetResponseTime,
        performance,
      };
    });

    // Resolution metrics
    const resolutionMetrics = categories.map(category => {
      const categoryRequests = maintenanceRequests.filter(r => r.category === category);
      const completedRequests = categoryRequests.filter(r => r.status === 'COMPLETED');
      
      const resolutionTimes = completedRequests
        .filter(r => r.createdAt && r.completedAt)
        .map(r => {
          const created = new Date(r.createdAt!);
          const completed = new Date(r.completedAt!);
          return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
        });

      const averageResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
        : 0;

      // Mock first-time fix rate and escalation rate
      const firstTimeFixRate = 75 + Math.random() * 20;
      const escalationRate = Math.random() * 15;

      return {
        category,
        averageResolutionTime,
        firstTimeFixRate,
        escalationRate,
      };
    });

    // Cost efficiency
    const costEfficiency = categories.map(category => {
      const categoryExpenses = maintenanceExpenses.filter(e => 
        e.category === 'MAINTENANCE' && (e as any).subcategory === category
      );
      
      const averageCost = categoryExpenses.length > 0
        ? categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length
        : 0;

      const benchmarkCost = this.getBenchmarkCost(category);
      const efficiency = averageCost <= benchmarkCost * 0.9 ? 'above_benchmark'
        : averageCost <= benchmarkCost * 1.1 ? 'at_benchmark'
        : 'below_benchmark';

      return {
        category,
        averageCost,
        benchmarkCost,
        efficiency,
      };
    });

    // Tenant satisfaction (mock data)
    const tenantSatisfaction = categories.map(category => ({
      category,
      averageRating: 3.5 + Math.random() * 1.5,
      responseRate: 60 + Math.random() * 30,
      commonComplaints: this.getCommonComplaints(category),
    }));

    return {
      responseTimeMetrics,
      resolutionMetrics,
      costEfficiency,
      tenantSatisfaction,
    };
  }

  // Helper methods
  private static calculateMonthlySpending(expenses: Expense[]) {
    const maintenanceExpenses = expenses.filter(e => e.category === 'MAINTENANCE');
    const monthlyData = maintenanceExpenses.reduce((acc, expense) => {
      const month = expense.date.slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, amount: 0, requestCount: 0 };
      }
      acc[month].amount += expense.amount;
      acc[month].requestCount += 1;
      return acc;
    }, {} as Record<string, { month: string; amount: number; requestCount: number }>);

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  private static analyzeCategoryBreakdown(
    requests: MaintenanceRequest[],
    expenses: Expense[]
  ) {
    const categories = ['PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'GENERAL'];
    const totalCost = expenses.filter(e => e.category === 'MAINTENANCE')
      .reduce((sum, e) => sum + e.amount, 0);

    return categories.map(category => {
      const categoryRequests = requests.filter(r => r.category === category);
      const categoryExpenses = expenses.filter(e => 
        e.category === 'MAINTENANCE' && (e as any).subcategory === category
      );
      
      const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = totalCost > 0 ? (amount / totalCost) * 100 : 0;

      return {
        category,
        amount,
        percentage,
        requestCount: categoryRequests.length,
      };
    });
  }

  private static comparePropertyCosts(
    requests: MaintenanceRequest[],
    expenses: Expense[],
    properties: Property[]
  ) {
    return properties.map(property => {
      const propertyRequests = requests.filter(r => r.propertyId === property.id);
      const propertyExpenses = expenses.filter(e => 
        e.propertyId === property.id && e.category === 'MAINTENANCE'
      );
      
      const totalCost = propertyExpenses.reduce((sum, e) => sum + e.amount, 0);
      const unitCount = property.rooms?.length || 1;
      const avgCostPerUnit = totalCost / unitCount;

      return {
        propertyId: property.id,
        totalCost,
        avgCostPerUnit,
        requestCount: propertyRequests.length,
      };
    });
  }

  private static analyzeCostTrends(expenses: Expense[]) {
    const maintenanceExpenses = expenses.filter(e => e.category === 'MAINTENANCE');
    const periods = this.getLastSixMonths();

    return periods.map(period => {
      const periodExpenses = maintenanceExpenses.filter(e => 
        e.date.slice(0, 7) === period
      );

      // Categorize by maintenance type (mock logic)
      const preventive = periodExpenses.filter(e => 
        (e.description || '').toLowerCase().includes('preventive') ||
        (e.description || '').toLowerCase().includes('scheduled')
      ).reduce((sum, e) => sum + e.amount, 0);

      const reactive = periodExpenses.filter(e => 
        !(e.description || '').toLowerCase().includes('preventive') &&
        !(e.description || '').toLowerCase().includes('emergency')
      ).reduce((sum, e) => sum + e.amount, 0);

      const emergency = periodExpenses.filter(e => 
        (e.description || '').toLowerCase().includes('emergency') ||
        (e.description || '').toLowerCase().includes('urgent')
      ).reduce((sum, e) => sum + e.amount, 0);

      return {
        period,
        preventive,
        reactive,
        emergency,
      };
    });
  }

  private static forecastMaintenanceNeeds(
    requests: MaintenanceRequest[],
    expenses: Expense[]
  ) {
    const historicalData = this.calculateMonthlySpending(expenses);
    
    return Array.from({ length: 6 }, (_, i) => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i + 1);
      const month = futureDate.toISOString().slice(0, 7);

      // Simple prediction based on historical average with seasonal adjustment
      const avgRequests = requests.length / 12; // Assuming 12 months of data
      const avgCost = historicalData.reduce((sum, d) => sum + d.amount, 0) / historicalData.length;
      
      const seasonalMultiplier = this.getSeasonalMultiplier(futureDate.getMonth());
      
      return {
        month,
        predictedRequests: Math.round(avgRequests * seasonalMultiplier),
        predictedCost: Math.round(avgCost * seasonalMultiplier),
        confidence: Math.max(0.5, 1 - (i * 0.1)),
        riskFactors: this.getRiskFactors(futureDate.getMonth()),
      };
    });
  }

  private static analyzeEquipmentLifecycle(
    requests: MaintenanceRequest[],
    properties: Property[]
  ) {
    const equipmentTypes = ['HVAC', 'WATER_HEATER', 'APPLIANCES', 'FLOORING', 'PLUMBING'];
    
    return equipmentTypes.map(equipmentType => {
      const averageLifespan = this.getAverageLifespan(equipmentType);
      
      // Mock replacement and maintenance schedules
      const replacementSchedule = properties.flatMap(property => 
        Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
          propertyId: property.id,
          equipmentId: `${equipmentType}_${i + 1}`,
          expectedReplacement: this.calculateReplacementDate(equipmentType),
        }))
      );

      const maintenanceSchedule = properties.flatMap(property => 
        Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
          propertyId: property.id,
          equipmentId: `${equipmentType}_${i + 1}`,
          nextMaintenance: this.calculateMaintenanceDate(equipmentType),
          type: 'Preventive',
        }))
      );

      return {
        equipmentType,
        averageLifespan,
        replacementSchedule,
        maintenanceSchedule,
      };
    });
  }

  private static generatePreventiveRecommendations(
    requests: MaintenanceRequest[],
    properties: Property[]
  ) {
    return properties.map(property => {
      const propertyRequests = requests.filter(r => r.propertyId === property.id);
      const recommendations = [];

      // Analyze request patterns to generate recommendations
      const hvacRequests = propertyRequests.filter(r => r.category === 'HVAC');
      if (hvacRequests.length > 2) {
        recommendations.push({
          type: 'HVAC Maintenance',
          priority: 'high' as const,
          estimatedCost: 300,
          potentialSavings: 800,
          description: 'Schedule regular HVAC maintenance to prevent frequent repairs',
        });
      }

      const plumbingRequests = propertyRequests.filter(r => r.category === 'PLUMBING');
      if (plumbingRequests.length > 1) {
        recommendations.push({
          type: 'Plumbing Inspection',
          priority: 'medium' as const,
          estimatedCost: 150,
          potentialSavings: 500,
          description: 'Conduct comprehensive plumbing inspection to identify potential issues',
        });
      }

      // Add general recommendations
      recommendations.push({
        type: 'Property Inspection',
        priority: 'low' as const,
        estimatedCost: 200,
        potentialSavings: 600,
        description: 'Annual comprehensive property inspection',
      });

      return {
        propertyId: property.id,
        recommendations,
      };
    });
  }

  private static assessMaintenanceRisks(
    requests: MaintenanceRequest[],
    properties: Property[]
  ) {
    return properties.map(property => {
      const propertyRequests = requests.filter(r => r.propertyId === property.id);
      let riskScore = 0;
      const riskFactors: string[] = [];
      const recommendedActions: string[] = [];

      // Age-based risk
      const propertyAge = new Date().getFullYear() - (property.yearBuilt || 2000);
      if (propertyAge > 20) {
        riskScore += 30;
        riskFactors.push('Property age over 20 years');
        recommendedActions.push('Schedule comprehensive property inspection');
      }

      // Request frequency risk
      const recentRequests = propertyRequests.filter(r => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return new Date(r.createdAt || '') > sixMonthsAgo;
      });

      if (recentRequests.length > 5) {
        riskScore += 25;
        riskFactors.push('High maintenance request frequency');
        recommendedActions.push('Investigate recurring issues');
      }

      // Emergency request risk
      const emergencyRequests = propertyRequests.filter(r => r.priority === 'URGENT');
      if (emergencyRequests.length > 2) {
        riskScore += 20;
        riskFactors.push('Multiple emergency requests');
        recommendedActions.push('Implement preventive maintenance program');
      }

      // Seasonal risk
      const currentMonth = new Date().getMonth();
      if ([11, 0, 1].includes(currentMonth)) { // Winter months
        riskScore += 15;
        riskFactors.push('Winter weather risks');
        recommendedActions.push('Prepare for winter maintenance needs');
      }

      return {
        propertyId: property.id,
        riskScore: Math.min(100, riskScore),
        riskFactors,
        recommendedActions,
      };
    });
  }

  // Utility methods
  private static getVendorName(vendorId: string): string {
    const vendorNames: Record<string, string> = {
      'internal': 'Internal Team',
      'vendor_1': 'ABC Maintenance Co.',
      'vendor_2': 'Quick Fix Services',
      'vendor_3': 'Professional Repairs Inc.',
    };
    return vendorNames[vendorId] || `Vendor ${vendorId}`;
  }

  private static getTargetResponseTime(category: string): number {
    const targets: Record<string, number> = {
      'PLUMBING': 4,
      'ELECTRICAL': 2,
      'HVAC': 8,
      'APPLIANCE': 12,
      'GENERAL': 24,
    };
    return targets[category] || 12;
  }

  private static getBenchmarkCost(category: string): number {
    const benchmarks: Record<string, number> = {
      'PLUMBING': 200,
      'ELECTRICAL': 150,
      'HVAC': 300,
      'APPLIANCE': 250,
      'GENERAL': 100,
    };
    return benchmarks[category] || 150;
  }

  private static getCommonComplaints(category: string): string[] {
    const complaints: Record<string, string[]> = {
      'PLUMBING': ['Slow response', 'Incomplete repairs', 'Messy work area'],
      'ELECTRICAL': ['Safety concerns', 'Multiple visits needed'],
      'HVAC': ['Temporary fixes', 'Noisy repairs'],
      'APPLIANCE': ['Long wait times', 'Wrong parts ordered'],
      'GENERAL': ['Poor communication', 'Scheduling issues'],
    };
    return complaints[category] || ['General service issues'];
  }

  private static getLastSixMonths(): string[] {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().slice(0, 7));
    }
    return months;
  }

  private static getSeasonalMultiplier(month: number): number {
    // Winter months typically have more maintenance issues
    const multipliers = [1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.0, 0.9, 1.0, 1.1, 1.3];
    return multipliers[month] || 1.0;
  }

  private static getRiskFactors(month: number): string[] {
    const factors = [
      ['Freezing temperatures', 'Heating system stress'],
      ['Winter weather', 'Pipe freeze risk'],
      ['Spring maintenance needs', 'HVAC transition'],
      ['Spring cleaning', 'System startups'],
      ['Increased usage', 'AC preparation'],
      ['Peak AC usage', 'High demand'],
      ['Summer heat stress', 'AC overload'],
      ['Continued heat', 'Equipment fatigue'],
      ['System transitions', 'Fall maintenance'],
      ['Weather changes', 'Heating preparation'],
      ['Pre-winter prep', 'System checks'],
      ['Winter onset', 'Heating demands'],
    ];
    return factors[month] || ['Seasonal maintenance needs'];
  }

  private static getAverageLifespan(equipmentType: string): number {
    const lifespans: Record<string, number> = {
      'HVAC': 15,
      'WATER_HEATER': 10,
      'APPLIANCES': 12,
      'FLOORING': 20,
      'PLUMBING': 25,
    };
    return lifespans[equipmentType] || 15;
  }

  private static calculateReplacementDate(equipmentType: string): string {
    const yearsToAdd = Math.floor(Math.random() * 5) + 1;
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + yearsToAdd);
    return futureDate.toISOString().slice(0, 10);
  }

  private static calculateMaintenanceDate(equipmentType: string): string {
    const monthsToAdd = Math.floor(Math.random() * 6) + 1;
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + monthsToAdd);
    return futureDate.toISOString().slice(0, 10);
  }
}