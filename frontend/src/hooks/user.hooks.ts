import { FormEvent, useEffect, useState } from 'react';
import { getApiMessage } from '../lib/api';
import { userDisplayName } from '../lib/labels';
import type { User } from '../types';
import { useUpdateMyProfileMutation } from '../services/profile';

type UseProfileEditorArgs = {
  user: User | null;
};

export function useProfileEditor({ user }: UseProfileEditorArgs) {
  const [draftName, setDraftName] = useState('');
  const updateProfileMutation = useUpdateMyProfileMutation();

  useEffect(() => {
    setDraftName(user?.displayName ?? '');
  }, [user?.id, user?.displayName, user?.email]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!user) {
      return;
    }

    updateProfileMutation.mutate({
      id: user.id,
      displayName: draftName.trim(),
    });
  }

  return {
    canSave: draftName.trim().length > 0 && draftName.trim() !== userDisplayName(user),
    draftName,
    handleSubmit,
    isPending: updateProfileMutation.isPending,
    saveError: updateProfileMutation.error ? getApiMessage(updateProfileMutation.error) : null,
    setDraftName,
  };
}
