import { getApiMessage } from '../../lib/api';

type FetchOptions<T> = {
  hasData: boolean;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  fetcher: () => Promise<T>;
  onSuccess: (data: T) => void;
};

export async function executeBackgroundFetch<T>({
  hasData,
  setLoading,
  setError,
  fetcher,
  onSuccess,
}: FetchOptions<T>) {
  if (!hasData) {
    setLoading(true);
  }

  try {
    const data = await fetcher();
    onSuccess(data);
  } catch (error) {
    if (!hasData) {
      setError(getApiMessage(error));
    }
  } finally {
    setLoading(false);
  }
}
