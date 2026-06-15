import { useState, useCallback } from 'react';


export const useFetch = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const execute = useCallback(async (url: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      return result; // Return data for immediate usage if needed
    } catch (err) {
      setError(err);
      throw err; // Re-throw to let component handle specific errors if needed
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
};
