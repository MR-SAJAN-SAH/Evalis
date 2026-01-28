/**
 * Dashboard Service - Handles all exam controller dashboard data operations
 * Includes caching, error handling, and API integration
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Type definitions
interface DashboardStats {
  totalExams: number;
  activeExams: number;
  totalCandidates: number;
  averageScore: number;
  completionRate: number;
  passRate: number;
  recentActivity: ActivityLog[];
}

interface ActivityLog {
  id: string;
  type: 'exam_created' | 'exam_published' | 'exam_started' | 'exam_completed' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
}

interface ExamFilter {
  status?: string;
  dateRange?: [Date, Date];
  searchTerm?: string;
  organizationId?: string;
}

interface ExamResponse {
  id: string;
  title: string;
  status: string;
  totalQuestions: number;
  duration: number;
  totalCandidates: number;
  completedCandidates: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  passingPercentage: number;
  averageScore?: number;
}

class DashboardServiceClass {
  private api: AxiosInstance;
  private cache: Map<string, { data: Record<string, unknown>; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const baseURL = typeof window !== 'undefined' 
      ? 'http://localhost:3001/api'
      : 'http://localhost:3001/api';
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Dashboard API Error:', error);
        throw error;
      }
    );
  }

  /**
   * Get dashboard statistics
   */
  async getStats(organizationId: string): Promise<DashboardStats> {
    const cacheKey = `stats-${organizationId}`;
    const cached = this.getFromCache<DashboardStats>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get<DashboardStats>(`/exams/stats`, {
        params: { organizationId },
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Get all exams with optional filters
   */
  async getExams(
    organizationId: string,
    filters?: ExamFilter,
    page = 1,
    limit = 20
  ): Promise<{ exams: ExamResponse[]; total: number }> {
    const cacheKey = `exams-${organizationId}-${JSON.stringify(filters)}-${page}`;
    const cached = this.getFromCache<{ exams: ExamResponse[]; total: number }>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get<{ exams: ExamResponse[]; total: number }>(`/exams`, {
        params: {
          organizationId,
          ...filters,
          page,
          limit,
        },
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  }

  /**
   * Get single exam details
   */
  async getExamDetails(examId: string): Promise<ExamResponse> {
    const cacheKey = `exam-${examId}`;
    const cached = this.getFromCache<ExamResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get<ExamResponse>(`/exams/${examId}`);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam details:', error);
      throw error;
    }
  }

  /**
   * Create a new exam
   */
  async createExam(examData: any): Promise<ExamResponse> {
    try {
      const response = await this.api.post<ExamResponse>(`/exams`, examData);
      this.invalidateCache('exams');
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  /**
   * Update exam
   */
  async updateExam(examId: string, examData: any): Promise<ExamResponse> {
    try {
      const response = await this.api.patch<ExamResponse>(`/exams/${examId}`, examData);
      this.invalidateCache(`exam-${examId}`);
      this.invalidateCache('exams');
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  /**
   * Delete exam
   */
  async deleteExam(examId: string): Promise<void> {
    try {
      await this.api.delete(`/exams/${examId}`);
      this.invalidateCache(`exam-${examId}`);
      this.invalidateCache('exams');
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  /**
   * Publish exam
   */
  async publishExam(examId: string, filters?: any): Promise<ExamResponse> {
    try {
      const response = await this.api.patch<ExamResponse>(`/exams/${examId}/publish`, {
        filters,
      });
      this.invalidateCache(`exam-${examId}`);
      this.invalidateCache('exams');
      return response.data;
    } catch (error) {
      console.error('Error publishing exam:', error);
      throw error;
    }
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(organizationId: string, limit = 10): Promise<ActivityLog[]> {
    const cacheKey = `activity-${organizationId}`;
    const cached = this.getFromCache<ActivityLog[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get<ActivityLog[]>(`/exams/activity-logs`, {
        params: { organizationId, limit },
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      // Return empty array instead of throwing to prevent UI breaks
      return [];
    }
  }

  /**
   * Get exam analytics
   */
  async getExamAnalytics(
    examId: string
  ): Promise<{
    passRate: number;
    averageScore: number;
    completionRate: number;
    timeStats: Record<string, unknown>;
    scoreDistribution: Record<string, unknown>;
  }> {
    const cacheKey = `analytics-${examId}`;
    const cached = this.getFromCache<{
      passRate: number;
      averageScore: number;
      completionRate: number;
      timeStats: Record<string, unknown>;
      scoreDistribution: Record<string, unknown>;
    }>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get(`/exams/${examId}/analytics`);
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Export exam results
   */
  async exportExamResults(examId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const response = await this.api.get(`/exams/${examId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting results:', error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data: data as Record<string, unknown>,
      timestamp: Date.now(),
    });
  }

  private invalidateCache(keyPattern: string): void {
    for (const [key] of this.cache) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const DashboardService = new DashboardServiceClass();
export default DashboardService;

// Export types for other components
export type { DashboardStats, ActivityLog, ExamFilter, ExamResponse };
