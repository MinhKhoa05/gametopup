import { type FormEvent } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { Field, FormActions, SectionHeading } from '@/shared/components';

export function ProfileEditForm({
  busy,
  canSave,
  draftName,
  email,
  errorMessage,
  onDraftNameChange,
  onSubmit,
}: {
  busy: boolean;
  canSave: boolean;
  draftName: string;
  email: string;
  errorMessage: string | null;
  onDraftNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="gt-surface min-h-0">
      <SectionHeading className="mb-4" title="Thông tin cá nhân" description="Cập nhật thông tin hiển thị trên tài khoản của bạn." />

      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Tên hiển thị" value={draftName} onChange={(event) => onDraftNameChange(event.target.value)} placeholder="Nhập tên hiển thị" />

        <Field label="Email" value={email} placeholder={email} readOnly />

        <div className="flex items-start gap-2 text-sm leading-6 text-slate-400">
          <ShieldCheck size={16} />
          <span>Email là định danh đăng nhập. Hệ thống không dùng username.</span>
        </div>

        {errorMessage ? <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errorMessage}</div> : null}

        <FormActions
          className="pt-0.5"
          justify="start"
          disabled={!canSave || busy}
          submitIcon={<Save size={16} />}
          submitLabel={busy ? 'Đang lưu...' : 'Lưu thay đổi'}
        />
      </form>
    </section>
  );
}
