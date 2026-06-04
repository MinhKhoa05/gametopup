import { FormEvent, useEffect, useState } from 'react';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { getApiMessage } from '../lib/api';
import { userDisplayName } from '../lib/labels';
import { User } from '../types';
import { useUpdateMyProfileMutation } from '../services/user';

type UseProfileEditorArgs = {
  user: User | null;
  execute: AsyncActionExecutor;
  onProfileUpdated: (displayName: string) => void;
};

export function useProfileEditor({ user, execute, onProfileUpdated }: UseProfileEditorArgs) {
  const [draftName, setDraftName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const updateProfileMutation = useUpdateMyProfileMutation(user?.id ?? null);

  useEffect(() => {
    setDraftName(user?.displayName ?? '');
    setSaveError(null);
  }, [user?.id, user?.displayName, user?.email]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await execute(
      async () => {
        const nextDisplayName = draftName.trim();
        try {
          await updateProfileMutation.mutateAsync(nextDisplayName);
          return nextDisplayName;
        } catch (error) {
          setSaveError(getApiMessage(error));
          throw error;
        }
      },
      {
        successMessage: 'Đã cập nhật hồ sơ.',
        onSuccess: (displayName) => {
          setSaveError(null);
          onProfileUpdated(displayName);
        },
      },
    );
  }

  return {
    canSave: draftName.trim().length > 0 && draftName.trim() !== userDisplayName(user),
    draftName,
    handleSubmit,
    saveError,
    setDraftName,
  };
}
