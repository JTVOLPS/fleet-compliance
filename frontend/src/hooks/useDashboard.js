import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../utils/api';
import toast from 'react-hot-toast';

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getStats();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard');
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
};

export const useFleetTagStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getByFleetTag();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch fleet stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};
