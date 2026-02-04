import { useState, useEffect, useCallback } from 'react';
import { trucksApi } from '../utils/api';
import toast from 'react-hot-toast';

export const useTrucks = (initialParams = {}) => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchTrucks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await trucksApi.getAll(params);
      setTrucks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch trucks');
      toast.error('Failed to fetch trucks');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const updateParams = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const createTruck = async (data) => {
    const response = await trucksApi.create(data);
    await fetchTrucks();
    return response.data;
  };

  const updateTruck = async (id, data) => {
    const response = await trucksApi.update(id, data);
    await fetchTrucks();
    return response.data;
  };

  const deleteTruck = async (id) => {
    await trucksApi.delete(id);
    await fetchTrucks();
  };

  return {
    trucks,
    loading,
    error,
    params,
    updateParams,
    refetch: fetchTrucks,
    createTruck,
    updateTruck,
    deleteTruck,
  };
};

export const useTruck = (id) => {
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTruck = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await trucksApi.getOne(id);
      setTruck(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch truck');
      toast.error('Failed to fetch truck details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTruck();
  }, [fetchTruck]);

  return { truck, loading, error, refetch: fetchTruck };
};
