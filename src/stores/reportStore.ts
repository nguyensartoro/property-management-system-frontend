import { create } from 'zustand';
import { reportService, ReportType, FinancialReport, OccupancyReport, MaintenanceReport } from '../utils/apiClient';

interface ReportFilters {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  format?: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  reportType: 'financial' | 'occupancy' | 'maintenance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  email: string;
  propertyId?: string;
  isActive: boolean;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
}

interface ReportState {
  reportTypes: ReportType[];
  financialReport: FinancialReport | null;
  occupancyReport: OccupancyReport | null;
  maintenanceReport: MaintenanceReport | null;
  isLoading: boolean;
  error: string | null;
  lastGeneratedReport: string | null;
  reportHistory: {
    id: string;
    type: string;
    filters: ReportFilters;
    generatedAt: string;
    data: any;
  }[];
  scheduledReports: ScheduledReport[];
  
  // Actions
  fetchReportTypes: () => Promise<void>;
  generateFinancialReport: (filters?: ReportFilters) => Promise<void>;
  generateOccupancyReport: (filters?: ReportFilters) => Promise<void>;
  generateMaintenanceReport: (filters?: ReportFilters) => Promise<void>;
  exportReportAsCSV: (reportType: string, filters?: ReportFilters) => Promise<Blob>;
  saveReportToHistory: (type: string, filters: ReportFilters, data: any) => void;
  fetchScheduledReports: () => Promise<void>;
  createScheduledReport: (schedule: Omit<ScheduledReport, 'id' | 'createdAt' | 'lastRun' | 'nextRun'>) => Promise<void>;
  updateScheduledReport: (id: string, updates: Partial<ScheduledReport>) => Promise<void>;
  deleteScheduledReport: (id: string) => Promise<void>;
  clearReports: () => void;
  clearError: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reportTypes: [],
  financialReport: null,
  occupancyReport: null,
  maintenanceReport: null,
  isLoading: false,
  error: null,
  lastGeneratedReport: null,
  reportHistory: [],
  scheduledReports: [],

  fetchReportTypes: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await reportService.getReportTypes();
      set({
        reportTypes: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching report types:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report types',
      });
    }
  },

  generateFinancialReport: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await reportService.generateFinancialReport(
        filters.propertyId,
        filters.startDate,
        filters.endDate,
        filters.format
      );
      
      const reportData = response.data.data;
      set({
        financialReport: reportData,
        lastGeneratedReport: 'financial',
        isLoading: false,
      });

      // Save to history
      get().saveReportToHistory('financial', filters, reportData);
    } catch (error) {
      console.error('Error generating financial report:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate financial report',
      });
    }
  },

  generateOccupancyReport: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await reportService.generateOccupancyReport(
        filters.propertyId,
        filters.startDate,
        filters.endDate,
        filters.format
      );
      
      const reportData = response.data.data;
      set({
        occupancyReport: reportData,
        lastGeneratedReport: 'occupancy',
        isLoading: false,
      });

      // Save to history
      get().saveReportToHistory('occupancy', filters, reportData);
    } catch (error) {
      console.error('Error generating occupancy report:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate occupancy report',
      });
    }
  },

  generateMaintenanceReport: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await reportService.generateMaintenanceReport(
        filters.propertyId,
        filters.startDate,
        filters.endDate,
        filters.format
      );
      
      const reportData = response.data.data;
      set({
        maintenanceReport: reportData,
        lastGeneratedReport: 'maintenance',
        isLoading: false,
      });

      // Save to history
      get().saveReportToHistory('maintenance', filters, reportData);
    } catch (error) {
      console.error('Error generating maintenance report:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate maintenance report',
      });
    }
  },

  exportReportAsCSV: async (reportType: string, filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await reportService.exportReportAsCSV(
        reportType,
        filters.propertyId,
        filters.startDate,
        filters.endDate
      );
      
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error exporting report as CSV:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to export report as CSV',
      });
      throw error;
    }
  },

  saveReportToHistory: (type: string, filters: ReportFilters, data: any) => {
    const historyEntry = {
      id: `${type}-${Date.now()}`,
      type,
      filters,
      generatedAt: new Date().toISOString(),
      data,
    };

    set((state) => ({
      reportHistory: [historyEntry, ...state.reportHistory.slice(0, 9)], // Keep last 10 reports
    }));
  },

  clearReports: () => {
    set({
      financialReport: null,
      occupancyReport: null,
      maintenanceReport: null,
      lastGeneratedReport: null,
    });
  },

  fetchScheduledReports: async () => {
    try {
      set({ isLoading: true, error: null });
      // Mock implementation - replace with actual API call
      const mockScheduledReports: ScheduledReport[] = [
        {
          id: '1',
          name: 'Monthly Financial Summary',
          reportType: 'financial',
          frequency: 'monthly',
          email: 'admin@example.com',
          isActive: true,
          createdAt: new Date().toISOString(),
          nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Weekly Occupancy Report',
          reportType: 'occupancy',
          frequency: 'weekly',
          email: 'manager@example.com',
          propertyId: 'prop-1',
          isActive: false,
          createdAt: new Date().toISOString(),
        },
      ];
      
      set({
        scheduledReports: mockScheduledReports,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scheduled reports',
      });
    }
  },

  createScheduledReport: async (schedule) => {
    try {
      set({ isLoading: true, error: null });
      
      // Mock implementation - replace with actual API call
      const newSchedule: ScheduledReport = {
        ...schedule,
        id: `schedule-${Date.now()}`,
        createdAt: new Date().toISOString(),
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
      };

      set((state) => ({
        scheduledReports: [...state.scheduledReports, newSchedule],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create scheduled report',
      });
      throw error;
    }
  },

  updateScheduledReport: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      // Mock implementation - replace with actual API call
      set((state) => ({
        scheduledReports: state.scheduledReports.map((schedule) =>
          schedule.id === id ? { ...schedule, ...updates } : schedule
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update scheduled report',
      });
      throw error;
    }
  },

  deleteScheduledReport: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // Mock implementation - replace with actual API call
      set((state) => ({
        scheduledReports: state.scheduledReports.filter((schedule) => schedule.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete scheduled report',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));