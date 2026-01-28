/**
 * useExamActions - Custom hook for exam management operations
 * Handles create, update, delete, publish operations with state management
 */

import { useState, useCallback } from 'react';
import DashboardService from '../services/DashboardService/dashboardService';

interface UseExamActionsOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface ActionState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useExamActions = ({ onSuccess, onError }: UseExamActionsOptions = {}) => {
  const [state, setState] = useState<ActionState>({
    loading: false,
    error: null,
    success: false,
  });

  const createExam = useCallback(
    async (examData: any) => {
      setState({ loading: true, error: null, success: false });
      try {
        const result = await DashboardService.createExam(examData);
        setState({ loading: false, error: null, success: true });
        onSuccess?.('Exam created successfully');
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create exam';
        setState({ loading: false, error: message, success: false });
        onError?.(message);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  const updateExam = useCallback(
    async (examId: string, examData: any) => {
      setState({ loading: true, error: null, success: false });
      try {
        const result = await DashboardService.updateExam(examId, examData);
        setState({ loading: false, error: null, success: true });
        onSuccess?.('Exam updated successfully');
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update exam';
        setState({ loading: false, error: message, success: false });
        onError?.(message);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  const deleteExam = useCallback(
    async (examId: string) => {
      setState({ loading: true, error: null, success: false });
      try {
        await DashboardService.deleteExam(examId);
        setState({ loading: false, error: null, success: true });
        onSuccess?.('Exam deleted successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete exam';
        setState({ loading: false, error: message, success: false });
        onError?.(message);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  const publishExam = useCallback(
    async (examId: string, filters?: any) => {
      setState({ loading: true, error: null, success: false });
      try {
        const result = await DashboardService.publishExam(examId, filters);
        setState({ loading: false, error: null, success: true });
        onSuccess?.('Exam published successfully');
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to publish exam';
        setState({ loading: false, error: message, success: false });
        onError?.(message);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  const exportResults = useCallback(
    async (examId: string, format: 'csv' | 'xlsx' = 'csv') => {
      setState({ loading: true, error: null, success: false });
      try {
        const blob = await DashboardService.exportExamResults(examId, format);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `exam-results-${examId}.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        setState({ loading: false, error: null, success: true });
        onSuccess?.('Results exported successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to export results';
        setState({ loading: false, error: message, success: false });
        onError?.(message);
        throw error;
      }
    },
    [onSuccess, onError]
  );

  const resetState = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    createExam,
    updateExam,
    deleteExam,
    publishExam,
    exportResults,
    resetState,
  };
};

export default useExamActions;
