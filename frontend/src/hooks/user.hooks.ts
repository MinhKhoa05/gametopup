import { FormEvent, useEffect } from 'react';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { getApiMessage } from '../lib/api';
import { updateMyProfile } from '../services/user.api';
import { userDisplayName } from '../lib/labels';
import { User } from '../types';
import { useUserProfileStore } from '../store/user.store';

type UseProfileEditorArgs = {
  user: User | null;
  execute: AsyncActionExecutor;
  onProfileUpdated: (displayName: string) => void;
};

export function useProfileEditor({ user, execute, onProfileUpdated }: UseProfileEditorArgs) {
  const draftName = useUserProfileStore((state) => state.draftName);
  const saveError = useUserProfileStore((state) => state.saveError);

  useEffect(() => {
    useUserProfileStore.getState().reset(user);
  }, [user?.id, user?.displayName, user?.email]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await execute(
      async () => {
        if (!user) {
          const message = 'Không tìm thấy người dùng để cập nhật.';
          useUserProfileStore.getState().setSaveError(message);
          throw new Error(message);
        }

        const nextDisplayName = draftName.trim();

        try {
          await updateMyProfile(user.id, nextDisplayName);
          useUserProfileStore.getState().setSaveError(null);
          return nextDisplayName;
        } catch (error) {
          useUserProfileStore.getState().setSaveError(getApiMessage(error));
          throw error;
        }
      },
      {
        successMessage: 'Đã cập nhật hồ sơ.',
        onSuccess: (displayName) => {
          onProfileUpdated(displayName);
          useUserProfileStore.getState().setSaveError(null);
        },
      },
    );
  }

  return {
    canSave: draftName.trim().length > 0 && draftName.trim() !== userDisplayName(user),
    draftName,
    handleSubmit,
    saveError,
    setDraftName: (draftName: string) => useUserProfileStore.getState().setDraftName(draftName),
  };
}
