import { FormEvent, useEffect, useState } from 'react';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { userDisplayName } from '../lib/labels';
import { User } from '../types';
import { updateMyProfile } from '../services/user.api';

type UseProfileEditorArgs = {
  user: User | null;
  execute: AsyncActionExecutor;
  onProfileUpdated: (displayName: string) => void;
};

export function useProfileEditor({ user, execute, onProfileUpdated }: UseProfileEditorArgs) {
  const initialDisplayName = userDisplayName(user);
  const [draftName, setDraftName] = useState(initialDisplayName);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraftName(initialDisplayName);
    setSaveError(null);
  }, [initialDisplayName]);

  const trimmedName = draftName.trim();
  const isDirty = trimmedName !== initialDisplayName;
  const canSave = trimmedName.length > 0 && isDirty;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!trimmedName) {
      setSaveError('Tên hiển thị không được để trống.');
      return;
    }

    await execute(() => updateMyProfile(user.id, trimmedName), {
      successMessage: 'Cập nhật tên hiển thị thành công.',
      onSuccess: () => {
        onProfileUpdated(trimmedName);
        setSaveError(null);
      },
    });
  }

  return {
    canSave,
    draftName,
    handleSubmit,
    saveError,
    setDraftName,
  };
}
