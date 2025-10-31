import { useState, useCallback, useRef, useEffect } from "react";

// -------------------- useLoadingStates --------------------
export const useLoadingStates = (initialStates = {}) => {
  const [loadingStates, setLoadingStates] = useState(initialStates);
  const timeoutRefs = useRef({});

  const setLoading = useCallback((key, isLoading, minDuration = 1500) => {
    if (minDuration > 0 && isLoading) {
      setLoadingStates((prev) => ({ ...prev, [key]: true }));

      if (timeoutRefs.current[key]) {
        clearTimeout(timeoutRefs.current[key]);
      }

      timeoutRefs.current[key] = setTimeout(() => {
        setLoadingStates((prev) => {
          if (prev[key]) {
            return { ...prev, [key]: false };
          }
          return prev;
        });
        delete timeoutRefs.current[key];
      }, minDuration);
    } else if (!isLoading) {
      setTimeout(() => {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }, 300);
    } else {
      setLoadingStates((prev) => ({ ...prev, [key]: isLoading }));
    }
  }, []);

  const isLoading = useCallback(
    (key) => loadingStates[key] || false,
    [loadingStates]
  );

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some((loading) => loading);
  }, [loadingStates]);

  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
  };
};

// -------------------- useAsyncOperation --------------------
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (asyncFn, options = {}) => {
    const { minLoadingTime = 300, onSuccess, onError } = options;

    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await asyncFn();

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsed)
        );
      }

      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
};

// -------------------- useProgressiveLoading --------------------
export const useProgressiveLoading = (stages = ["skeleton", "partial", "complete"]) => {
  const [currentStage, setCurrentStage] = useState(stages[0]);
  const [stageData, setStageData] = useState({});

  const setStage = useCallback((stage, data = null) => {
    setCurrentStage(stage);
    if (data !== null) {
      setStageData((prev) => ({ ...prev, [stage]: data }));
    }
  }, []);

  const isStage = useCallback((stage) => currentStage === stage, [currentStage]);
  const getStageData = useCallback((stage) => stageData[stage], [stageData]);

  const reset = useCallback(() => {
    setCurrentStage(stages[0]);
    setStageData({});
  }, [stages]);

  return {
    currentStage,
    setStage,
    isStage,
    getStageData,
    reset,
    stages,
  };
};

// -------------------- useDebouncedLoading --------------------
export const useDebouncedLoading = (delay = 300) => {
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const setDebouncedLoading = useCallback(
    (isLoading) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (isLoading) {
        setLoading(true);
      } else {
        timeoutRef.current = setTimeout(() => {
          setLoading(false);
        }, delay);
      }
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [loading, setDebouncedLoading];
};

// -------------------- useSequentialLoading --------------------
export const useSequentialLoading = () => {
  const [queue, setQueue] = useState([]);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addOperation = useCallback((operation) => {
    setQueue((prev) => [...prev, operation]);
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    const operations = [...queue];
    setQueue([]);

    for (const operation of operations) {
      setCurrentOperation(operation);
      try {
        await operation.execute();
      } catch (error) {
        console.error("Sequential operation failed:", error);
        operation.onError?.(error);
      }
    }

    setCurrentOperation(null);
    setIsProcessing(false);
  }, [queue, isProcessing]);

  useEffect(() => {
    processQueue();
  }, [processQueue]);

  return {
    addOperation,
    currentOperation,
    isProcessing,
    queueLength: queue.length,
  };
};
