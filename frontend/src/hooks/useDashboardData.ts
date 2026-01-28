/**
 * useDashboardData - Custom hook for fetching and managing dashboard data
 * Handles loading states, error handling, and caching
 */

import { useState, useEffect, useCallback } from 'react';
import DashboardService from '../services/DashboardService/dashboardService';

interface UseDashboardDataOptions {
  organizationId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface DashboardData {
  stats: any;
  exams: any[];
  totalExams: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardData = ({
  organizationId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseDashboardDataOptions) => {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    exams: [],
    totalExams: 0,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const [stats, examsData] = await Promise.all([
        DashboardService.getStats(organizationId),
        DashboardService.getExams(organizationId),
      ]);

      setData({
        stats,
        exams: examsData.exams,
        totalExams: examsData.total,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      setData((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  const refetch = useCallback(() => {
    DashboardService.clearCache();
    fetchData();
  }, [fetchData]);

  return {
    ...data,
    refetch,
  };
};

export default useDashboardData;
