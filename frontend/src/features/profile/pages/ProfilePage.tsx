import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, PencilLine, ShieldCheck, UserRound } from "lucide-react";

import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import type { User } from "@/features/auth/types";
import { useUpdateMyProfileMutation } from "@/features/profile/server";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { formatDate } from "@/shared/lib/format";

import {
  Container,
  Field,
  FormActions,
  IconBox,
  MediaListItem,
  PageHero,
  PanelShell,
  SectionHeading,
} from "@/shared/components";

export function ProfilePage() {
  const { isChecking, user } = useAuthSession();

  if (isChecking) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return null;
  }

  return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: User }) {
  const updateProfileMutation = useUpdateMyProfileMutation();

  const [draftName, setDraftName] = useState("");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const trimmedDraftName = draftName.trim();
  const currentDisplayName = (user.displayName ?? "").trim();

  useEffect(() => {
    setDraftName(user.displayName ?? "");
  }, [user.displayName, user.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({
      displayName: trimmedDraftName,
    });
  }

  return (
    <>
      <div className="relative isolate overflow-hidden">
        <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
          <div className="grid gap-10 lg:gap-12">
            <PageHero
              eyebrow="TÀI KHOẢN CỦA TÔI"
              visual={
                <IconBox
                  size="lg"
                  tone="primary"
                  className="h-[62px] w-[62px] rounded-[18px]"
                >
                  <UserRound size={30} strokeWidth={1.8} />
                </IconBox>
              }
              title={user.displayName?.trim() || user.email}
              description={`Thành viên từ ${formatDate(user.createdAt)}`}
            />

            <section className="w-full">
              <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,2fr)_500px]">
                <PanelShell className="flex h-full flex-col">
                  <div className="px-6 pt-6">
                    <SectionHeading
                      title="Thông tin hồ sơ"
                      titleClassName="text-[1.35rem]"
                    />
                  </div>

                  <form
                    className="flex flex-1 flex-col px-6 pb-6 pt-5"
                    onSubmit={handleSubmit}
                  >
                    <div className="grid gap-4">
                      <Field
                        required
                        label="Tên hiển thị"
                        value={draftName}
                        placeholder="Nhập tên hiển thị"
                        onChange={(event) => setDraftName(event.target.value)}
                      />

                      <Field
                        label="Email"
                        value={user.email}
                        readOnly
                        trailing={<ShieldCheck size={16} />}
                      />

                      {updateProfileMutation.error instanceof Error && (
                        <div className="rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                          {updateProfileMutation.error.message}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto border-t gt-border pt-5">
                      <FormActions
                        submitIcon={<PencilLine size={16} />}
                        submitLabel={
                          updateProfileMutation.isPending
                            ? "Đang cập nhật..."
                            : "Lưu thay đổi"
                        }
                        disabled={
                          trimmedDraftName.length === 0 ||
                          trimmedDraftName === currentDisplayName ||
                          updateProfileMutation.isPending
                        }
                      />
                    </div>
                  </form>
                </PanelShell>

                <PanelShell className="flex flex-col sticky top-24 h-fit">
                  <div className="px-6 pt-6">
                    <SectionHeading
                      title="Bảo mật"
                      titleClassName="text-[1.35rem]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                    <div className="space-y-4">
                      <MediaListItem
                        leading={
                          <IconBox tone="primary">
                            <LockKeyhole size={18} />
                          </IconBox>
                        }
                        title="Đổi mật khẩu"
                        subtitle="Cập nhật mật khẩu để bảo vệ tài khoản."
                        onClick={() => setIsChangePasswordOpen(true)}
                        trailing={
                          <span className="text-sm font-semibold text-cyan-300">
                            Đổi →
                          </span>
                        }
                        className="min-h-[84px]"
                      />
                    </div>

                    <div className="mt-5 rounded-2xl bg-cyan-500/5 px-4 py-4 text-sm leading-6 gt-text-muted">
                      <p className="font-semibold text-cyan-300">Mẹo bảo mật</p>

                      <p className="mt-2">
                        Không chia sẻ mật khẩu với người khác. Nên sử dụng mật
                        khẩu mạnh gồm chữ hoa, chữ thường, chữ số và ký tự đặc
                        biệt.
                      </p>
                    </div>
                  </div>
                </PanelShell>
              </div>
            </section>
          </div>
        </Container>
      </div>

      {isChangePasswordOpen && (
        <ChangePasswordDialog onClose={() => setIsChangePasswordOpen(false)} />
      )}
    </>
  );
}

function ProfilePageSkeleton() {
  return (
    <Container className="py-5 sm:py-7 lg:py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]">
        <div className="h-[340px] animate-pulse rounded-[26px] border gt-border bg-white/[0.03]" />

        <div className="h-[180px] animate-pulse rounded-[26px] border gt-border bg-white/[0.03]" />
      </div>
    </Container>
  );
}
