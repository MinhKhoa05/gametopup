import { useCallback, useState } from 'react';
import { getApiMessage } from '../lib/api';

type AsyncActionOptions<T> = {
  successMessage?: string | ((result: T) => string);
  onSuccess?: (result: T) => void | Promise<void>;
};

export type AsyncActionExecutor = <T>(
  request: () => Promise<T>,
  options?: AsyncActionOptions<T>,
) => Promise<T | undefined>;

export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const execute: AsyncActionExecutor = useCallback(
    async <T,>(request: () => Promise<T>, options: AsyncActionOptions<T> = {}) => {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const result = await request();
        await options.onSuccess?.(result);

        if (options.successMessage) {
          const nextMessage =
            typeof options.successMessage === 'function' ? options.successMessage(result) : options.successMessage;
          setSuccessMessage(nextMessage);
        }

        return result;
      } catch (err) {
        setErrorMessage(getApiMessage(err));
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    errorMessage,
    execute,
    isLoading,
    setErrorMessage,
    setSuccessMessage,
    successMessage,
  };
}
